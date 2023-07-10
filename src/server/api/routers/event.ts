import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { RRule, Frequency, RRuleSet, rrulestr } from "rrule";
import { z } from "zod";
import moment from "moment";
import type { PrismaClient } from "@prisma/client";

function generateRule(
  startDate: Date | undefined,
  endDate: Date | undefined,
  frequency: Frequency,
  interval: number | undefined,
  count: number | undefined
): string {
  const ruleSet = new RRuleSet();
  const rule = new RRule({
    freq: frequency,
    dtstart: startDate,
    until: endDate,
    interval,
    count,
  });
  ruleSet.rrule(rule);
  return ruleSet.toString();
}

async function deleteAllEvents(prisma: PrismaClient, eventMasterId: string) {
  return await prisma.$transaction(async (tx) => {
    const where = {
      eventMasterId: eventMasterId,
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
    await tx.eventInfo.deleteMany({
      where: {
        id: eventMasterId,
      },
    });
    await tx.eventMaster.deleteMany({
      where: {
        id: eventMasterId,
      },
    });
  });
}

export const eventRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        from: z.date(),
        until: z.date().optional(),
        frequency: z.nativeEnum(Frequency),
        interval: z.number().optional(),
        count: z.number().optional(),
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
              input.from,
              input.until,
              input.frequency,
              input.interval,
              input.count
            ),
            workspaceId: ctx.session.user.activeWorkspaceId,
            eventInfoId: eventInfo.id,
            DateStart: input.from,
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
      const eventMasters = await ctx.prisma.eventMaster.findMany({
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
        title: string | null;
        description: string | null;
        date: Date;
        rule: string;
      }

      let calendarTasks: CalendarTask[] = [];

      //const eventGlobalIds = eventGlobal.map((eventMaster) => eventMaster.id)

      eventMasters.forEach((eventMaster) => {
        const rrule = rrulestr(eventMaster.rule);
        const allDates = rrule.between(input.dateStart, input.dateEnd, true);

        allDates.forEach((date) => {
          calendarTasks.push({
            eventId: eventMaster.id,
            title: eventMaster.eventInfo.title,
            description: eventMaster.eventInfo.description,
            date: date,
            rule: eventMaster.rule,
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
                moment(input.dateStart).isSameOrBefore(
                  foundException.newDate
                ) &&
                moment(input.dateEnd).isSameOrAfter(foundException.newDate)
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
      z
        .object({
          eventId: z.string().cuid(),
        })
        .and(
          z.union([
            z.object({
              exclusionDefinition: z.literal("all"),
            }),
            z.object({
              exclusionDefinition: z
                .literal("thisAndFuture")
                .or(z.literal("single")),
              date: z.date(),
            }),
          ])
        )
    )
    .mutation(async ({ ctx, input }) => {
      const eventMaster = await ctx.prisma.eventMaster.findUnique({
        where: {
          id: input.eventId,
        },
      });
      if (!eventMaster)
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });

      if (input.exclusionDefinition === "single") {
        const eventCancelation = await ctx.prisma.eventCancellation.create({
          data: {
            eventMasterId: eventMaster.id,
            originalDate: input.date,
          },
        });
        return eventCancelation;
      } else if (input.exclusionDefinition === "thisAndFuture") {
        const rule = rrulestr(eventMaster.rule);
        const occurences = rule.between(
          eventMaster.DateStart,
          input.date,
          true
        );
        const penultimateOccurence = occurences[occurences.length - 2];
        if (!penultimateOccurence)
          return await deleteAllEvents(ctx.prisma, eventMaster.id);

        const options = RRule.parseString(eventMaster.rule);
        options.until = penultimateOccurence;

        return await ctx.prisma.eventMaster.update({
          where: {
            id: input.eventId,
          },
          data: {
            DateUntil: penultimateOccurence,
            rule: new RRule(options).toString(),
          },
        });
      } else if (input.exclusionDefinition === "all") {
        return deleteAllEvents(ctx.prisma, eventMaster.id);
      }
    }),
  edit: protectedProcedure
    //* I cannot send count with single
    //* I cannot send interval with single
    //* I cannot send until with single
    //* I cannot send frequency with single
    //* I cannot send from with all
    .input(
      z
        .object({
          eventId: z.string().cuid(),
          selectedTimestamp: z.date(),

          title: z.string().optional(),
          description: z.string().optional(),
        })
        .and(
          z.union([
            z.object({
              frequency: z.nativeEnum(Frequency).optional(),
              until: z.date().optional(),
              interval: z.number().optional(),
              count: z.number().optional(),

              from: z.date().optional(),
              editDefinition: z.enum(["thisAndFuture"]),
            }),
            z.object({
              frequency: z.nativeEnum(Frequency).optional(),
              until: z.date().optional(),
              interval: z.number().optional(),
              count: z.number().optional(),

              editDefinition: z.enum(["all"]),
            }),
            z.object({
              from: z.date().optional(),
              editDefinition: z.literal("single"),
            }),
          ])
        )
    )
    .mutation(async ({ ctx, input }) => {
      const eventMaster = await ctx.prisma.eventMaster.findUnique({
        where: {
          id: input.eventId,
        },
        include: {
          eventInfo: true,
        },
      });
      if (!eventMaster)
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });

      if (input.editDefinition === "single") {
        //* Havemos description, title, from e selectedTimestamp.

        //* Havemos um selectedTimestamp.
        //* Temos que procurar se temos uma ocorrencia advinda do RRULE do master que bate com o selectedTimestamp, ou se temos uma exceção que bate com o selectedTimestamp.
        //* Se não tivermos nenhum, temos que gerar um erro.
        const evtMasterRule = rrulestr(eventMaster.rule);
        const occurences = evtMasterRule.between(
          eventMaster.DateStart,
          input.selectedTimestamp,
          true
        );
        const foundTimestamp = occurences.find(
          (x) => x === input.selectedTimestamp
        );
        if (foundTimestamp) {
          //* Ocorrencia encontrada. Temos que verificar se temos uma exceção para ela.
          const eventException = await ctx.prisma.eventException.findFirst({
            where: {
              eventMasterId: eventMaster.id,
              newDate: input.selectedTimestamp,
            },
          });

          if (eventException) {
            //* Temos uma ocorrencia e uma exceção com o MESMO selectedTimestamp. Isso significa que o usuário quer editar a exceção.
            //* Aqui, o usuário pode alterar o title e o description ou o from da exceção.
            return await ctx.prisma.eventException.update({
              where: {
                id: eventException.id,
              },
              data: {
                newDate: input.from,
                EventInfo: {
                  update: {
                    description: input.description,
                    title: input.title,
                  },
                },
              },
            });
            //! END OF PROCEDURE
          } else {
            //* Não temos uma exceção para o selectedTimestamp. Isso significa que o usuário quer editar o master.
            //* Aqui, o usuário pode alterar o title e o description ou o from do master.
            return await ctx.prisma.eventMaster.update({
              where: {
                id: eventMaster.id,
              },
              data: {
                DateStart: input.from,
                eventInfo: {
                  upsert: {
                    //* Upsert é um update ou um create. Se não existir, cria. Se existir, atualiza.
                    create: {
                      description: input.description,
                      title: input.title,
                    },
                    update: {
                      description: input.description,
                      title: input.title,
                    },
                  },
                },
              },
            });
            //! END OF PROCEDURE
          }
        } else {
          //* Não temos uma ocorrencia para o selectedTimestamp. Isso significa que o usuário quer editar o master.
          const eventException = await ctx.prisma.eventException.findFirst({
            where: {
              eventMasterId: eventMaster.id,
              newDate: input.selectedTimestamp,
            },
          });

          if (!eventException) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Event not found",
            });
          }
        }

        if (occurences[occurences.length - 1] !== input.selectedTimestamp)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });
        //

        // await ctx.prisma.$transaction(async (tx) => {
        //   if (input.editDefinition === "single") {
        //     //como sou single, eu não consigo alterar o rule.
        //     //se tiver title ou description, eu tenho que criar um novo eventInfo
        //     //se tiver from, eu tenho que criar um novo eventException

        // 		//Antes de tudo, preciso checar se o evento que eu estou tentando editar nao foi

        //     const { selectedTimestamp, description, title, from } = input;

        //     if (description || title)
        //       //Como eu tenho description ou title, eu tenho que criar um novo eventInfo
        //       return await tx.eventInfo.create({
        //         data: {
        //           title: input.title,
        //           description: input.description,
        //           EventException: {
        //             create: {
        //               EventMaster: {
        //                 connect: {
        //                   id: eventMaster.id,
        //                 },
        //               },
        //               originalDate: selectedTimestamp,
        //               newDate: from,
        //             },
        //           },
        //         },
        //       });
        //     //Se eu nao tenho description ou title, eu nao preciso criar um novo eventInfo. Eu posso apenas criar um novo eventException
        //     await tx.eventMaster.update({
        //       where: {
        //         id: eventMaster.id,
        //       },
        //       data: {
        //         DateStart: from,
        //         EventExceptions: {
        //           create: {
        //             originalDate: selectedTimestamp,
        //             newDate: from,
        //           },
        //         },
        //       },
        //     });
        //   }
        //   return await tx.eventInfo.update({
        //     where: {
        //       id: eventMaster.eventInfoId,
        //     },
        //     data: {
        //       title: input.title,
        //       description: input.description,
        //     },
        //   });
        // });

        // //Temos alteracao de title ou description
        // return await ctx.prisma.eventInfo.create({
        //   data: {
        //     title: input.title,
        //     description: input.description,
        //     EventException: {
        //       create: {
        //         eventMasterId: eventMaster.id,
        //         originalDate: input.selectedTimestamp,
        //         newDate: input.from,
        //       },
        //     },
        //   },
        // });

        // //Nao temos alteracao de title ou description
        // return await ctx.prisma.eventException.create({
        //   data: {
        //     eventMasterId: eventMaster.id,
        //     originalDate: input.selectedTimestamp,
        //     newDate: input.from,
        //   },
        // });
      } else if (input.editDefinition === "thisAndFuture") {
      } else if (input.editDefinition === "all") {
        const options = RRule.parseString(eventMaster.rule);
        options.until = input.until || options.until;
        options.dtstart = input.from || options.dtstart;
        options.freq = input.frequency || options.freq;
        options.interval = input.interval || options.interval;
        options.count = input.count || options.count;

        const newRule = new RRule(options);
        const newRuleString = newRule.toString();

        return await ctx.prisma.eventMaster.update({
          where: {
            id: input.eventId,
          },
          data: {
            DateStart: input.from,
            DateUntil: input.until,
            rule: newRuleString,
            eventInfo: {
              update: {
                title: input.title,
                description: input.description,
              },
            },
          },
        });
      }

      //

      //if (input.allEvents) {
      //  await ctx.prisma.eventMaster.update({
      //    where: {
      //      id: input.eventId,
      //    },
      //    data: {
      //      eventInfo: {
      //        update: {
      //          title: input.title,
      //          description: input.description,
      //        },
      //      },
      //      DateStart: input.from,
      //      DateUntil: input.until,
      //      rule: rule.toString(),
      //    },
      //  });
      //
      //  const exceptions = await ctx.prisma.eventException.findMany({
      //    where: {
      //      eventMasterId: input.eventId,
      //    },
      //  });
      //} else {
      //  await ctx.prisma.eventException.create({
      //    data: {
      //      eventMasterId: eventMaster.id,
      //      originalDate: input.from,
      //      newDate: input.from,
      //      eventInfo: {
      //        create:
      //          input.title || input.description
      //            ? {
      //                title: input.title,
      //                description: input.description,
      //              }
      //            : undefined,
      //      },
      //    },
      //  });
      //}
    }),
});
