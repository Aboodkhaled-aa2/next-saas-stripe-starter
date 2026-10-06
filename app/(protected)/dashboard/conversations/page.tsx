import Link from "next/link";
import {
  ArrowRight,
  Bot,
  MessageCircle,
  Phone,
  Search,
  UserRound,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const channelStyles: Record<string, string> = {
  WHATSAPP: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  FACEBOOK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  INSTAGRAM: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

const channelLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
};

export default async function ConversationsPage() {
  const user = await getCurrentUser();

  const conversations = user?.id
    ? await prisma.conversation.findMany({
        where: { userId: user.id },
        orderBy: { lastMessageAt: "desc" },
        take: 50,
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { text: true, createdAt: true, direction: true },
          },
        },
      })
    : [];

  const activeCount = conversations.filter((c) => c.status === "OPEN").length;
  const aiHandledCount = conversations.filter((c) => Boolean(c.aiResponseId)).length;
  const connectedChannels = new Set(conversations.map((c) => c.channel)).size;

  return (
    <div className="space-y-6">
      <DashboardHeader heading="Conversations" text="View and manage real customer conversations from your connected channels." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active Conversations" value={String(activeCount)} icon={<MessageCircle className="h-5 w-5" />} />
        <StatCard label="AI Handled" value={String(aiHandledCount)} icon={<Bot className="h-5 w-5" />} />
        <StatCard label="Connected Channels" value={String(connectedChannels)} icon={<Phone className="h-5 w-5" />} />
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-white">Recent Conversations</h2>
            <p className="mt-1 text-sm text-slate-500">Live conversations stored by Smart Cleaning Desk.</p>
          </div>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input type="text" placeholder="Search conversations..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600 sm:w-56" aria-label="Search conversations" />
          </div>
        </div>
        {conversations.length === 0 ? (
          <div className="p-10 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-slate-700" />
            <p className="mt-4 font-medium text-white">No customer conversations yet</p>
            <p className="mt-1 text-sm text-slate-500">Connect a channel and send a customer message to see it here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {conversations.map((conversation) => {
              const latestMessage = conversation.messages[0];
              const channel = channelLabels[conversation.channel] ?? conversation.channel;
              return (
                <div key={conversation.id} className="group flex flex-col gap-4 p-5 transition-colors hover:bg-slate-900/40 sm:flex-row sm:items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
                    <UserRound className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-white">{conversation.customerName || conversation.customerExternalId || "Customer"}</h3>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${channelStyles[conversation.channel] || "border-slate-800 bg-slate-900 text-slate-400"}`}>{channel}</span>
                      <span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-500">{conversation.status}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">{latestMessage?.text || "No messages yet"}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <span className="text-xs text-slate-600">{formatRelativeTime(conversation.lastMessageAt)}</span>
                    <Link href="/dashboard/ai" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-white">View<ArrowRight className="h-3.5 w-3.5" /></Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="border-t border-slate-800 bg-slate-900/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10"><Bot className="h-4 w-4 text-blue-400" /></div>
            <p className="text-xs text-slate-500">New messages are processed by the Smart Cleaning Desk AI employee when the connected channel and required Meta permissions are active.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatRelativeTime(date: Date) {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return "just now";
  if (diffSeconds < 3600) return Math.floor(diffSeconds / 60) + " min ago";
  if (diffSeconds < 86400) return Math.floor(diffSeconds / 3600) + " hr ago";
  return Math.floor(diffSeconds / 86400) + " days ago";
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
      <div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-400">{icon}</div></div>
      <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}