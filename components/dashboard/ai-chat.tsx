"use client";

import { FormEvent, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previousResponseId, setPreviousResponseId] = useState<string | null>(
    null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setInput("");

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: message,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          ...(previousResponseId ? { previousResponseId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      if (typeof data.responseId === "string") {
        setPreviousResponseId(data.responseId);
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Bot className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-white">Test Your AI Employee</h2>
          <p className="text-xs text-slate-500">
            Send a message to test how your AI employee responds.
          </p>
        </div>
      </div>

      <div className="mt-6 min-h-[220px] space-y-3 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
        {messages.length === 0 ? (
          <div className="flex min-h-[180px] items-center justify-center text-center">
            <div>
              <Bot className="mx-auto h-8 w-8 text-slate-700" />
              <p className="mt-3 text-sm text-slate-500">
                Try asking about your services, pricing, or booking process.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-800 bg-slate-900 text-slate-300"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI is thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask your AI employee something..."
          disabled={loading}
          className="h-11 min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </form>
    </section>
  );
}
