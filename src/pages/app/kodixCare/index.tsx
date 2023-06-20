import StatusPopover, {
  StatusIcon,
} from "@/components/Apps/Todo/StatusPopover";
import { DataTable } from "@/components/Apps/Todo/data-table";
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
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Plus } from "lucide-react";
import { Frequency } from "rrule";
import { useState } from "react";

export default function KodixCare() {
  console.log(Frequency);

  return (
    <>
      <H1>Todo</H1>
      <Separator className="my-4" />
      <CreateEventDialogButton />
      {/* <DataTable columns={columns} data={data ?? []} /> */}
    </>
  );
}

function CreateEventDialogButton() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [assignedToUserId, setAssignedToUserId] = useState<string | null>("");
  const [open, setOpen] = useState(false);

  function handleCreateEvent() {
    console.log("handleCreateEvent");
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs">
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
            className="my-2 border-none"
            type="text"
            placeholder="Task title..."
            onChange={(e) => setTitle(e.target.value)}
          ></Input>
          <Textarea
            className="my-2 border-none"
            placeholder="Add description..."
            onChange={(e) => setDescription(e.target.value)}
          ></Textarea>
          <div className="flex flex-row gap-1"></div>
        </DialogDescription>
        <DialogFooter>
          <Button type="submit" size="xs" onClick={handleCreateEvent}>
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
