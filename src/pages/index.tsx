import { signOut, useSession } from "next-auth/react";

import Link from "next/link";
import SEO from "../components/SEO";
import { buttonVariants } from "@ui/button";
import { api } from "@/utils/api";

const Home = () => {
  const { data: session } = useSession();
  const { data: workspaces } = api.workspace.getAllForLoggedUser.useQuery(
    undefined,
    {
      enabled: session?.user !== undefined,
    }
  );

  return (
    <>
      <SEO title={"Kodix"} description={"Kodix - Software on demand"}></SEO>
      <div className="h-144 flex flex-col items-center justify-center gap-12 bg-background px-4 py-16">
        <h1 className="scroll-m-20 text-6xl font-extrabold tracking-tight lg:text-8xl">
          Welcome to Kodix
        </h1>
        <div className="text-center text-2xl">
          <p>Your current active workspace is:</p>
          <span className="text-bold text-primary">
            {
              workspaces?.find((x) => x.id === session?.user?.activeWorkspaceId)
                ?.name
            }
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Link
              href={session ? "" : "/signIn"}
              onClick={session ? () => void signOut() : () => null}
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
