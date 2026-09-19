import argon2 from "argon2";
import { Session } from "./session.model.js";
import { User } from "../users/user.model.js";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from "./token.service.js";
import type { LoginInput } from "./auth.schema.js";

export class InvalidCredentialsError extends Error {}

const dummyPasswordHash = await argon2.hash(
  "dummy-password-user-only-for-timing",
  {
    type: argon2.argon2id,
  },
);

export async function loginUser(
  input: LoginInput,
  context: {
    userAgent?: string;
  },
) {
  const user = await User.findOne({
    email: input.email,
  }).select("+passwordHash");

  if (!user) {
    await argon2.verify(dummyPasswordHash, input.password);

    throw new InvalidCredentialsError();
  }

  const passwordMatches = await argon2.verify(
    user.passwordHash,
    input.password,
  );

  if (!passwordMatches || !user.isActive) {
    throw new InvalidCredentialsError();
  }

  const refreshToken = createRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const session = await Session.create({
    userId: user._id,
    userAgent: context.userAgent,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    refreshTokenHash,
  });

  const accessToken = await createAccessToken({
    userId: user.id,
    sessionId: session.id,
    role: user.role,
  });

  return {
    accessToken,
    refreshToken,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
