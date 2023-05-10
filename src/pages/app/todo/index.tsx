import { Separator } from "@ui/separator";
import { Button } from "@ui/button";
import { addDays, format } from "date-fns";
import { pt } from "date-fns/locale";

import { H1 } from "@ui/typography";
import type { Status, User } from "@prisma/client";
import {
  CalendarIcon,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  CircleOff,
  CircleSlash,
  LucideUser,
  Plus,
  PlusCircle,
  Settings2,
  SignalHigh,
  SignalLow,
  SignalMedium,
  X,
} from "lucide-react";
import { api } from "@/utils/api";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ui/dialog";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/components/ui/lib/utils";
import workspaces from "../../workspaces";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@ui/select";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { TodoColumns, columns } from "./columns";

export default function Todo() {
  const { data: todos } = api.todo.getAllForLoggedUser.useQuery();
  return (
    <>
      <H1>Todo</H1>
      <Separator className="my-4" />
      <CreateTaskDialogButton />
      {todos && <DataTable columns={columns} data={todos} />}
    </>
  );
}

function CreateTaskDialogButton() {
  function handleCreateTask() {
    createTask({
      title,
      description,
      status,
      dueDate,
      priority,
      assignedToUserId,
    });
    setOpen(false);
  }

  const StatusPopoverButton = ({
    status,
    setStatus,
  }: {
    status: Status;
    setStatus: React.Dispatch<React.SetStateAction<Status>>;
  }) => {
    const [open, setOpen] = useState(false);

    let Icon = <CheckCircle2 className="h-4 w-4" />;
    Icon = StatusToIcon(status, "mr-2");

    let statusTxt = "Todo";
    switch (status) {
      case "TODO":
        statusTxt = "Todo";
        break;
      case "INPROGRESS":
        statusTxt = "In progress";
        break;
      case "INREVIEW":
        statusTxt = "In review";
        break;
      case "DONE":
        statusTxt = "Done";
        break;
      case "CANCELED":
        statusTxt = "Canceled";
        break;
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="xs">
            {Icon} {"  " + statusTxt}
            <span></span>
            <span className="sr-only">Open status popover</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
          <Command>
            <CommandInput placeholder="Change status..." />
            <CommandList
              onSelect={() => {
                setOpen(false);
              }}
            >
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setStatus("TODO");
                    setOpen(false);
                  }}
                >
                  {StatusToIcon("TODO", "mr-2")}
                  Todo
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setStatus("INPROGRESS");
                    setOpen(false);
                  }}
                >
                  {StatusToIcon("INPROGRESS", "mr-2")}
                  In progress
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setStatus("INREVIEW");
                    setOpen(false);
                  }}
                >
                  {StatusToIcon("INREVIEW", "mr-2")}
                  In review
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setStatus("DONE");
                    setOpen(false);
                  }}
                >
                  {StatusToIcon("DONE", "mr-2")}
                  Done
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setStatus("CANCELED");
                    setOpen(false);
                  }}
                >
                  {StatusToIcon("CANCELED", "mr-2")}
                  Canceled
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const PriorityButton = ({
    priority,
    setPriority,
  }: {
    priority: number;
    setPriority: React.Dispatch<React.SetStateAction<number>>;
  }) => {
    const [open, setOpen] = useState(false);

    const LowIcon = () => <SignalLow className="mr-2 h-4 w-4 text-green-400" />;
    const MediumIcon = () => (
      <SignalMedium className="mr-2 h-4 w-4 text-yellow-400" />
    );
    const HighIcon = () => <SignalHigh className="mr-2 h-4 w-4 text-red-400" />;

    let Icon = <CheckCircle2 className="h-4 w-4" />;
    let statusTxt = "Todo";

    switch (priority) {
      case 1:
        Icon = <LowIcon />;
        statusTxt = "Low";
        break;
      case 2:
        Icon = <MediumIcon />;
        statusTxt = "Medium";
        break;
      case 3:
        Icon = <HighIcon />;
        statusTxt = "High";
        break;
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="xs">
            {Icon} {"  " + statusTxt}
            <span className="sr-only">Open status popover</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
          <Command>
            <CommandInput placeholder="Change priority..." />
            <CommandList
              onSelect={() => {
                setOpen(false);
              }}
            >
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setPriority(1);
                    setOpen(false);
                  }}
                >
                  <LowIcon />
                  Low
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setPriority(2);
                    setOpen(false);
                  }}
                >
                  <MediumIcon />
                  Medium
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setPriority(3);
                    setOpen(false);
                  }}
                >
                  <HighIcon />
                  High
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const AssigneeButton = ({
    assignedToUserId,
    setAssignedToUserId,
    users,
  }: {
    assignedToUserId: string;
    setAssignedToUserId: React.Dispatch<React.SetStateAction<string>>;
    users: User[];
  }) => {
    const [open, setOpen] = useState(false);
    const user = users.find((x) => x.id === assignedToUserId);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="xs">
            <span className="sr-only">Open assign user popover</span>

            {user ? (
              <>
                <Avatar className="mr-2 h-4 w-4">
                  <AvatarImage
                    src={user.image ?? ""}
                    alt={user.name ?? "" + " avatar"}
                  />
                  <AvatarFallback>
                    <UserCircleIcon />
                  </AvatarFallback>
                </Avatar>
                {user.name}
              </>
            ) : (
              <>
                <UserCircleIcon className="mr-2 h-4 w-4" />
                Assignee
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
          <Command>
            <CommandInput placeholder="Assign to user..." />
            <CommandList
              onSelect={() => {
                setOpen(false);
              }}
            >
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setAssignedToUserId("");
                    setOpen(false);
                  }}
                >
                  <UserCircleIcon className="mr-2 h-4 w-4" />
                  Unassigned
                </CommandItem>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => {
                      setAssignedToUserId(user.id);
                      setOpen(false);
                    }}
                    value={user.id}
                  >
                    <Avatar className="mr-2 h-4 w-4">
                      <AvatarImage
                        src={user.image ?? ""}
                        alt={user.image ?? "" + " avatar"}
                      />
                      <AvatarFallback>
                        <UserCircleIcon />
                      </AvatarFallback>
                    </Avatar>
                    {user.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const DatePickerWithPresetsButton = ({
    date,
    setDate,
  }: {
    date: Date | undefined;
    setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  }) => {
    const commands = [
      {
        text: "Today",
        value: "0",
      },
      {
        text: "Tomorrow",
        value: "1",
      },
      {
        text: "In 3 days",
        value: "3",
      },
      {
        text: "In a week",
        value: "7",
      },
      {
        text: "In one month",
        value: "30",
      },
      {
        text: "In one year",
        value: "365",
      },
    ];

    const [open, setOpen] = useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={!date ? "text-muted-foreground" : "text-foreground"}
            size="xs"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
            {date && (
              <span
                onClick={() => {
                  setDate(undefined);
                }}
                className="ml-2 rounded-full transition-colors hover:bg-primary/90 hover:text-background"
              >
                <X className="h-4 w-4 " />
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="flex flex-col space-y-2 p-2" align="start">
          <Popover>
            <PopoverTrigger>
              <Button variant="outline" className="w-full justify-between">
                Select...
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" side="bottom">
              <Command
                onValueChange={(value) =>
                  setDate(addDays(new Date(), parseInt(value)))
                }
              >
                <CommandInput placeholder="Choose day..." />
                <CommandList>
                  <CommandGroup>
                    {commands.map((command) => (
                      <CommandItem
                        key={command.value}
                        onSelect={() => {
                          setDate(addDays(new Date(), parseInt(command.value)));
                          setOpen(false);
                        }}
                      >
                        {command.text}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="rounded-md border">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const ctx = api.useContext();
  const { mutate: createTask } = api.todo.create.useMutation({
    onSuccess: () => {
      void ctx.todo.getAllForLoggedUser.invalidate();
    },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("TODO");
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState(1);
  const [assignedToUserId, setAssignedToUserId] = useState("");

  const { data: workspace } = api.workspace.getActiveWorkspace.useQuery(
    undefined,
    {
      onSuccess: (data) => {
        if (!data || !data.users[0]) return;
        setAssignedToUserId(data.users[0].id);
      },
    }
  );

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs">
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-64 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
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
          <div className="flex flex-row gap-1">
            <StatusPopoverButton status={status} setStatus={setStatus} />
            <PriorityButton priority={priority} setPriority={setPriority} />
            <AssigneeButton
              assignedToUserId={assignedToUserId}
              setAssignedToUserId={setAssignedToUserId}
              users={workspace?.users ?? []}
            />
            <DatePickerWithPresetsButton date={dueDate} setDate={setDueDate} />
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button type="submit" size="xs" onClick={handleCreateTask}>
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusToIcon(status: Status, className?: string) {
  switch (status) {
    case "TODO":
      return (
        <CheckCircle2 className={cn("h-4 w-4 text-foreground", className)} />
      );
    case "INPROGRESS":
      return <CircleDot className={cn("h-4 w-4 text-yellow-400", className)} />;
    case "INREVIEW":
      return (
        <CircleSlash className={cn("h-4 w-4 text-orange-400", className)} />
      );
    case "DONE":
      return <Check className={cn("h-4 w-4 text-green-400", className)} />;
    case "CANCELED":
      return <CircleOff className={cn("h-4 w-4 text-red-400", className)} />;
  }
}
