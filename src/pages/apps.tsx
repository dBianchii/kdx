import type { App } from "@prisma/client";
import AppComponent from "../components/App/App";
import { api } from "../utils/api";

export default function Apps() {
  const data = api.app.getInstalledApps.useQuery();
  if (data.isLoading) {
    return <div>Loading...</div>;
  }

  if (!data.data) {
    return <div>Error</div>;
  }

  return (
    <div className="flex min-h-screen flex-row bg-gray-800 bg-gradient-to-b">
      <div className="mx-10 my-4">
        {data.data.map((app: App) => (
          <div key={app.id}>
            <AppComponent
              appName={app.name}
              appDescription={app.description}
              installed={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
