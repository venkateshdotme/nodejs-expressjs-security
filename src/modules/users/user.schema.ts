import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(50),
    email: z.email().trim().toLowerCase().max(254),
    password: z.string().min(12).max(128),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
