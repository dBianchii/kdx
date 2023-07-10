import { FrequencyToTxt } from "@/components/FrequencyPicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { cn } from "@ui/lib/utils";
import { Textarea } from "@ui/textarea";
import { api } from "@/utils/api";
import { Popover, PopoverTrigger, PopoverContent } from "@ui/popover";
import { Label } from "@ui/label";
import { CommandList, CommandGroup, CommandItem, Command } from "@ui/command";
import { format } from "date-fns";
import { CalendarIcon, Check, Loader2 } from "lucide-react";
import moment from "moment";
import { Input } from "@ui/input";
import { useEffect, useState } from "react";
import { Button } from "@ui/button";
import { type Frequency, RRule } from "rrule";
import { Calendar } from "@ui/calendar";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import { tzOffsetText } from "@/utils/helpers";
import RecurrencePicker from "./RecurrencePicker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { date } from "zod";

type RouterOutput = inferRouterOutputs<AppRouter>;
type CalendarTask = RouterOutput["event"]["getAll"][number];

export default function EditEventDialog({
  calendarTask,
  open,
  setOpen,
}: {
  calendarTask: CalendarTask;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const ctx = api.useContext();
  const { mutate: editEvent } = api.event.edit.useMutation({
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
  const [buttonLoading, setButtonLoading] = useState(false);
  const [personalizedRecurrenceOpen, setPersonalizedRecurrenceOpen] =
    useState(false);
  const [editDefinitionOpen, setEditDefinitionOpen] = useState(false);

  const defaultState = {
    calendarTask: calendarTask,
    title: calendarTask.title,
    description: calendarTask.description ?? "",
    from: moment(calendarTask.date),
    time: moment(calendarTask.date).format("HH:mm"),
    frequency: RRule.fromString(calendarTask.rule).options.freq,
    interval: RRule.fromString(calendarTask.rule).options.interval,
    until: RRule.fromString(calendarTask.rule).options.until
      ? moment(RRule.fromString(calendarTask.rule).options.until)
      : undefined,
    count: RRule.fromString(calendarTask.rule).options.count ?? undefined,
  };

  const [title, setTitle] = useState(defaultState.title);
  const [description, setDescription] = useState(defaultState.description);
  const [from, setFrom] = useState(defaultState.from);
  const [time, setTime] = useState(defaultState.time);
  const [frequency, setFrequency] = useState<Frequency>(defaultState.frequency);
  const [interval, setInterval] = useState<number>(defaultState.interval);
  const [until, setUntil] = useState<moment.Moment | undefined>(
    defaultState.until
  );
  const [count, setCount] = useState<number | undefined>(defaultState.count);
  const [definition, setDefinition] = useState<
    "single" | "thisAndFuture" | "all"
  >("single");
  const [allowedDefinitions, setAllowedDefinitions] = useState<
    ("single" | "thisAndFuture" | "all")[]
  >(["single", "thisAndFuture", "all"]);

  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    from.set({
      hour: parseInt(time.split(":")[0] ?? "0"),
      minute: parseInt(time.split(":")[1] ?? "0"),
      second: 0,
      millisecond: 0,
    });
    until?.set({
      hour: parseInt(time.split(":")[0] ?? "0"),
      minute: parseInt(time.split(":")[1] ?? "0"),
      second: 0,
      millisecond: 0,
    });
  }, [from, until, time]);

  useEffect(() => {
    const isSingleAllowed =
      count === defaultState.count ||
      until === defaultState.until ||
      interval === defaultState.interval ||
      frequency === defaultState.frequency;

    if (!isSingleAllowed) {
      setAllowedDefinitions((prev) => prev.filter((item) => item !== "single"));
    } else {
      !allowedDefinitions.includes("single") &&
        setAllowedDefinitions((prev) => [...prev, "single"]);
    }

    const isAllAllowed = from === defaultState.from;
    if (!isAllAllowed) {
      setAllowedDefinitions((prev) => prev.filter((item) => item !== "all"));
    } else {
      !allowedDefinitions.includes("all") &&
        setAllowedDefinitions((prev) => [...prev, "all"]);
    }
  }, [
    count,
    until,
    interval,
    frequency,
    from,
    allowedDefinitions,
    defaultState.count,
    defaultState.until,
    defaultState.interval,
    defaultState.frequency,
    defaultState.from,
  ]);

  useEffect(() => {
    const isChanged =
      title !== defaultState.title ||
      description !== defaultState.description ||
      !from.isSame(defaultState.from) ||
      time !== defaultState.time ||
      frequency !== defaultState.frequency ||
      interval !== defaultState.interval ||
      until !== defaultState.until ||
      count !== defaultState.count;

    setIsFormChanged(isChanged);
  }, [
    title,
    description,
    from,
    time,
    frequency,
    interval,
    until,
    count,
    defaultState.title,
    defaultState.description,
    defaultState.from,
    defaultState.time,
    defaultState.frequency,
    defaultState.interval,
    defaultState.until,
    defaultState.count,
  ]);

  // const defaultState = {
  //   calendarTask: calendarTask,
  //   title: calendarTask.title,
  //   description: calendarTask.description ?? "",
  //   from: moment(calendarTask.date),
  //   time: moment(calendarTask.date).format("HH:mm"),
  //   frequency: RRule.fromString(calendarTask.rule).options.freq,
  //   interval: RRule.fromString(calendarTask.rule).options.interval,
  //   until: RRule.fromString(calendarTask.rule).options.until
  //     ? moment(RRule.fromString(calendarTask.rule).options.until)
  //     : undefined,
  // };
  // const [formData, setFormData] = useState<{
  //   calendarTask: CalendarTask;
  //   title: string;
  //   description: string;
  //   from: moment.Moment;
  //   time: string;
  //   frequency: Frequency;
  //   interval: number;
  //   until: moment.Moment | undefined;
  // }>(defaultState);

  function revertStateToDefault() {
    setTitle(defaultState.title);
    setDescription(defaultState.description);
    setFrom(defaultState.from);
    setTime(defaultState.time);
    setFrequency(defaultState.frequency);
    setInterval(defaultState.interval);
    setUntil(defaultState.until);
    setCount(defaultState.count);
  }

  function handleSubmitFormData() {
    const idObj = calendarTask.eventExceptionId
      ? { eventExceptionId: calendarTask.eventExceptionId }
      : { eventMasterId: calendarTask.eventMasterId };

    // editEvent({
    //   ...idObj,
    //   selectedTimestamp: from.toDate(),
    //   title: title || undefined,
    //   description: description,
    //   from: from.toDate(),
    //   until: until?.toDate(),
    //   frequency: frequency,
    //   interval: interval,
    // });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openDialog) => {
        if (!openDialog) revertStateToDefault(); //Revert the data back to default when closing
        setOpen(openDialog);
      }}
    >
      <DialogContent className="mb-64 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="space-y-4">
            <div className="flex flex-row gap-2">
              <Input
                placeholder="Event title..."
                onChange={(e) => setTitle(e.target.value)}
                value={title ?? ""}
              />
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col space-y-2">
                <Label>From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[200px] pl-3 text-left font-normal",
                        !from && "text-muted-foreground"
                      )}
                    >
                      {from ? (
                        format(from.toDate(), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={from.toDate()}
                      onSelect={(date) => date && setFrom(moment(date))}
                      // disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="invisible">From</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-26"
                />
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <RecurrencePicker
                open={personalizedRecurrenceOpen}
                setOpen={setPersonalizedRecurrenceOpen}
                interval={interval}
                setInterval={setInterval}
                frequency={frequency}
                setFrequency={setFrequency}
                until={until}
                setUntil={setUntil}
                count={count}
                setCount={setCount}
              />
            </div>
            <Textarea
              placeholder="Add description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></Textarea>
          </div>
        </DialogDescription>
        <DialogFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={buttonLoading || !isFormChanged}
                    onClick={() => setEditDefinitionOpen(true)}
                  >
                    {buttonLoading ? (
                      <Loader2 className="mx-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>OK</>
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent hidden={isFormChanged}>
                <p>Please change some data in order to accept the changes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
        <EditDefinitionDialog
          open={editDefinitionOpen}
          setOpen={setEditDefinitionOpen}
          definition={definition}
          setDefinition={setDefinition}
          allowedDefinitions={allowedDefinitions}
          submit={handleSubmitFormData}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditDefinitionDialog({
  open,
  setOpen,
  definition,
  setDefinition,
  allowedDefinitions,
  submit,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  definition: "single" | "thisAndFuture" | "all";
  setDefinition: React.Dispatch<
    React.SetStateAction<"single" | "thisAndFuture" | "all">
  >;
  allowedDefinitions: ("single" | "thisAndFuture" | "all")[];
  submit: (definition: "single" | "thisAndFuture" | "all") => void;
}) {
  const [buttonLoading, setButtonLoading] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exclude recurrent event</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="my-6">
              <RadioGroup
                className="flex flex-col space-y-2"
                defaultValue={definition}
              >
                {allowedDefinitions.includes("single") && (
                  <div className="flex">
                    <RadioGroupItem
                      id="single"
                      value={"single"}
                      onClick={() => {
                        setDefinition("single");
                      }}
                      className=""
                    />
                    <Label htmlFor="single" className="ml-2">
                      This event
                    </Label>
                  </div>
                )}
                {allowedDefinitions.includes("thisAndFuture") && (
                  <div className="flex">
                    <RadioGroupItem
                      id="thisAndFuture"
                      value={"thisAndFuture"}
                      onClick={() => {
                        setDefinition("thisAndFuture");
                      }}
                    />
                    <Label htmlFor="thisAndFuture" className="ml-2">
                      This and future events
                    </Label>
                  </div>
                )}
                {allowedDefinitions.includes("all") && (
                  <div className="flex">
                    <RadioGroupItem
                      id="all"
                      value={"all"}
                      onClick={() => {
                        setDefinition("all");
                      }}
                    />
                    <Label htmlFor="all" className="ml-2">
                      All events
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-background">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              submit(definition);
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
