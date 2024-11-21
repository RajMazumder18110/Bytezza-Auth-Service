/** @notice Library imports */
import { StatusCodes } from "http-status-codes";
import { HTTPException } from "hono/http-exception";

/// Incase of email already exists
export const emailAlreadyExists = new HTTPException(StatusCodes.CONFLICT, {
  message: "Email already exists!",
});
