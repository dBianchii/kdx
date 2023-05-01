import { signIn, getProviders, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import type { InferGetStaticPropsType } from "next";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Label } from "@ui/label";
import { Input } from "@ui/input";
import { Separator } from "@ui/separator";

function SignIn({ providers }: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: session } = useSession();
  const router = useRouter();
  if (session) void router.push("/");

  const [email, setEmail] = useState("");

  return (
    <section>
      <div className="mx-auto flex h-screen flex-col items-center justify-center px-6 py-8 lg:py-0">
        <Link href="/" className="my-4 text-4xl font-extrabold">
          Kodix
        </Link>
        <Card className="w-[400px]">
          <CardHeader className="text-center">
            <CardTitle className="text-bold text-lg">
              Sign in to your account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center">
                <div className="flex flex-col">
                  {providers?.email && (
                    <>
                      <Label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Your email
                      </Label>
                      <Input
                        type="email"
                        placeholder="name@company.com"
                        id="email"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button
                        variant="default"
                        onClick={() => void signIn("email", { email })}
                        className="mt-4"
                      >
                        Sign In
                      </Button>
                    </>
                  )}

                  <Separator className="my-4" />

                  {providers?.google && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => void signIn("google")}
                      >
                        <FcGoogle className="mr-2 h-4 w-4" /> Sign in with
                        Google
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export const getStaticProps = async () => {
  const providers = await getProviders();
  return {
    props: {
      providers,
    },
  };
};

export default SignIn;
