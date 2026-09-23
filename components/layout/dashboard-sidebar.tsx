"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelRightClose } from "lucide-react";

import { SidebarNavItem } from "@/types";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icons } from "@/components/shared/icons";

interface DashboardSidebarProps {
  links: SidebarNavItem[];
}

const hiddenLegacyItems = new Set([
  "User Posts",
  "Documentation",
  "Homepage",
]);

function filterLinks(links: SidebarNavItem[]) {
  return links
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !hiddenLegacyItems.has(item.title),
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export function DashboardSidebar({
  links,
}: DashboardSidebarProps) {
  const path = usePathname();

  const { isTablet } = useMediaQuery();

  const [isSidebarExpanded, setIsSidebarExpanded] =
    useState(!isTablet);

  const visibleLinks = filterLinks(links);

  const toggleSidebar = () => {
    setIsSidebarExpanded((current) => !current);
  };

  useEffect(() => {
    setIsSidebarExpanded(!isTablet);
  }, [isTablet]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="sticky top-0 h-full bg-[#020617]">
        <ScrollArea className="h-full overflow-y-auto border-r border-slate-800 bg-[#020617]">
          <aside
            className={cn(
              isSidebarExpanded
                ? "w-[220px] xl:w-[260px]"
                : "w-[68px]",
              "hidden h-screen bg-[#020617] md:block",
            )}
          >
            <div className="flex h-full max-h-screen flex-1 flex-col">
              <div className="flex h-14 items-center border-b border-slate-800 px-4 lg:h-[60px]">
                {isSidebarExpanded ? (
                  <Link
                    href="/dashboard"
                    className="flex min-w-0 items-center gap-2"
                  >
                    <Icons.logo className="size-6 shrink-0 text-blue-400" />

                    <span className="truncate font-urban text-base font-bold text-white">
                      Smart Cleaning Desk
                    </span>
                  </Link>
                ) : null}

                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-9 text-slate-500 hover:bg-slate-900 hover:text-white lg:size-8"
                  onClick={toggleSidebar}
                >
                  {isSidebarExpanded ? (
                    <PanelLeftClose
                      size={18}
                      className="stroke-slate-500"
                    />
                  ) : (
                    <PanelRightClose
                      size={18}
                      className="stroke-slate-500"
                    />
                  )}

                  <span className="sr-only">
                    Toggle Sidebar
                  </span>
                </Button>
              </div>

              <nav className="flex flex-1 flex-col gap-8 px-3 pt-5">
                {visibleLinks.map((section) => (
                  <section
                    key={section.title}
                    className="flex flex-col gap-1"
                  >
                    {isSidebarExpanded ? (
                      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        {section.title}
                      </p>
                    ) : (
                      <div className="h-4" />
                    )}

                    {section.items.map((item) => {
                      const Icon =
                        Icons[item.icon || "arrowRight"];

                      const isActive =
                        path === item.href ||
                        (item.href !== "/dashboard" &&
                          path.startsWith(`${item.href}/`));

                      if (!item.href) {
                        return null;
                      }

                      return (
                        <Fragment key={item.title}>
                          {isSidebarExpanded ? (
                            <Link
                              href={
                                item.disabled
                                  ? "#"
                                  : item.href
                              }
                              className={cn(
                                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                isActive
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "text-slate-400 hover:bg-slate-900 hover:text-white",
                                item.disabled &&
                                  "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-400",
                              )}
                              aria-disabled={item.disabled}
                              onClick={(event) => {
                                if (item.disabled) {
                                  event.preventDefault();
                                }
                              }}
                            >
                              <Icon
                                className={cn(
                                  "size-[18px] shrink-0 transition-colors",
                                  isActive
                                    ? "text-blue-400"
                                    : "text-slate-500 group-hover:text-slate-300",
                                )}
                              />

                              <span className="truncate">
                                {item.title}
                              </span>

                              {item.badge ? (
                                <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full border-blue-500/20 bg-blue-500/10 px-0 text-[10px] font-medium text-blue-400">
                                  {item.badge}
                                </Badge>
                              ) : null}
                            </Link>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={
                                    item.disabled
                                      ? "#"
                                      : item.href
                                  }
                                  aria-disabled={item.disabled}
                                  onClick={(event) => {
                                    if (item.disabled) {
                                      event.preventDefault();
                                    }
                                  }}
                                  className={cn(
                                    "flex items-center justify-center rounded-lg py-2.5 text-sm font-medium transition-all",
                                    isActive
                                      ? "bg-blue-500/10 text-blue-400"
                                      : "text-slate-500 hover:bg-slate-900 hover:text-white",
                                    item.disabled &&
                                      "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-500",
                                  )}
                                >
                                  <span className="flex size-full items-center justify-center">
                                    <Icon
                                      className={cn(
                                        "size-5",
                                        isActive
                                          ? "text-blue-400"
                                          : "text-slate-500",
                                      )}
                                    />
                                  </span>
                                </Link>
                              </TooltipTrigger>

                              <TooltipContent
                                side="right"
                                sideOffset={8}
                                className="border-slate-800 bg-slate-950 text-white"
                              >
                                {item.title}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </Fragment>
                      );
                    })}
                  </section>
                ))}
              </nav>
            </div>
          </aside>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

export function MobileSheetSidebar({
  links,
}: DashboardSidebarProps) {
  const path = usePathname();

  const [open, setOpen] = useState(false);

  const { isSm, isMobile } = useMediaQuery();

  const visibleLinks = filterLinks(links);

  if (isSm || isMobile) {
    return (
      <Sheet
        open={open}
        onOpenChange={setOpen}
      >
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0 border-slate-800 bg-[#020617] text-white hover:bg-slate-900 hover:text-white md:hidden"
          >
            <Menu className="size-5" />

            <span className="sr-only">
              Toggle navigation menu
            </span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="flex w-[280px] flex-col border-slate-800 bg-[#020617] p-0 text-white shadow-2xl"
        >
          <ScrollArea className="h-full bg-[#020617]">
            <div className="flex min-h-screen flex-col bg-[#020617]">
              <div className="border-b border-slate-800 px-5 py-5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2"
                  onClick={() => setOpen(false)}
                >
                  <Icons.logo className="size-6 text-blue-400" />

                  <span className="font-urban text-xl font-bold text-white">
                    Smart Cleaning Desk
                  </span>
                </Link>
              </div>

              <nav className="flex flex-1 flex-col gap-y-8 p-5 text-lg font-medium">
                {visibleLinks.map((section) => (
                  <section
                    key={section.title}
                    className="flex flex-col gap-1"
                  >
                    <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      {section.title}
                    </p>

                    {section.items.map((item) => {
                      const Icon =
                        Icons[item.icon || "arrowRight"];

                      const isActive =
                        path === item.href ||
                        (item.href !== "/dashboard" &&
                          path.startsWith(`${item.href}/`));

                      if (!item.href) {
                        return null;
                      }

                      return (
                        <Fragment key={item.title}>
                          <Link
                            onClick={(event) => {
                              if (item.disabled) {
                                event.preventDefault();
                                return;
                              }

                              setOpen(false);
                            }}
                            href={
                              item.disabled
                                ? "#"
                                : item.href
                            }
                            aria-disabled={item.disabled}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                              isActive
                                ? "bg-blue-500/10 text-blue-400"
                                : "text-slate-400 hover:bg-slate-900 hover:text-white",
                              item.disabled &&
                                "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-400",
                            )}
                          >
                            <Icon
                              className={cn(
                                "size-[18px]",
                                isActive
                                  ? "text-blue-400"
                                  : "text-slate-500",
                              )}
                            />

                            <span className="truncate">
                              {item.title}
                            </span>

                            {item.badge ? (
                              <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full border-blue-500/20 bg-blue-500/10 px-0 text-[10px] font-medium text-blue-400">
                                {item.badge}
                              </Badge>
                            ) : null}
                          </Link>
                        </Fragment>
                      );
                    })}
                  </section>
                ))}
              </nav>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="flex size-9 animate-pulse rounded-lg bg-slate-900 md:hidden" />
  );
}
