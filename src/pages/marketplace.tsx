import { useSession } from "next-auth/react";
import KodixApp from "../components/App/KodixApp";
import { api } from "../utils/api";
import { H1, H4 } from "@ui/typography";

export default function Marketplace() {
  const { data: session } = useSession();
  const { data } = api.app.getAll.useQuery();

  return (
    <div className="p-4">
      <H1>Marketplace</H1>
      <H4>People stopped telling jokes</H4>
      <br />
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
    </div>
  );
}
