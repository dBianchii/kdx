"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Laptop, Moon, SunMedium } from "lucide-react";

function DevModeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-1 right-0 flex h-6 w-6 items-center justify-center rounded-full p-3 font-mono text-xs font-bold">
      {children}
    </div>
  );
}

export function ThemeSwitcher({ devMode = false }: { devMode?: boolean }) {
  const { setTheme } = useTheme();
  if (devMode && process.env.NODE_ENV === "production") return null;
  const DevLayout = devMode ? DevModeLayout : React.Fragment;

  return (
    <DevLayout>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 px-0">
            <SunMedium className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <SunMedium className="mr-2 h-4 w-4" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DevLayout>
  );
}
