import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "../utils/api";

import "../styles/globals.css";

import { type ReactNode, Fragment } from "react";
import NavBar from "@/components/NavBar/NavBar";
import Header from "@/components/Header/Header";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
  ...appProps
}) => {
  const routesLayoutNotNeeded = ["/signIn", "/newUser"];
  const isLayoutNotNeeded = !routesLayoutNotNeeded.includes(
    (appProps.router as { pathname: string }).pathname
  );
  const LayoutComponent = isLayoutNotNeeded ? Layout : Fragment;

  return (
    <SessionProvider session={session}>
      <LayoutComponent>
        <Component {...pageProps} />
      </LayoutComponent>
    </SessionProvider>
  );
};

function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      <NavBar />
      {/* <Header /> */}
      {children}
    </>
  );
}

export default api.withTRPC(MyApp);
