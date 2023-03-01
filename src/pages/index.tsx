import { signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import Link from "next/link";
import SEO from "../components/SEO";

const Home = () => {
  return (
    <>
      <SEO title={"Kodix"} description={"Kodix - Software on demand"}></SEO>
      <div className="flex h-144 flex-col items-center justify-center gap-12 bg-slate-800 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Welcome to Kodix
        </h1>
        <div className="flex flex-col items-center">
          <AuthShowcase />
        </div>
      </div>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.auth.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <Link
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        href={sessionData ? "" : "/signIn"}
        onClick={sessionData ? () => void signOut() : () => null}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </Link>
    </div>
  );
};
