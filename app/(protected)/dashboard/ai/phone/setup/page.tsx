"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Phone, Save, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

export default function AIPhoneSetupPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);

    window.setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 500);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/ai"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
          aria-label="Back to AI Employee"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div>
          <p className="text-sm text-slate-500">AI Employee / AI Phone</p>
          <h1 className="text-2xl font-semibold text-white">Set Up AI Phone</h1>
        </div>
      </div>

      <section className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Phone className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-white">Your AI receptionist</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              AI Phone will use your existing business profile, services,
              pricing, policies, tone, and AI instructions when handling calls.
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Receptionist details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose how your AI receptionist should identify itself.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone number" name="phoneNumber" placeholder="+1 555 123 4567" type="tel" />
            <Field label="AI receptionist name" name="assistantName" placeholder="Sarah" />
          </div>

          <div className="mt-5">
            <label htmlFor="greeting" className="text-sm font-medium text-slate-300">
              Greeting
            </label>
            <textarea
              id="greeting"
              name="greeting"
              rows={3}
              placeholder="Hi, thanks for calling. How can I help you today?"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-violet-500"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Voice setup</h2>
              <p className="mt-1 text-sm text-slate-500">
                These options will control the receptionist experience. Provider
                connection and voice selection will be connected in the next step.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Speaking style"
              name="speakingStyle"
              options={["Professional and friendly", "Warm and casual", "Concise and direct"]}
            />
            <SelectField
              label="Provider"
              name="provider"
              options={["Vapi", "Not connected yet"]}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl sm:p-8">
          <div className="mb-6">
            <h2 className="font-semibold text-white">Call behavior</h2>
            <p className="mt-1 text-sm text-slate-500">
              The AI will follow your existing business rules and handoff instructions.
            </p>
          </div>

          <div className="space-y-3">
            <BehaviorItem title="Use existing business knowledge" description="Services, pricing, service areas, policies, and additional notes." />
            <BehaviorItem title="Help qualify customers" description="Collect the details needed before a booking or human handoff." />
            <BehaviorItem title="Support booking conversations" description="Use the same booking workflow as the rest of Smart Cleaning Desk." />
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {saved && (
            <span className="inline-flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Setup saved locally
            </span>
          )}

          <Link
            href="/dashboard/ai"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-800 px-5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save AI Phone Setup"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-violet-500"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={options[0]}
        className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-white outline-none focus:border-violet-500"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function BehaviorItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}
