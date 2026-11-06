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
import { useEffect, useState } from "react";

const faqs = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Every plan includes a 7-day free trial. Your subscription begins billing after the trial period ends.",
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
    <main className="min-h-screen overflow-hidden bg-[#050918] text-slate-100 selection:bg-blue-500 selection:text-white">
      <style jsx global>{`
        @keyframes scd-float { 0%,100% { transform:translate3d(0,0,0) rotateY(-12deg) rotateX(4deg); } 50% { transform:translate3d(0,-17px,18px) rotateY(-7deg) rotateX(1deg); } }
        @keyframes scd-bob { 0%,100% { transform:translate3d(0,0,0) rotateY(10deg); } 50% { transform:translate3d(0,-13px,20px) rotateY(16deg); } }
        @keyframes scd-glow { 0%,100% { opacity:.45; transform:scale(.92); } 50% { opacity:.85; transform:scale(1.08); } }
        @keyframes scd-orbit { from { transform:rotate(0deg) translateX(10px) rotate(0deg); } to { transform:rotate(360deg) translateX(10px) rotate(-360deg); } }
        .scd-float { animation:scd-float 7s ease-in-out infinite; transform-style:preserve-3d; will-change:transform; }
        .scd-bob { animation:scd-bob 5.5s ease-in-out infinite; transform-style:preserve-3d; will-change:transform; }
        .scd-glow { animation:scd-glow 4s ease-in-out infinite; }
        .scd-orbit { animation:scd-orbit 18s linear infinite; }
        .scd-scene { perspective:1300px; transform-style:preserve-3d; }
        .scd-scene:hover .scd-float { animation-duration:3.8s; }
        .scd-scene:hover .scd-bob { animation-duration:3s; }
        @media(prefers-reduced-motion:reduce){.scd-float,.scd-bob,.scd-glow,.scd-orbit{animation:none!important}}
      `}</style>

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
      <section className="relative isolate overflow-hidden bg-[#050918]">
        <div className="pointer-events-none absolute -right-32 top-0 h-[620px] w-[620px] rounded-full bg-blue-600/20 blur-[120px] scd-glow"/>
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[110px]"/>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1fr] lg:px-8 lg:py-28">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2.5 text-xs font-bold text-blue-200 sm:text-sm"><Sparkles className="h-4 w-4"/>24/7 AI Customer Service for Cleaning Businesses</div>
            <h1 className="max-w-2xl text-5xl font-black leading-[1.04] tracking-[-0.05em] text-white sm:text-6xl lg:text-[4.4rem]">Your Cleaning Business,<span className="mt-2 block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">Powered by AI. 24/7.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Answer every customer. Capture every lead. Book more jobs — even while you are busy cleaning. One AI employee for calls, messages, follow-ups, and bookings.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup?plan=starter" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 px-7 py-4 text-sm font-extrabold text-white shadow-[0_12px_38px_rgba(37,99,235,.4)] transition hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(37,99,235,.55)]">Start Your AI Employee <ArrowRight className="h-4 w-4"/></Link>
              <a href="#how-it-works" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[.04] px-7 py-4 text-sm font-bold text-white transition hover:border-blue-300/50 hover:bg-white/[.08]">See How It Works</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-400 sm:text-sm"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-400"/>7-day free trial</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-400"/>No card at signup</span><span className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-400"/>Built for cleaning teams</span></div>
          </div>
          <div className="scd-scene relative mx-auto w-full max-w-[590px]">
            <div className="scd-glow absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/30 blur-[85px]"/>
            <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/10"/>
            <div className="scd-orbit absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_24px_8px_rgba(34,211,238,.45)]"/>
            <div className="relative min-h-[430px] sm:min-h-[510px]">
              <div className="scd-float absolute right-0 top-8 z-10 w-[78%] rounded-[28px] border border-blue-200/30 bg-gradient-to-br from-blue-300/20 via-[#10234d]/95 to-[#080f25] p-3 shadow-[0_30px_90px_rgba(0,80,255,.28)] sm:p-4">
                <div className="rounded-[20px] border border-white/10 bg-[#08132c]/95 p-4 sm:p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"><Sparkles className="h-4 w-4"/></span><div><p className="text-xs font-extrabold text-white">Business Overview</p><p className="text-[10px] text-emerald-300">AI employee active</p></div></div><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold text-emerald-300">LIVE</span></div>
                  <div className="mt-4 grid grid-cols-2 gap-3">{[{label:"New Leads",value:"24",icon:Users},{label:"Bookings",value:"18",icon:Calendar},{label:"Messages",value:"67",icon:MessageCircle},{label:"Calls Answered",value:"32",icon:Phone}].map((item)=><div key={item.label} className="rounded-xl border border-white/10 bg-white/[.045] p-3"><div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">{item.label}</span><item.icon className="h-3.5 w-3.5 text-blue-300"/></div><p className="mt-2 text-2xl font-black text-white">{item.value}</p><p className="mt-1 text-[9px] text-emerald-300">↑ Active workflow</p></div>)}</div>
                  <div className="mt-3 rounded-xl border border-blue-300/15 bg-blue-500/[.08] p-3"><div className="flex items-center gap-2 text-[10px] font-bold text-blue-200"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"/>AI is handling a new inquiry</div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"/></div></div>
                </div>
              </div>
              <div className="scd-bob absolute bottom-7 left-0 z-20 flex h-[190px] w-[190px] items-center justify-center rounded-[42%] border border-cyan-100/70 bg-gradient-to-br from-white via-blue-100 to-blue-500 shadow-[0_0_55px_rgba(34,160,255,.55),inset_-14px_-18px_35px_rgba(17,75,190,.35)] sm:bottom-8 sm:left-2 sm:h-[230px] sm:w-[230px]">
                <div className="absolute inset-[12%] rounded-[42%] border border-white/60 bg-gradient-to-br from-[#10234d] via-[#07112a] to-[#020817] shadow-[inset_0_0_35px_rgba(30,130,255,.55)]"/>
                <div className="relative z-10 flex flex-col items-center"><div className="mb-5 flex gap-5 sm:gap-7"><span className="h-5 w-7 rounded-full bg-cyan-300 shadow-[0_0_18px_#22d3ee] sm:h-7 sm:w-9"/><span className="h-5 w-7 rounded-full bg-cyan-300 shadow-[0_0_18px_#22d3ee] sm:h-7 sm:w-9"/></div><div className="h-3 w-10 rounded-b-full border-b-[4px] border-cyan-300"/><span className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-[0_0_25px_rgba(37,99,235,.8)]"><Sparkles className="h-7 w-7"/></span></div>
                <span className="absolute -right-4 top-12 h-14 w-5 rounded-full border border-cyan-100/80 bg-gradient-to-b from-blue-100 to-blue-500"/><span className="absolute -left-4 top-12 h-14 w-5 rounded-full border border-cyan-100/80 bg-gradient-to-b from-blue-100 to-blue-500"/>
              </div>
              <div className="absolute bottom-0 left-[18%] h-7 w-[55%] rounded-[50%] border border-cyan-200/80 bg-gradient-to-r from-blue-900 via-cyan-400 to-blue-900 shadow-[0_0_35px_rgba(34,211,238,.65)]"/>
              <div className="absolute bottom-[42%] left-[3%] rounded-2xl border border-blue-200/20 bg-[#0b1731]/90 px-3 py-2 text-[10px] font-bold text-white shadow-xl backdrop-blur-xl"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400"/>AI Receptionist Online</div>
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
