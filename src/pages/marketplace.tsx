import type { App } from "@prisma/client";
import AppComponent from "../components/App/App";
import { api } from "../utils/api";

export interface AppWithInstalled extends App {
  installed: boolean;
}

export default function Marketplace() {
  //const data = api.app.getAll.useQuery();
  const data = api.app.getAllWithInstalled.useQuery();

  if (data.isLoading) {
    return <div>Loading...</div>;
  }

  if (!data.data) {
    return <div>Error</div>;
  }

  return (
    <div className="flex min-h-screen flex-row bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="mx-10 my-4">
        {data.data.map((app: AppWithInstalled) => (
          <div key={app.id}>
            <AppComponent
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
