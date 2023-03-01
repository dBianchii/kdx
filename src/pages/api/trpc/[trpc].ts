import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "server/env.mjs";
import { createTRPCContext } from "server/server/api/trpc";
import { appRouter } from "server/server/api/root";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});
