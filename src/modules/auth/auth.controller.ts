import type { NextFunction, Request, Response } from "express";
import { InvalidCredentialsError, loginUser } from "./auth.service.js";
import { setAuthenticationCookies } from "./auth.cookies.js";

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await loginUser(req.body, {
      userAgent: req.get("user-agent"),
    });

    setAuthenticationCookies(res, result.accessToken, result.refreshToken);

    return res.status(200).json({
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    next(error);
  }
}

export async function meController(req: Request, res: Response) {
  return res.status(200).json({
    data: {
      user: {
        id: req.auth!.userId,
        name: req.auth!.name,
        email: req.auth!.email,
        role: req.auth!.role,
      },
    },
  });
}
