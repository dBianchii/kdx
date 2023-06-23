import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { datetime, RRule, Frequency, RRuleSet, rrulestr } from "rrule";
import { z } from "zod";
import type { EventInfo } from "@prisma/client";
import { ca } from "date-fns/locale";

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
        dateUntil: z.date(),
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
            DateUntil: input.dateUntil,
          },
        });
      });

      return eventMaster;
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        dateStart: z.date(),
        dateEnd: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const eventGlobal = await ctx.prisma.eventMaster.findMany({
        where: {
          workspaceId: ctx.session.user.activeWorkspaceId,
          DateStart: input.dateStart,
          DateUntil: input.dateEnd,
        },
        include: {
          eventInfo: true,
        },
      });

      interface CalendarTask {
        eventId: string;
        title: string;
        description: string | null;
        date: Date;
      }

      let calendarTasks: CalendarTask[] = [];

      //const eventGlobalIds = eventGlobal.map((eventMaster) => eventMaster.id)

      eventGlobal.forEach((eventMaster) => {
        const rrule = rrulestr(eventMaster.rule);
        const allDates = rrule.between(input.dateStart, input.dateEnd);

        allDates.forEach((date) => {
          calendarTasks.push({
            eventId: eventMaster.id,
            title: eventMaster.eventInfo.title,
            description: eventMaster.eventInfo.description,
            date: date,
          });
        });
      });

      //Handling Exceptions
      const eventExceptions = await ctx.prisma.eventException.findMany({
        where: {
          OR: {
            originalDate: {
              gte: input.dateStart,
              lte: input.dateEnd,
            },
            newDate: {
              gte: input.dateStart,
              lte: input.dateEnd,
            },
          },
        },
        include: {
          EventMaster: {
            select: {
              id: true,
            },
          },
          EventInfo: {
            select: {
              title: true,
              description: true,
            },
          },
        },
      });

      const eventCancelations = await ctx.prisma.eventCancellation.findMany({
        where: {
          originalDate: {
            gte: input.dateStart,
            lte: input.dateEnd,
          },
        },
        include: {
          EventMaster: {
            select: {
              id: true,
            },
          },
        },
      });

      calendarTasks = calendarTasks
        .map((calendarTask) => {
          //Cuidar de cancelamentos
          const foundCancelation = eventCancelations.find(
            (x) =>
              x.eventMasterId === calendarTask.eventId &&
              x.originalDate === calendarTask.date
          );
          if (foundCancelation) return null;

          // No CalendarTasks tenho Date e EventId
          // Pesquiso dentro do EventExceptions filtrado se tenho algum item com OriginalDate e EventId semelhante
          // Se sim, vejo o que a exceção me pede para fazer e executo
          const foundException = eventExceptions.find(
            (x) =>
              x.eventMasterId === calendarTask.eventId &&
              x.originalDate === calendarTask.date
          );
          if (foundException) {
            if (foundException.newDate) {
              //Temos alteraçao de data
              if (
                input.dateStart <= foundException.newDate &&
                foundException.newDate <= input.dateEnd
              ) {
                calendarTask.date = foundException.newDate;
              } else {
                //Temos exclusão do calendarTask
                //Como que eu excluo este calendarTask do array???
                return null;
              }
            }

            if (foundException.eventInfoId) {
              //Alterou informacao
              calendarTask.description =
                foundException.EventInfo?.description ??
                calendarTask.description;
              calendarTask.title =
                foundException.EventInfo?.title ?? calendarTask.title;
            }
          }

          return calendarTask;
        })
        .filter((task): task is CalendarTask => !!task);

      return calendarTasks;
    }),
});
