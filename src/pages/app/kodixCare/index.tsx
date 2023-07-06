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
import { Frequency, RRule } from "rrule";
import { useState } from "react";
import { api } from "@/utils/api";
import { FrequencyToTxt } from "@/components/FrequencyPicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DatePicker from "@/components/DatePicker";
import { addDays, format } from "date-fns";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { cn } from "@/components/ui/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
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

const formSchema = z.object({
  title: z.string({
    required_error: "Please enter a title",
  }),
  description: z.string().optional(),
  from: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().refine((value) => value !== "", {
    message: "Please select a time",
    path: ["time"],
  }),
  frequency: z.nativeEnum(Frequency),
  interval: z.number().optional(),
  until: z.date().optional(),
});

function CreateEventDialogButton() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  // function onSubmit(values: z.infer<typeof formSchema>) {
  //   // Do something with the form values.
  //   // ✅ This will be type-safe and validated.
  //   console.log(values);
  // }
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
  const [neverEnds, setNeverEnds] = useState(true);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    from: moment.Moment;
    time: string;
    frequency: Frequency;
    interval: number;
    until: moment.Moment | undefined;
  }>({
    title: "",
    description: "",
    from: moment(),
    time: "",
    frequency: RRule.DAILY,
    interval: 1,
    until: undefined,
  });
  const freqs = [RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY];
  const rule = new RRule({
    freq: formData.frequency,
    dtstart: formData.from.toDate(),
    until: neverEnds ? undefined : formData.until?.toDate(),
    interval: formData.interval,
  });
  function handleSubmitFormData() {
    //insert the time into the date

    formData.from.set({
      hour: parseInt(formData.time.split(":")[0] ?? "0"),
      minute: parseInt(formData.time.split(":")[1] ?? "0"),
      second: 0,
      millisecond: 0,
    });
    formData.until?.set({
      hour: parseInt(formData.time.split(":")[0] ?? "0"),
      minute: parseInt(formData.time.split(":")[1] ?? "0"),
      second: 0,
      millisecond: 0,
    });
    createEvent({
      title: formData.title,
      description: formData.description,
      dateStart: formData.from.toDate(),
      until: neverEnds ? undefined : formData.until?.toDate(),
      frequency: formData.frequency,
      interval: formData.interval,
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <Form {...form}>
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
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    value={formData.title}
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
                            !formData.from && "text-muted-foreground"
                          )}
                        >
                          {formData.from ? (
                            format(formData.from.toDate(), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.from.toDate()}
                          onSelect={(date) =>
                            date &&
                            setFormData({ ...formData, from: moment(date) })
                          }
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
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-26"
                    />
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <Popover>
                    <PopoverTrigger>
                      <Button type="button" variant="outline" size="sm">
                        {rule.toText()}
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
                                  setFormData((prev) => ({
                                    ...prev,
                                    interval: 1,
                                    frequency: freq,
                                    until: undefined,
                                  }));
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.frequency === freq
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                Every {FrequencyToTxt(freq).toLowerCase()}
                              </CommandItem>
                            ))}
                            <Dialog>
                              <DialogTrigger className="w-full">
                                <CommandItem>
                                  <span className="ml-2"></span>
                                  <Check className="invisible h-4 w-4" />
                                  Custom...
                                </CommandItem>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Personalized Recurrence
                                  </DialogTitle>
                                  <DialogDescription>
                                    <div className="mt-4 flex flex-row gap-4">
                                      <span className="font-medium">
                                        Repeat every:
                                      </span>
                                      <Input
                                        type="number"
                                        min={1}
                                        aria-valuemin={1}
                                        value={formData.interval}
                                        onChange={(e) =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            interval: parseInt(e.target.value),
                                          }))
                                        }
                                        placeholder="1"
                                        className="w-16"
                                      />
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button variant="outline" size="sm">
                                            {FrequencyToTxt(
                                              formData.frequency
                                            ).toLowerCase()}
                                            {formData.interval !== 1
                                              ? "s"
                                              : null}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="w-300 p-0"
                                          side="bottom"
                                          align="start"
                                        >
                                          <Command>
                                            <CommandList>
                                              <CommandGroup>
                                                {freqs.map((freq, i) => (
                                                  <CommandItem
                                                    key={i}
                                                    onSelect={() => {
                                                      setFormData((prev) => ({
                                                        ...prev,
                                                        frequency: freq,
                                                      }));
                                                    }}
                                                  >
                                                    <Check
                                                      className={cn(
                                                        "mr-2 h-4 w-4",
                                                        formData.frequency ===
                                                          freq
                                                          ? "opacity-100"
                                                          : "opacity-0"
                                                      )}
                                                    />
                                                    {FrequencyToTxt(
                                                      freq
                                                    ).toLowerCase()}
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
                                          defaultValue="1"
                                        >
                                          <span className="mt-4 font-medium">
                                            Ends:
                                          </span>
                                          <div
                                            className="flex items-center"
                                            onClick={() => setNeverEnds(true)}
                                          >
                                            <RadioGroupItem
                                              value=""
                                              id="r1"
                                              checked={neverEnds}
                                            />
                                            <Label
                                              htmlFor="r1"
                                              className="ml-2"
                                            >
                                              Never
                                            </Label>
                                          </div>
                                          <div
                                            className="flex items-center"
                                            onClick={() => setNeverEnds(false)}
                                          >
                                            <RadioGroupItem
                                              value="0"
                                              id="r2"
                                              checked={!neverEnds}
                                            />
                                            <Label
                                              htmlFor="r2"
                                              className="ml-2"
                                            >
                                              At
                                            </Label>
                                            <div className=" ml-8">
                                              <DatePicker
                                                date={formData.until?.toDate()}
                                                setDate={(date) =>
                                                  setFormData((prev) => ({
                                                    ...prev,
                                                    until: moment(date),
                                                  }))
                                                }
                                                // disabledDate={(date) =>
                                                //   date < new Date()
                                                // }
                                                disabledPopover={neverEnds}
                                              />
                                            </div>
                                          </div>
                                        </RadioGroup>
                                      </div>
                                    </div>
                                  </DialogDescription>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <Textarea
                  placeholder="Add description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
