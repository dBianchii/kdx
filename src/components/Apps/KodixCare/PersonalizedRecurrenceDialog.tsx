import DatePicker from "@/components/DatePicker";
import { FrequencyToTxt } from "@/components/FrequencyPicker";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/components/ui/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@ui/popover";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
import { Label } from "@ui/label";
import { CommandList, CommandGroup, CommandItem, Command } from "@ui/command";
import { Check } from "lucide-react";
import moment from "moment";
import { Input } from "@ui/input";
import { useEffect, useState } from "react";
import { Button } from "@ui/button";
import { type Frequency, RRule } from "rrule";

const freqs = [RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY];
export default function PersonalizedRecurrenceDialog({
  open,
  setOpen,
  defaultInterval,
  setDefaultInterval,
  defaultFrequency,
  setDefaultFrequency,
  defaultUntil,
  setDefaultUntil,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultInterval: number;
  setDefaultInterval: React.Dispatch<React.SetStateAction<number>>;
  defaultFrequency: Frequency;
  setDefaultFrequency: React.Dispatch<React.SetStateAction<Frequency>>;
  defaultUntil: moment.Moment | undefined;
  setDefaultUntil: React.Dispatch<
    React.SetStateAction<moment.Moment | undefined>
  >;
}) {
  useEffect(() => {
    setStateToDefault();
  }, [open]);

  const [interval, setInterval] = useState(defaultInterval);
  const [frequency, setFrequency] = useState(defaultFrequency);
  const [until, setUntil] = useState(defaultUntil);

  function setStateToDefault() {
    setInterval(defaultInterval);
    setFrequency(defaultFrequency);
    setUntil(defaultUntil);
  }
  function setNewDefaultState() {
    setDefaultInterval(interval);
    setDefaultFrequency(frequency);
    setDefaultUntil(until);
  }

  function closeDialog(openOrClose: boolean, save: boolean) {
    if (save) setNewDefaultState();
    else setStateToDefault();
    setOpen(openOrClose);
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(openOrClose) => closeDialog(openOrClose, false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Personalized Recurrence</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          <div className="mt-4 flex flex-row gap-4">
            <span className="font-medium">Repeat every:</span>
            <Input
              type="number"
              min={1}
              aria-valuemin={1}
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value))}
              placeholder="1"
              className="w-16"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  {FrequencyToTxt(frequency).toLowerCase()}
                  {interval !== 1 ? "s" : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-300 p-0" side="bottom" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {freqs.map((freq, i) => (
                        <CommandItem
                          key={i}
                          onSelect={() => {
                            setFrequency(freq);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              frequency === freq ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {FrequencyToTxt(freq).toLowerCase()}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col">
              <RadioGroup
                className="mt-2 space-y-3"
                defaultValue={until === undefined ? "1" : "0"}
              >
                <span className="mt-4 font-medium">Ends:</span>
                <div
                  className="flex items-center"
                  onClick={() => setUntil(undefined)}
                >
                  <RadioGroupItem
                    value=""
                    id="r1"
                    checked={until === undefined}
                  />
                  <Label htmlFor="r1" className="ml-2">
                    Never
                  </Label>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center">
                    <RadioGroupItem
                      value="0"
                      id="r2"
                      checked={until !== undefined}
                      onClick={() => setUntil(defaultUntil ?? moment())}
                    />
                    <Label htmlFor="r2" className="ml-2">
                      At
                    </Label>
                  </div>

                  <div className=" ml-8">
                    <DatePicker
                      date={until?.toDate()}
                      setDate={(date) => setUntil(moment(date))}
                      // disabledDate={(date) =>
                      //   date < new Date()
                      // }
                      disabledPopover={until === undefined}
                    />
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => closeDialog(false, false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              closeDialog(false, true);
            }}
          >
            OK
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
