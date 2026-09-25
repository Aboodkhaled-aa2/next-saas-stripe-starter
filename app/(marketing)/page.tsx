"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Facebook,
  Headphones,
  Instagram,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Is there a free trial?",
    answer:
      "No. Smart Cleaning Desk is a paid-only platform. You choose the plan that fits your cleaning business and activate your subscription through secure checkout.",
  },
  {
    question: "What happens after I subscribe?",
    answer:
      "After your payment is successfully verified, your subscription becomes active. You can then complete your business setup and configure the AI employee using your company information, services, rules, and customer workflow.",
  },
  {
    question: "What are Voice AI minutes?",
    answer:
      "Voice AI minutes are the monthly calling minutes included with Business and Pro plans. Starter does not include Voice AI. Additional voice minutes can be purchased when your included balance is used.",
  },
  {
    question: "Can I upgrade my plan?",
    answer:
      "Yes. You can move to a higher plan when your business needs more automation, voice minutes, calling features, or advanced AI capabilities.",
  },
  {
    question: "Which channels can Smart Cleaning Desk handle?",
    answer:
      "The platform is designed to help cleaning businesses manage customer conversations across WhatsApp, Instagram, and Facebook, depending on the connected services and account configuration.",
  },
  {
    question: "Is Smart Cleaning Desk built for cleaning companies?",
    answer:
      "Yes. The platform is designed specifically around cleaning-business workflows such as lead capture, customer questions, service information, follow-ups, appointments, and customer management.",
  },
];

const starterFeatures = [
  "AI Customer Messaging",
  "Lead Capture",
  "Customer Inbox",
  "Business Knowledge & FAQs",
  "Conversation History",
];

const businessFeatures = [
  "Everything in Starter",
  "AI Voice Receptionist",
  "100 Voice Minutes / Month",
  "Appointment Booking",
  "Automated Lead Follow-Ups",
];

const proFeatures = [
  "Everything in Business",
  "Dedicated Business Phone Number",
  "500 Voice Minutes / Month",
  "Advanced Call Handling",
  "Custom Booking & AI Rules",
];

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
        <Check className="h-3.5 w-3.5" />
      </span>

      <span className="text-sm leading-6 text-slate-300">{children}</span>
    </li>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-4 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
        {eyebrow}
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-lg leading-8 text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Sparkles className="h-5 w-5" />
            </div>

            <span className="text-lg font-black tracking-tight text-white">
              Smart Cleaning Desk
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              How It Works
            </a>

            <a
              href="#pricing"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Pricing
            </a>

            <a
              href="#faq"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-slate-300 hover:text-white sm:inline-flex"
            >
              Log In
            </Link>

            <Link
              href="/signup?plan=starter"
              className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.25),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
              <Sparkles className="h-4 w-4" />
              24/7 AI Customer Service for Your Cleaning Business
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Your Cleaning Business,
              <span className="block text-blue-400">
                Powered by AI. 24/7.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Answer every customer. Capture every lead. Book more jobs — even while you are busy cleaning.
              Smart Cleaning Desk brings customer service, AI phone, lead capture,
              follow-ups, and smart booking into one AI employee.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup?plan=starter"
                className="inline-flex h-13 items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500"
              >
                Start Your AI Employee
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <a
                href="#pricing"
                className="inline-flex h-13 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                View Pricing
              </a>
            </div>

            <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-left shadow-2xl shadow-black/20 sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">AI Customer Service</p>
                    <p className="text-xs text-emerald-400">Available 24/7</p>
                  </div>
                </div>
                <MessageCircle className="h-5 w-5 text-slate-500" />
              </div>
              <div className="grid gap-3 pt-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white">
                  I need a deep cleaning for a 3-bedroom home this Saturday.
                </div>
                <ArrowRight className="hidden h-5 w-5 text-slate-600 sm:block" />
                <div className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200">
                  AI collects the details, checks your rules, and moves the customer toward booking.
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                Secure subscription
              </div>

              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-400" />
                Built for cleaning businesses
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                Customer management
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="border-y border-slate-800/80 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
              <Instagram className="h-6 w-6 text-pink-400" />
              <span className="font-semibold text-slate-200">Instagram</span>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
              <Facebook className="h-6 w-6 text-blue-400" />
              <span className="font-semibold text-slate-200">Facebook</span>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
              <MessageCircle className="h-6 w-6 text-emerald-400" />
              <span className="font-semibold text-slate-200">WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-950 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Everything in One Place"
            title="Run customer communication smarter"
            description="Let AI handle customer conversations, qualify leads, answer calls, collect job details, follow up, and move customers toward booked appointments."
          />

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MessageCircle,
                title: "AI Customer Messaging",
                description:
                  "Help manage customer questions and conversations across connected messaging channels.",
              },
              {
                icon: Phone,
                title: "AI Voice Receptionist",
                description:
                  "Let your AI receptionist answer calls, collect customer details, handle common questions, and help move callers toward a booking.",
              },
              {
                icon: Users,
                title: "Lead Management",
                description:
                  "Capture customer information, organize leads, and keep conversations connected to customers.",
              },
              {
                icon: Calendar,
                title: "Appointment Booking",
                description:
                  "Collect the details needed for a cleaning, check availability, and move qualified customers toward the right appointment.",
              },
              {
                icon: Clock,
                title: "Automated Follow-Ups",
                description:
                  "Automatically follow up with leads so opportunities do not disappear when you are busy running the business.",
              },
              {
                icon: Headphones,
                title: "Customer Support Tools",
                description:
                  "Keep important customer information and conversation history organized in one place.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 shadow-lg transition hover:border-slate-700"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-slate-800/80 bg-slate-950 py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Simple Workflow"
            title="From customer message to booked job"
            description="From the first customer message or phone call to qualification, scheduling, and follow-up, Smart Cleaning Desk keeps the workflow connected."
          />

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Capture the Lead",
                description:
                  "Customer conversations and inquiries can be organized so important lead information is not lost.",
              },
              {
                number: "02",
                title: "Engage & Qualify",
                description:
                  "Use AI messaging, follow-ups, customer information collection, and qualification tools.",
              },
              {
                number: "03",
                title: "Book & Manage",
                description:
                  "Move qualified customers toward appointments while keeping customer information organized.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="relative rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8"
              >
                <div className="mb-6 text-5xl font-black text-blue-500/20">
                  {step.number}
                </div>

                <h3 className="text-2xl font-bold text-white">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-t border-slate-800/80 bg-slate-950 py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Simple Pricing"
            title="Choose the AI employee for your business"
            description="Start with customer messaging, add Voice AI when you need it, or unlock the full receptionist experience with Pro."
          />

          <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3 lg:gap-7">
            <div className="flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-slate-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-400">Starter</p>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    Customer Messaging
                  </h3>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <MessageCircle className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 min-h-[56px] text-sm leading-6 text-slate-400">
                Capture and manage customer conversations across your main messaging channels.
              </p>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-black tracking-tight text-white">
                  $49
                </span>
                <span className="mb-2 text-sm text-slate-400">/month</span>
              </div>

              <Link
                href="/signup?plan=starter"
                className="mt-7 flex h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-5 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Choose Starter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <div className="mt-7 border-t border-slate-800 pt-6">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Includes
                </p>
                <ul className="space-y-3">
                  {starterFeatures.map((feature) => (
                    <CheckItem key={feature}>{feature}</CheckItem>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative flex h-full flex-col rounded-3xl border border-blue-500 bg-slate-900 p-7 shadow-2xl shadow-blue-950/30 ring-2 ring-blue-500/15 transition duration-300 hover:-translate-y-1">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/20">
                Most Popular
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-400">Business</p>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    AI Voice Receptionist
                  </h3>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                  <Phone className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 min-h-[56px] text-sm leading-6 text-slate-400">
                Add Voice AI, appointment booking, qualification, quotes, and automated follow-ups.
              </p>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-black tracking-tight text-white">
                  $99
                </span>
                <span className="mb-2 text-sm text-slate-400">/month</span>
              </div>

              <Link
                href="/signup?plan=business"
                className="mt-7 flex h-12 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Choose Business
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <div className="mt-7 border-t border-slate-800 pt-6">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Includes
                </p>
                <ul className="space-y-3">
                  {businessFeatures.map((feature) => (
                    <CheckItem key={feature}>{feature}</CheckItem>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-slate-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-400">Pro</p>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    Full AI Receptionist
                  </h3>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 min-h-[56px] text-sm leading-6 text-slate-400">
                Advanced calling, custom booking rules, deeper AI knowledge, and a dedicated business number.
              </p>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-black tracking-tight text-white">
                  $249
                </span>
                <span className="mb-2 text-sm text-slate-400">/month</span>
              </div>

              <Link
                href="/signup?plan=pro"
                className="mt-7 flex h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-5 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Choose Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <div className="mt-7 border-t border-slate-800 pt-6">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Includes
                </p>
                <ul className="space-y-3">
                  {proFeatures.map((feature) => (
                    <CheckItem key={feature}>{feature}</CheckItem>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-5 text-center">
            <p className="text-sm font-semibold text-white">
              Need Voice AI?
              <span className="ml-2 font-normal text-slate-400">
                Starter focuses on messaging. Business adds 100 voice minutes, while Pro includes 500 voice minutes and advanced calling.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="border-t border-slate-800/80 bg-slate-950 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
                Built for Cleaning Businesses
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                Your AI employee works while you work.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-400">
                Smart Cleaning Desk helps handle customer communication, lead capture,
                follow-ups, bookings, and calls so you can spend more time
                running and growing your cleaning company.
              </p>

              <Link
                href="/signup?plan=business"
                className="mt-8 inline-flex items-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                See Business Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  icon: MessageCircle,
                  title: "Centralized Conversations",
                  text: "Keep customer conversations organized.",
                },
                {
                  icon: Users,
                  title: "Lead Organization",
                  text: "Track and manage customer opportunities.",
                },
                {
                  icon: Calendar,
                  title: "Booking Workflow",
                  text: "Move qualified leads toward appointments.",
                },
                {
                  icon: Phone,
                  title: "Voice AI",
                  text: "Available on Business and Pro plans.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm"
                  >
                    <Icon className="h-7 w-7 text-blue-400" />

                    <h3 className="mt-5 font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="border-t border-slate-800/80 bg-slate-950 py-24"
      >
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Everything you need to know before choosing your plan and setting up your AI employee."
          />

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left transition hover:bg-slate-900/80"
                  >
                    <span className="font-bold text-white">
                      {faq.question}
                    </span>

                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-800 bg-slate-900/30 px-6 pb-6 pt-4">
                      <p className="leading-7 text-slate-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-800/80 bg-blue-600 py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-6">
          <Star className="mx-auto h-10 w-10 text-blue-100" />

          <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Ready to put your customer communication on autopilot?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Choose your plan, complete checkout, and start setting up your AI employee.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup?plan=starter"
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-7 py-3.5 text-sm font-bold text-white shadow-xl transition hover:bg-slate-900"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
