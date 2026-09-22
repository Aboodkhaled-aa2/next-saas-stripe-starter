"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ProjectType = {
  title: string;
  slug: string;
  color: string;
};

const projects: ProjectType[] = [
  {
    title: "Project 1",
    slug: "project-number-one",
    color: "bg-red-500",
  },
  {
    title: "Project 2",
    slug: "project-number-two",
    color: "bg-blue-500",
  },
];

const selected: ProjectType = projects[1];

export default function ProjectSwitcher({
  large = false,
}: {
  large?: boolean;
}) {
  const { status } = useSession();
  const [openPopover, setOpenPopover] = useState(false);

  if (!projects || status === "loading") {
    return <ProjectSwitcherPlaceholder />;
  }

  return (
    <div>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "h-10 w-full justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 text-slate-300 shadow-none transition-colors hover:border-slate-700 hover:bg-slate-900 hover:text-white",
              openPopover && "border-slate-700 bg-slate-900 text-white",
            )}
            variant="ghost"
          >
            <div className="flex min-w-0 items-center space-x-3">
              <div
                className={cn(
                  "size-2.5 shrink-0 rounded-full ring-4 ring-blue-500/10",
                  selected.color,
                )}
              />

              <span
                className={cn(
                  "truncate text-sm font-medium",
                  large ? "w-full" : "max-w-[120px]",
                )}
              >
                {selected.slug}
              </span>
            </div>

            <ChevronsUpDown
              className="ml-2 size-4 shrink-0 text-slate-500"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-60 border-slate-800 bg-slate-950 p-2 text-white shadow-2xl"
        >
          <ProjectList
            selected={selected}
            projects={projects}
            setOpenPopover={setOpenPopover}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ProjectList({
  selected,
  projects,
  setOpenPopover,
}: {
  selected: ProjectType;
  projects: ProjectType[];
  setOpenPopover: (open: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {projects.map(({ slug, color }) => (
        <Link
          key={slug}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "relative flex h-10 items-center gap-3 rounded-lg p-3 text-slate-400 hover:bg-slate-900 hover:text-white",
          )}
          href="#"
          onClick={() => setOpenPopover(false)}
        >
          <div
            className={cn(
              "size-2.5 shrink-0 rounded-full ring-4 ring-slate-900",
              color,
            )}
          />

          <span
            className={cn(
              "flex-1 truncate text-left text-sm",
              selected.slug === slug
                ? "font-medium text-white"
                : "font-normal text-slate-400",
            )}
          >
            {slug}
          </span>

          {selected.slug === slug && (
            <span className="flex items-center text-blue-400">
              <Check size={16} aria-hidden="true" />
            </span>
          )}
        </Link>
      ))}

      <div className="my-1 border-t border-slate-800" />

      <Button
        variant="ghost"
        className="relative flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
        onClick={() => {
          setOpenPopover(false);
        }}
      >
        <Plus size={16} />
        <span className="truncate text-sm">New Project</span>
      </Button>
    </div>
  );
}

function ProjectSwitcherPlaceholder() {
  return (
    <div className="flex w-full animate-pulse items-center rounded-xl">
      <div className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900/60" />
    </div>
  );
}
