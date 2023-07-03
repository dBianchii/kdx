import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppRouter } from "@/server/api/root";
import { createColumnHelper } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { api } from "@/utils/api";

type RouterOutput = inferRouterOutputs<AppRouter>;
type CalendarTask = RouterOutput["event"]["getAll"][number];
const columnHelper = createColumnHelper<CalendarTask>();

export const columns = [
  columnHelper.accessor("eventId", {
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: function Cell(info) {
      const [radioValue, setRadioValue] = useState<"thisEvent" | "allEvents">(
        "thisEvent"
      );
      const [buttonLoading, setButtonLoading] = useState(false);
      const [open, setOpen] = useState(false);
      const ctx = api.useContext();
      const { mutate: cancelEvent } = api.event.cancelEvent.useMutation({
        onMutate: () => {
          setButtonLoading(true);
        },
        onSuccess: () => {
          void ctx.event.getAll.invalidate();
          setOpen(false);
        },
        onSettled: () => {
          setButtonLoading(false);
        },
      });

      return (
        <div className="space-x-4">
          <Checkbox
            checked={info.row.getIsSelected()}
            onCheckedChange={(value) => info.row.toggleSelected(!!value)}
            aria-label="Select row"
          />
          <AlertDialog open={open} onOpenChange={setOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Event
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Event
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Exclude recurrent event</AlertDialogTitle>
                <AlertDialogDescription className="mt-6">
                  <RadioGroup
                    className="flex flex-col space-y-2"
                    defaultValue="thisEvent"
                  >
                    <div className="flex">
                      <RadioGroupItem
                        id="thisEvent"
                        value={"thisEvent"}
                        onClick={() => {
                          setRadioValue("thisEvent");
                        }}
                      />
                      <Label htmlFor="thisEvent" className="ml-2">
                        This event
                      </Label>
                    </div>
                    <div className="flex">
                      <RadioGroupItem
                        id="allEvents"
                        value={"allEvents"}
                        onClick={() => {
                          setRadioValue("allEvents");
                        }}
                      />
                      <Label htmlFor="allEvents" className="ml-2">
                        All events
                      </Label>
                    </div>
                  </RadioGroup>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    cancelEvent({
                      eventId: info.row.original.eventId,
                      originalDate: info.row.original.date,
                      allEvents: radioValue === "allEvents",
                    });
                  }}
                >
                  {buttonLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>OK</>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
