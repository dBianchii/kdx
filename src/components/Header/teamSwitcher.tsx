"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import type { Workspace as PrismaWorkspace } from "@prisma/client";

import { cn } from "@ui/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TeamSwitcherProps extends PopoverTriggerProps {}

type Workspace = Pick<PrismaWorkspace, "id" | "name">;

export default function TeamSwitcher({ className }: TeamSwitcherProps) {
  const ctx = api.useContext();
  const { data: session } = useSession();

  const { data: workspaces } = api.workspace.getAllForLoggedUser.useQuery(
    undefined,
    {
      enabled: session?.user !== undefined,
    }
  );

  const { mutateAsync } = api.user.switchActiveWorkspace.useMutation({
    onSuccess: () => {
      void ctx.workspace.getAllForLoggedUser.invalidate();
    },
  });

  const array: [string, object] = ["asd", { banana: "isAwesome" }];

  const [open, setOpen] = React.useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] =
    React.useState(false);
  const [selectedWS, setSelectedWS] = React.useState<Workspace>({
    id: session?.user?.activeWorkspaceId || "",
    name:
      workspaces?.find((w) => w.id === session?.user?.activeWorkspaceId)
        ?.name || "",
  });

  return (
    <AddWorkspaceDialog
      open={showNewWorkspaceDialog}
      onOpenChange={setShowNewWorkspaceDialog}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className={cn("w-[200px] justify-between", className)}
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${
                  selectedWS.name + selectedWS.id
                }.png`}
                alt={selectedWS.name}
              />
              <AvatarFallback>
                {selectedWS.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {selectedWS.name}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search team..." />
              <CommandEmpty>No team found.</CommandEmpty>
              {workspaces?.map((ws) => (
                <CommandGroup key={ws.id}>
                  <CommandItem
                    key={ws.id}
                    onSelect={() => {
                      setSelectedWS({
                        id: ws.id,
                        name: ws.name,
                      });
                      setOpen(false);
                      void mutateAsync({ workspaceId: ws.id });
                    }}
                    className="text-sm"
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${ws.id}kdx.png`}
                        alt={ws.name}
                      />
                      <AvatarFallback>
                        {session?.user.name
                          ? session?.user?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : ""}
                      </AvatarFallback>
                    </Avatar>
                    {ws.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedWS.name === ws.name
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                </CommandGroup>
              ))}
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowNewWorkspaceDialog(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Team
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </AddWorkspaceDialog>
  );
}

/**
 * To use this Dialog, make sure you wrap it in a DialogTrigger component.
 * To activate the Dialog component from within a Context Menu or Dropdown Menu, you must encase the Context Menu or Dropdown Menu component in the Dialog component.
 */
export function AddWorkspaceDialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const ctx = api.useContext();
  const { mutateAsync } = api.workspace.create.useMutation({
    onSuccess: () => {
      void ctx.workspace.getAllForLoggedUser.invalidate();
    },
  });
  const [workspaceName, changeWorkspaceName] = React.useState("");
  const { data: session } = useSession();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace and invite your team members
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input
                id="name"
                placeholder="Acme Inc."
                value={workspaceName}
                onChange={(e) => changeWorkspaceName(e.target.value)}
              />
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="plan">Subscription plan</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">
                    <span className="font-medium">Free</span> -{" "}
                    <span className="text-muted-foreground">
                      Trial for two weeks
                    </span>
                  </SelectItem>
                  <SelectItem value="pro">
                    <span className="font-medium">Pro</span> -{" "}
                    <span className="text-muted-foreground">
                      $9/month per user
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div> This is a nice way to do forms so I am not deleting it yet until ive used it somewhere else*/}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={() => {
              void mutateAsync({
                userId: session?.user.id ?? "",
                workspaceName: workspaceName,
              });
              onOpenChange(false);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
