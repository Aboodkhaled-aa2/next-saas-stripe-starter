import React from 'react';
import Link from 'next/link';
import { 
  Bot, PhoneCall, Calendar, MessageSquare, Shield, Zap, CheckCircle2, 
  ArrowRight, Sparkles, Clock, DollarSign, Star, Users, BarChart3, 
  HelpCircle, ChevronDown, Lock, RefreshCw, Check, Smartphone, Building2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Smart Cleaning <span className="text-emerald-400">Desk</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a>
            <a href="#demo" className="hover:text-emerald-400 transition">Live Demo</a>
            <a href="#pricing" className="hover:text-emerald-400 transition">Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">Sign In</Link>
            <Link href="/signup" className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" /> AI Operating System for Cleaning Businesses
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            Double Your Cleaning Bookings & Automate Operations <span className="text-emerald-400">Without Manual Effort</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            An all-in-one platform combining WhatsApp, voice calls, automated scheduling, and smart dispatching to serve your clients 24/7.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#demo" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base border border-slate-800 flex items-center justify-center gap-2 transition">
              Watch Demo
            </a>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl backdrop-blur max-w-4xl mx-auto text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-slate-400 ml-2 font-mono">SmartCleaningDesk AI Inbox - Live</span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-semibold">Online 24/7</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">Client</div>
                <div>
                  <p className="text-slate-200">Hi, I want to book a deep cleaning service for a 3-bedroom apartment tomorrow at 10 AM?</p>
                  <span className="text-[10px] text-slate-500">Via WhatsApp - 1 min ago</span>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20 ml-6">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">AI</div>
                <div>
                  <p className="text-emerald-200">Hello! I checked the team schedule and tomorrow at 10:00 AM is fully available. The total price is $150 including supplies. Shall I confirm your booking and send the secure checkout link?</p>
                  <span className="text-[10px] text-emerald-400/70">Smart AI Reply - Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem Section */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Cleaning Businesses Lose Up to 40% of Clients</h2>
            <p className="text-slate-400">Traditional methods of handling calls and WhatsApp cause massive daily revenue leaks.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6 font-bold text-xl">01</div>
              <h3 className="text-xl font-bold text-white mb-3">Slow Customer Response</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Clients who don't get an immediate response within minutes instantly move to a competitor.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6 font-bold text-xl">02</div>
              <h3 className="text-xl font-bold text-white mb-3">Scheduling Chaos</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Overlapping appointments and misplaced cleaning task details lead to constant complaints.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6 font-bold text-xl">03</div>
              <h3 className="text-xl font-bold text-white mb-3">Difficult Payment Follow-ups</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Manual payment collection and invoicing drain valuable administrative time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How Smart Cleaning Desk Works</h2>
            <p className="text-slate-400">Three simple steps to fully automate your cleaning business operations.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 relative">
              <span className="absolute top-4 right-4 text-4xl font-black text-slate-800">1</span>
              <h3 className="text-xl font-bold text-white mb-3 pt-4">Connect Channels</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Link your business WhatsApp number, social channels, and dedicated phone line with a single click.</p>
            </div>
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 relative">
              <span className="absolute top-4 right-4 text-4xl font-black text-slate-800">2</span>
              <h3 className="text-xl font-bold text-white mb-3 pt-4">Set Pricing & Schedule</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Input your service offerings (home, furniture, office cleaning) and available staff working hours.</p>
            </div>
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 relative">
              <span className="absolute top-4 right-4 text-4xl font-black text-slate-800">3</span>
              <h3 className="text-xl font-bold text-white mb-3 pt-4">Let AI Take Over</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Intelligent agents begin responding to clients, booking appointments, and collecting payments automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI Features Grid */}
      <section id="features" className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Smart Features Built Specifically for Cleaning Businesses</h2>
            <p className="text-slate-400">Advanced tools to put your business at the digital forefront.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Chat Assistant</h3>
                <p className="text-slate-400 text-sm">Instant responses handling room sizes, cleaning types, and custom requests with high accuracy.</p>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Voice AI Receptionist</h3>
                <p className="text-slate-400 text-sm">Answers missed phone calls and talks with a natural human voice like a professional receptionist.</p>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Automated Team Dispatch</h3>
                <p className="text-slate-400 text-sm">Distribute tasks to cleaning crews based on geographical location and availability schedules.</p>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Review & Rating Management</h3>
                <p className="text-slate-400 text-sm">Automatically send feedback review links to clients post-service to boost your reputation.</p>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Stripe Payment Gateway</h3>
                <p className="text-slate-400 text-sm">Full integration with Stripe and digital invoicing to secure bookings financially.</p>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Dashboard & Analytics</h3>
                <p className="text-slate-400 text-sm">Monitor business revenue, task completion rates, and team performance in real time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Channels */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Connect With Clients Across All Their Favorite Channels</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-16">A unified system gathering all customer messages and phone interactions in one place.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <MessageSquare className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">WhatsApp Business</h3>
              <p className="text-xs text-slate-400 mt-1">24/7 automated responses</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <PhoneCall className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">Phone Calls</h3>
              <p className="text-xs text-slate-400 mt-1">Voice reception & booking</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <Smartphone className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">Instagram & Facebook</h3>
              <p className="text-xs text-slate-400 mt-1">DMs and comments handling</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <Building2 className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">Your Website</h3>
              <p className="text-xs text-slate-400 mt-1">Direct live booking widget</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Before / After */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Massive Difference Before and After Smart Cleaning Desk</h2>
            <p className="text-slate-400">Shift your cleaning business from operational chaos to ultimate professionalism.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-950/20 border border-red-500/30 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">❌ Without the Platform (Traditional Way)</h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex items-start gap-3">Losing clients due to slow response times during peak hours.</li>
                <li className="flex items-start gap-3">Tiresome daily effort spent manually coordinating schedules and teams.</li>
                <li className="flex items-start gap-3">Delayed cash collection and paper invoicing issues.</li>
                <li className="flex items-start gap-3">Difficulty monitoring field crew performance quality on-site.</li>
              </ul>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">✅ With Smart Cleaning Desk</h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex items-start gap-3">Instant response and automated client booking within seconds.</li>
                <li className="flex items-start gap-3">Smart scheduling distributed geographically across teams without errors.</li>
                <li className="flex items-start gap-3">Upfront, reliable digital payments protecting your revenue.</li>
                <li className="flex items-start gap-3">Performance reports and automated client reviews enhancing brand status.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Transparent Pricing for Every Business Size</h2>
            <p className="text-slate-400 mb-2">Choose the right plan and start automating your operations today.</p>
            <p className="text-xs text-emerald-400 font-semibold">No free trial. Subscription required to access the platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">STARTER</span>
                <h3 className="text-2xl font-bold text-white mt-4 mb-2">Starter</h3>
                <p className="text-slate-400 text-sm mb-6">For small cleaning businesses.</p>
                <div className="text-4xl font-black text-white mb-6">$49<span className="text-sm font-normal text-slate-400">/month</span></div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> WhatsApp automated replies</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Basic schedule management</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Up to 300 monthly bookings</li>
                </ul>
              </div>
              <Link href="/signup?plan=starter" className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-center transition">Choose Starter</Link>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border-2 border-emerald-500 flex flex-col justify-between relative shadow-xl shadow-emerald-500/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full">MOST POPULAR</span>
              <div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">BUSINESS</span>
                <h3 className="text-2xl font-bold text-white mt-4 mb-2">Business</h3>
                <p className="text-slate-400 text-sm mb-6">For growing cleaning businesses.</p>
                <div className="text-4xl font-black text-white mb-6">$99<span className="text-sm font-normal text-slate-400">/month</span></div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> WhatsApp + social channels</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Stripe payment integration</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited bookings</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Crew & team management</li>
                </ul>
              </div>
              <Link href="/signup?plan=business" className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-center transition">Choose Business</Link>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">PRO</span>
                <h3 className="text-2xl font-bold text-white mt-4 mb-2">Pro</h3>
                <p className="text-slate-400 text-sm mb-6">FULL AI RECEPTIONIST - For established cleaning businesses.</p>
                <div className="text-4xl font-black text-white mb-6">$249<span className="text-sm font-normal text-slate-400">/month</span></div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dedicated voice phone number</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Fully integrated AI voice agent</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority VIP support</li>
                </ul>
              </div>
              <Link href="/signup?plan=pro" className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-center transition">Choose Pro</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Cleaning Business Types */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tailored for All Cleaning Niches</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-16">Whatever your service scope or scale, the system is engineered to fit your exact workflow.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">Residential & Villas</h3>
              <p className="text-xs text-slate-400">Bookings and recurring home visits</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">Commercial & Offices</h3>
              <p className="text-xs text-slate-400">Corporate and facility cleaning contracts</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">Short-Term Rentals (Airbnb)</h3>
              <p className="text-xs text-slate-400">Quick turnaround cleanings between guests</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">Carpet & Upholstery</h3>
              <p className="text-xs text-slate-400">Item-based and piece counting bookings</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about operating the platform.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">Do I need technical experience to integrate the platform?</h3>
              <p className="text-slate-400 text-sm">Not at all. Integration takes just a few simple steps, and our support team is ready to help you step by step.</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">How does the AI handle varying service pricing?</h3>
              <p className="text-slate-400 text-sm">You input your pricing table once, and the system precisely computes service costs and communicates them to the client.</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">Can I test the platform without a subscription?</h3>
              <p className="text-slate-400 text-sm">No, an active paid subscription is required to access the platform and utilize all operational features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Dedicated Phone Number Section */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">Pro Plan Advanced Feature</span>
            <h2 className="text-3xl font-bold text-white mt-4 mb-4">Dedicated Phone Number Powered by AI Voice</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Give your business enterprise-grade credibility with a dedicated phone line that answers calls instantly, negotiates appointments, and confirms bookings without losing a single phone lead.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Fluent local accents and natural dialogue</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Seamless escalation to human supervisors when needed</li>
            </ul>
          </div>
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
            <PhoneCall className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <div className="text-xl font-bold text-white mb-2">+1 (800) 555-CLEAN</div>
            <p className="text-xs text-slate-400">Ready to handle client calls around the clock</p>
          </div>
        </div>
      </section>

      {/* 12. Pricing Comparison Table */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Detailed Plan Comparison Table</h2>
            <p className="text-slate-400">Compare features and choose what fits your business ambition.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                  <th className="py-4 px-4 font-semibold">Feature</th>
                  <th className="py-4 px-4 font-semibold text-center">Starter</th>
                  <th className="py-4 px-4 font-semibold text-center text-emerald-400">Business</th>
                  <th className="py-4 px-4 font-semibold text-center">Pro</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300 divide-y divide-slate-800/60">
                <tr>
                  <td className="py-4 px-4 font-medium text-white">WhatsApp Automated Replies</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Digital Payment Gateways</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Dedicated Voice Phone Number</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 13. Value / ROI Section */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <Clock className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <div className="text-4xl font-black text-white mb-2">15+ Hours</div>
            <p className="text-slate-400 text-sm">Weekly administration time saved from manual replies and coordination.</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <DollarSign className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <div className="text-4xl font-black text-white mb-2">35%</div>
            <p className="text-slate-400 text-sm">Immediate increase in confirmed booking revenues due to fast replies.</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <Star className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <div className="text-4xl font-black text-white mb-2">100%</div>
            <p className="text-slate-400 text-sm">Schedule precision preventing cleaning team overlaps and delays.</p>
          </div>
        </div>
      </section>

      {/* 14. AI Conversation Demo */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Live AI Interaction Simulation</h2>
            <p className="text-slate-400">Watch how the system answers clients with confidence and professionalism.</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 text-left">
            <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl">
              <span className="font-bold text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Client</span>
              <p className="text-slate-200 text-sm">How much for a 5-bedroom villa cleaning with kitchen sanitization?</p>
            </div>
            <div className="flex items-start gap-3 bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/20">
              <span className="font-bold text-xs bg-emerald-500 text-slate-950 px-2 py-1 rounded">AI Agent</span>
              <p className="text-emerald-200 text-sm">Hello! The total price for the villa including sanitization and cleaning supplies is $220. The job requires a team of 3 cleaners for 4 hours. Shall I book an appointment for you this coming Saturday morning?</p>
            </div>
          </div>
        </div>
      </section>

      {/* 15. Trust & Security Badge Section */}
      <section className="py-16 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Total Security & Protection for Client Data</h3>
              <p className="text-slate-400 text-sm">Full encryption for all bookings and financial transactions complying with top standards.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400 font-semibold">
            <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-emerald-400" /> SSL Secured</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> GDPR Compliant</span>
          </div>
        </div>
      </section>

      {/* 16. Integrations & Ecosystem */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Integrates Seamlessly With Your Existing Tools</h2>
          <p className="text-slate-400 mb-12">Connect the platform to your preferred calendars and payment systems.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">Google Calendar</div>
            <div className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">Stripe Payments</div>
            <div className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">WhatsApp Business API</div>
            <div className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">Meta Webhooks</div>
          </div>
        </div>
      </section>

      {/* 17. Comprehensive Footer & Final CTA */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 p-10 rounded-3xl border border-emerald-500/20 text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Double Your Cleaning Business Revenue?</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8">Start now and never miss another client due to delayed replies or schedule chaos.</p>
            <Link href="/signup" className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold inline-flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-sm text-left">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">Smart Cleaning Desk</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">The premier AI automation platform designed specifically for cleaning businesses.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-emerald-400 transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support & Help</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#faq" className="hover:text-emerald-400 transition">FAQ</a></li>
                <li className="hover:text-emerald-400 transition cursor-pointer">Help Center</li>
                <li className="hover:text-emerald-400 transition cursor-pointer">Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal & Policies</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-emerald-400 transition cursor-pointer">Privacy Policy</li>
                <li className="hover:text-emerald-400 transition cursor-pointer">Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
            <p>© 2026 Smart Cleaning Desk. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Built specifically to empower cleaning businesses with smart growth.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
