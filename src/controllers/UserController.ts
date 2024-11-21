/** @notice Library imports */
import { Context } from "hono";
import type { Logger } from "winston";
import { BlankEnv } from "hono/types";
import { StatusCodes } from "http-status-codes";
/// Local imports
import { emailAlreadyExists } from "@/errors";
import { AuthRoutes } from "@/constants/routes";
import { SuccessResponse } from "@/types/responses";
import { NewUserInput } from "@/validators/userValidator";
import { CookieServices, UsersServices, AuthTokenServices } from "@/services";

export class UserController {
  /// Dependency injection
  constructor(
    private logger: Logger,
    private userServices: UsersServices,
    private cookieService: CookieServices,
    private tokenServices: AuthTokenServices,
  ) {}

  async register(c: Context<BlankEnv, AuthRoutes.REGISTER, NewUserInput>) {
    /// Grabbing validated data
    const data = c.req.valid("json");

    /// Check if user already exists
    const user = await this.userServices.findByEmail(data.email);
    if (user) {
      this.logger.error("Email already exists", {
        data: { email: data.email },
      });
      throw emailAlreadyExists;
    }

    /// Create user
    const newUser = await this.userServices.create(data);
    this.logger.info("User has been registered.", {
      data: {
        name: data.name,
        email: data.email,
      },
    });

    /// Assign cookies (access & refresh token)
    const refreshTokenId = await this.tokenServices.create({
      userId: newUser.id,
    });
    await this.cookieService.assignAccessToken(c, {
      id: newUser.id,
      role: newUser.role,
    });
    await this.cookieService.assignRefreshToken(c, refreshTokenId);

    /// Returns the created response.
    return c.json<SuccessResponse<{ id: string }>>(
      {
        success: true,
        message: "User created successfully",
      },
      StatusCodes.CREATED,
    );
  }
}
