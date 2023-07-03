import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { RRule, Frequency, RRuleSet, rrulestr } from "rrule";
import { z } from "zod";
import moment from "moment";

function generateRule(
  startDate: Date | undefined,
  endDate: Date | undefined,
  frequency: Frequency,
  interval: number | undefined
): string {
  const ruleSet = new RRuleSet();
  const rule = new RRule({
    freq: frequency,
    dtstart: startDate,
    until: endDate,
    interval,
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
        dateStart: z.date(),
        until: z.date().optional(),
        frequency: z.nativeEnum(Frequency),
        interval: z.number().optional(),
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
            rule: generateRule(
              input.dateStart,
              input.until,
              input.frequency,
              input.interval
            ),
            workspaceId: ctx.session.user.activeWorkspaceId,
            eventInfoId: eventInfo.id,
            DateStart: input.dateStart,
            DateUntil: input.until,
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
    .query(async ({ ctx, input }) => {
      const eventGlobal = await ctx.prisma.eventMaster.findMany({
        where: {
          workspaceId: ctx.session.user.activeWorkspaceId,
          AND: [
            {
              DateStart: {
                lte: input.dateEnd,
              },
            },
            {
              OR: [
                { DateUntil: { gte: input.dateStart } },
                { DateUntil: null },
              ],
            },
          ],
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

      //Handling Exceptions and Cancelations
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
          const foundCancelation = eventCancelations.some(
            (x) =>
              x.eventMasterId === calendarTask.eventId &&
              moment(x.originalDate).isSame(calendarTask.date)
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
  cancelEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        originalDate: z.date(),
        allEvents: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const eventMaster = await ctx.prisma.eventMaster.findUnique({
        where: {
          id: input.eventId,
        },
      });
      if (!eventMaster)
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });

      if (!input.allEvents) {
        const eventCancelation = await ctx.prisma.eventCancellation.create({
          data: {
            eventMasterId: eventMaster.id,
            originalDate: input.originalDate,
          },
        });
        return eventCancelation;
      } else {
        await ctx.prisma.$transaction(async (tx) => {
          const where = {
            eventMasterId: eventMaster.id,
          };
          await tx.eventCancellation.deleteMany({
            where,
          });
          await tx.eventException.deleteMany({
            where,
          });
          await tx.eventDone.deleteMany({
            where,
          });
          await tx.eventMaster.deleteMany({
            where: {
              id: eventMaster.id,
            },
          });
          await tx.eventInfo.deleteMany({
            where: {
              id: eventMaster.eventInfoId,
            },
          });
        });
      }
    }),
});
