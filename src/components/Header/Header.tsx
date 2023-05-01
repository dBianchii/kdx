import TeamSwitcher from "./teamSwitcher";
import { cn } from "@ui/lib/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import { CreditCard, LogOut, PlusCircle, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 ">
        {!session && (
          <Link
            href="/"
            className="text-bold mx-5 text-xl font-medium text-primary"
          >
            Kodix
          </Link>
        )}
        {!!session && <TeamSwitcher />}

        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}

function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter();
  const navigation = [
    {
      href: "/marketplace",
      title: "Marketplace",
    },
    {
      href: "/apps",
      title: "Apps",
    },
  ];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {navigation.map((item) => (
        <Link
          href={item.href}
          key={item.href}
          className={
            "text-sm font-medium transition-colors hover:text-primary " +
            (router.pathname !== item.href ? " text-muted-foreground" : "")
          }
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

export function UserNav() {
  const { data: session } = useSession();

  return (
    <>
      {session?.user.id && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">shadcn</p>
                <p className="text-xs leading-none text-muted-foreground">
                  m@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>New Team</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {!session?.user.id && (
        <div className="mr-5 space-x-2">
          <Link href="/signIn" className={buttonVariants({ variant: "ghost" })}>
            Sign In
          </Link>
          <Link
            href="/signIn"
            className={buttonVariants({ variant: "default" })}
          >
            Sign Up
          </Link>
        </div>
      )}
    </>
  );
}
