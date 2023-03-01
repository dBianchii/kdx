import { createTRPCRouter } from "../trpc";
import { appsRouter } from "./apps";
import { authRouter } from "./auth";
import { technologyRouter } from "./technology";
import { userRouter } from "./user";
import { workspaceRouter } from "./workspace";

export const appRouter = createTRPCRouter({
  user: userRouter,
  auth: authRouter,
  technology: technologyRouter,
  workspace: workspaceRouter,
  app: appsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
