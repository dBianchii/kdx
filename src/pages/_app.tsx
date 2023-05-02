import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "../utils/api";

import "../styles/globals.css";

import { type ReactNode, Fragment } from "react";
import Header from "@/components/Header/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import Footer from "@/components/Footer/footer";
import { ThemeSwitcher } from "@/components/theme-switcher";

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
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LayoutComponent>
          <Component {...pageProps} />
        </LayoutComponent>
        <ThemeSwitcher devMode={true} />
        <TailwindIndicator />
      </ThemeProvider>
    </SessionProvider>
  );
};

function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default api.withTRPC(MyApp);
