import React from 'react';
import Link from 'next/link';
import {
  Bot,
  PhoneCall,
  Calendar,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Clock,
  DollarSign,
  Check,
  Smartphone,
  Building2,
  Users,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  Star,
  Database,
  Settings2,
  BookOpen,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Smart Cleaning <span className="text-emerald-400">Desk</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a>
            <a href="#pricing" className="hover:text-emerald-400 transition">Pricing</a>
            <a href="#comparison" className="hover:text-emerald-400 transition">Compare Plans</a>
            <a href="#faq" className="hover:text-emerald-400 transition">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            AI Receptionist & Customer Management for Cleaning Businesses
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.05]">
            Let AI Handle Your
            <span className="text-emerald-400"> Cleaning Business </span>
            Customers 24/7
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Manage customer messages, leads, bookings, follow-ups, and AI phone calls
            from one powerful platform built specifically for cleaning businesses.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#pricing" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base border border-slate-800 flex items-center justify-center gap-2 transition">
              View Pricing
            </a>
          </div>
          <p className="text-xs text-slate-500 mb-14">
            Paid subscription required. No free trial or free tier.
          </p>
        </div>
      </section>

      {/* CHANNELS SECTION */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-emerald-400 text-sm font-semibold mb-3">ONE CENTRAL DESK</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Manage Your Customer Conversations in One Place
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10">
            <ChannelCard icon={<MessageSquare />} title="WhatsApp" text="Customer messages and booking conversations" />
            <ChannelCard icon={<Smartphone />} title="Instagram & Facebook" text="DMs and lead capture" />
            <ChannelCard icon={<PhoneCall />} title="AI Voice" text="AI-powered phone reception" />
            <ChannelCard icon={<Building2 />} title="Website" text="Customer inquiries and booking flow" />
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-emerald-400 text-sm font-semibold mb-3">SIMPLE PRICING</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
              Choose the Right AI Plan for Your Cleaning Business
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            <PricingCard
              name="Starter"
              label="STARTER"
              price="$49"
              description="Essential AI customer communication and lead management."
              features={['AI Customer Messaging', 'WhatsApp Integration', 'Lead Capture', 'Customer Inbox', 'Email Support']}
              button="Choose Starter"
              href="/signup?plan=starter"
            />
            <PricingCard
              name="Business"
              label="BUSINESS"
              price="$99"
              description="A complete AI receptionist workflow for growing cleaning businesses."
              popular
              features={['Everything in Starter', 'AI Voice Receptionist', '100 Voice Minutes / Month', 'Appointment Booking', 'Priority Support']}
              button="Choose Business"
              href="/signup?plan=business"
            />
            <PricingCard
              name="Pro"
              label="FULL AI RECEPTIONIST"
              price="$249"
              description="Advanced AI phone handling, custom workflows, and customer management."
              features={['Everything in Business', 'Dedicated Business Phone Number', '500 Voice Minutes / Month', 'Custom AI Knowledge Base', 'Priority Support']}
              button="Choose Pro"
              href="/signup?plan=pro"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-10 px-6 text-center">
        <p className="text-xs text-slate-600">
          © 2026 Smart Cleaning Desk. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

/* COMPONENTS */
function ChannelCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-400">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
      </div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-xs text-slate-500 mt-2">{text}</p>
    </div>
  );
}

function PricingCard({ name, label, price, description, features, button, href, popular = false }: any) {
  return (
    <div className={`relative bg-slate-900 rounded-2xl p-8 flex flex-col border ${popular ? 'border-2 border-emerald-500 shadow-xl' : 'border-slate-800'}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-full uppercase">Most Popular</span>
        </div>
      )}
      <div className="flex-1">
        <span className="inline-flex text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">{label}</span>
        <h3 className="text-2xl font-bold text-white mt-5 mb-2">{name}</h3>
        <p className="text-slate-400 text-sm mb-6">{description}</p>
        <div className="text-4xl font-black text-white mb-6">{price}<span className="text-sm font-normal text-slate-400">/month</span></div>
        <div className="space-y-3 mb-8">
          {features.map((f: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
      <Link href={href} className={`w-full py-3.5 rounded-xl font-bold text-center transition ${popular ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white'}`}>
        {button}
      </Link>
    </div>
  );
}
