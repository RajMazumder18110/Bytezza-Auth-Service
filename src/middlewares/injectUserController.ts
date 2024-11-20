/** @notice library imports */
import { Context } from "hono";
import { createMiddleware } from "hono/factory";
/// Local imports
import { UsersRepository } from "@/database/users/repository";
import { UserController } from "@/controllers/UserController";
import { InjectUserControllerVariables } from "@/types/variables";

/// Instances
const userRepo = new UsersRepository();
const userController = new UserController(userRepo);

/// Inject middleware
export const injectUserController = createMiddleware(
  async (c: Context<{ Variables: InjectUserControllerVariables }>, next) => {
    c.set("userController", userController);
    await next();
  },
);
