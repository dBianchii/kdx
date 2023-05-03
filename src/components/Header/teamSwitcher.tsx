"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, Loader2 } from "lucide-react";
import type { Workspace as PrismaWorkspace } from "@prisma/client";
import Router from "next/router";
import { cn } from "@ui/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@ui/button";
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
import { Skeleton } from "../ui/skeleton";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

type TeamSwitcherProps = PopoverTriggerProps;

type Workspace = Pick<PrismaWorkspace, "id" | "name">;

export default function TeamSwitcher({ className }: TeamSwitcherProps) {
  const { data: session } = useSession();

  const [selectedWS, setSelectedWS] = React.useState<Workspace>({
    id: session?.user?.activeWorkspaceId || "",
    name: "",
  });

  const { data: workspaces } = api.workspace.getAllForLoggedUser.useQuery(
    undefined,
    {
      enabled: session?.user !== undefined,
      onSuccess: (data) => {
        const newSelectedWS = data.find((ws) => ws.id === selectedWS.id);
        if (newSelectedWS === undefined) return;
        setSelectedWS({
          id: newSelectedWS.id,
          name: newSelectedWS.name,
        });
      },
    }
  );

  const { mutateAsync } = api.user.switchActiveWorkspace.useMutation({
    onSuccess: () => {
      Router.reload();
    },
  });

  const [open, setOpen] = React.useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] =
    React.useState(false);
  const [reloading, setReloading] = React.useState(false);

  return (
    <AddWorkspaceDialog
      open={showNewWorkspaceDialog}
      onOpenChange={setShowNewWorkspaceDialog}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <div className="center flex justify-center rounded-lg border border-border">
          <Link
            href={reloading ? "#" : `/workspace/${selectedWS.name}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-[175px] justify-start",
              className
            )}
          >
            {reloading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <Skeleton className="mx-3 h-3 w-full" />
              </>
            ) : (
              <>
                <Avatar className="mr-2 h-5 w-5">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${selectedWS.id}kdx.png`}
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
              </>
            )}
          </Link>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              role="combobox"
              aria-expanded={open}
              aria-label="Select a workspace"
              disabled={reloading}
            >
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search team..." />
              <CommandEmpty>No workspace found.</CommandEmpty>
              <CommandGroup>
                {workspaces?.map((ws) => (
                  <CommandItem
                    key={ws.name}
                    value={ws.name + ws.id} //
                    onSelect={(value) => {
                      setSelectedWS({
                        id: ws.id,
                        name: ws.name,
                      });
                      setOpen(false);
                      value !== selectedWS.id
                        ? void mutateAsync({ workspaceId: ws.id })
                        : null;
                      setReloading(true);
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
                        selectedWS.id === ws.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
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
                    Create Workspace
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
 * To activate the AddWorkspaceDialog component from within a Context Menu or Dropdown Menu, you must encase the Context Menu or Dropdown Menu component in the AddWorkspaceDialog component.
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
  const [loading, setLoading] = React.useState(false);
  const ctx = api.useContext();
  const { toast } = useToast();
  const { mutateAsync } = api.workspace.create.useMutation({
    onSuccess: (result) => {
      void ctx.workspace.getAllForLoggedUser.invalidate();
      onOpenChange(false);
      toast({
        variant: "default",
        title: `Workspace ${result.name} created`,
        description: "Successfully created a new workspace.",
        action: (
          <ToastAction disabled altText="Goto schedule to undo">
            Undo
          </ToastAction>
        ),
      });
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
            disabled={loading}
            type="submit"
            onClick={() => {
              void mutateAsync({
                userId: session?.user.id ?? "",
                workspaceName: workspaceName,
              });
              setLoading(true);
            }}
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
