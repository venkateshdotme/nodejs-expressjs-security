import type { Request, Response, NextFunction } from "express";
import { EmailAlreadyRegisteredError, registerUser } from "./user.service.js";

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      data: {
        user,
      },
    });
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) {
      return res.status(409).json({
        error: {
          code: "REGISTRATION_UNAVAILABLE",
          message: "Registration could not be completed",
        },
      });
    }

    next(error);
  }
}
