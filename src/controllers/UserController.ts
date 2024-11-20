/** @notice Library imports */
import { Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { BlankEnv, BlankInput } from "hono/types";
/// Local imports

import { AuthRoutes } from "@/constants/routes";
import { SuccessResponse } from "@/types/responses";
// import { UsersRepository } from "@/database/users/repository";

export class UserController {
  /// Dependency injection
  //   constructor(private userRepo: UsersRepository) {}

  async register(c: Context<BlankEnv, AuthRoutes.REGISTER, BlankInput>) {
    // console.log(this.userRepo);

    return c.json<SuccessResponse<{ id: string }>>(
      {
        success: true,
        message: "User created successfully",
      },
      StatusCodes.CREATED,
    );
  }
}
