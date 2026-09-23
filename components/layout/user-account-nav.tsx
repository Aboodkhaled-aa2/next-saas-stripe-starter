"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Lock,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Drawer } from "vaul";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";

function AccountCircle() {
  return (
    <span className="flex size-10 items-center justify-center rounded-full border border-blue-400/30 bg-[#071a3a] text-blue-300 shadow-lg shadow-blue-950/20">
      <User className="size-5" strokeWidth={2} />
    </span>
  );
}

export function UserAccountNav() {
  const { data: session } = useSession();
  const user = session?.user;

  const [open, setOpen] = useState(false);
  const closeDrawer = () => {
    setOpen(false);
  };

  const { isMobile } = useMediaQuery();

  if (!user) {
    return (
      <div className="flex size-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
        <User className="size-5 text-slate-500" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <Drawer.Root open={open} onClose={closeDrawer}>
        <Drawer.Trigger
          asChild
          onClick={() => setOpen(true)}
        >
          <button
            type="button"
            aria-label="Open account menu"
            className="rounded-full outline-none transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            <AccountCircle />
          </button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 z-40 h-full bg-black/70 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 overflow-hidden rounded-t-2xl border border-slate-800 bg-[#020617] px-3 text-sm text-white shadow-2xl">
            <div className="sticky top-0 z-20 flex w-full items-center justify-center bg-[#020617]">
              <div className="my-3 h-1.5 w-16 rounded-full bg-slate-700" />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <AccountCircle />

              <div className="flex min-w-0 flex-col">
                {user.name && (
                  <p className="truncate font-medium text-white">
                    {user.name}
                  </p>
                )}

                {user.email && (
                  <p className="w-[220px] truncate text-sm text-slate-500">
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            <ul
              role="list"
              className="mb-8 mt-3 w-full space-y-1 text-slate-400"
            >
              {user.role === "ADMIN" ? (
                <li className="rounded-xl text-slate-300 transition-colors hover:bg-slate-900 hover:text-white">
                  <Link
                    href="/admin"
                    onClick={closeDrawer}
                    className="flex w-full items-center gap-3 px-3 py-3"
                  >
                    <Lock className="size-4 text-slate-500" />
                    <p className="text-sm">Admin</p>
                  </Link>
                </li>
              ) : null}

              <li className="rounded-xl text-slate-300 transition-colors hover:bg-slate-900 hover:text-white">
                <Link
                  href="/dashboard"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-3 py-3"
                >
                  <LayoutDashboard className="size-4 text-slate-500" />
                  <p className="text-sm">Dashboard</p>
                </Link>
              </li>

              <li className="rounded-xl text-slate-300 transition-colors hover:bg-slate-900 hover:text-white">
                <Link
                  href="/dashboard/settings"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-3 py-3"
                >
                  <Settings className="size-4 text-slate-500" />
                  <p className="text-sm">Settings</p>
                </Link>
              </li>

              <li
                className="rounded-xl text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
                onClick={(event) => {
                  event.preventDefault();
                  signOut({
                    callbackUrl: `${window.location.origin}/`,
                  });
                }}
              >
                <div className="flex w-full items-center gap-3 px-3 py-3">
                  <LogOut className="size-4 text-slate-500" />
                  <p className="text-sm">Log out</p>
                </div>
              </li>
            </ul>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="rounded-full outline-none transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
        >
          <AccountCircle />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-xl border-slate-800 bg-slate-950 p-1.5 text-white shadow-2xl"
      >
        <div className="flex items-center gap-3 rounded-lg p-2.5">
          <UserAvatar
            user={{ name: user.name || null, image: user.image || null }}
            className="size-9 border border-slate-700"
          />

          <div className="flex min-w-0 flex-col space-y-1 leading-none">
            {user.name && (
              <p className="truncate font-medium text-white">{user.name}</p>
            )}

            {user.email && (
              <p className="w-[175px] truncate text-xs text-slate-500">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-800" />

        {user.role === "ADMIN" ? (
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-lg text-slate-300 focus:bg-slate-900 focus:text-white"
          >
            <Link href="/admin" className="flex items-center space-x-2.5">
              <Lock className="size-4 text-slate-500" />
              <p className="text-sm">Admin</p>
            </Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-lg text-slate-300 focus:bg-slate-900 focus:text-white"
        >
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <LayoutDashboard className="size-4 text-slate-500" />
            <p className="text-sm">Dashboard</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-lg text-slate-300 focus:bg-slate-900 focus:text-white"
        >
          <Link
            href="/dashboard/settings"
            className="flex items-center space-x-2.5"
          >
            <Settings className="size-4 text-slate-500" />
            <p className="text-sm">Settings</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-800" />

        <DropdownMenuItem
          className="cursor-pointer rounded-lg text-slate-300 focus:bg-red-500/10 focus:text-red-400"
          onSelect={(event) => {
            event.preventDefault();
            signOut({
              callbackUrl: `${window.location.origin}/`,
            });
          }}
        >
          <div className="flex items-center space-x-2.5">
            <LogOut className="size-4 text-slate-500" />
            <p className="text-sm">Log out</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
