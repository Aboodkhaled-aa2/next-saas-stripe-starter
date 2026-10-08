"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Phone, Save, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

export default function AIPhoneSetupPage() {
  const [speakingStyle, setSpeakingStyle] = useState("Professional and friendly");
  const [handoffInstructions, setHandoffInstructions] = useState("");
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch("/api/ai-phone");
        if (!response.ok) return;

        const data = await response.json();
        if (!cancelled) {
          setBusinessProfile(data.businessProfile ?? null);
        }

        if (!cancelled && data.aiPhoneSettings) {
          const settings = data.aiPhoneSettings;
          const form = document.querySelector<HTMLFormElement>("form");
          if (!form) return;

          const setValue = (name: string, value: string | null) => {
            const field = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
            if (field && value) field.value = value;
          };

          setValue("phoneNumber", settings.phoneNumber);
          setValue("assistantName", settings.assistantName);
          setValue("greeting", settings.greeting);
          setValue("provider", settings.provider);
        }

        if (!cancelled && data.businessProfile) {
          setSpeakingStyle(
            data.businessProfile.aiTone || "Professional and friendly",
          );
          setHandoffInstructions(
            data.businessProfile.humanHandoffInstructions || "",
          );
        }
      } catch {
        if (!cancelled) setError("Unable to load AI Phone settings.");
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/ai-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formData.get("phoneNumber"),
          assistantName: formData.get("assistantName"),
          greeting: formData.get("greeting"),
          provider: formData.get("provider"),
          speakingStyle: speakingStyle || formData.get("speakingStyle"),
          handoffInstructions:
            handoffInstructions || formData.get("handoffInstructions"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save AI Phone settings.");
      }

      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save AI Phone settings.");
    } finally {
      setSaving(false);
    }
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
            <h2 className="font-semibold text-white">Business knowledge</h2>
            <p className="mt-1 text-sm text-slate-500">
              AI Phone uses the same services, service areas, hours, pricing,
              and booking rules from your Business Profile.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileCard label="Business" value={businessProfile?.businessName || "Not configured"} />
            <ProfileCard label="Services" value={formatProfileValue(businessProfile?.services)} />
            <ProfileCard label="Service areas" value={formatProfileValue(businessProfile?.serviceAreas)} />
            <ProfileCard label="Business hours" value={formatProfileValue(businessProfile?.businessHours)} />
            <ProfileCard label="Booking rules" value={formatProfileValue(businessProfile?.bookingRules)} />
            <ProfileCard label="Pricing" value={formatProfileValue(businessProfile?.pricing)} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl sm:p-8">
          <div className="mb-6">
            <h2 className="font-semibold text-white">Human handoff</h2>
            <p className="mt-1 text-sm text-slate-500">
              Define when the AI should transfer the caller to a human employee.
            </p>
          </div>

          <textarea
            name="handoffInstructions"
            value={handoffInstructions}
            onChange={(event) => setHandoffInstructions(event.target.value)}
            rows={5}
            placeholder="Transfer when the customer asks for a human, has a billing issue, requests something outside the configured services, or when the AI cannot confidently help."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-violet-500"
          />
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

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {saved && (
            <span className="inline-flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Setup saved
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
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
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
        value={value}
        defaultValue={value ? undefined : options[0]}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
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


function ProfileCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap text-sm leading-5 text-slate-300">
        {value}
      </p>
    </div>
  );
}

function formatProfileValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not configured";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.length
      ? value
          .map((item) =>
            typeof item === "string" ? item : JSON.stringify(item),
          )
          .join(", ")
      : "Not configured";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Configured";
  }
}
