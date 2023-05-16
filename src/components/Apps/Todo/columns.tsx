import {} from "@/pages/app/todo";
import { Button } from "@ui/button";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@ui/avatar";
import { type inferRouterOutputs } from "@trpc/server";

import { type AppRouter } from "@/server/api/root";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import StatusPopover, { StatusIcon, StatusToText } from "./StatusPopover";
import { PopoverTrigger } from "@/components/ui/popover";
import type { Status } from "@prisma/client";
import { api } from "@/utils/api";
import { toast, useToast } from "@/components/ui/use-toast";
import {
  type Priority,
  PriorityIcon,
  PriorityPopover,
  PriorityToTxt,
} from "./PriorityPopover";
import { DatePickerIcon, DatePickerWithPresets } from "./DatePickerWithPresets";
import { AssigneePopover } from "./AssigneePopover";
import { UserCircleIcon } from "@heroicons/react/24/outline";

type RouterOutput = inferRouterOutputs<AppRouter>;
export type TodoColumn = RouterOutput["todo"]["getAllForLoggedUser"][number];
const columnHelper = createColumnHelper<TodoColumn>();

export const columns = [
  columnHelper.accessor("priority", {
    cell: function Cell(info) {
      const [priority, setPriority] = useState<Priority>(0); //added "0" Just to make TS happy
      const { toast } = useToast();

      const value = info.getValue() as Priority;
      useEffect(() => {
        if (value) setPriority(value);
      }, [value]);

      const ctx = api.useContext();
      const { mutate: updateTodo } = api.todo.update.useMutation({
        async onMutate(newData) {
          if (!newData.priority) return;

          // Cancel outgoing fetches (so they don't overwrite our optimistic update)
          await ctx.todo.getAllForLoggedUser.cancel();

          // Get the previous data, so we can rollback later
          const prevData = priority;
          // Optimistically update to the new value
          setPriority(newData.priority as Priority);
          return { prevData };
        },
        onError(err, newTodo, ctx) {
          if (!ctx?.prevData) return;

          toast({
            variant: "destructive",
            title: `Failed to update priority`,
            description: "Please try again later",
          });
          // If the mutation fails, use the context-value from onMutate
          setPriority(ctx?.prevData);
        },
      });

      function handlePriorityChange(newPriority: Priority) {
        updateTodo({ id: info.row.original.id, priority: newPriority });
      }

      return (
        <div className="text-left">
          <PriorityPopover setPriority={handlePriorityChange}>
            <PopoverTrigger>
              <Button variant="ghost" size="xs">
                <PriorityIcon priority={priority} className="mr-2" />
                {PriorityToTxt(priority)}
                <span className="sr-only">Open priority popover</span>
              </Button>
            </PopoverTrigger>
          </PriorityPopover>
        </div>
      );
    },
  }),
  columnHelper.accessor("status", {
    cell: function Cell(info) {
      const [status, setStatus] = useState<Status>("TODO"); //added "TODO" Just to make TS happy
      const { toast } = useToast();

      const value = info.getValue();
      useEffect(() => {
        if (value) setStatus(value);
      }, [value]);

      const ctx = api.useContext();
      const { mutate: updateTodo } = api.todo.update.useMutation({
        async onMutate(newData) {
          if (!newData.status) return;

          // Cancel outgoing fetches (so they don't overwrite our optimistic update)
          await ctx.todo.getAllForLoggedUser.cancel();

          // Get the previous data, so we can rollback later
          const prevData = status;
          // Optimistically update to the new value
          setStatus(newData.status);
          return { prevData };
        },
        onError(err, newTodo, ctx) {
          if (!ctx?.prevData) return;

          toast({
            variant: "destructive",
            title: `Failed to update status`,
            description: "Please try again later",
          });
          // If the mutation fails, use the context-value from onMutate
          setStatus(ctx?.prevData);
        },
      });

      function handleStatusChange(newStatus: Status) {
        updateTodo({ id: info.row.original.id, status: newStatus });
      }

      const statusTxt = StatusToText(status);

      return (
        <StatusPopover setStatus={handleStatusChange}>
          <PopoverTrigger>
            <Button variant="ghost" size="xs">
              <StatusIcon status={status} className="mr-2" />
              {statusTxt}
              <span className="sr-only">Open status popover</span>
            </Button>
          </PopoverTrigger>
        </StatusPopover>
      );
    },
  }),
  columnHelper.accessor("title", {
    cell: (info) => <div className="font-bold">{info.getValue()}</div>,
  }),
  columnHelper.accessor("dueDate", {
    cell: function Cell(info) {
      const [dueDate, setDueDate] = useState<Date>();
      const { toast } = useToast();

      const value = info.getValue();
      useEffect(() => {
        if (value) setDueDate(value);
      }, [value]);

      const ctx = api.useContext();
      const { mutate: updateTodo } = api.todo.update.useMutation({
        async onMutate(newData) {
          // Cancel outgoing fetches (so they don't overwrite our optimistic update)
          await ctx.todo.getAllForLoggedUser.cancel();

          // Get the previous data, so we can rollback later
          const prevData = dueDate;
          // Optimistically update to the new value
          setDueDate(newData.dueDate ?? undefined);
          return { prevData };
        },
        onError(err, newTodo, ctx) {
          toast({
            variant: "destructive",
            title: `Failed to update due date`,
            description: "Please try again later",
          });
          // If the mutation fails, use the context-value from onMutate
          setDueDate(ctx?.prevData);
        },
      });

      function handleDueDateChange(newDueDate: Date | undefined | null) {
        updateTodo({ id: info.row.original.id, dueDate: newDueDate });
      }

      return (
        <div className="text-right">
          <DatePickerWithPresets date={dueDate} setDate={handleDueDateChange}>
            <PopoverTrigger>
              <Button variant="ghost" size="xs">
                <DatePickerIcon date={dueDate} className="mr-2" />
                {dueDate
                  ? format(new Date(dueDate.toString() ?? ""), "PPP").split(
                      ","
                    )[0]
                  : "Pick a date"}
                {dueDate && (
                  <span
                    onClick={() => {
                      handleDueDateChange(null);
                    }}
                    className="ml-2 rounded-full transition-colors hover:bg-primary/90 hover:text-background"
                  >
                    <X className="h-4 w-4 " />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </DatePickerWithPresets>
        </div>
      );
    },
  }),
  columnHelper.accessor("assignedToUser", {
    cell: function Cell(info) {
      const [assignedToUserId, setAssignedToUserId] = useState("");

      const value = info.getValue();
      useEffect(() => {
        if (value) setAssignedToUserId(value.id);
      }, [value]);

      const { data: workspace } = api.workspace.getActiveWorkspace.useQuery();

      const ctx = api.useContext();
      const { mutate: updateTodo } = api.todo.update.useMutation({
        async onMutate(newData) {
          // Cancel outgoing fetches (so they don't overwrite our optimistic update)
          await ctx.todo.getAllForLoggedUser.cancel();

          // Get the previous data, so we can rollback later
          const prevData = assignedToUserId;
          // Optimistically update to the new value
          setAssignedToUserId(newData.assignedToUserId ?? "");
          return { prevData };
        },
        onError(err, newTodo, ctx) {
          if (!ctx?.prevData) return;

          toast({
            variant: "destructive",
            title: `Failed to update assigned user`,
            description: "Please try again later",
          });
          // If the mutation fails, use the context-value from onMutate
          setAssignedToUserId(ctx?.prevData);
        },
      });

      function handleAssignedToUserChange(newAssignedToUserId: string | null) {
        updateTodo({
          id: info.row.original.id,
          assignedToUserId: newAssignedToUserId,
        });
      }
      const user = (workspace?.users ?? []).find(
        (x) => x.id === assignedToUserId
      );

      return (
        <div className="text-right">
          <AssigneePopover
            setAssignedToUserId={handleAssignedToUserChange}
            users={workspace?.users ?? []}
          >
            <PopoverTrigger asChild>
              {user ? (
                <div>
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name ? user.name + " avatar" : ""}
                    />
                    <AvatarFallback>
                      {user.name &&
                        user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div>
                  <UserCircleIcon className="h-6 w-6 text-foreground/70" />
                </div>
              )}
            </PopoverTrigger>
          </AssigneePopover>
        </div>
      );
    },

    // cell: (info) => {
    //   const user = info.getValue();
    //   if (!user?.image) return;
    //   return (
    //     <div>
    //       <Avatar className="h-6 w-6">
    //         <AvatarImage
    //           src={user.image}
    //           alt={user.name ? user.name + " avatar" : ""}
    //         />
    //         <AvatarFallback>
    //           {user.name &&
    //             user.name
    //               .split(" ")
    //               .map((n) => n[0])
    //               .join("")}
    //         </AvatarFallback>
    //       </Avatar>
    //     </div>
    //   );
    // },
  }),
  // {
  //   accessorKey: "status",
  //   header: () => <div className="text-left">Status</div>,
  //   cell: ({ row }) => {
  //     const currentStatus = String(row.getValue("status")) as Status;
  //     const Icon = StatusIcon(currentStatus, "mr-2");
  //     const statusTxt = StatusToText(currentStatus);
  //     return (
  //       <Button variant="outline" size="xs">
  //         {Icon} {"  " + statusTxt}
  //         <span className="sr-only">Open status popover</span>
  //       </Button>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "title",
  //   header: "Title",
  // },

  // {
  //   accessorKey: "dueDate",
  //   header: "",
  //   cell: ({ row }) => {
  //     const dateString = row.getValue("dueDate")?.toString();
  //     if (!dateString) return;
  //     const formatedDate = format(new Date(dateString ?? ""), "PPP").split(
  //       ","
  //     )[0]; //This format should be like 'May 11th'
  //     return (
  //       <div className="text-right">
  //         <Button variant="ghost" size="xs">
  //           {<Calendar className="mr-2 h-4 w-4" />}
  //           <span className="">{formatedDate}</span>
  //         </Button>
  //       </div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "assignedToUserId",
  //   header: "",
  //   cell: ({ row }) => {
  //     const userImage = row.getValue("assignedToUserImage")?.toString();
  //     if (!userImage) return;
  //     return (
  //       <div className="text-right">
  //         <Avatar>
  //           <AvatarImage src={userImage} alt="@shadcn" />
  //           <AvatarFallback>CN</AvatarFallback>
  //         </Avatar>
  //       </div>
  //     );
  //   },
  // },
];
