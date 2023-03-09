import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import type { App } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export interface AppWithInstalled extends App {
  installed: boolean;
}

export const appsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const app = await ctx.prisma.app.findMany();
    return app;
  }),
  /**
   * Returns all apps, but with an extra boolean indicating if they are installed in the active workspace for the user
   */
  getAllWithInstalled: protectedProcedure.query(async ({ ctx }) => {
    const apps = await ctx.prisma.app.findMany({
      include: {
        activeWorkspaces: true,
      },
    });
    if (!apps)
      throw new TRPCError({
        message: "No Apps Found",
        code: "INTERNAL_SERVER_ERROR",
      });

    const _apps: AppWithInstalled[] = apps.map((app) => {
      let installed = false;
      app.activeWorkspaces.forEach((workspace) => {
        if (workspace.id === ctx.session.user.activeWorkspaceId) {
          installed = true;
          console.log("object");
        }
      });
      return {
        ...app,
        installed,
      };
    });

    return _apps;
  }),
  getInstalledApps: protectedProcedure.query(async ({ ctx }) => {
    const apps = await ctx.prisma.app.findMany({
      where: {
        activeWorkspaces: {
          some: {
            id: ctx.session.user.activeWorkspaceId,
          },
        },
      },
    });
    return apps;
  }),
});
