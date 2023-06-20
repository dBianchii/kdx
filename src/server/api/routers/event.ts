import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { datetime, RRule, Frequency, RRuleSet, rrulestr } from "rrule";
import { z } from "zod";

function generateRule(
  startDate: Date,
  endDate: Date,
  frequency: Frequency
): string {
  const ruleSet = new RRuleSet();
  const rule = new RRule({
    freq: frequency,
    dtstart: startDate,
    until: endDate,
  });
  ruleSet.rrule(rule);
  return ruleSet.toString();
}

export const eventRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        frequency: z.nativeEnum(Frequency),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const eventMaster = await ctx.prisma.$transaction(async (tx) => {
        const eventInfo = await tx.eventInfo.create({
          data: {
            title: input.title,
            description: input.description,
          },
        });

        return await tx.eventMaster.create({
          data: {
            rule: generateRule(input.startDate, input.endDate, input.frequency),
            workspaceId: ctx.session.user.activeWorkspaceId,
            eventInfoId: eventInfo.id,
          },
        });
      });

      return eventMaster;
    }),
});
