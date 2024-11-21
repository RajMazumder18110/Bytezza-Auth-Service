/** @notice library imports */
import { Context } from "hono";
import { createMiddleware } from "hono/factory";
/// Local imports
import { UserRoles } from "@/constants";
import { AuthVariables } from "@/types/variables";

export const authenticate = createMiddleware(
  async (c: Context<{ Variables: AuthVariables }>, next) => {
    /// handle cookie
    const id = "123";

    /// set authorized user
    c.set("auth", { id, role: UserRoles.CUSTOMER });
    await next();
  },
);
