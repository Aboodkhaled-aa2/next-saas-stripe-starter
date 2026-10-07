import Link from "next/link";
import { ArrowLeft, Bot, MessageCircle, UserRound } from "lucide-react";
import { notFound } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/header";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const channelLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
};

const channelStyles: Record<string, string> = {
  WHATSAPP: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  FACEBOOK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  INSTAGRAM: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user?.id) {
    notFound();
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          text: true,
          direction: true,
          createdAt: true,
        },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  const channel = channelLabels[conversation.channel] ?? conversation.channel;
  const channelStyle =
    channelStyles[conversation.channel] ??
    "border-slate-800 bg-slate-900 text-slate-400";

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Conversation"
        text="View the complete customer conversation and AI responses."
      />

      <Link
        href="/dashboard/conversations"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to conversations
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="border-b border-slate-800 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
              <UserRound className="h-5 w-5 text-slate-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-white">
                {conversation.customerName ||
                  conversation.customerExternalId ||
                  "Customer"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {conversation.customerExternalId || "Customer conversation"}
              </p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${channelStyle}`}
            >
              {channel}
            </span>
            <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-500">
              {conversation.status}
            </span>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          {conversation.messages.length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-slate-700" />
              <p className="mt-4 font-medium text-white">No messages yet</p>
            </div>
          ) : (
            conversation.messages.map((message) => {
              const inbound = message.direction === "INBOUND";

              return (
                <div
                  key={message.id}
                  className={`flex ${inbound ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                      inbound
                        ? "border border-slate-800 bg-slate-900 text-slate-200"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-medium opacity-70">
                      {inbound ? (
                        <UserRound className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                      <span>{inbound ? "Customer" : "Smart Cleaning Desk AI"}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.text}
                    </p>
                    <p className="mt-2 text-[10px] opacity-60">
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-800 bg-slate-900/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Bot className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-xs text-slate-500">
              Messages from connected channels are stored here and AI responses
              are shown in the same conversation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatMessageTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
