/** @notice library imports */
import { Context } from "hono";
import { createMiddleware } from "hono/factory";
/// Local imports
import { Logger } from "@/config";
import { CookieServices } from "@/services/CookieServices";
import { UsersRepository } from "@/database/users/repository";
import { UserController } from "@/controllers/UserController";
import { InjectUserControllerVariables } from "@/types/variables";
import { CredentialService } from "@/services/CredentialServices";

/// Instances
const credService = new CredentialService();
const userRepo = new UsersRepository(credService);
const cookieService = new CookieServices(credService);
const userController = new UserController(Logger, userRepo, cookieService);

/// Inject middleware
export const injectUserController = createMiddleware(
  async (c: Context<{ Variables: InjectUserControllerVariables }>, next) => {
    c.set("userController", userController);
    await next();
  },
);
