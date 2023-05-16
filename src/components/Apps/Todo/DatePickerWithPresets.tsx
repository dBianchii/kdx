import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  Command,
} from "@ui/command";
import { Calendar } from "@ui/calendar";
import { addDays } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/components/ui/lib/utils";

export function DatePickerWithPresets({
  date,
  setDate,
  children,
}: {
  date: Date | undefined;
  setDate:
    | React.Dispatch<React.SetStateAction<Date | undefined>>
    | ((newDate: Date | undefined) => void);
  children: React.ReactNode;
}) {
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
      {children}
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
}

export function DatePickerIcon({
  date,
  className,
}: {
  date: Date | undefined;
  className?: string;
}) {
  if (date === undefined) {
    return (
      <CalendarIcon className={cn("h-4 w-4 text-foreground/70", className)} />
    );
  } else if (new Date() > date) {
    return <CalendarIcon className={cn("h-4 w-4 text-red-500", className)} />;
  } else {
    return (
      <CalendarIcon className={cn("h-4 w-4 text-foreground", className)} />
    );
  }
}
