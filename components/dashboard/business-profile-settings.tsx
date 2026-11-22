"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Save } from "lucide-react";

type Profile = {
  businessName?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  websiteUrl?: string | null;
  businessType?: string | null;
  services?: unknown;
  serviceAreas?: unknown;
  pricing?: unknown;
  businessHours?: unknown;
  paymentMethods?: unknown;
  bookingRules?: unknown;
  cancellationPolicy?: string | null;
  reschedulingPolicy?: string | null;
  aiInstructions?: string | null;
  aiTone?: string | null;
  humanHandoffInstructions?: string | null;
  additionalNotes?: string | null;
};

type Fields = Record<string, string>;

const empty: Fields = {
  businessName: "", businessPhone: "", businessEmail: "", websiteUrl: "",
  businessType: "", services: "", serviceAreas: "", pricing: "", businessHours: "",
  paymentMethods: "", bookingRules: "", cancellationPolicy: "", reschedulingPolicy: "",
  aiInstructions: "", aiTone: "Professional and friendly",
  humanHandoffInstructions: "", additionalNotes: "",
};

function asText(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(String).join("\n");
  return JSON.stringify(value, null, 2);
}

function toFields(profile: Profile): Fields {
  return {
    businessName: profile.businessName || "",
    businessPhone: profile.businessPhone || "",
    businessEmail: profile.businessEmail || "",
    websiteUrl: profile.websiteUrl || "",
    businessType: profile.businessType || "",
    services: asText(profile.services),
    serviceAreas: asText(profile.serviceAreas),
    pricing: asText(profile.pricing),
    businessHours: asText(profile.businessHours),
    paymentMethods: asText(profile.paymentMethods),
    bookingRules: asText(profile.bookingRules),
    cancellationPolicy: profile.cancellationPolicy || "",
    reschedulingPolicy: profile.reschedulingPolicy || "",
    aiInstructions: profile.aiInstructions || "",
    aiTone: profile.aiTone || "Professional and friendly",
    humanHandoffInstructions: profile.humanHandoffInstructions || "",
    additionalNotes: profile.additionalNotes || "",
  };
}

const sections = [
  { title: "Business basics", fields: [
    ["businessName", "Business name"], ["businessPhone", "Business phone"],
    ["businessEmail", "Business email"], ["websiteUrl", "Website"], ["businessType", "Business type"],
  ]},
  { title: "Services and pricing", fields: [
    ["services", "Services offered"], ["pricing", "Prices and how prices are calculated"],
  ]},
  { title: "Service area and hours", fields: [
    ["serviceAreas", "Service areas"], ["businessHours", "Business hours"],
  ]},
  { title: "Booking and payments", fields: [
    ["paymentMethods", "Payment methods"], ["bookingRules", "Booking rules and appointment duration"],
  ]},
  { title: "Policies", fields: [
    ["cancellationPolicy", "Cancellation policy"], ["reschedulingPolicy", "Rescheduling policy"],
  ]},
  { title: "AI employee", fields: [
    ["aiTone", "Communication style"], ["aiInstructions", "AI instructions"],
    ["humanHandoffInstructions", "When to hand off to a human"], ["additionalNotes", "Additional notes"],
  ]},
] as const;

const longFields = new Set([
  "services", "pricing", "serviceAreas", "businessHours", "paymentMethods",
  "bookingRules", "cancellationPolicy", "reschedulingPolicy", "aiInstructions",
  "humanHandoffInstructions", "additionalNotes",
]);

export function BusinessProfileSettings() {
  const [fields, setFields] = useState<Fields>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/business-profile", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load business profile.");
        if (active && data.businessProfile) setFields(toFields(data.businessProfile));
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Unable to load business profile."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function update(key: string, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    setSuccess("");
    setError("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const services = fields.services.split("\n").map((item) => item.trim()).filter(Boolean);
      const paymentMethods = fields.paymentMethods.split("\n").map((item) => item.trim()).filter(Boolean);
      const response = await fetch("/api/business-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          services,
          paymentMethods,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save business profile.");
      setSuccess("Business information saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save business profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center gap-3 py-8 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading business information...</div>;
  }

  return (
    <section className="space-y-6 py-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Business information</h2>
        <p className="mt-1 text-sm text-slate-400">View and update the information your AI employee uses when speaking with customers.</p>
      </div>
      <form onSubmit={save} className="space-y-5">
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
            <h3 className="mb-5 font-semibold text-white">{section.title}</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              {section.fields.map(([key, label]) => (
                <label key={key} className={longFields.has(key) ? "sm:col-span-2 block" : "block"}>
                  <span className="text-sm font-medium text-slate-300">{label}</span>
                  {longFields.has(key) ? (
                    <textarea
                      value={fields[key]}
                      onChange={(event) => update(key, event.target.value)}
                      rows={key === "pricing" || key === "bookingRules" ? 5 : 3}
                      placeholder={key === "pricing" ? "Example: Standard cleaning starts at $120. Price is based on bedrooms, bathrooms, square footage, and cleaning type. Deep cleaning starts at $200. Add exact rates or formulas; the AI will not invent missing prices." : key === "services" ? "Enter one service per line." : key === "paymentMethods" ? "Enter one payment method per line." : ""}
                      className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                    />
                  ) : (
                    <input
                      value={fields[key]}
                      onChange={(event) => update(key, event.target.value)}
                      type={key === "businessEmail" ? "email" : "text"}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-blue-500/50"
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
        {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
        {success && <p role="status" className="flex items-center gap-2 text-sm text-emerald-400"><Check className="h-4 w-4" />{success}</p>}
        <button type="submit" disabled={saving} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save business information"}
        </button>
      </form>
    </section>
  );
}
