/** @notice library imports */
import { Hono } from "hono";

/// Local imports
import { handlers } from "@/middlewares";
import { usersRouter } from "@/routers/userRouter";
import { ApplicationRoutes } from "@/constants/routes";

/// Core app
const app = new Hono({ strict: false });

/// Routers
app.route(ApplicationRoutes.AUTH, usersRouter);

/// Global handlers
app.onError(handlers.onErrorHandler);
app.notFound(handlers.onNotFoundHandler);

export default app;
