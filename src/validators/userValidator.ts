/** @notice library imports */
import { Input } from "hono";
import { z } from "zod";

/// Register user schema
export const newUserSchema = z.object({
  name: z.string().min(3, "At least 3 characters"),
  email: z.string().email("Must be a valid email."),
  password: z.string().min(6, "At least 6 characters"),
});

/// Types
export type NewUserInput = Input & {
  out: {
    json: z.infer<typeof newUserSchema>;
  };
};
