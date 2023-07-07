import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { H1 } from "@/components/ui/typography";
import { CalendarIcon, Check, Loader2, Plus } from "lucide-react";
import { RRule } from "rrule";
import { useState } from "react";
import { api } from "@/utils/api";
import { FrequencyToTxt } from "@/components/FrequencyPicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/components/ui/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@ui/label";
import { DataTable } from "@/components/Apps/KodixCare/data-table";
import { columns } from "@/components/Apps/KodixCare/columns";
import moment from "moment";
import { tzOffsetText } from "@/utils/helpers";
import PersonalizedRecurrenceDialog from "@/components/Apps/KodixCare/PersonalizedRecurrenceDialog";

export default function KodixCare() {
  //date Start should be the beginninig of the day
  //date End should be the end of the day

  const [selectedDay, setSelectedDay] = useState<Date | undefined>(
    moment().startOf("day").toDate()
  );

  const result = api.event.getAll.useQuery(
    {
      dateStart: moment(selectedDay).startOf("day").toDate(),
      dateEnd: moment(selectedDay).endOf("day").toDate(),
    },
    {
      refetchOnWindowFocus: false,
    }
  );
  console.log(moment(selectedDay).startOf("day").toDate());

  return (
    <>
      <H1>Kodix Care</H1>
      <Separator className="my-4" />
      <CreateEventDialogButton />
      <DataTable
        columns={columns}
        data={result.data ?? []}
        selectedDate={selectedDay}
        setSelectedDate={setSelectedDay}
        isLoading={result.isFetching || result.isRefetching}
      />
    </>
  );
}
const freqs = [RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY];

function CreateEventDialogButton() {
  const [open, setOpen] = useState(false);
  const ctx = api.useContext();
  const { mutate: createEvent } = api.event.create.useMutation({
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
    title: "",
    description: "",
    from: moment(),
    time: "13:00",
    frequency: RRule.DAILY,
    interval: 1,
    until: undefined,
    count: 1,
  };
  const [title, setTitle] = useState(defaultState.title);
  const [description, setDescription] = useState(defaultState.description);
  const [from, setFrom] = useState(defaultState.from);
  const [time, setTime] = useState(defaultState.time);
  const [frequency, setFrequency] = useState(defaultState.frequency);
  const [interval, setInterval] = useState(defaultState.interval);
  const [until, setUntil] = useState<moment.Moment | undefined>(
    defaultState.until
  );
  const [count, setCount] = useState<number | undefined>(defaultState.count);

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
    createEvent({
      title: title,
      description: description,
      dateStart: from.toDate(),
      until: until ? until?.toDate() : undefined,
      frequency: frequency,
      interval: interval,
    });
  }

  const ruleForText = new RRule({
    freq: frequency,
    dtstart: from.toDate(),
    until: until ? until?.toDate() : undefined,
    interval: interval,
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(boolean) => {
        if (!boolean) revertStateToDefault(); //reset form data when closing
        setOpen(boolean);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-64 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitFormData();
          }}
          className="space-y-8"
        >
          <DialogDescription>
            <PersonalizedRecurrenceDialog
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
                <Popover>
                  <PopoverTrigger>
                    <Button type="button" variant="outline" size="sm">
                      {count === 1
                        ? "doesn't repeat"
                        : tzOffsetText(ruleForText)}
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
                          <CommandItem
                            onSelect={() => {
                              setFrequency(RRule.DAILY);
                              setInterval(1);
                              setCount(1);
                              setUntil(undefined);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                frequency === RRule.DAILY &&
                                  interval === 1 &&
                                  count === 1
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            Doesn&apos;t repeat
                          </CommandItem>
                          {freqs.map((freq, i) => (
                            <CommandItem
                              key={i}
                              onSelect={() => {
                                setInterval(1);
                                setFrequency(freq);
                                setUntil(undefined);
                                setCount(undefined);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  frequency === freq &&
                                    interval === 1 &&
                                    !until &&
                                    !count
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
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                until || interval > 1
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            Custom...
                          </CommandItem>
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
            <Button type="submit" size="sm" disabled={buttonLoading}>
              {buttonLoading ? (
                <Loader2 className="mx-2 h-4 w-4 animate-spin" />
              ) : (
                <>Create task</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
