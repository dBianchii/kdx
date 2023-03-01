import { createTRPCRouter } from "./trpc";
import { appsRouter } from "../api/routers/apps";
import { authRouter } from "../api/routers/auth";
import { technologyRouter } from "../api/routers/technology";
import { userRouter } from "../api/routers/user";
import { workspaceRouter } from "../api/routers/workspace";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  app: appsRouter,
  auth: authRouter,
  technology: technologyRouter,
  user: userRouter,
  workspace: workspaceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
