import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "../utils/api";

import "../styles/globals.css";

import NavBar from "../components/NavBar/NavBar";
import { Fragment } from "react";

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
      <LayoutComponent className="h-fit bg-k-color-background">
        <Component {...pageProps} />
      </LayoutComponent>
    </SessionProvider>
  );
};

function Layout({
  children,
  className,
}: React.AllHTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className}>
      <NavBar />
      {children}
    </div>
  );
}

export default api.withTRPC(MyApp);
