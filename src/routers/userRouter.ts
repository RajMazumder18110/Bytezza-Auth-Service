/** @notice library imports */
import { Hono } from "hono";
/// Local imports
import { AuthRoutes } from "@/constants/routes";
import { UserController } from "@/controllers/UserController";
// import { UsersRepository } from "@/database/users/repository";

/// Dependencies
// const userRepo = new UsersRepository();
const userController = new UserController();

/// Users router
export const usersRouter = new Hono({ strict: false })

  /// Register a new user
  .post(AuthRoutes.REGISTER, userController.register);
