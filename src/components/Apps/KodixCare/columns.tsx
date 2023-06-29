import type { AppRouter } from "@/server/api/root";
import { createColumnHelper } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;
export type EventColumn = RouterOutput["event"]["getAll"][number];
const columnHelper = createColumnHelper<EventColumn>();

export const columns = [
  columnHelper.accessor("title", {
    cell: (info) => <div className="font-bold">{info.getValue()}</div>,
  }),
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];
