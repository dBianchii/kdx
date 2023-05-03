import type { App } from "@prisma/client";
import AppComponent from "../components/App/KodixApp";
import { api } from "../utils/api";

export default function Apps() {
  const { data } = api.app.getInstalledApps.useQuery();

  return (
    <div className="grid grid-cols-4">
      <div className="mx-10 my-4">
        {data &&
          data.map((app: App) => (
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
