import Image from "next/image";

type Props = {
  appName: string;
  appDescription: string;
  installed: boolean;
};

const KodixApp: React.FC<Props> = ({
  appName,
  appDescription,
  installed = false,
}) => {
  return (
    <div className="max-w-sm rounded-3xl bg-gray-700 p-5 text-center font-semibold shadow-xl">
      <Image
        width={20}
        height={20}
        className="mx-auto mb-3 h-20 w-20 rounded-full shadow-lg"
        src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
        alt="product designer"
      />
      <h1 className="text-lg text-gray-200">{appName}</h1>
      <p className="mt-4 text-xs text-gray-400">{appDescription}</p>
      <button className="mt-8 rounded-3xl px-8 py-2 font-semibold tracking-wide text-gray-100 hover:bg-gray-600">
        {installed ? "Open App" : "Install"}
      </button>
    </div>
  );
};

export default KodixApp;
