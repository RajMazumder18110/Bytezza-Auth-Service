/** @notice library imports */
import { Context } from "hono";
import { createMiddleware } from "hono/factory";
/// Local imports
import { CookieServices } from "@/services";
import { AuthVariables } from "@/types/variables";

export const authenticate = (cookieService: CookieServices) =>
  createMiddleware(async (c: Context<{ Variables: AuthVariables }>, next) => {
    /// Grabbing access token
    const { id, role } = await cookieService.validateAccessToken(c);

    /// Set authorized user id
    c.set("auth", { id, role });
    await next();
  });
