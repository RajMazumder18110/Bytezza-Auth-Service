/** @notice library imports */
import { ZodSchema } from "zod";
import { validator } from "hono/validator";
import { StatusCodes } from "http-status-codes";
/// Local imports
import { ValidationErrorResponse } from "@/types/responses";

export const validateSchema = (schema: ZodSchema) =>
  validator("json", (value, c) => {
    /// Parse data
    const parsedData = schema.safeParse(value);
    if (!parsedData.success) {
      /// Incase of form validation error (Zod)
      return c.json<ValidationErrorResponse>(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Invalid parameters!",
          issues: parsedData.error.errors.map((err) => ({
            field: (err.path.at(0) as string) ?? "",
            message: err.message,
          })),
        },
        StatusCodes.BAD_REQUEST,
      );
    }

    /// Incase of success
    return parsedData.data;
  });
