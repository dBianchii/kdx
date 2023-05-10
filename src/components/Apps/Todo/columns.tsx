"use client";

import type { Todo } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.1
export type TodoColumns = {
  id: Todo["id"];
  priority: Todo["priority"];
  status: Todo["status"];
  title: Todo["title"];
  dueDate: Todo["dueDate"];
  assignedToUserId: Todo["assignedToUserId"];
};

export const columns: ColumnDef<TodoColumns>[] = [
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
  },
  {
    accessorKey: "assignedToUserId",
    header: "Assigned To",
  },
];
