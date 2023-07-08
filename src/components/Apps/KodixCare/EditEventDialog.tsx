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

  const freqs = [RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY];
  const ruleForText = new RRule({
    freq: frequency,
    dtstart: from.toDate(),
    until: until ? until?.toDate() : undefined,
    interval: interval,
  });

  function handleSubmitFormData() {
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
    // editEvent({
    //   title: title,
    //   description: description,
    //   dateStart: from.toDate(),
    //   until: neverEnds ? undefined : until?.toDate(),
    //   frequency: frequency,
    //   interval: interval,
    // });
  }

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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitFormData();
          }}
          className="space-y-8"
        >
          <DialogDescription>
            <div className="space-y-4">
              <div className="flex flex-row gap-2">
                <Input
                  placeholder="Event title..."
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
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
                      onClick={() =>
                        alert(
                          `
											title: ${title}
											description: ${description}
											from: ${from ? from.toDate().toString() : "undefined"}
											time: ${time}
											frequency: ${frequency}
											interval: ${interval}
											until: ${until ? until.toDate().toString() : "undefined"}
											count: ${count ?? "undefined"}

											`
                        )
                      }
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
