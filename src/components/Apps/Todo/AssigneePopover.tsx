import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { User } from "@prisma/client";
import {
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  Command,
} from "@ui/command";
import { useState } from "react";
import { Button } from "@ui/button";

export function AssigneePopover({
  setAssignedToUserId,
  users,
  children,
}: {
  setAssignedToUserId: (newUserId: string | null) => void;
  users: User[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {children}
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
                  setAssignedToUserId(null);
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
}
