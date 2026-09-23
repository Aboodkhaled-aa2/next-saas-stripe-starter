"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
} from "lucide-react";

type FormData = {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  websiteUrl: string;
  services: string[];
  serviceAreas: string;
  pricing: string;
  businessHours: string;
  paymentMethods: string[];
  bookingRules: string;
  cancellationPolicy: string;
  reschedulingPolicy: string;
  aiInstructions: string;
  aiTone: string;
  humanHandoffInstructions: string;
};

const initialFormData: FormData = {
  businessName: "",
  businessPhone: "",
  businessEmail: "",
  websiteUrl: "",
  services: [],
  serviceAreas: "",
  pricing: "",
  businessHours: "",
  paymentMethods: [],
  bookingRules: "",
  cancellationPolicy: "",
  reschedulingPolicy: "",
  aiInstructions: "",
  aiTone: "Professional and friendly",
  humanHandoffInstructions: "",
};

const steps = [
  {
    title: "Business basics",
    description: "Tell us about your cleaning business.",
    icon: Building2,
  },
  {
    title: "Services & pricing",
    description: "Tell your AI employee what you sell.",
    icon: Sparkles,
  },
  {
    title: "Service area & hours",
    description: "Help your AI know when and where you operate.",
    icon: MapPin,
  },
  {
    title: "Booking & payments",
    description: "Set your booking and payment rules.",
    icon: CalendarDays,
  },
  {
    title: "Policies",
    description: "Tell your AI how to handle changes and cancellations.",
    icon: Clock3,
  },
  {
    title: "AI behavior",
    description: "Customize how your AI employee communicates.",
    icon: Bot,
  },
];

const serviceOptions = [
  "Standard Cleaning",
  "Deep Cleaning",
  "Move In / Move Out",
  "Office Cleaning",
  "Recurring Cleaning",
  "Post Construction Cleaning",
  "Airbnb Cleaning",
  "Other",
];

const paymentOptions = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Online Payment",
  "Other",
];

const aiToneOptions = [
  "Professional and friendly",
  "Warm and conversational",
  "Short and direct",
  "Premium and professional",
];

export default function OnboardingPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const step = steps[currentStep];
  const StepIcon = step.icon;

  const progress = useMemo(
    () => ((currentStep + 1) / steps.length) * 100,
    [currentStep],
  );

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  };

  const toggleArrayValue = (
    field: "services" | "paymentMethods",
    value: string,
  ) => {
    setFormData((current) => {
      const values = current[field];

      return {
        ...current,
        [field]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      };
    });

    setError("");
  };

  const canContinue = () => {
    if (currentStep === 0) {
      return Boolean(
        formData.businessName.trim() &&
          formData.businessPhone.trim() &&
          formData.businessEmail.trim(),
      );
    }

    if (currentStep === 1) {
      return (
        formData.services.length > 0 &&
        formData.pricing.trim().length > 0
      );
    }

    if (currentStep === 2) {
      return Boolean(
        formData.serviceAreas.trim() &&
          formData.businessHours.trim(),
      );
    }

    if (currentStep === 3) {
      return formData.paymentMethods.length > 0;
    }

    if (currentStep === 4) {
      return Boolean(
        formData.cancellationPolicy.trim() &&
          formData.reschedulingPolicy.trim(),
      );
    }

    return true;
  };

  const handleNext = () => {
    if (!canContinue()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((current) => current + 1);
    }
  };

  const handleBack = () => {
    if (isSaving) {
      return;
    }

    if (currentStep > 0) {
      setCurrentStep((current) => current - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canContinue() || isSaving) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/business-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save your business profile.",
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Onboarding submission error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save your business profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
              <Bot className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Smart Cleaning Desk
              </p>

              <p className="text-xs text-slate-500">
                AI Employee Setup
              </p>
            </div>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-xs text-slate-500">Step</p>

            <p className="text-sm font-semibold text-white">
              {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">
              Setting up your AI employee
            </p>

            <p className="text-sm font-medium text-blue-400">
              {Math.round(progress)}%
            </p>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-900">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-8 grid gap-2 sm:grid-cols-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const active = index === currentStep;
            const completed = index < currentStep;

            return (
              <button
                key={item.title}
                type="button"
                disabled={isSaving}
                onClick={() => {
                  if (index <= currentStep) {
                    setCurrentStep(index);
                  }
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  active
                    ? "border-blue-500/30 bg-blue-500/10 text-white"
                    : completed
                      ? "border-slate-800 bg-slate-950 text-slate-300"
                      : "border-slate-900 bg-slate-950/40 text-slate-600"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    active
                      ? "bg-blue-500/15 text-blue-400"
                      : completed
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-900 text-slate-600"
                  }`}
                >
                  {completed ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>

                <span className="hidden truncate text-xs font-medium lg:block">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-950/70 shadow-2xl">
            <div className="border-b border-slate-800 p-6 sm:p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                <StepIcon className="h-6 w-6 text-blue-400" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {step.title}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {step.description}
              </p>
            </div>

            <div className="p-6 sm:p-8">
              {currentStep === 0 && (
                <div className="space-y-5">
                  <Field
                    label="Business name"
                    placeholder="ABC Cleaning Services"
                    value={formData.businessName}
                    onChange={(value) =>
                      updateField("businessName", value)
                    }
                    required
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Business phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.businessPhone}
                      onChange={(value) =>
                        updateField("businessPhone", value)
                      }
                      icon={<Phone className="h-4 w-4" />}
                      required
                    />

                    <Field
                      label="Business email"
                      placeholder="hello@yourbusiness.com"
                      type="email"
                      value={formData.businessEmail}
                      onChange={(value) =>
                        updateField("businessEmail", value)
                      }
                      required
                    />
                  </div>

                  <Field
                    label="Website"
                    placeholder="https://yourbusiness.com"
                    value={formData.websiteUrl}
                    onChange={(value) =>
                      updateField("websiteUrl", value)
                    }
                    optional
                  />
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-7">
                  <div>
                    <Label
                      text="What cleaning services do you offer?"
                      required
                    />

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {serviceOptions.map((service) => {
                        const selected =
                          formData.services.includes(service);

                        return (
                          <SelectableButton
                            key={service}
                            selected={selected}
                            onClick={() =>
                              toggleArrayValue("services", service)
                            }
                          >
                            {service}
                          </SelectableButton>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label
                      text="Tell us about your pricing"
                      required
                    />

                    <textarea
                      value={formData.pricing}
                      onChange={(event) =>
                        updateField("pricing", event.target.value)
                      }
                      placeholder="Example: Standard cleaning starts at $120 for homes up to 1,500 sq ft. Deep cleaning starts at $200."
                      rows={5}
                      className="mt-3 w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />

                    <p className="mt-2 text-xs text-slate-600">
                      Your AI will use this information when customers ask for
                      prices.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label
                      text="Where do you provide services?"
                      required
                    />

                    <textarea
                      value={formData.serviceAreas}
                      onChange={(event) =>
                        updateField(
                          "serviceAreas",
                          event.target.value,
                        )
                      }
                      placeholder="Example: Austin, Round Rock, Cedar Park, and nearby areas within 25 miles."
                      rows={4}
                      className="mt-3 w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <Label
                      text="What are your business hours?"
                      required
                    />

                    <textarea
                      value={formData.businessHours}
                      onChange={(event) =>
                        updateField(
                          "businessHours",
                          event.target.value,
                        )
                      }
                      placeholder="Example: Monday-Friday 8 AM-6 PM. Saturday 9 AM-3 PM. Closed Sunday."
                      rows={4}
                      className="mt-3 w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-7">
                  <div>
                    <Label
                      text="How do customers pay you?"
                      required
                    />

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {paymentOptions.map((method) => {
                        const selected =
                          formData.paymentMethods.includes(method);

                        return (
                          <SelectableButton
                            key={method}
                            selected={selected}
                            onClick={() =>
                              toggleArrayValue(
                                "paymentMethods",
                                method,
                              )
                            }
                            icon={
                              <CreditCard className="h-4 w-4" />
                            }
                          >
                            {method}
                          </SelectableButton>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label
                      text="Booking rules"
                      optional
                    />

                    <textarea
                      value={formData.bookingRules}
                      onChange={(event) =>
                        updateField(
                          "bookingRules",
                          event.target.value,
                        )
                      }
                      placeholder="Example: Same-day bookings are allowed before 2 PM. A minimum of 24 hours notice is preferred."
                      rows={5}
                      className="mt-3 w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <Label
                      text="Cancellation policy"
                      required
                    />

                    <textarea
                      value={formData.cancellationPolicy}
                      onChange={(event) =>
                        updateField(
                          "cancellationPolicy",
                          event.target.value,
                        )
                      }
                      placeholder="Example: Customers can cancel for free up to 24 hours before the appointment. Late cancellations may be charged a $50 fee."
                      rows={5}
                      className="mt-3 w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <Label
                      text="Rescheduling policy"
                      required
                    />

                    <textarea
                      value={formData.reschedulingPolicy}
                      onChange={(event) =>
                        updateField(
                          "reschedulingPolicy",
                          event.target.value,
                        )
                      }
                      placeholder="Example: Customers can reschedule once for free with at least 24 hours notice."
                      rows={5}
                      className="mt-3 w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-7">
                  <div>
                    <Label text="How should your AI communicate?" />

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {aiToneOptions.map((tone) => {
                        const selected =
                          formData.aiTone === tone;

                        return (
                          <SelectableButton
                            key={tone}
                            selected={selected}
                            onClick={() =>
                              updateField("aiTone", tone)
                            }
                            icon={
                              <MessageSquare className="h-4 w-4" />
                            }
                          >
                            {tone}
                          </SelectableButton>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label
                      text="Anything your AI should know?"
                      optional
                    />

                    <textarea
                      value={formData.aiInstructions}
                      onChange={(event) =>
                        updateField(
                          "aiInstructions",
                          event.target.value,
                        )
                      }
                      placeholder="Example: Always mention that we are locally owned. Never promise a specific cleaner unless confirmed."
                      rows={5}
                      className="mt-3 w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <Label
                      text="When should the AI hand a customer to a human?"
                      optional
                    />

                    <textarea
                      value={formData.humanHandoffInstructions}
                      onChange={(event) =>
                        updateField(
                          "humanHandoffInstructions",
                          event.target.value,
                        )
                      }
                      placeholder="Example: Transfer customers who have complaints, ask for a manager, or request services outside our service area."
                      rows={5}
                      className="mt-3 w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="flex gap-3">
                      <Bot className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

                      <div>
                        <p className="font-medium text-white">
                          Your AI employee is almost ready
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          We&apos;ll use your business information to help
                          your AI answer questions, qualify leads, and handle
                          customer conversations according to your rules.
                        </p>
                      </div>
                    </div>
                  </div>

                  {error ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                      {error}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0 || isSaving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canContinue() || isSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-colors hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-40"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canContinue() || isSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-colors hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-40"
                >
                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          You can update your business information and AI instructions later
          from your dashboard.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
  required = false,
  optional = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div>
      <Label
        text={label}
        required={required}
        optional={optional}
      />

      <div className="relative mt-3">
        {icon ? (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>
        ) : null}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 ${
            icon ? "pl-10" : ""
          }`}
        />
      </div>
    </div>
  );
}

function Label({
  text,
  required = false,
  optional = false,
}: {
  text: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-slate-200">
        {text}
      </label>

      {required ? (
        <span className="text-xs text-blue-400">Required</span>
      ) : optional ? (
        <span className="text-xs text-slate-600">Optional</span>
      ) : null}
    </div>
  );
}

function SelectableButton({
  children,
  selected,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
        selected
          ? "border-blue-500/40 bg-blue-500/10 text-white"
          : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900/70 hover:text-white"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon ? (
          <span
            className={
              selected
                ? "text-blue-400"
                : "text-slate-600"
            }
          >
            {icon}
          </span>
        ) : null}

        {children}
      </span>

      <span
        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
          selected
            ? "border-blue-500 bg-blue-600 text-white"
            : "border-slate-700 bg-slate-950"
        }`}
      >
        {selected ? <Check className="h-3 w-3" /> : null}
      </span>
    </button>
  );
}
