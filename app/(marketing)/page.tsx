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
            <a href="#pricing" className="hover:text-emerald-400 transition">Pricing</a>
            <a href="#comparison" className="hover:text-emerald-400 transition">Compare Plans</a>
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
            Automate Your Cleaning Business Operations <span className="text-emerald-400">With Advanced AI</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            An all-in-one platform combining WhatsApp, Instagram, Facebook, voice calls, and automated scheduling to serve your cleaning clients 24/7.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#pricing" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base border border-slate-800 flex items-center justify-center gap-2 transition">
              View Pricing Plans
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

      {/* 3. Channels Section */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Unified Omnichannel Client Management</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-16">Capture leads and manage customer interactions across all major platforms from one central dashboard.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <MessageSquare className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">WhatsApp Business</h3>
              <p className="text-xs text-slate-400 mt-1">Automated chat & booking</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <Smartphone className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">Instagram & Facebook</h3>
              <p className="text-xs text-slate-400 mt-1">DMs & lead capture</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <PhoneCall className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">Voice & Phone Calls</h3>
              <p className="text-xs text-slate-400 mt-1">AI voice receptionist</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <Building2 className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">Website Integration</h3>
              <p className="text-xs text-slate-400 mt-1">Direct widgets & booking</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing Plans */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Transparent Pricing Plans</h2>
            <p className="text-slate-400 mb-2">Select the ideal plan for your cleaning business operations.</p>
            <p className="text-xs text-emerald-400 font-semibold">Paid subscription required. No free trials or free tier available.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            
            {/* Starter Plan */}
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">STARTER</span>
                <h3 className="text-2xl font-bold text-white mt-4 mb-2">Starter</h3>
                <p className="text-slate-400 text-sm mb-6">Essential automated messaging and client organization for small teams.</p>
                <div className="text-4xl font-black text-white mb-6">$49<span className="text-sm font-normal text-slate-400">/month</span></div>
                
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> AI Customer Messaging</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Instagram integration</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Facebook integration</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> WhatsApp integration</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Lead Capture</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Customer Inbox</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Customer Information Collection</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Business Hours & FAQ Responses</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Conversation History</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Basic Automations</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Customer Management</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Email Support</li>
                </ul>
              </div>
              <Link href="/signup?plan=starter" className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-center transition">
                Choose Starter
              </Link>
            </div>

            {/* Business Plan - Most Popular */}
            <div className="bg-slate-900 p-8 rounded-2xl border-2 border-emerald-500 flex flex-col justify-between relative shadow-xl shadow-emerald-500/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
              <div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">BUSINESS</span>
                <h3 className="text-2xl font-bold text-white mt-4 mb-2">Business</h3>
                <p className="text-slate-400 text-sm mb-6">Advanced booking pipelines, payments, and AI voice minutes for growing businesses.</p>
                <div className="text-4xl font-black text-white mb-6">$99<span className="text-sm font-normal text-slate-400">/month</span></div>
                
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-start gap-2 text-emerald-300 font-semibold"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> AI Voice – 100 minutes/month</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Everything in Starter included</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Calendar Integration</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Automated Lead Follow-ups</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Lead Qualification</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Quote / Service Information</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Booking Reminders</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Review Request Automation</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Lead Status Management</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Custom AI Instructions</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Conversation & Lead Tracking</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Priority Support</li>
                </ul>
              </div>
              <Link href="/signup?plan=business" className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-center transition shadow-lg shadow-emerald-500/20">
                Choose Business
              </Link>
            </div>

            {/* Pro Plan - Full AI Receptionist */}
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">PRO</span>
                <h3 className="text-2xl font-bold text-white mt-4 mb-2">Full AI Receptionist</h3>
                <p className="text-slate-400 text-sm mb-6">Enterprise-grade voice call handling and custom behaviors for established agencies.</p>
                <div className="text-4xl font-black text-white mb-6">$249<span className="text-sm font-normal text-slate-400">/month</span></div>
                
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-start gap-2 text-emerald-300 font-semibold"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> AI Voice – 500 minutes/month</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Everything in Business included</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Advanced Call Handling</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Call Transfer</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Advanced Lead Qualification</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Advanced Follow-ups</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Custom Booking Rules</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Multiple Service Types</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Custom AI Knowledge Base</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Advanced Customer Management</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Detailed Call & Conversation History</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Custom AI Behavior</li>
                </ul>
              </div>
              <Link href="/signup?plan=pro" className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-center transition">
                Choose Pro
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Detailed Comparison Table */}
      <section id="comparison" className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Comprehensive Feature Comparison</h2>
            <p className="text-slate-400">Compare features across Starter, Business, and Pro plans to see what fits your growth.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                  <th className="py-4 px-4 font-semibold w-1/3">Feature</th>
                  <th className="py-4 px-4 font-semibold text-center">Starter ($49)</th>
                  <th className="py-4 px-4 font-semibold text-center text-emerald-400">Business ($99)</th>
                  <th className="py-4 px-4 font-semibold text-center">Pro ($249)</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300 divide-y divide-slate-800/60">
                <tr>
                  <td className="py-4 px-4 font-medium text-white">AI Customer Messaging</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">WhatsApp, Instagram & Facebook</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">AI Voice Minutes / Month</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-400">100 Mins</td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-400">500 Mins</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Calendar Integration</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Automated Lead Follow-ups & Reminders</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Review Request Automation</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Advanced Call Handling & Transfer</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Custom AI Knowledge Base & Behavior</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about subscriptions and access.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">Can I test the platform with a free trial?</h3>
              <p className="text-slate-400 text-sm">No, we do not offer free trials. An active paid subscription is required to access the dashboard and activate automated messaging and AI features.</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">How do the AI voice minutes work on Business and Pro plans?</h3>
              <p className="text-slate-400 text-sm">Voice minutes are included monthly to power your AI voice receptionist and automated call handling. Additional blocks can be added anytime.</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">Can I upgrade or downgrade my plan later?</h3>
              <p className="text-slate-400 text-sm">Yes, you can upgrade or adjust your subscription tier instantly directly from your billing settings inside the dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 p-10 rounded-3xl border border-emerald-500/20 text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Automate Your Cleaning Business?</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8">Subscribe to a plan today and instantly streamline your customer communications and scheduling.</p>
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
              <p className="text-slate-400 text-xs leading-relaxed">The premier AI automation platform designed specifically for professional cleaning services.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-emerald-400 transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition">Pricing</a></li>
                <li><a href="#comparison" className="hover:text-emerald-400 transition">Compare Plans</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#faq" className="hover:text-emerald-400 transition">FAQ</a></li>
                <li className="hover:text-emerald-400 transition cursor-pointer">Help Center</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-emerald-400 transition cursor-pointer">Privacy Policy</li>
                <li className="hover:text-emerald-400 transition cursor-pointer">Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
            <p>© 2026 Smart Cleaning Desk. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Professional automation software for cleaning businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
