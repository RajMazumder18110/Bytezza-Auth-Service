/** @notice library imports */
import type { ErrorHandler } from "hono";
import { StatusCodes } from "http-status-codes";
import { HTTPException } from "hono/http-exception";
/// Local imports
import { Logger } from "@/config";
import { ErrorResponse } from "@/types/responses";

export const onErrorHandler: ErrorHandler = (error, c) => {
  Logger.error(error.message);

  /// Incase of HTTP error
  if (error instanceof HTTPException) {
    return c.json<ErrorResponse>(
      {
        success: false,
        message: error.message,
        code: "HTTP_ERROR",
      },
      error.status,
    );
  }

  /// Incase of server error
  return c.json<ErrorResponse>(
    {
      success: false,
      code: "SERVER_ERROR",
      message: error.message,
    },
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
};
