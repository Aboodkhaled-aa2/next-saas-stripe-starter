"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem, SidebarNavItem } from "@/types";
import { Menu, PanelLeftClose, PanelRightClose } from "lucide-react";

import { siteConfig } from "@/config/site";
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
import ProjectSwitcher from "@/components/dashboard/project-switcher";
import { UpgradeCard } from "@/components/dashboard/upgrade-card";
import { Icons } from "@/components/shared/icons";

interface DashboardSidebarProps {
  links: SidebarNavItem[];
}

export function DashboardSidebar({ links }: DashboardSidebarProps) {
  const path = usePathname();

  const { isTablet } = useMediaQuery();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(!isTablet);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    setIsSidebarExpanded(!isTablet);
  }, [isTablet]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="sticky top-0 h-full bg-[#020617]">
        <ScrollArea className="h-full overflow-y-auto border-r border-[#17233d] bg-[#020617]">
          <aside
            className={cn(
              isSidebarExpanded ? "w-[220px] xl:w-[260px]" : "w-[68px]",
              "hidden h-screen bg-[#020617] md:block",
            )}
          >
            <div className="flex h-full max-h-screen flex-1 flex-col gap-2">
              <div className="flex h-14 items-center border-b border-[#17233d] p-4 lg:h-[60px]">
                {isSidebarExpanded ? <ProjectSwitcher /> : null}

                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-9 text-[#94a3b8] hover:bg-[#0b1938] hover:text-white lg:size-8"
                  onClick={toggleSidebar}
                >
                  {isSidebarExpanded ? (
                    <PanelLeftClose
                      size={18}
                      className="stroke-[#94a3b8]"
                    />
                  ) : (
                    <PanelRightClose
                      size={18}
                      className="stroke-[#94a3b8]"
                    />
                  )}

                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </div>

              <nav className="flex flex-1 flex-col gap-8 px-4 pt-4">
                {links.map((section) => (
                  <section
                    key={section.title}
                    className="flex flex-col gap-0.5"
                  >
                    {isSidebarExpanded ? (
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#475569]">
                        {section.title}
                      </p>
                    ) : (
                      <div className="h-4" />
                    )}

                    {section.items.map((item) => {
                      const Icon = Icons[item.icon || "arrowRight"];

                      return (
                        item.href && (
                          <Fragment key={`link-fragment-${item.title}`}>
                            {isSidebarExpanded ? (
                              <Link
                                key={`link-${item.title}`}
                                href={item.disabled ? "#" : item.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg p-2.5 text-sm font-medium transition-colors",
                                  path === item.href
                                    ? "bg-[#0b1938] text-[#60a5fa]"
                                    : "text-[#94a3b8] hover:bg-[#0a1224] hover:text-white",
                                  item.disabled &&
                                    "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-[#94a3b8]",
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "size-5",
                                    path === item.href
                                      ? "text-[#60a5fa]"
                                      : "text-[#64748b]",
                                  )}
                                />

                                {item.title}

                                {item.badge && (
                                  <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full border-[#28549a] bg-[#0b1938] text-[#60a5fa]">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            ) : (
                              <Tooltip key={`tooltip-${item.title}`}>
                                <TooltipTrigger asChild>
                                  <Link
                                    key={`link-tooltip-${item.title}`}
                                    href={item.disabled ? "#" : item.href}
                                    className={cn(
                                      "flex items-center justify-center rounded-lg py-2.5 text-sm font-medium transition-colors",
                                      path === item.href
                                        ? "bg-[#0b1938] text-[#60a5fa]"
                                        : "text-[#64748b] hover:bg-[#0a1224] hover:text-white",
                                      item.disabled &&
                                        "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-[#64748b]",
                                    )}
                                  >
                                    <span className="flex size-full items-center justify-center">
                                      <Icon
                                        className={cn(
                                          "size-5",
                                          path === item.href
                                            ? "text-[#60a5fa]"
                                            : "text-[#64748b]",
                                        )}
                                      />
                                    </span>
                                  </Link>
                                </TooltipTrigger>

                                <TooltipContent
                                  side="right"
                                  className="border-[#243858] bg-[#080f21] text-white"
                                >
                                  {item.title}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </Fragment>
                        )
                      );
                    })}
                  </section>
                ))}
              </nav>

              <div className="mt-auto xl:p-4">
                {isSidebarExpanded ? <UpgradeCard /> : null}
              </div>
            </div>
          </aside>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

export function MobileSheetSidebar({ links }: DashboardSidebarProps) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { isSm, isMobile } = useMediaQuery();

  if (isSm || isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0 border-[#243858] bg-[#080f21] text-white hover:bg-[#0b1938] hover:text-white md:hidden"
          >
            <Menu className="size-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="flex w-[280px] flex-col border-[#17233d] bg-[#020617] p-0 text-white"
        >
          <ScrollArea className="h-full overflow-y-auto">
            <div className="flex h-screen flex-col">
              <nav className="flex flex-1 flex-col gap-y-8 p-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  <Icons.logo className="size-6 text-[#60a5fa]" />

                  <span className="font-urban text-xl font-bold">
                    {siteConfig.name}
                  </span>
                </Link>

                <ProjectSwitcher large />

                {links.map((section) => (
                  <section
                    key={section.title}
                    className="flex flex-col gap-0.5"
                  >
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#475569]">
                      {section.title}
                    </p>

                    {section.items.map((item) => {
                      const Icon = Icons[item.icon || "arrowRight"];

                      return (
                        item.href && (
                          <Fragment key={`link-fragment-${item.title}`}>
                            <Link
                              key={`link-${item.title}`}
                              onClick={() => {
                                if (!item.disabled) setOpen(false);
                              }}
                              href={item.disabled ? "#" : item.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg p-2.5 text-sm font-medium transition-colors",
                                path === item.href
                                  ? "bg-[#0b1938] text-[#60a5fa]"
                                  : "text-[#94a3b8] hover:bg-[#0a1224] hover:text-white",
                                item.disabled &&
                                  "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-[#94a3b8]",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "size-5",
                                  path === item.href
                                    ? "text-[#60a5fa]"
                                    : "text-[#64748b]",
                                )}
                              />

                              {item.title}

                              {item.badge && (
                                <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full border-[#28549a] bg-[#0b1938] text-[#60a5fa]">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </Fragment>
                        )
                      );
                    })}
                  </section>
                ))}

                <div className="mt-auto">
                  <UpgradeCard />
                </div>
              </nav>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="flex size-9 animate-pulse rounded-lg bg-[#080f21] md:hidden" />
  );
}
