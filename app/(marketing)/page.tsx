import React from 'react';
import Link from 'next/link';
import {
  Bot,
  PhoneCall,
  Calendar,
  MessageSquare,
  Zap,
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
  UserCheck,
  RefreshCw,
  Star,
  Database,
  Headphones,
  Settings2,
  PhoneForwarded,
  BookOpen,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">

      {/* =========================
          NAVBAR
      ========================== */}
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
            <a href="#features" className="hover:text-emerald-400 transition">
              Features
            </a>

            <a href="#how-it-works" className="hover:text-emerald-400 transition">
              How It Works
            </a>

            <a href="#pricing" className="hover:text-emerald-400 transition">
              Pricing
            </a>

            <a href="#comparison" className="hover:text-emerald-400 transition">
              Compare Plans
            </a>

            <a href="#faq" className="hover:text-emerald-400 transition">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================
          HERO
      ========================== */}
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

            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base border border-slate-800 flex items-center justify-center gap-2 transition"
            >
              View Pricing
            </a>

          </div>

          <p className="text-xs text-slate-500 mb-14">
            Paid subscription required. No free trial or free tier.
          </p>

          {/* AI Inbox Preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl backdrop-blur max-w-5xl mx-auto text-left">

            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">

              <div className="flex items-center gap-2">

                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />

                <span className="text-xs text-slate-400 ml-2 font-mono">
                  Smart Cleaning Desk AI Inbox
                </span>

              </div>

              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-semibold">
                AI Online
              </span>

            </div>

            <div className="space-y-3 text-sm">

              <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">

                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                  Client
                </div>

                <div>
                  <p className="text-slate-200">
                    Hi, I need a deep cleaning for a 3-bedroom apartment.
                  </p>

                  <span className="text-[10px] text-slate-500">
                    WhatsApp
                  </span>
                </div>

              </div>

              <div className="flex items-start gap-3 bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/20 ml-6">

                <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                  AI
                </div>

                <div>

                  <p className="text-emerald-200">
                    Absolutely! I can help with that. I can collect the details
                    needed for a quote and help you schedule your cleaning.
                  </p>

                  <span className="text-[10px] text-emerald-400/70">
                    AI Customer Response
                  </span>

                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =========================
          CHANNELS
      ========================== */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">

        <div className="max-w-6xl mx-auto text-center">

          <p className="text-emerald-400 text-sm font-semibold mb-3">
            ONE CENTRAL DESK
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Manage Your Customer Conversations in One Place
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto mb-12">
            Bring your customer communication channels together so your team can
            manage leads, conversations, and bookings from one platform.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

            <ChannelCard
              icon={<MessageSquare />}
              title="WhatsApp"
              text="Customer messages and booking conversations"
            />

            <ChannelCard
              icon={<Smartphone />}
              title="Instagram & Facebook"
              text="DMs and lead capture"
            />

            <ChannelCard
              icon={<PhoneCall />}
              title="AI Voice"
              text="AI-powered phone reception"
            />

            <ChannelCard
              icon={<Building2 />}
              title="Website"
              text="Customer inquiries and booking flow"
            />

          </div>
        </div>
      </section>

      {/* =========================
          FEATURES
      ========================== */}
      <section id="features" className="py-24 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="max-w-3xl mb-14">

            <p className="text-emerald-400 text-sm font-semibold mb-3">
              POWERFUL FEATURES
            </p>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
              Everything You Need to Manage More Customers
            </h2>

            <p className="text-slate-400 text-lg">
              Smart Cleaning Desk brings customer communication, lead management,
              scheduling, and AI reception into one workspace.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <FeatureCard
              icon={<Bot />}
              title="AI Customer Messaging"
              text="Automatically respond to customer questions and collect the information needed to move leads forward."
            />

            <FeatureCard
              icon={<PhoneCall />}
              title="AI Voice Receptionist"
              text="Let your AI receptionist handle inbound calls and assist customers with common requests."
            />

            <FeatureCard
              icon={<Users />}
              title="Lead Management"
              text="Capture, organize, qualify, and track cleaning leads from initial inquiry to booking."
            />

            <FeatureCard
              icon={<Calendar />}
              title="Appointment Booking"
              text="Connect your scheduling workflow and help customers book available appointments."
            />

            <FeatureCard
              icon={<RefreshCw />}
              title="Automated Follow-Ups"
              text="Keep conversations moving with automated follow-ups and booking reminders."
            />

            <FeatureCard
              icon={<Star />}
              title="Review Requests"
              text="Automate customer review requests after completed services."
            />

            <FeatureCard
              icon={<Database />}
              title="Customer Management"
              text="Keep customer information and conversation history organized in one place."
            />

            <FeatureCard
              icon={<BookOpen />}
              title="AI Knowledge Base"
              text="Give your AI the information it needs about your services, policies, and business."
            />

            <FeatureCard
              icon={<BarChart3 />}
              title="Conversation & Lead Tracking"
              text="Keep track of conversations, leads, and customer activity across your workflow."
            />

          </div>
        </div>
      </section>

      {/* =========================
          HOW IT WORKS
      ========================== */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/40 border-y border-slate-800/80">

        <div className="max-w-6xl mx-auto">

          <div className="text-center max-w-3xl mx-auto mb-16">

            <p className="text-emerald-400 text-sm font-semibold mb-3">
              HOW IT WORKS
            </p>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
              From Customer Message to Booked Service
            </h2>

            <p className="text-slate-400 text-lg">
              Keep your customer communication organized while AI handles repetitive
              conversations and follow-ups.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <StepCard
              number="01"
              icon={<MessageSquare />}
              title="Connect Your Channels"
              text="Connect the customer communication channels supported by your account and bring conversations into one workflow."
            />

            <StepCard
              number="02"
              icon={<Bot />}
              title="AI Handles Conversations"
              text="Your AI can answer configured questions, collect lead information, qualify inquiries, and assist with bookings."
            />

            <StepCard
              number="03"
              icon={<Calendar />}
              title="Manage & Book"
              text="Track leads, schedule appointments, follow up with customers, and manage your customer relationships."
            />

          </div>
        </div>
      </section>

      {/* =========================
          PRICING
      ========================== */}
      <section id="pricing" className="py-24 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-3xl mx-auto mb-16">

            <p className="text-emerald-400 text-sm font-semibold mb-3">
              SIMPLE PRICING
            </p>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
              Choose the Right AI Plan for Your Cleaning Business
            </h2>

            <p className="text-slate-400">
              Start with the tools you need and upgrade as your customer volume grows.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              Paid subscription required • No free trial
            </div>

          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch">

            {/* STARTER */}
            <PricingCard
              name="Starter"
              label="STARTER"
              price="$49"
              description="Essential AI customer communication and lead management."
              features={[
                'AI Customer Messaging',
                'Instagram Integration',
                'Facebook Integration',
                'WhatsApp Integration',
                'Lead Capture',
                'Customer Inbox',
                'Customer Information Collection',
                'Business Hours & FAQ Responses',
                'Conversation History',
                'Basic Automations',
                'Customer Management',
                'Email Support',
              ]}
              button="Choose Starter"
              href="/signup?plan=starter"
            />

            {/* BUSINESS */}
            <PricingCard
              name="Business"
              label="BUSINESS"
              price="$99"
              description="A complete AI receptionist workflow for growing cleaning businesses."
              popular
              features={[
                'Everything in Starter',
                'AI Voice Receptionist',
                '100 Voice Minutes / Month',
                'Appointment Booking',
                'Calendar Integration',
                'Automated Lead Follow-Ups',
                'Lead Qualification',
                'Quote & Service Information',
                'Booking Reminders',
                'Review Request Automation',
                'Lead Status Management',
                'Custom AI Instructions',
                'Conversation & Lead Tracking',
                'Priority Support',
              ]}
              button="Choose Business"
              href="/signup?plan=business"
            />

            {/* PRO */}
            <PricingCard
              name="Pro"
              label="FULL AI RECEPTIONIST"
              price="$249"
              description="Advanced AI phone handling, custom workflows, and customer management."
              features={[
                'Everything in Business',
                'Dedicated Business Phone Number',
                '500 Voice Minutes / Month',
                'Advanced Call Handling',
                'Call Transfer',
                'Advanced Lead Qualification',
                'Advanced Follow-Ups',
                'Custom Booking Rules',
                'Multiple Service Types',
                'Custom AI Knowledge Base',
                'Advanced Customer Management',
                'Detailed Call & Conversation History',
                'Custom AI Behavior',
                'Priority Support',
              ]}
              button="Choose Pro"
              href="/signup?plan=pro"
            />

          </div>
        </div>
      </section>

      {/* =========================
          COMPARISON
      ========================== */}
      <section id="comparison" className="py-24 px-6 bg-slate-900/40 border-y border-slate-800/80">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">

            <p className="text-emerald-400 text-sm font-semibold mb-3">
              PLAN COMPARISON
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Compare All Features
            </h2>

            <p className="text-slate-400">
              See exactly what is included in each subscription.
            </p>

          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">

            <table className="w-full min-w-[850px] border-collapse">

              <thead>

                <tr className="border-b border-slate-800">

                  <th className="text-left p-5 text-slate-300 font-semibold">
                    Feature
                  </th>

                  <th className="p-5 text-center text-slate-300">
                    Starter
                    <div className="text-emerald-400 text-xs mt-1">
                      $49/month
                    </div>
                  </th>

                  <th className="p-5 text-center text-emerald-400">
                    Business
                    <div className="text-xs mt-1">
                      $99/month
                    </div>
                  </th>

                  <th className="p-5 text-center text-slate-300">
                    Pro
                    <div className="text-emerald-400 text-xs mt-1">
                      $249/month
                    </div>
                  </th>

                </tr>

              </thead>

              <tbody>

                <ComparisonRow name="AI Customer Messaging" starter business pro />

                <ComparisonRow name="WhatsApp" starter business pro />
                <ComparisonRow name="Instagram" starter business pro />
                <ComparisonRow name="Facebook" starter business pro />

                <ComparisonRow name="Lead Capture" starter business pro />
                <ComparisonRow name="Customer Inbox" starter business pro />
                <ComparisonRow name="Customer Information Collection" starter business pro />
                <ComparisonRow name="Business Hours & FAQ Responses" starter business pro />
                <ComparisonRow name="Conversation History" starter business pro />
                <ComparisonRow name="Basic Automations" starter business pro />
                <ComparisonRow name="Customer Management" starter business pro />

                <ComparisonRow name="Appointment Booking" business pro />
                <ComparisonRow name="Calendar Integration" business pro />
                <ComparisonRow name="Automated Lead Follow-Ups" business pro />
                <ComparisonRow name="Lead Qualification" business pro />
                <ComparisonRow name="Quote & Service Information" business pro />
                <ComparisonRow name="Booking Reminders" business pro />
                <ComparisonRow name="Review Request Automation" business pro />
                <ComparisonRow name="Lead Status Management" business pro />
                <ComparisonRow name="Custom AI Instructions" business pro />
                <ComparisonRow name="Conversation & Lead Tracking" business pro />

                <ComparisonRow name="AI Voice Receptionist" business pro />
                <ComparisonRow name="Voice Minutes" starterValue="—" businessValue="100/month" proValue="500/month" />

                <ComparisonRow name="Dedicated Business Phone Number" pro />
                <ComparisonRow name="Advanced Call Handling" pro />
                <ComparisonRow name="Call Transfer" pro />
                <ComparisonRow name="Advanced Lead Qualification" pro />
                <ComparisonRow name="Advanced Follow-Ups" pro />
                <ComparisonRow name="Custom Booking Rules" pro />
                <ComparisonRow name="Multiple Service Types" pro />
                <ComparisonRow name="Custom AI Knowledge Base" pro />
                <ComparisonRow name="Advanced Customer Management" pro />
                <ComparisonRow name="Detailed Call & Conversation History" pro />
                <ComparisonRow name="Custom AI Behavior" pro />

                <ComparisonRow name="Email Support" starter business pro />
                <ComparisonRow name="Priority Support" business pro />

              </tbody>

            </table>
          </div>
        </div>
      </section>

      {/* =========================
          WHY SMART CLEANING DESK
      ========================== */}
      <section className="py-24 px-6">

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">

          <div>

            <p className="text-emerald-400 text-sm font-semibold mb-3">
              BUILT FOR CLEANING BUSINESSES
            </p>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Spend Less Time Repeating the Same Customer Conversations
            </h2>

            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Smart Cleaning Desk gives cleaning companies one place to organize
              customer communication, leads, bookings, follow-ups, and AI-assisted
              reception.
            </p>

            <div className="space-y-5">

              <Benefit
                icon={<Clock />}
                title="Respond around the clock"
                text="Keep customer communication moving outside your team's normal working hours."
              />

              <Benefit
                icon={<DollarSign />}
                title="Capture more opportunities"
                text="Organize incoming inquiries and follow up with leads instead of letting conversations get lost."
              />

              <Benefit
                icon={<Settings2 />}
                title="Configure your AI"
                text="Give the AI your business information, services, policies, and instructions."
              />

            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

            <div className="grid grid-cols-2 gap-4">

              <MiniStat
                icon={<MessageSquare />}
                title="Messages"
                text="Centralized"
              />

              <MiniStat
                icon={<PhoneCall />}
                title="Voice"
                text="AI Reception"
              />

              <MiniStat
                icon={<Users />}
                title="Leads"
                text="Organized"
              />

              <MiniStat
                icon={<Calendar />}
                title="Bookings"
                text="Managed"
              />

            </div>

            <div className="mt-6 p-5 rounded-2xl bg-slate-950 border border-slate-800">

              <div className="flex items-center gap-3 mb-4">

                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>

                <div>
                  <p className="font-bold text-white">
                    AI Receptionist
                  </p>

                  <p className="text-xs text-slate-500">
                    Configured for your business
                  </p>
                </div>

              </div>

              <div className="space-y-2 text-sm text-slate-400">

                <div className="flex justify-between">
                  <span>Customer questions</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex justify-between">
                  <span>Lead information</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex justify-between">
                  <span>Booking assistance</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex justify-between">
                  <span>Follow-ups</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================
          FAQ
      ========================== */}
      <section id="faq" className="py-24 px-6 bg-slate-900/40 border-y border-slate-800/80">

        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-14">

            <p className="text-emerald-400 text-sm font-semibold mb-3">
              FAQ
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>

            <p className="text-slate-400">
              Important information about plans, access, and AI features.
            </p>

          </div>

          <div className="space-y-4">

            <FAQ
              question="Is there a free trial?"
              answer="No. Smart Cleaning Desk does not offer a free trial or free tier. An active paid subscription is required to access the customer dashboard and paid platform features."
            />

            <FAQ
              question="Which channels can I connect?"
              answer="Depending on your subscription and the integrations available in your account, Smart Cleaning Desk is designed to support customer communication through channels such as WhatsApp, Instagram, Facebook, website conversations, and AI voice."
            />

            <FAQ
              question="How do AI voice minutes work?"
              answer="Business includes 100 AI voice minutes per month, while Pro includes 500 AI voice minutes per month. Voice usage is intended for the AI receptionist and supported call-handling features."
            />

            <FAQ
              question="Can I upgrade my plan?"
              answer="Yes. Plan changes can be handled through the subscription and billing flow available in your account."
            />

            <FAQ
              question="Can I customize the AI?"
              answer="Business includes custom AI instructions. Pro adds a custom AI knowledge base and custom AI behavior controls for businesses that need more advanced configuration."
            />

            <FAQ
              question="Do I get a business phone number?"
              answer="A dedicated business phone number is included with the Pro plan. Voice AI availability and calling functionality depend on the phone and voice services configured for your account."
            />

          </div>

        </div>
      </section>

      {/* =========================
          FINAL CTA
      ========================== */}
      <section className="py-24 px-6">

        <div className="max-w-5xl mx-auto text-center bg-gradient-to-br from-emerald-950/60 to-slate-900 p-10 md:p-16 rounded-3xl border border-emerald-500/20">

          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Bot className="w-7 h-7 text-emerald-400" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
            Ready to Put Your Customer Communication on Autopilot?
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
            Choose a plan and start building a more organized customer communication
            workflow for your cleaning business.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-xl shadow-emerald-500/20 transition"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-xs text-slate-500 mt-5">
            Paid subscription required. No free trial.
          </p>

        </div>

      </section>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-10 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

            <div className="col-span-2 md:col-span-1">

              <Link href="/" className="flex items-center gap-2 mb-4">

                <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-slate-950" />
                </div>

                <span className="font-bold text-white">
                  Smart Cleaning Desk
                </span>

              </Link>

              <p className="text-slate-500 text-sm leading-relaxed">
                AI-powered customer communication and management software
                built for cleaning businesses.
              </p>

            </div>

            <div>

              <h4 className="font-bold text-white mb-4">
                Product
              </h4>

              <ul className="space-y-3 text-sm text-slate-500">

                <li>
                  <a href="#features" className="hover:text-emerald-400 transition">
                    Features
                  </a>
                </li>

                <li>
                  <a href="#how-it-works" className="hover:text-emerald-400 transition">
                    How It Works
                  </a>
                </li>

                <li>
                  <a href="#pricing" className="hover:text-emerald-400 transition">
                    Pricing
                  </a>
                </li>

                <li>
                  <a href="#comparison" className="hover:text-emerald-400 transition">
                    Compare Plans
                  </a>
                </li>

              </ul>

            </div>

            <div>

              <h4 className="font-bold text-white mb-4">
                Account
              </h4>

              <ul className="space-y-3 text-sm text-slate-500">

                <li>
                  <Link href="/login" className="hover:text-emerald-400 transition">
                    Sign In
                  </Link>
                </li>

                <li>
                  <Link href="/signup" className="hover:text-emerald-400 transition">
                    Get Started
                  </Link>
                </li>

                <li>
                  <a href="#faq" className="hover:text-emerald-400 transition">
                    FAQ
                  </a>
                </li>

              </ul>

            </div>

            <div>

              <h4 className="font-bold text-white mb-4">
                Legal
              </h4>

              <ul className="space-y-3 text-sm text-slate-500">

                <li>
                  <Link href="/privacy" className="hover:text-emerald-400 transition">
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <Link href="/terms" className="hover:text-emerald-400 transition">
                    Terms of Service
                  </Link>
                </li>

              </ul>

            </div>

          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600">

            <p>
              © 2026 Smart Cleaning Desk. All rights reserved.
            </p>

            <p>
              Professional AI automation software for cleaning businesses.
            </p>

          </div>

        </div>
      </footer>

    </div>
  );
}


/* =========================================================
   COMPONENTS
========================================================= */

function ChannelCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition">

      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-400">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'w-6 h-6',
        })}
      </div>

      <h3 className="font-bold text-white">
        {title}
      </h3>

      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
        {text}
      </p>

    </div>
  );
}


function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 hover:-translate-y-1 transition duration-300">

      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'w-6 h-6',
        })}
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-400 leading-relaxed">
        {text}
      </p>

    </div>
  );
}


function StepCard({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-8">

      <div className="flex items-center justify-between mb-7">

        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          {React.cloneElement(icon as React.ReactElement, {
            className: 'w-6 h-6',
          })}
        </div>

        <span className="text-4xl font-black text-slate-800">
          {number}
        </span>

      </div>

      <h3 className="text-xl font-bold text-white mb-3">
        {title}
      </h3>

      <p className="text-sm text-slate-400 leading-relaxed">
        {text}
      </p>

    </div>
  );
}


function PricingCard({
  name,
  label,
  price,
  description,
  features,
  button,
  href,
  popular = false,
}: {
  name: string;
  label: string;
  price: string;
  description: string;
  features: string[];
  button: string;
  href: string;
  popular?: boolean;
}) {
  return (
    <div
      className={`relative bg-slate-900 rounded-2xl p-8 flex flex-col border ${
        popular
          ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10'
          : 'border-slate-800'
      }`}
    >

      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wide">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex-1">

        <span className="inline-flex text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
          {label}
        </span>

        <h3 className="text-2xl font-bold text-white mt-5 mb-2">
          {name}
        </h3>

        <p className="text-slate-400 text-sm leading-relaxed min-h-[48px]">
          {description}
        </p>

        <div className="text-4xl font-black text-white mt-6 mb-7">
          {price}
          <span className="text-sm font-normal text-slate-400">
            /month
          </span>
        </div>

        <div className="space-y-3 mb-8">

          {features.map((feature, index) => (

            <div
              key={index}
              className={`flex items-start gap-2 text-sm ${
                feature.startsWith('AI Voice') ||
                feature === '100 Voice Minutes / Month' ||
                feature === '500 Voice Minutes / Month'
                  ? 'text-emerald-300 font-semibold'
                  : 'text-slate-300'
              }`}
            >

              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />

              <span>{feature}</span>

            </div>

          ))}

        </div>

      </div>

      <Link
        href={href}
        className={`w-full py-3.5 rounded-xl font-bold text-center transition ${
          popular
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
            : 'bg-slate-800 hover:bg-slate-700 text-white'
        }`}
      >
        {button}
      </Link>

    </div>
  );
}


function ComparisonRow({
  name,
  starter = false,
  business = false,
  pro = false,
  starterValue,
  businessValue,
  proValue,
}: {
  name: string;
  starter?: boolean;
  business?: boolean;
  pro?: boolean;
  starterValue?: string;
  businessValue?: string;
  proValue?: string;
}) {
  return (
    <tr className="border-t border-slate-800/70">

      <td className="p-4 text-sm font-medium text-white">
        {name}
      </td>

      <ComparisonCell
        enabled={starter}
        value={starterValue}
      />

      <ComparisonCell
        enabled={business}
        value={businessValue}
        highlight={business}
      />

      <ComparisonCell
        enabled={pro}
        value={proValue}
      />

    </tr>
  );
}


function ComparisonCell({
  enabled,
  value,
  highlight = false,
}: {
  enabled: boolean;
  value?: string;
  highlight?: boolean;
}) {
  return (
    <td className="p-4 text-center">

      {value ? (
        <span
          className={`text-sm font-semibold ${
            highlight ? 'text-emerald-400' : 'text-slate-300'
          }`}
        >
          {value}
        </span>
      ) : enabled ? (
        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
      ) : (
        <span className="text-slate-700">
          —
        </span>
      )}

    </td>
  );
}


function Benefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">

      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'w-5 h-5',
        })}
      </div>

      <div>

        <h3 className="font-bold text-white mb-1">
          {title}
        </h3>

        <p className="text-sm text-slate-400 leading-relaxed">
          {text}
        </p>

      </div>

    </div>
  );
}


function MiniStat({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">

      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'w-5 h-5',
        })}
      </div>

      <p className="text-sm font-bold text-white">
        {title}
      </p>

      <p className="text-xs text-slate-500 mt-1">
        {text}
      </p>

    </div>
  );
}


function FAQ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800">

      <h3 className="font-bold text-white mb-2">
        {question}
      </h3>

      <p className="text-slate-400 text-sm leading-relaxed">
        {answer}
      </p>

    </div>
  );
}
    </div>
  );
}
