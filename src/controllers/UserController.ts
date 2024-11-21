/** @notice Library imports */
import { Context } from "hono";
import type { Logger } from "winston";
import { BlankEnv } from "hono/types";
import { StatusCodes } from "http-status-codes";
/// Local imports
import { AuthRoutes } from "@/constants/routes";
import { AuthVariables } from "@/types/variables";
import { SuccessResponse } from "@/types/responses";
import { LoginUserInput, NewUserInput } from "@/validators/userValidator";
import { emailAlreadyExistsError, invalidEmailOrPasswordError } from "@/errors";
import {
  CookieServices,
  UsersServices,
  AuthTokenServices,
  CredentialService,
} from "@/services";

export class UserController {
  /// Dependency injection
  constructor(
    private logger: Logger,
    private userServices: UsersServices,
    private cookieService: CookieServices,
    private tokenServices: AuthTokenServices,
    private credentialService: CredentialService,
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
      throw emailAlreadyExistsError;
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
    await this.cookieService.assignRefreshToken(c, {
      userId: newUser.id,
      tokenId: refreshTokenId,
    });

    /// Returns the created response.
    return c.json<SuccessResponse>(
      {
        success: true,
        message: "User created successfully",
      },
      StatusCodes.CREATED,
    );
  }

  async login(c: Context<BlankEnv, AuthRoutes.LOGIN, LoginUserInput>) {
    /// Grabbing validated data
    const data = c.req.valid("json");

    /// Check if user exists
    const user = await this.userServices.findByEmail(data.email);
    if (!user) {
      this.logger.error("Invalid email or password", {
        data: { email: data.email },
      });
      throw invalidEmailOrPasswordError;
    }

    /// Check for password
    const isValidPassword = this.credentialService.isSamePassword(
      data.password,
      user.password,
    );
    if (!isValidPassword) {
      this.logger.error("Invalid email or password", {
        data: { email: data.email },
      });

      throw invalidEmailOrPasswordError;
    }

    /// Successful login
    this.logger.info("User has been logged in.", {
      data: {
        name: user.name,
        email: user.email,
      },
    });

    /// Assign cookies (access & refresh token)
    const refreshTokenId = await this.tokenServices.create({
      userId: user.id,
    });
    await this.cookieService.assignAccessToken(c, {
      id: user.id,
      role: user.role,
    });
    await this.cookieService.assignRefreshToken(c, {
      userId: user.id,
      tokenId: refreshTokenId,
    });

    /// Returns the created response.
    return c.json<SuccessResponse>(
      {
        success: true,
        message: "User logged in successfully",
      },
      StatusCodes.OK,
    );
  }

  async whoami(c: Context<{ Variables: AuthVariables }, AuthRoutes.WHO_AM_I>) {
    /// Returns the success response.
    return c.json<SuccessResponse<AuthVariables["auth"]>>(
      {
        success: true,
        message: "Authenticated",
        data: c.get("auth"),
      },
      StatusCodes.OK,
    );
  }
}
