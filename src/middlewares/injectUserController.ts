/** @notice library imports */
import { Context } from "hono";
import { createMiddleware } from "hono/factory";
/// Local imports
import { Logger } from "@/config";
import { UserController } from "@/controllers/UserController";
import { InjectUserControllerVariables } from "@/types/variables";
import {
  UsersServices,
  CookieServices,
  CredentialService,
  AuthTokenServices,
} from "@/services";

/// Instances
const credService = new CredentialService();
const authTokenService = new AuthTokenServices();
const userService = new UsersServices(credService);
const cookieService = new CookieServices(credService);
const userController = new UserController(
  Logger,
  userService,
  cookieService,
  authTokenService,
);

/// Inject middleware
export const injectUserController = createMiddleware(
  async (c: Context<{ Variables: InjectUserControllerVariables }>, next) => {
    c.set("userController", userController);
    await next();
  },
);
