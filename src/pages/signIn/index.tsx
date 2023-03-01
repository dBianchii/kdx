import {
  signIn,
  getProviders,
  type LiteralUnion,
  type ClientSafeProvider,
  useSession,
  type SignInOptions,
} from "next-auth/react";
import type { BuiltInProviderType } from "next-auth/providers";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useState } from "react";
import Button from "@ui/Button";
import Link from "next/link";
import { useRouter } from "next/router";

const SignIn = () => {
  const signInOptions: SignInOptions = {
    email: "",
    callbackUrl: "/",
  };
  const [email, setEmail] = useState(signInOptions);
  const handleEmail = (emailString: string) => {
    const signInOptions: SignInOptions = {
      email: emailString,
      callbackUrl: "/",
    };
    setEmail(signInOptions);
  };

  const [providers, setproviders] = useState<Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null>();

  useEffect(() => {
    const setTheProviders = async () => {
      const setupProviders = await getProviders();
      setproviders(setupProviders);
    };

    setTheProviders().catch((error) => {
      throw error;
    });
  }, []);

  const { data: session } = useSession();
  const router = useRouter();
  if (session) void router.push("/");

  return (
    <section className="bg-gray">
      <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
        <Link
          href="/"
          className="text-gray-dark mb-6 flex items-center text-2xl font-semibold"
        >
          Kodix
        </Link>
        <div className="w-full rounded-lg bg-gray-800 shadow  sm:max-w-md md:mt-0 xl:p-0">
          <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
            <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-200 md:text-2xl">
              Sign in to your account
            </h1>

            {providers?.email && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-400">
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    onChange={(e) => handleEmail(e.target.value)}
                    className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-md border border-gray-300 bg-gray-50 p-2.5 text-gray-900 sm:text-sm"
                    placeholder="name@company.com"
                  />
                </div>
                <Button
                  intent="primary"
                  onClick={() => void signIn(providers.email.id, email)}
                  fullWidth={true}
                >
                  Sign In
                </Button>
                <hr />
              </>
            )}
            {providers?.google && (
              <>
                <Button
                  intent="secondary"
                  fullWidth={true}
                  onClick={() =>
                    void signIn(providers.google.id, { callbackUrl: "/" })
                  }
                >
                  <FcGoogle className="inline" /> Login With Google
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
export default SignIn;
