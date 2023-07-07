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
import PersonalizedRecurrenceDialog from "./PersonalizedRecurrenceDialog";

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
      until !== defaultState.until;

    console.log("title", title !== defaultState.title);
    console.log("description", description !== defaultState.description);
    console.log("from", !from.isSame(defaultState.from));
    console.log("time", time !== defaultState.time);
    console.log("frequency", frequency !== defaultState.frequency);
    console.log("interval", interval !== defaultState.interval);
    console.log("until", until !== defaultState.until);

    setIsFormChanged(isChanged);
  }, [
    title,
    description,
    from,
    time,
    frequency,
    interval,
    until,
    defaultState.title,
    defaultState.description,
    defaultState.from,
    defaultState.time,
    defaultState.frequency,
    defaultState.interval,
    defaultState.until,
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
  const rule = new RRule({
    freq: frequency,
    dtstart: from.toDate(),
    until: until ? until?.toDate() : undefined,
    interval: interval,
    tzid: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
    alert("sent");
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
                  placeholder="Task title..."
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
                <Popover>
                  <PopoverTrigger>
                    <Button type="button" variant="outline" size="sm">
                      {tzOffsetText(rule)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-300 p-0"
                    side="bottom"
                    align={"start"}
                  >
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {freqs.map((freq, i) => (
                            <CommandItem
                              key={i}
                              onSelect={() => {
                                setInterval(1);
                                setFrequency(freq);
                                setUntil(undefined);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  frequency === freq
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              Every {FrequencyToTxt(freq).toLowerCase()}
                            </CommandItem>
                          ))}
                          <CommandItem
                            onSelect={() => setPersonalizedRecurrenceOpen(true)}
                          >
                            <span className="ml-2"></span>
                            <Check className="invisible h-4 w-4" />
                            Custom...
                          </CommandItem>
                          <PersonalizedRecurrenceDialog
                            open={personalizedRecurrenceOpen}
                            setOpen={setPersonalizedRecurrenceOpen}
                            defaultInterval={interval}
                            setDefaultInterval={setInterval}
                            defaultFrequency={frequency}
                            setDefaultFrequency={setFrequency}
                            defaultUntil={until}
                            setDefaultUntil={setUntil}
                          />
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <Textarea
                placeholder="Add description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></Textarea>
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button
              type="submit"
              size="sm"
              disabled={buttonLoading || !isFormChanged}
            >
              {buttonLoading ? (
                <Loader2 className="mx-2 h-4 w-4 animate-spin" />
              ) : (
                <>Edit task</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
