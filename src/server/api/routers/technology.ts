import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const technologyRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.technology.findMany();
  }),
  deleteAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.technology.deleteMany();
  }),
  createTech: publicProcedure
    .input(
      z.object({
        name: z.string(),
        idade: z.number(),
        email: z.string().email().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.technology.create({ data: input });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.prisma?.technology.delete({
        where: {
          id: input.id,
        },
      });
      return { deleted: result };
    }),
});
