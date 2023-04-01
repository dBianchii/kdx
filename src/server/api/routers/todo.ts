import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const todoRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().nullish(),
        dueDate: z.date(),
        reminder: z.boolean(),
        priority: z.number().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.create({
        data: {
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          reminder: input.reminder,
          userId: ctx.session.user.id,
          workspaceId: ctx.session.user.activeWorkspaceId,
          priority: input.priority,
        },
      });

      return todo.id;
    }),
  getAllForLoggedUser: protectedProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        userId: ctx.session.user.id,
        workspaceId: ctx.session.user.activeWorkspaceId,
      },
    });

    return todos;
  }),
});
