import { H1, H4, Lead } from "@ui/typography";
import KodixApp from "../components/App/KodixApp";
import { api } from "../utils/api";
import { useEffect } from "react";

export default function Apps() {
  const { data: apps } = api.app.getInstalled.useQuery();

  useEffect(() => void {}, [apps]);

  return (
    <div className="p-4">
      <H1>Your installed apps</H1>
      <Lead className="mt-2">These are your installed apps</Lead>
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
