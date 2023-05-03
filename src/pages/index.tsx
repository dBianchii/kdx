import { signOut, useSession } from "next-auth/react";

import Link from "next/link";
import SEO from "../components/SEO";
import { buttonVariants } from "@ui/button";
import { api } from "@/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Home = () => {
  const { data: session } = useSession();
  const { data: workspaces } = api.workspace.getAllForLoggedUser.useQuery(
    undefined,
    {
      enabled: session?.user !== undefined,
    }
  );
  const workspace = workspaces?.find(
    (x) => x.id === session?.user?.activeWorkspaceId
  );

  return (
    <>
      <SEO title={"Kodix"} description={"Kodix - Software on demand"}></SEO>
      <div className="h-144 flex flex-col items-center justify-center gap-12 bg-background px-4 py-16">
        <h1 className="scroll-m-20 text-6xl font-extrabold tracking-tight lg:text-8xl">
          Welcome to Kodix
        </h1>
        {session && (
          <div className=" text-2xl">
            <p>Your current active workspace is:</p>
            <div className="text-bold inline-flex h-[40px] items-center text-primary">
              <Avatar className="my-auto mr-2 h-5 w-5">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${session.user.id}kdx.png`}
                  alt={workspace?.name}
                />
                <AvatarFallback>
                  {workspace?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="">{workspace?.name}</span>
            </div>
          </div>
        )}

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
