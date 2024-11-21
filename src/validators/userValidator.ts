/** @notice library imports */
import { z } from "zod";
import { Input } from "hono";

/// Register user schema
export const newUserSchema = z.object({
  name: z.string().min(3, "At least 3 characters"),
  email: z.string().email("Must be a valid email."),
  password: z.string().min(6, "At least 6 characters"),
});

/// Login user schema
export const loginUserSchema = z.object({
  email: z.string().email("Must be a valid email."),
  password: z.string().min(6, "At least 6 characters"),
});

/// Types
export type NewUserInput = Input & {
  out: {
    json: z.infer<typeof newUserSchema>;
  };
};

export type LoginUserInput = Input & {
  out: {
    json: z.infer<typeof loginUserSchema>;
  };
};
