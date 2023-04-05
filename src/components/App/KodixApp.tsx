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

  const ctx = api.useContext();
  const { mutate } = api.workspace.installApp.useMutation({
    onSuccess: () => {
      void ctx.app.getAllWithInstalled.invalidate();
    },
  });

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
          !installed
            ? () => void mutate({ appId: id })
            : () => router.push(appUrl)
        }
        className="mt-8 rounded-3xl px-8 py-2 font-semibold tracking-wide text-gray-100 hover:bg-gray-600"
      >
        {installed ? "Open App" : "Install"}
      </button>
    </div>
  );
};

export default KodixApp;
