"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SidebarNavItem } from "@/types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Icons } from "@/components/shared/icons";

export function SearchCommand({ links }: { links: SidebarNavItem[] }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);

    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-10 w-full justify-start rounded-xl border-slate-800 bg-slate-950/70 text-sm font-normal text-slate-500 shadow-none transition-colors hover:border-slate-700 hover:bg-slate-900 hover:text-slate-300 sm:pr-14 md:w-80",
        )}
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex items-center gap-1">
          Search
          <span className="hidden sm:inline-flex">documentation</span>...
        </span>

        <kbd className="pointer-events-none absolute right-2 top-2 hidden h-6 select-none items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 font-mono text-[10px] font-medium text-slate-500 sm:flex">
          <span className="text-xs text-slate-400">⌘</span>
          K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />

        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {links.map((section) => (
            <CommandGroup key={section.title} heading={section.title}>
              {section.items.map((item) => {
                const Icon = Icons[item.icon || "arrowRight"];

                return (
                  <CommandItem
                    key={item.title}
                    onSelect={() => {
                      runCommand(() => router.push(item.href as string));
                    }}
                  >
                    <Icon className="mr-2 size-5" />
                    {item.title}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
