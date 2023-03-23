import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workspaceRouter = createTRPCRouter({
  getAllForLoggedUser: protectedProcedure.query(async ({ ctx }) => {
    const workspaces = await ctx.prisma.workspace.findMany({
      where: {
        users: {
          some: {
            id: ctx.session.user.id,
          },
        },
      },
    });

    return workspaces;
  }),
  create: protectedProcedure
    .input(z.object({ userId: z.string().cuid(), workspaceName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.create({
        data: {
          name: input.workspaceName,
          users: {
            connect: [{ id: input.userId }],
          },
        },
      });

      return workspace;
    }),
  getOne: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: {
          id: input.workspaceId,
        },
      });

      if (!workspace)
        throw new TRPCError({
          message: "No Workspace Found",
          code: "NOT_FOUND",
        });

      return workspace;
    }),
  update: protectedProcedure
    .input(
      z.object({ workspaceId: z.string().cuid(), workspaceName: z.string() })
    )
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.update({
        where: {
          id: input.workspaceId,
        },
        data: {
          name: input.workspaceName,
        },
      });
      return workspace;
    }),
  getActiveWorkspace: protectedProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
        include: {
          activeWorkspace: true,
        },
      });

      if (!user)
        throw new TRPCError({
          message: "No User Found",
          code: "NOT_FOUND",
        });
      if (!user.activeWorkspace)
        throw new TRPCError({
          message: "No Active Workspace Found",
          code: "NOT_FOUND",
        });

      return user.activeWorkspace;
    }),
});
