import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppRouter } from "@/server/api/root";
import { createColumnHelper } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";
import { MoreHorizontal, PencilIcon, Trash2 } from "lucide-react";
import { Button } from "@ui/button";
import { useState } from "react";
import CancelationDialog from "./CancelationDialog";
import EditEventDialog from "./EditEventDialog";

type RouterOutput = inferRouterOutputs<AppRouter>;
type CalendarTask = RouterOutput["event"]["getAll"][number];
const columnHelper = createColumnHelper<CalendarTask>();

export const columns = [
  columnHelper.accessor("eventId", {
    header: () => (
      <>
        {/* <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        /> */}
      </>
    ),
    cell: function Cell(info) {
      const [openCancelDialog, setOpenCancelDialog] = useState(false);
      const [openEditDialog, setOpenEditDialog] = useState(false);

      return (
        <div className="space-x-4">
          {/* <Checkbox
            checked={info.row.getIsSelected()}
            onCheckedChange={(value) => info.row.toggleSelected(!!value)}
            aria-label="Select row"
          /> */}
          <EditEventDialog
            open={openEditDialog}
            setOpen={setOpenEditDialog}
            eventId={info.row.original.eventId}
            date={info.row.original.date}
          />
          <CancelationDialog
            open={openCancelDialog}
            setOpen={setOpenCancelDialog}
            eventId={info.row.original.eventId}
            date={info.row.original.date}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenCancelDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("title", {
    header: () => <div>Title</div>,
    cell: (info) => <div className="font-bold">{info.getValue()}</div>,
  }),
  columnHelper.accessor("description", {
    header: () => <div>Description</div>,
    cell: (info) => <div className="text-sm">{info.getValue()}</div>,
  }),
  columnHelper.accessor("date", {
    header: () => <div>Date</div>,
    cell: (info) => (
      <div className="text-sm">{info.getValue().toLocaleString()}</div>
    ),
  }),
];
