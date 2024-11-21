/** @notice Library imports */
import { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import type { Logger } from "winston";
/// Local imports
import { AuthRoutes } from "@/constants/routes";
import { SuccessResponse } from "@/types/responses";
import { NewUserInput } from "@/validators/userValidator";
import { UsersRepository } from "@/database/users/repository";
import { InjectUserControllerVariables } from "@/types/variables";

export class UserController {
  /// Dependency injection
  constructor(
    private userRepo: UsersRepository,
    private logger: Logger,
  ) {}

  async register(
    c: Context<
      { Variables: InjectUserControllerVariables },
      AuthRoutes.REGISTER,
      NewUserInput
    >,
  ) {
    /// Grabbing validated data
    const data = c.req.valid("json");

    /// Create user
    await this.userRepo.create(data);
    this.logger.info("User has been registered.", {
      data: {
        email: data.email,
      },
    });

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