/** @notice library imports */
import { Hono } from "hono";
/// Local imports
import { AuthRoutes } from "@/constants/routes";
import { newUserSchema } from "@/validators/userValidator";
import { validateSchema } from "@/middlewares/schemaValidateMiddleware";
import { injectUserController } from "@/middlewares/injectUserController";

/// Users router
export const usersRouter = new Hono({ strict: false })
  /// Inject user controller dependency
  .use(injectUserController)

  /// Register a new user
  .post(AuthRoutes.REGISTER, validateSchema(newUserSchema), (c) =>
    c.get("userController").register(c),
  );
