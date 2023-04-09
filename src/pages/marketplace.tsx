import KodixApp from "../components/App/KodixApp";
import { api } from "../utils/api";

export default function Marketplace() {
  //const data = api.app.getAll.useQuery();
  const data = api.app.getAllWithInstalled.useQuery(undefined);
  const loading = data.isLoading;

  return (
    <div className="flex min-h-screen flex-row">
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
  );
}
