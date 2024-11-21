/** @notice Library imports */
import { StatusCodes } from "http-status-codes";
import { HTTPException } from "hono/http-exception";

/// Incase of email already exists
export const emailAlreadyExistsError = new HTTPException(StatusCodes.CONFLICT, {
  message: "Email already exists!",
});

/// Incase of invalid email or password
export const invalidEmailOrPasswordError = new HTTPException(
  StatusCodes.BAD_REQUEST,
  {
    message: "Invalid email or password!",
  },
);

/// Incase of cookies are not valid
export const unauthorized = new HTTPException(StatusCodes.UNAUTHORIZED, {
  message: "Unauthorized!",
});
