import Image from "next/image";
import { api } from "src/utils/api";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  appName: string;
  appDescription: string;
  appUrl: string;
  installed: boolean;
};

const KodixApp: React.FC<Props> = ({
  id,
  appName,
  appDescription,
  appUrl,
  installed = false,
}) => {
  const router = useRouter();

  function install(appId: string) {
    //const { mutate } = api.app.installApp.useMutation();
    //mutate({ appId });
  }

  function openApp(appUrl: string) {
    //alert("Not implemented" + appUrl);
    const baseUrl = window.location.origin; // obter a raiz da URL atual
    //appUrl = "/todo";
    const newUrl = baseUrl + appUrl; // concatenar com a variável appURL
    window.open(newUrl, "_self"); // abrir em uma nova aba
  }

  return (
    <div className="mb-4 max-w-sm rounded-3xl bg-gray-700 p-5 text-center font-semibold shadow-xl">
      <Image
        width={20}
        height={20}
        className="mx-auto mb-3 h-20 w-20 rounded-full shadow-lg"
        src="https://pbs.twimg.com/media/EaZSuXXXkAAMtJ5?format=jpg&name=small"
        alt="app"
      />
      <h1 className="text-lg text-gray-200">{appName}</h1>
      <p className="mt-4 text-xs text-gray-400">{appDescription}</p>
      <button
        onClick={
          !installed ? () => void install(id) : () => router.push(appUrl)
        }
        className="mt-8 rounded-3xl px-8 py-2 font-semibold tracking-wide text-gray-100 hover:bg-gray-600"
      >
        {installed ? "Open App" : "Install"}
      </button>
    </div>
  );
};

export default KodixApp;
