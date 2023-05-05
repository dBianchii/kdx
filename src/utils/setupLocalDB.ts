import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  const kdxPartnerId = "clh9tiqsj000835711pg3sskn";
  await prisma.devPartner.createMany({
    data: [
      {
        id: kdxPartnerId,
        name: "Kodix",
        partnerUrl: "kodix.com.br",
      },
    ],
  });

  await prisma.app.createMany({
    data: [
      {
        name: "Todo",
        description: "Todo app",
        subscriptionCost: 0,
        devPartnerId: kdxPartnerId,
        urlApp: "/todo",
      },
    ],
  });
})()
  .then(() => {
    console.log("Done!");
  })
  .catch((e) => {
    console.error(e);
  });
