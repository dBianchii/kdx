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
import { CalendarIcon, Check, Plus } from "lucide-react";
import { Frequency, RRule } from "rrule";
import { useState } from "react";
import { DateTimePicker } from "@/components/date-time-picker/date-time-picker";
import { type DateValue } from "react-aria";
import { api } from "@/utils/api";
import { FrequencyToTxt, FrequencyPicker } from "@/components/FrequencyPicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DatePicker from "@/components/DatePicker";
import { addWeeks, format } from "date-fns";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/components/ui/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@ui/label";

export default function KodixCare() {
  return (
    <>
      <H1>Kodix Care</H1>
      <Separator className="my-4" />
      <CreateEventDialogButton />
      {/* <DataTable columns={columns} data={data ?? []} /> */}
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [startDate, setStartDate] = useState<Date>();
  const [untilDate, setUntilDate] = useState<Date | undefined>(
    addWeeks(new Date(), 2)
  );
  const [frequency, setFrequency] = useState(Frequency.DAILY);
  const [neverEnds, setNeverEnds] = useState(true);
  const [reccurrenceDialogOpen, setReccurrenceDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  const { mutate: createEvent } = api.event.create.useMutation();
  const freqs = [RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
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
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="space-y-8"
          >
            <DialogDescription>
              <div className="space-y-4">
                <div className="flex flex-row gap-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Task title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="from"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>From</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onDayClick={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="invisible">Time</FormLabel>
                        <Input type="time" value={field.value} />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-row gap-2">
                  Frequency
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="invisible">Frequency</FormLabel>
                        <Popover>
                          <PopoverTrigger>
                            <Button type="button" variant="outline" size="sm">
                              Every {FrequencyToTxt(frequency).toLowerCase()}
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
                                        form.setValue("frequency", freq);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.getValues("frequency") === freq
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      Every {FrequencyToTxt(freq).toLowerCase()}
                                    </CommandItem>
                                  ))}
                                  <Dialog>
                                    <DialogTrigger className="w-full">
                                      <CommandItem className="text-primary/20">
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
                                              placeholder="1"
                                              className="w-16"
                                            />

                                            <Select>
                                              <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select a recurrence" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem
                                                  value="DAILY"
                                                  onSelect={() => {
                                                    form.setValue(
                                                      "frequency",
                                                      RRule.DAILY
                                                    );
                                                  }}
                                                >
                                                  Days
                                                </SelectItem>
                                                <SelectItem
                                                  value="WEEKLY"
                                                  onSelect={() => {
                                                    form.setValue(
                                                      "frequency",
                                                      RRule.WEEKLY
                                                    );
                                                  }}
                                                >
                                                  Weeks
                                                </SelectItem>
                                                <SelectItem
                                                  value="MONTHLY"
                                                  onSelect={() => {
                                                    setFrequency(RRule.MONTHLY);
                                                    form.setValue(
                                                      "frequency",
                                                      RRule.MONTHLY
                                                    );
                                                  }}
                                                >
                                                  Months
                                                </SelectItem>
                                                <SelectItem
                                                  value="YEARLY"
                                                  onSelect={() => {
                                                    setFrequency(RRule.YEARLY);
                                                    form.setValue(
                                                      "frequency",
                                                      RRule.YEARLY
                                                    );
                                                  }}
                                                >
                                                  Years
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="flex flex-row">
                                            <div className="flex flex-col">
                                              <RadioGroup
                                                className="mt-2 space-y-3"
                                                defaultValue={
                                                  neverEnds ? "1" : "0"
                                                }
                                              >
                                                <span className="mt-4 font-medium">
                                                  Ends:
                                                </span>
                                                <div className="flex items-center">
                                                  <RadioGroupItem
                                                    value="1"
                                                    id="r1"
                                                    onClick={() => {
                                                      setNeverEnds(true);
                                                    }}
                                                  />
                                                  <Label
                                                    htmlFor="r1"
                                                    className="ml-2"
                                                  >
                                                    Never
                                                  </Label>
                                                </div>
                                                <div className="flex items-center">
                                                  <RadioGroupItem
                                                    value="0"
                                                    id="r2"
                                                    onClick={() => {
                                                      setNeverEnds(false);
                                                    }}
                                                  />
                                                  <Label
                                                    htmlFor="r2"
                                                    className="ml-2"
                                                  >
                                                    At
                                                  </Label>
                                                  <div className=" ml-8">
                                                    <DatePicker
                                                      date={untilDate}
                                                      setDate={setUntilDate}
                                                      disabledDate={(date) =>
                                                        date < new Date()
                                                      }
                                                      disabledPopover={
                                                        neverEnds
                                                      }
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
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        placeholder="Add description..."
                        value={field.value}
                      ></Textarea>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DialogDescription>
            <DialogFooter>
              <Button
                type="submit"
                size="sm"
                // onClick={() => {
                //    createEvent({
                //      title,
                //      description,
                //      startDate,
                //      endDate,
                //      frequency: Frequency.DAILY,
                //      dateUntil: new Date(),
                //    });
                //   setOpen(false);
                // }}
              >
                Create task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
