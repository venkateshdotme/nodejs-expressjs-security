import { Router } from "express";
import { validateBody } from "../../middleware/validate.js";
import { registerController } from "./user.controller.js";
import { registerSchema } from "./user.schema.js";

export const userRouter = Router();

userRouter.post("/register", validateBody(registerSchema), registerController);
