import { Router } from "express";
import { validateBody } from "../../middleware/validate.js";
import { loginController, meController } from "./auth.controller.js";
import { loginRateLimit } from "./auth.rate-limit.js";
import { loginSchema } from "./auth.schema.js";
import { requireAuthentication } from "./auth.middleware.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  loginRateLimit,
  validateBody(loginSchema),
  loginController,
);

authRouter.get("/me", requireAuthentication, meController);
