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
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

type IconComponent = React.ComponentType<{
  className?: string;
}>;

type Feature = {
  name: string;
  starter: boolean;
  business: boolean;
  pro: boolean;
};

const features: Feature[] = [
  {
    name: "AI Customer Messaging",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "Instagram",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "Facebook",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "WhatsApp",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "Lead Capture",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "Customer Inbox",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "Customer Information Collection",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "Business Hours & FAQ Responses",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "Conversation History",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "Basic Automations",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "Customer Management",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "Email Support",
    starter: true,
    business: true,
    pro: true,
  },
  {
    name: "AI Voice Receptionist",
    starter: false,
    business: true,
    pro: true,
  },
  {
    name: "100 Voice Minutes / Month",
    starter: false,
    business: true,
    pro: false,
  },
  {
    name: "500 Voice Minutes / Month",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Appointment Booking",
    starter: false,
    business: true,
    pro: true,
  },
  {
    name: "Calendar Integration",
    starter: false,
    business: true,
    pro: true,
  },
  {
    name: "Automated Lead Follow-Ups",
    starter: false,
    business: true,
    pro: true,
  },
  {
    name: "Lead Qualification",
    starter: false,
    business: true,
    pro: true,
  },
  {
    name: "Quote & Service Information",
    starter: false,
    business: true,
    pro: true,
  },
  {
    name: "Booking Reminders",
    starter: false,
    business: true,
    pro: true,
  },
  {
    name: "Review Request Automation",
    starter: false,
    business: true,
    pro: true,
  },
  {
    name: "Lead Status Management",
    starter: false,
    business: true,
    pro: true,
  },
  {
    name: "Custom AI Instructions",
    starter: false,
    business: true,
    pro: true,
  },
  {
    name: "Conversation & Lead Tracking",
    starter: false,
    business: true,
    pro: true,
  },
  {
    name: "Dedicated Business Phone Number",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Advanced Call Handling",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Call Transfer",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Advanced Lead Qualification",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Advanced Follow-Ups",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Custom Booking Rules",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Multiple Service Types",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Custom AI Knowledge Base",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Advanced Customer Management",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Detailed Call & Conversation History",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Custom AI Behavior",
    starter: false,
    business: false,
    pro: true,
  },
  {
    name: "Priority Support",
    starter: false,
    business: true,
    pro: true,
  },
];

const faqs = [
  {
    question: "Is there a free trial?",
    answer:
      "No. Smart Cleaning Desk is a paid-only platform. You choose the plan that fits your cleaning business and activate your subscription through secure checkout.",
  },
  {
    question: "What happens after I subscribe?",
    answer:
      "After your payment is successfully verified, your subscription becomes active and you can access the dashboard and the features included in your plan.",
  },
  {
    question: "What are Voice AI minutes?",
    answer:
      "Voice AI minutes are the monthly calling minutes included with Business and Pro plans. Starter does not include Voice AI.",
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
  "Instagram",
  "Facebook",
  "WhatsApp",
  "Lead Capture",
  "Customer Inbox",
  "Customer Information Collection",
  "Business Hours & FAQ Responses",
  "Conversation History",
  "Basic Automations",
  "Customer Management",
  "Email Support",
];

const businessFeatures = [
  "Everything in Starter",
  "AI Voice Receptionist",
  "100 Voice Minutes / Month",
  "Appointment Booking",
  "Calendar Integration",
  "Automated Lead Follow-Ups",
  "Lead Qualification",
  "Quote & Service Information",
  "Booking Reminders",
  "Review Request Automation",
  "Lead Status Management",
  "Custom AI Instructions",
  "Conversation & Lead Tracking",
  "Priority Support",
];

const proFeatures = [
  "Everything in Business",
  "Dedicated Business Phone Number",
  "500 Voice Minutes / Month",
  "Advanced Call Handling",
  "Call Transfer",
  "Advanced Lead Qualification",
  "Advanced Follow-Ups",
  "Custom Booking Rules",
  "Multiple Service Types",
  "Custom AI Knowledge Base",
  "Advanced Customer Management",
  "Detailed Call & Conversation History",
  "Custom AI Behavior",
  "Priority Support",
];

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="h-3.5 w-3.5" />
      </span>

      <span className="text-sm leading-6 text-slate-600">{children}</span>
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
      <div className="mb-4 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
        {eyebrow}
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-lg leading-8 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function FeatureColumn({
  title,
  description,
  price,
  featuresList,
  popular,
  icon: Icon,
  plan,
}: {
  title: string;
  description: string;
  price: string;
  featuresList: string[];
  popular?: boolean;
  icon: IconComponent;
  plan: "starter" | "business" | "pro";
}) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-3xl border bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        popular
          ? "border-blue-500 ring-2 ring-blue-500/10"
          : "border-slate-200"
      }`}
    >
      {popular && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
          Most Popular
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mb-7">
        <div className="flex items-end gap-1">
          <span className="text-5xl font-black tracking-tight text-slate-900">
            {price}
          </span>
          <span className="mb-2 text-slate-500">/month</span>
        </div>
      </div>

      <Link
        href={`/signup?plan=${plan}`}
        className={`mb-7 flex h-12 items-center justify-center rounded-xl px-5 text-sm font-bold transition ${
          popular
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
        }`}
      >
        Choose {title}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>

      <div className="border-t border-slate-100 pt-6">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Includes
        </p>

        <ul className="space-y-3">
          {featuresList.map((feature) => (
            <CheckItem key={feature}>{feature}</CheckItem>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ComparisonCell({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <div className="flex justify-center">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-4 w-4" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <X className="h-5 w-5 text-slate-300" />
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>

            <span className="text-lg font-black tracking-tight text-slate-900">
              Smart Cleaning Desk
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              How It Works
            </a>

            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Pricing
            </a>

            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-slate-700 hover:text-blue-600 sm:inline-flex"
            >
              Log In
            </Link>

            <Link
              href="/signup?plan=starter"
              className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200">
              <Sparkles className="h-4 w-4" />
              AI-Powered Cleaning Business Management
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Turn More Cleaning Leads Into
              <span className="block text-blue-400">
                Customers & Bookings
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Smart Cleaning Desk helps cleaning businesses manage customer
              conversations, capture leads, automate follow-ups, book
              appointments, and handle customer communication with AI.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup?plan=starter"
                className="inline-flex h-13 items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <a
                href="#pricing"
                className="inline-flex h-13 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                View Pricing
              </a>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Secure subscription
              </div>

              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-400" />
                Built for cleaning businesses
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                Customer management
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-50 p-5">
              <Instagram className="h-6 w-6 text-pink-500" />
              <span className="font-semibold text-slate-800">Instagram</span>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-50 p-5">
              <Facebook className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-slate-800">Facebook</span>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-50 p-5">
              <MessageCircle className="h-6 w-6 text-emerald-500" />
              <span className="font-semibold text-slate-800">WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Everything in One Place"
            title="Run customer communication smarter"
            description="Bring your customer conversations, leads, follow-ups, appointments, and AI tools into one workspace designed for cleaning businesses."
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
                  "Business and Pro plans can use Voice AI to help handle customer calls.",
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
                  "Business and Pro plans include appointment and calendar features.",
              },
              {
                icon: Clock,
                title: "Automated Follow-Ups",
                description:
                  "Keep potential customers moving forward with automated follow-up workflows.",
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
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Simple Workflow"
            title="From customer message to booked job"
            description="Smart Cleaning Desk is designed around the everyday workflow of a cleaning business."
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
              <div key={step.number} className="relative">
                <div className="mb-6 text-5xl font-black text-blue-100">
                  {step.number}
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Simple Pricing"
            title="Choose the plan for your business"
            description="No free trial. Choose a paid plan, complete checkout, and access the features included in your active subscription."
          />

          <div className="mt-16 grid gap-7 lg:grid-cols-3">
            <FeatureColumn
              title="Starter"
              description="For getting started"
              price="$49"
              featuresList={starterFeatures}
              icon={Sparkles}
              plan="starter"
            />

            <FeatureColumn
              title="Business"
              description="For growing cleaning businesses"
              price="$99"
              featuresList={businessFeatures}
              popular
              icon={Zap}
              plan="business"
            />

            <FeatureColumn
              title="Pro"
              description="Full AI receptionist"
              price="$249"
              featuresList={proFeatures}
              icon={Phone}
              plan="pro"
            />
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Plan Comparison"
            title="Compare every feature"
            description="See exactly what is included with Starter, Business, and Pro."
          />

          <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-5 text-left text-sm font-bold text-slate-900">
                      Feature
                    </th>

                    <th className="px-6 py-5 text-center text-sm font-bold text-slate-900">
                      Starter
                      <span className="mt-1 block text-xs font-normal text-slate-500">
                        $49/mo
                      </span>
                    </th>

                    <th className="px-6 py-5 text-center text-sm font-bold text-blue-700">
                      Business
                      <span className="mt-1 block text-xs font-normal text-slate-500">
                        $99/mo
                      </span>
                    </th>

                    <th className="px-6 py-5 text-center text-sm font-bold text-slate-900">
                      Pro
                      <span className="mt-1 block text-xs font-normal text-slate-500">
                        $249/mo
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {features.map((feature, index) => (
                    <tr
                      key={feature.name}
                      className={`border-b border-slate-100 last:border-b-0 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {feature.name}
                      </td>

                      <td className="px-6 py-4">
                        <ComparisonCell enabled={feature.starter} />
                      </td>

                      <td className="px-6 py-4">
                        <ComparisonCell enabled={feature.business} />
                      </td>

                      <td className="px-6 py-4">
                        <ComparisonCell enabled={feature.pro} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-slate-950 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
                Built for Cleaning Businesses
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                Spend less time managing messages.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                Smart Cleaning Desk brings customer communication and business
                workflows together so you can focus more of your time on
                running and growing your cleaning company.
              </p>

              <Link
                href="/signup?plan=business"
                className="mt-8 inline-flex items-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                Choose Business
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
                    className="rounded-3xl border border-white/10 bg-white/5 p-6"
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
      <section id="faq" className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Everything you need to know before choosing your plan."
          />

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left"
                  >
                    <span className="font-bold text-slate-900">
                      {faq.question}
                    </span>

                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-6 pb-6 pt-4">
                      <p className="leading-7 text-slate-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-6">
          <Star className="mx-auto h-10 w-10 text-blue-100" />

          <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Ready to simplify your cleaning business?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Choose a plan that fits your business and start using Smart
            Cleaning Desk after your subscription is activated.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup?plan=starter"
              className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Compare Plans
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-white"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
                  <Sparkles className="h-5 w-5" />
                </div>

                <span className="font-black">Smart Cleaning Desk</span>
              </Link>

              <p className="mt-4 max-w-md text-sm leading-6">
                AI-powered customer communication and management software
                designed for cleaning businesses.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white">Product</h3>

              <div className="mt-4 space-y-3 text-sm">
                <a
                  href="#features"
                  className="block transition hover:text-white"
                >
                  Features
                </a>

                <a
                  href="#pricing"
                  className="block transition hover:text-white"
                >
                  Pricing
                </a>

                <a
                  href="#faq"
                  className="block transition hover:text-white"
                >
                  FAQ
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white">Account</h3>

              <div className="mt-4 space-y-3 text-sm">
                <Link
                  href="/login"
                  className="block transition hover:text-white"
                >
                  Log In
                </Link>

                <Link
                  href="/signup?plan=starter"
                  className="block transition hover:text-white"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-7 text-sm">
            © {new Date().getFullYear()} Smart Cleaning Desk. All rights
            reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
