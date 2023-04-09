import { signIn, getProviders, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@ui/Button";
import Link from "next/link";
import { useRouter } from "next/router";
import type { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import { Input } from "@ui/Input";
import { Separator } from "@ui/Separator";

function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const router = useRouter();
  if (session) void router.push("/");

  const [email, setEmail] = useState("");

  return (
    <section className="bg-gray-800">
      <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
        <Link
          href="/"
          className="text-blue mb-6 flex items-center text-2xl font-semibold"
        >
          Kodix
        </Link>
        <div className="w-full rounded-lg bg-slate-900 shadow  sm:max-w-md md:mt-0 xl:p-0">
          <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
            <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-200 md:text-2xl">
              Sign in to your account
            </h1>

            {providers?.email && (
              <>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-400"
                  >
                    Your email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
                <Button
                  variant="subtle"
                  className="w-full"
                  onClick={() =>
                    void signIn("email", { email, callbackUrl: "/" })
                  }
                >
                  Sign In
                </Button>
                <Separator />
              </>
            )}
            {providers?.google && (
              <>
                <Button
                  className="w-full"
                  variant="subtle"
                  onClick={() => void signIn("google", { callbackUrl: "/" })}
                >
                  <FcGoogle className="mr-2 inline" /> Login With Google
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export const getServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: {
      providers,
    },
  };
};

export default SignIn;
