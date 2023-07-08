import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
import { Label } from "@ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/utils/api";

/**
 * To use this this component, you need to wrap it around a AlertDialogTrigger component.
 */
export default function CancelationDialog({
  eventId,
  date,
  open,
  setOpen,
}: {
  eventId: string;
  date: Date;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [radioValue, setRadioValue] = useState<"all" | "future" | "single">(
    "single"
  );

  const [buttonLoading, setButtonLoading] = useState(false);
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exclude recurrent event</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="my-6">
              <RadioGroup
                className="flex flex-col space-y-2"
                defaultValue="thisEvent"
              >
                <div className="flex">
                  <RadioGroupItem
                    id="single"
                    value={"single"}
                    onClick={() => {
                      setRadioValue("single");
                    }}
                    className=""
                  />
                  <Label htmlFor="single" className="ml-2">
                    This event
                  </Label>
                </div>
                <div className="flex">
                  <RadioGroupItem
                    id="future"
                    value={"future"}
                    onClick={() => {
                      setRadioValue("future");
                    }}
                  />
                  <Label htmlFor="future" className="ml-2">
                    Future events
                  </Label>
                </div>
                <div className="flex">
                  <RadioGroupItem
                    id="all"
                    value={"all"}
                    onClick={() => {
                      setRadioValue("all");
                    }}
                  />
                  <Label htmlFor="allEvents" className="ml-2">
                    All events
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-background">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (radioValue === "all")
                cancelEvent({
                  eventId,
                  exclusionDefinition: "all",
                });
              else if (radioValue === "future" || radioValue === "single")
                cancelEvent({
                  eventId,
                  exclusionDefinition: radioValue,
                  date,
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
