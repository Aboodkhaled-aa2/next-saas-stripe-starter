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

export const dynamic = "force-dynamic";

const conversations = [
  {
    id: "1",
    name: "Sarah Johnson",
    channel: "WhatsApp",
    lastMessage: "Hi, I need a deep cleaning for my house.",
    time: "2 min ago",
    status: "New",
  },
  {
    id: "2",
    name: "Michael Brown",
    channel: "Phone",
    lastMessage: "I'd like to get a quote for a move-out cleaning.",
    time: "18 min ago",
    status: "Qualified",
  },
  {
    id: "3",
    name: "Emily Davis",
    channel: "Instagram",
    lastMessage: "Do you have availability this Saturday?",
    time: "42 min ago",
    status: "Booked",
  },
];

const channelStyles: Record<string, string> = {
  WhatsApp: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Phone: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Conversations"
        text="View and manage conversations handled by your AI employee across every connected channel."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Conversations"
          value="3"
          icon={<MessageCircle className="h-5 w-5" />}
        />

        <StatCard
          label="AI Handled"
          value="100%"
          icon={<Bot className="h-5 w-5" />}
        />

        <StatCard
          label="Response Time"
          value="< 1 min"
          icon={<Phone className="h-5 w-5" />}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-white">Recent Conversations</h2>

            <p className="mt-1 text-sm text-slate-500">
              Conversations from your connected customer channels.
            </p>
          </div>

          <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3">
            <Search className="h-4 w-4 text-slate-500" />

            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600 sm:w-56"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="group flex flex-col gap-4 p-5 transition-colors hover:bg-slate-900/40 sm:flex-row sm:items-center"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
                <UserRound className="h-5 w-5 text-slate-500" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-white">
                    {conversation.name}
                  </h3>

                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      channelStyles[conversation.channel] ||
                      "border-slate-800 bg-slate-900 text-slate-400"
                    }`}
                  >
                    {conversation.channel}
                  </span>

                  <span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    {conversation.status}
                  </span>
                </div>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {conversation.lastMessage}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <span className="text-xs text-slate-600">
                  {conversation.time}
                </span>

                <Link
                  href="/dashboard/ai"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-white"
                >
                  View
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 bg-slate-900/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Bot className="h-4 w-4 text-blue-400" />
            </div>

            <p className="text-xs text-slate-500">
              Your AI employee will automatically handle new conversations
              once your channels are connected.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-400">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
