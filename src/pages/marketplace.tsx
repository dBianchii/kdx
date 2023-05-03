"use client";

import KodixApp from "../components/App/KodixApp";
import { api } from "../utils/api";
import { H1, H4 } from "@ui/typography";

export default function Marketplace() {
  const data = api.app.getAllWithInstalled.useQuery(undefined);
  const loading = data.isLoading;

  return (
    <div className="p-4">
      <H1>Marketplace</H1>
      <H4>People stopped telling jokes</H4>
      <div className="grid grid-cols-4">
        {data.data &&
          !loading &&
          data.data.map((app) => (
            <div key={app.id}>
              <KodixApp
                id={app.id}
                appName={app.name}
                appDescription={app.description}
                appUrl={app.urlApp}
                installed={app.installed}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
