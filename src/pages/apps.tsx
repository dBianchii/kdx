import { H1, H4 } from "@ui/typography";
import KodixApp from "../components/App/KodixApp";
import { api } from "../utils/api";
import { useEffect } from "react";

export default function Apps() {
  const { data: apps } = api.app.getInstalled.useQuery();

  useEffect(() => void {}, [apps]);

  return (
    <div className="p-4">
      <H1>Marketplace</H1>
      <H4>People stopped telling jokes</H4>
      <br />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {apps &&
          apps.map((app) => (
            <div key={app.id}>
              <KodixApp
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
