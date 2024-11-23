/** @notice library imports */
import { Context } from "hono";
import { Logger } from "winston";
import { createMiddleware } from "hono/factory";
/// Local imports
import { unauthorized } from "@/errors";
import { AuthVariables } from "@/types/variables";
import { AuthTokenServices, CookieServices, UsersServices } from "@/services";

export const validateRefreshToken = (
  logger: Logger,
  cookieService: CookieServices,
  tokenService: AuthTokenServices,
  userService: UsersServices,
) =>
  createMiddleware(async (c: Context<{ Variables: AuthVariables }>, next) => {
    /// Grabbing access token
    const { id, uid } = await cookieService.validateRefreshToken(c);

    /// Additional validation
    const isUsingRevokedToken =
      await tokenService.isUsingRevokedAuthTokenId(id);
    if (isUsingRevokedToken) {
      /// Revoke all token ids
      logger.info("Force revoke tokens", {
        data: {
          userId: uid,
          tokenId: id,
        },
      });
      await tokenService.revokeAllTokensOfUserId(uid);
      throw unauthorized;
    }

    /// Check for auth token
    const isValid = await tokenService.isValidAuthTokenId(id);
    if (!isValid) throw unauthorized;
    logger.info("Refresh token revoked", {
      data: {
        userId: uid,
        tokenId: id,
      },
    });

    /// Revoke all refresh tokens
    await tokenService.revokeAllTokensOfUserId(uid);
    const user = await userService.findById(uid)!;

    /// Setting auth values
    c.set("auth", {
      id: uid,
      role: user!.role,
    });
    await next();
  });
