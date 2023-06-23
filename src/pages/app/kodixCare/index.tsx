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
import { Plus } from "lucide-react";
import { Frequency } from "rrule";
import { useState } from "react";
import { DateTimePicker } from "@/components/date-time-picker/date-time-picker";
import { type DateValue } from "react-aria";
import { api } from "@/utils/api";
import {
  FrequencyToTxt,
  FrequencyPopover,
} from "@/components/FrequencyPopover";
import { PopoverTrigger } from "@/components/ui/popover";

export default function KodixCare() {
  console.log(Frequency);

  return (
    <>
      <H1>Kodix Care</H1>
      <Separator className="my-4" />
      <CreateEventDialogButton />
      {/* <DataTable columns={columns} data={data ?? []} /> */}
    </>
  );
}

function CreateEventDialogButton() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  const [startDate, setStartDate] = useState<DateValue | null>(null);
  const [endDate, setEndDate] = useState<DateValue | null>(null);
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const handleStartDateChange = (date: DateValue | null) => {
    setStartDate(date);
  };
  const handleEndDateChange = (date: DateValue | null) => {
    setEndDate(date);
  };

  const { mutate: createEvent } = api.event.create.useMutation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <DialogDescription>
          <Input
            className="my-2"
            type="text"
            placeholder="Task title..."
            onChange={(e) => setTitle(e.target.value)}
          ></Input>
          <div className="my-2 flex flex-row gap-4">
            <div className="flex flex-col gap-1">
              From
              <DateTimePicker
                granularity="minute"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              To
              <DateTimePicker
                granularity="minute"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              Frequency
              <FrequencyPopover setFrequency={setFrequency}>
                <PopoverTrigger>
                  <Button variant="outline" size="sm">
                    {FrequencyToTxt(frequency)}
                  </Button>
                </PopoverTrigger>
              </FrequencyPopover>
            </div>
          </div>
          <Textarea
            className="my-4 border-none"
            placeholder="Add description..."
            onChange={(e) => setDescription(e.target.value)}
          ></Textarea>
        </DialogDescription>
        <DialogFooter>
          <Button
            type="submit"
            size="sm"
            onClick={() => {
              if (!startDate || !endDate) return;
              createEvent({
                title,
                description,
                startDate: startDate.toDate("UTC"),
                endDate: endDate.toDate("UTC"),
                frequency: Frequency.DAILY,
                dateUntil: new Date(),
              });
              setOpen(false);
            }}
          >
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
