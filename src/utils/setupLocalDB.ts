import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  const kdxPartnerId = "clh9tiqsj000835711pg3sskn";
  await prisma.devPartner.upsert({
    where: {
      id: kdxPartnerId,
    },
    update: {},
    create: {
      id: kdxPartnerId,
      name: "Kodix",
      partnerUrl: "kodix.com.br",
    },
  });

  const apps = [
    {
      id: "clhb5iple000008lcgd0zem9n",
      name: "Todo",
      description: "Todo app",
      subscriptionCost: 0,
      devPartnerId: kdxPartnerId,
      urlApp: "/todo",
    },
  ];

  for (const app of apps) {
    await prisma.app.upsert({
      where: {
        id: app.id,
      },
      update: {},
      create: app,
    });
  }
})()
  .then(() => {
    console.log("Done!");
  })
  .catch((e) => {
    console.error(e);
  });
