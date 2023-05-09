import { Separator } from "@ui/separator";
import { Button } from "@ui/button";
import { H1 } from "@ui/typography";
import type { User } from "@prisma/client";
import {
  Check,
  CheckCircle2,
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
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/components/ui/lib/utils";
import workspaces from "../workspaces";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Calendar } from "@/components/ui/calendar";

export default function Todo() {
  // const { data: todos } = api.todo.getAllForLoggedUser.useQuery();
  return (
    <>
      <H1>Todo</H1>
      <Separator className="my-4" />
      <CreateTaskDialog />
      <div className="my-4">
        {/* {todos &&
          todos.map((todo) => (
            <div key={todo.id} className="flex flex-row border">
              <div></div>
              <div>{todo.title}</div>
            </div>
          ))} */}
      </div>
    </>
  );
}

function CreateTaskDialog() {
  const ctx = api.useContext();
  // const { mutate: createTask } = api.todo.create.useMutation({
  //   onSuccess: () => {
  //     void ctx.todo.getAllForLoggedUser.invalidate();
  //   },
  // });

  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs">
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-64 outline outline-ring sm:max-w-[600px]">
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
          >
            {description}
          </Textarea>
          <div className="flex flex-row gap-1">
            <StatusPopoverButton status={status} setStatus={setStatus} />
            <PriorityButton priority={priority} setPriority={setPriority} />
            <AssigneeButton
              assignedToUserId={assignedToUserId}
              setAssignedToUserId={setAssignedToUserId}
              users={workspace?.users ?? []}
            />
            <DatePickerButton date={dueDate} setDate={setDueDate} />
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button type="submit" size="xs">
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const StatusPopoverButton = ({
  status,
  setStatus,
}: {
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [open, setOpen] = useState(false);

  let Icon = <CheckCircle2 className="h-4 w-4" />;
  let statusTxt = "Todo";

  const TodoIcon = () => <CheckCircle2 className="mr-2 h-4 w-4 text-white" />;
  const InProgressIcon = () => (
    <CircleDot className="mr-2 h-4 w-4 text-yellow-400" />
  );
  const InReviewIcon = () => (
    <CircleSlash className="mr-2 h-4 w-4 text-orange-400" />
  );
  const DoneIcon = () => <Check className="mr-2 h-4 w-4 text-green-400" />;
  const CanceledIcon = () => (
    <CircleOff className="mr-2 h-4 w-4 text-red-400" />
  );

  switch (status) {
    case "TODO":
      Icon = <TodoIcon />;
      statusTxt = "Todo";
      break;
    case "INPROGRESS":
      Icon = <InProgressIcon />;
      statusTxt = "In progress";
      break;
    case "INREVIEW":
      Icon = <InReviewIcon />;
      statusTxt = "In review";
      break;
    case "DONE":
      Icon = <DoneIcon />;
      statusTxt = "Done";
      break;
    case "CANCELED":
      Icon = <CanceledIcon />;
      statusTxt = "Canceled";
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
                <TodoIcon />
                Todo
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("INPROGRESS");
                  setOpen(false);
                }}
              >
                <InProgressIcon />
                In progress
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("INREVIEW");
                  setOpen(false);
                }}
              >
                <InReviewIcon />
                In review
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("DONE");
                  setOpen(false);
                }}
              >
                <DoneIcon />
                Done
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("CANCELED");
                  setOpen(false);
                }}
              >
                <CanceledIcon />
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

const DatePickerButton = ({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="xs">
          {date?.getDay()}
          <span className="sr-only">Open status popover</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
