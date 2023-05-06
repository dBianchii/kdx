import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import type { App } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export interface AppWithInstalled extends App {
  installed: boolean;
}

export const appsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const apps = await ctx.prisma.app.findMany({
      include: {
        activeWorkspaces: ctx.session
          ? {
              where: {
                id: ctx.session.user.activeWorkspaceId,
              },
            }
          : undefined,
      },
    });

    if (!apps)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No apps found",
      });

    return apps;
  }),
  getInstalled: protectedProcedure.query(async ({ ctx }) => {
    const apps = await ctx.prisma.app.findMany({
      where: {
        activeWorkspaces: {
          some: {
            id: ctx.session.user.activeWorkspaceId,
          },
        },
      },
    });

    if (!apps)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No apps found",
      });

    return apps;
  }),
});
