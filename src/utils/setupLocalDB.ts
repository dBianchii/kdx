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
    {
      id: "clhb5q2kq000208lcbclw71in",
      name: "Busca CEP",
      description: "Este app busca os ceps",
      subscriptionCost: 0,
      devPartnerId: kdxPartnerId,
      urlApp: "/ceps",
    },
    {
      id: "clhb5rbl5000408lc5bhqc5hs",
      name: "Gatinhos Dengosos",
      description: "Este app busca gatinhos dengosos na sua rua",
      subscriptionCost: 0,
      devPartnerId: kdxPartnerId,
      urlApp: "/gatinhosDengosos",
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
