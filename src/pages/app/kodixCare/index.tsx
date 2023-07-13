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
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { RRule } from "rrule";
import { useState } from "react";
import { api } from "@/utils/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/components/ui/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@ui/label";
import { DataTable } from "@/components/Apps/KodixCare/data-table";
import { columns } from "@/components/Apps/KodixCare/columns";
import moment from "moment";
import RecurrencePicker from "@/components/Apps/KodixCare/RecurrencePicker";
import { DateTimePicker } from "@/components/date-time-picker/date-time-picker";
import { type DateValue } from "react-aria";
import { TimeField } from "@/components/date-time-picker/time-field";
import { TimePicker } from "@/components/date-time-picker/time-picker";
import { useDatePickerState } from "react-stately";
import CreateEventDialogButton from "@/components/Apps/KodixCare/CreateEventDialogButton";

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
