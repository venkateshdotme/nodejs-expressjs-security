import crypto from "node:crypto";
import { z } from "zod";
import { jwtVerify, SignJWT } from "jose";
import { env } from "../../config/env.js";

const accessSecret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);

const accessPayloadSchema = z.object({
  sub: z.string().min(1),
  sessionId: z.string().min(1),
  role: z.enum(["user", "admin"]),
  type: z.literal("access"),
});

export async function createAccessToken(input: {
  userId: string;
  sessionId: string;
  role: "user" | "admin";
}) {
  return new SignJWT({
    sessionId: input.sessionId,
    role: input.role,
    type: "access",
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(input.userId)
    .setIssuer("express-security-service")
    .setAudience("security-course-client")
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessSecret);
}

export async function verifyAccessToken(token: string) {
  const result = await jwtVerify(token, accessSecret, {
    algorithms: ["HS256"],
    issuer: "express-security-service",
    audience: "security-course-client",
  });

  const payload = accessPayloadSchema.parse(result.payload);

  return {
    userId: payload.sub,
    sessionId: payload.sessionId,
    role: payload.role,
  };
}

export function createRefreshToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
