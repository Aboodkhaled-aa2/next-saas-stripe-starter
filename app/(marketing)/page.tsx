import Link from 'next/link';
import { Check, X, Sparkles, ArrowRight, ShieldCheck, Clock, Users } from 'lucide-react';

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> AI Receptionist for Cleaning Businesses
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
            Never Miss a Cleaning Lead Again with <span className="text-emerald-400">24/7 AI</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Automate phone calls, WhatsApp messages, and instant bookings for your residential or commercial cleaning service.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/sign-in" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#pricing" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 font-semibold text-base transition-all text-center">
              View Pricing
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8 border-t border-white/10 text-zinc-400 text-sm">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> 24/7 Instant Response
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> WhatsApp & Voice AI
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Automated Booking
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRICING SECTION */}
      <section id="pricing" className="py-24 bg-zinc-950 border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-zinc-400 text-lg">
              Choose the plan that fits your cleaning business. Scale up as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* STARTER */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-8 flex flex-col justify-between backdrop-blur-sm">
              <div>
                <div className="text-zinc-400 font-semibold text-sm tracking-wider uppercase mb-2">Starter</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold">$49</span>
                  <span className="text-zinc-400 text-sm">/month</span>
                </div>
                <p className="text-zinc-400 text-sm mb-6">For cleaning businesses getting started with AI.</p>
                <div className="space-y-3 text-sm border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>AI Messaging</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Facebook & Instagram</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Lead Capture</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Customer Inbox</span></div>
                  <div className="flex items-center gap-3 text-zinc-600"><X className="w-4 h-4" /><span className="line-through">Voice AI</span></div>
                </div>
              </div>
              <div className="pt-8">
                <Link href="/sign-in" className="w-full block text-center bg-zinc-800 hover:bg-zinc-700 font-semibold py-3 rounded-xl transition-all text-sm">Start Free Trial</Link>
              </div>
            </div>

            {/* BUSINESS */}
            <div className="bg-zinc-900 border-2 border-emerald-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl shadow-emerald-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Most Popular
              </div>
              <div>
                <div className="text-emerald-400 font-semibold text-sm tracking-wider uppercase mb-2">Business</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold">$99</span>
                  <span className="text-zinc-400 text-sm">/month</span>
                </div>
                <p className="text-zinc-400 text-sm mb-6">For growing cleaning businesses.</p>
                <div className="space-y-3 text-sm border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Everything in Starter</span></div>
                  <div className="flex items-center gap-3 font-medium text-white"><Check className="w-4 h-4 text-emerald-400" /><span>AI Voice — 100 min/month</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Appointment Booking</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Automated Follow-Ups</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Calendar Integration</span></div>
                </div>
              </div>
              <div className="pt-8">
                <Link href="/sign-in" className="w-full block text-center bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20">Start Free Trial</Link>
              </div>
            </div>

            {/* PRO */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-8 flex flex-col justify-between backdrop-blur-sm">
              <div>
                <div className="text-cyan-400 font-semibold text-sm tracking-wider uppercase mb-2">Pro</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold">$249</span>
                  <span className="text-zinc-400 text-sm">/month</span>
                </div>
                <p className="text-zinc-400 text-sm mb-6">Full AI receptionist ready to automate everything.</p>
                <div className="space-y-3 text-sm border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-cyan-400" /><span>Everything in Business</span></div>
                  <div className="flex items-center gap-3 font-medium text-white"><Check className="w-4 h-4 text-cyan-400" /><span>Dedicated Phone Number</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-cyan-400" /><span>AI Voice — 500 min/month</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-cyan-400" /><span>Priority Support</span></div>
                </div>
              </div>
              <div className="pt-8">
                <Link href="/sign-in" className="w-full block text-center bg-zinc-800 hover:bg-zinc-700 font-semibold py-3 rounded-xl transition-all text-sm">Start Free Trial</Link>
              </div>
            </div>

          </div>

        </div>
      </section>

    </main>
  );
}
