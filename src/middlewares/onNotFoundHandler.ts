/** @notice library imports */
import type { NotFoundHandler } from "hono";
import { StatusCodes } from "http-status-codes";
/// Local imports
import { Logger } from "@/config";
import { ErrorNotFoundResponse } from "@/types/responses";

export const onNotFoundHandler: NotFoundHandler = (c) => {
  Logger.error(`[INVALID_PATH] ${c.req.path}`);

  /// Return the not found response
  return c.json<ErrorNotFoundResponse>(
    {
      success: false,
      path: c.req.path,
      code: "NOT_FOUND",
      error: `Invalid API Path`,
    },
    StatusCodes.NOT_FOUND,
  );
};
