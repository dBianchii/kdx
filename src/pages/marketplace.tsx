import { useSession } from "next-auth/react";
import KodixApp from "../components/App/KodixApp";
import { api } from "../utils/api";
import { H1, Lead } from "@ui/typography";
import { Separator } from "@ui/separator";

export default function Marketplace() {
  const { data: session } = useSession();
  const { data } = api.app.getAll.useQuery();

  return (
    <>
      <H1>Marketplace</H1>
      <Lead>Take a look at all available apps, and install them</Lead>
      <Separator className="my-4" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data &&
          data.map((app) => (
            <KodixApp
              key={app.id}
              id={app.id}
              appName={app.name}
              appDescription={app.description}
              appUrl={app.urlApp}
              installed={
                session
                  ? app.activeWorkspaces.some(
                      (x) => x.id === session.user.activeWorkspaceId
                    )
                  : false
              }
            />
          ))}
      </div>
    </>
  );
}
