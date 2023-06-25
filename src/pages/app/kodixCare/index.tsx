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
import DatePicker from "@/components/DatePicker";

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

  const [startDate, setStartDate] = useState<Date>();
  const [untilDate, setUntilDate] = useState<Date>();

  const [frequency, setFrequency] = useState(Frequency.DAILY);

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
          <div className="space-y-4">
            <div className="flex flex-row gap-2">
              <Input
                className="my-2"
                type="text"
                placeholder="Task title..."
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-row gap-2">
              <span>From</span>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                className="w-[200px]"
              />

              <Input
                type="time"
                className="w-24"
                onChange={(e) => {
                  const selectedTime = e.target.value;
                  setStartDate((prev) => {
                    if (!prev) return prev;
                    const updatedStartDate = new Date(prev);
                    const [hours, minutes] = selectedTime?.split(":") ?? [];
                    updatedStartDate.setHours(
                      hours !== undefined ? parseInt(hours, 10) : 0
                    );
                    updatedStartDate.setMinutes(
                      minutes !== undefined ? parseInt(minutes, 10) : 0
                    );
                    return updatedStartDate;
                  });
                }}
              />
            </div>
            <div className="flex flex-row gap-2">
              Frequency
              <FrequencyPopover
                frequency={frequency}
                setFrequency={setFrequency}
                untilDate={untilDate}
                setUntilDate={setUntilDate}
              />
            </div>
            <Textarea
              placeholder="Add description..."
              onChange={(e) => setDescription(e.target.value)}
            ></Textarea>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button
            type="submit"
            size="sm"
            onClick={() => {
              if (!startDate) return;
              alert(startDate);
              // createEvent({
              //   title,
              //   description,
              //   startDate: startDate.toDate("UTC"),
              //   endDate: endDate.toDate("UTC"),
              //   frequency: Frequency.DAILY,
              //   dateUntil: new Date(),
              // });
              // setOpen(false);
            }}
          >
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
