import type { NextFunction, Request, Response } from "express";
import { Session } from "./session.model.js";
import { User } from "../users/user.model.js";
import { ACCESS_COOKIE } from "./auth.cookies.js";
import { verifyAccessToken } from "./token.service.js";

export async function requireAuthentication(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const accessToken = req.cookies?.[ACCESS_COOKIE];

    if (!accessToken) {
      return unauthorized(res);
    }

    const token = await verifyAccessToken(accessToken);

    const [session, user] = await Promise.all([
      Session.exists({
        _id: token.sessionId,
        userId: token.userId,
        revokedAt: null,
        expiresAt: {
          $gt: new Date(),
        },
      }),
      User.findOne({
        _id: token.userId,
        isActive: true,
      }).select("name email role"),
    ]);

    if (!session || !user) {
      return unauthorized(res);
    }

    req.auth = {
      userId: user.id,
      sessionId: token.sessionId,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch {
    return unauthorized(res);
  }
}

function unauthorized(res: Response) {
  return res.status(401).json({
    error: {
      code: "UNAUTHENTICATED",
      message: "Authentication is required",
    },
  });
}
