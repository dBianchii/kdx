import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

import type {prisma} from "../../db"


export const todoRouter = createTRPCRouter({

  create: protectedProcedure
    .input(z.object({ title: z.string(), description: z.string().nullish(), dueDate: z.date(), reminder: z.boolean()  }))
    .mutation(async ({ ctx, input }) => { 

      const todo = await ctx.prisma.todo.create({
        data: {
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          reminder: input.reminder,
          userId: ctx.session.user.id,
          workspaceId: ctx.session.user.activeWorkspaceId,
          priority: "LOW"
        },

      })
      return todo.id
    }),
  
  
});
