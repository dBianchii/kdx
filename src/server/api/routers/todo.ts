import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Status } from "@prisma/client";

export const todoRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        reminder: z.boolean().optional(),
        priority: z.number().optional(),
        status: z.nativeEnum(Status).optional(),
        assignedToUserId: z.string().cuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.create({
        data: {
          assignedToUserId: ctx.session.user.id,
          workspaceId: ctx.session.user.activeWorkspaceId,

          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          priority: input.priority,
        },
      });

      return todo.id;
    }),
  getAllForLoggedUser: protectedProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        assignedToUserId: ctx.session.user.id,
        workspaceId: ctx.session.user.activeWorkspaceId,
      },
    });

    return todos;
  }),
});
