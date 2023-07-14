import { Separator } from "@/components/ui/separator";
import { H1 } from "@/components/ui/typography";
import { useState } from "react";
import { api } from "@/utils/api";
import { DataTable } from "@/components/Apps/KodixCare/data-table";
import { columns } from "@/components/Apps/KodixCare/columns";
import moment from "moment";
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
