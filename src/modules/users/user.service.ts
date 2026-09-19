import argon2 from "argon2";
import { User } from "./user.model.js";
import type { RegisterInput } from "./user.schema.js";

export class EmailAlreadyRegisteredError extends Error {}

export async function registerUser(input: RegisterInput) {
  const existingUser = await User.exists({
    email: input.email,
  });

  if (existingUser) {
    throw new EmailAlreadyRegisteredError();
  }

  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
  });

  try {
    const user = await User.create({
      name: input.name,
      email: input.email,
      role: "user",
      passwordHash,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new EmailAlreadyRegisteredError();
    }

    throw error;
  }
}
