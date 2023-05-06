import { H1, H4 } from "@ui/typography";
import AppComponent from "../components/App/KodixApp";
import { api } from "../utils/api";
import { useSession } from "next-auth/react";

export default function Apps() {
  const { data: session } = useSession();
  const { data } = api.app.getInstalled.useQuery();

  return (
    <div className="p-4">
      <H1>Marketplace</H1>
      <H4>People stopped telling jokes</H4>
      <br />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data &&
          data.map((app) => (
            <div key={app.id}>
              <AppComponent
                id={app.id}
                appName={app.name}
                appDescription={app.description}
                appUrl={app.urlApp}
                installed={true}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
