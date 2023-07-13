import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import type { User } from "@prisma/client";
import {
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  Command,
} from "@ui/command";
import { useState } from "react";

/**
 * @description You can optionally input a button to overwrite the default button trigger.
 */
export function AssigneePopover({
  assignedToUserId,
  setAssignedToUserId,
  users,
  children,
}: {
  assignedToUserId: string | null;
  setAssignedToUserId: (newUserId: string | null) => void;
  users: User[];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const user = (users ?? []).find((x) => x.id === assignedToUserId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ? (
          children
        ) : user ? (
          <div>
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={user?.image ?? undefined}
                alt={user?.name ? user.name + " avatar" : ""}
              />
              <AvatarFallback>
                {user?.name &&
                  user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div>
            <UserCircleIcon className="h-6 w-6 text-foreground/70" />
          </div>
        )}
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
