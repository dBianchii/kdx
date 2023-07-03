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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
import { Label } from "@ui/label";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@ui/button";
import { useState } from "react";
import { api } from "@/utils/api";

/**
 * To use this this component, you need to wrap it around a AlertDialogTrigger component.
 */
export default function CancelationDialog({
  eventId,
  date,
  children,
}: {
  eventId: string;
  date: Date;
  children: React.ReactNode;
}) {
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      {children}
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
        <AlertDialogFooter className="bg-background">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              cancelEvent({
                eventId,
                originalDate: date,
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
  );
}
