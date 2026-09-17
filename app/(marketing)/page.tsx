import Link from 'next/link';
import { 
  Check, X, Sparkles, ArrowRight, ShieldCheck, Clock, Users, 
  PhoneOff, MessageSquareOff, CalendarX, Zap, CheckCircle2, 
  MessageSquare, Phone, Calendar, Repeat, Star, Inbox, 
  Home, Building2, Sparkle, SprayCan, Key, UserCheck 
} from 'lucide-react';

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black">
      
      {/* 2. NAVBAR */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="font-extrabold text-xl tracking-tight flex items-center gap-2">
            <span className="text-emerald-400">Smart</span> Cleaning Desk
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300 font-medium">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-semibold hover:text-emerald-400 transition-colors">
              Login
            </Link>
            <Link href="/sign-in" className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-lg shadow-emerald-500/20">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-20 lg:pt-32 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                <Sparkles className="w-4 h-4" /> AI-Powered • 24/7 • Built for Cleaning Businesses
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                Your AI Receptionist for Your <span className="text-emerald-400">Cleaning Business</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Never miss a customer again. Smart Cleaning Desk answers messages, handles calls, captures leads, and books cleaning jobs — 24/7.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link href="/sign-in" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 font-semibold text-base transition-all text-center">
                  See How It Works
                </Link>
              </div>
            </div>

            {/* Visual SaaS Dashboard Mockup */}
            <div className="lg:col-span-5">
              <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">Live AI Inbox</span>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="bg-zinc-800/60 p-4 rounded-2xl border border-white/5">
                    <div className="text-xs text-zinc-400 mb-1">Customer • 2m ago</div>
                    <p className="text-zinc-200">“Hi, how much for a deep clean on a 3-bed house?”</p>
                  </div>
                  <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/20 ml-4">
                    <div className="text-xs text-emerald-400 mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Receptionist</div>
                    <p className="text-zinc-200">“Hi! I’d love to help. For a 3-bedroom deep clean, our rate is $220. What day works best for you?”</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 pt-2 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Booking Confirmed & Added to Calendar
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PROBLEM SECTION */}
      <section className="py-24 bg-zinc-950/50 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              You’re Losing Customers While You’re Busy Cleaning.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6">
                <MessageSquareOff className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Missed Messages</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Customers message while you’re working and expect an immediate reply.</p>
            </div>

            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6">
                <PhoneOff className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Missed Calls</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Unanswered phone calls directly mean lost cleaning jobs to your competitors.</p>
            </div>

            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6">
                <CalendarX className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">No Time for Follow-Ups</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">High-value leads disappear completely when nobody follows up instantly.</p>
            </div>
          </div>

          <div className="text-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-emerald-400 font-semibold text-lg flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" /> Smart Cleaning Desk handles the conversations for you.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">From Customer Message to Booked Job</h2>
            <p className="text-zinc-400 text-lg mt-4">Three simple steps to automate your cleaning operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
              <div className="text-emerald-400 font-mono text-xl font-bold mb-4">01</div>
              <h3 className="text-xl font-bold mb-3">Customer Contacts You</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Customer sends a message or calls your cleaning business phone number.</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
              <div className="text-emerald-400 font-mono text-xl font-bold mb-4">02</div>
              <h3 className="text-xl font-bold mb-3">AI Responds Instantly</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Your AI answers questions, collects home details, and qualifies the lead.</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
              <div className="text-emerald-400 font-mono text-xl font-bold mb-4">03</div>
              <h3 className="text-xl font-bold mb-3">Get More Bookings</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">The AI helps schedule appointments and moves qualified leads forward automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. AI FEATURES */}
      <section id="features" className="py-24 bg-zinc-950/50 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Your AI Employee That Never Takes a Day Off</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8">
              <MessageSquare className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">AI Messaging</h3>
              <p className="text-zinc-400 text-sm">Reply to customers instantly across supported channels.</p>
            </div>
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8">
              <Phone className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">AI Voice</h3>
              <p className="text-zinc-400 text-sm">Answer customer calls and handle common questions.</p>
            </div>
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8">
              <Calendar className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Smart Booking</h3>
              <p className="text-zinc-400 text-sm">Help customers schedule cleaning appointments.</p>
            </div>
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8">
              <Repeat className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Automated Follow-Ups</h3>
              <p className="text-zinc-400 text-sm">Automatically follow up with leads and customers.</p>
            </div>
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8">
              <Star className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Review Requests</h3>
              <p className="text-zinc-400 text-sm">Ask customers for reviews after completed services.</p>
            </div>
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8">
              <Inbox className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Lead Management</h3>
              <p className="text-zinc-400 text-sm">Keep customer conversations and leads organized.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER CHANNELS */}
      <section className="py-24 bg-black border-t border-white/10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">One AI. All Your Customer Conversations.</h2>
          <p className="text-zinc-400 text-lg mb-12">Your customers can reach you wherever they are. Your AI handles the conversation.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['WhatsApp', 'Facebook', 'Instagram', 'Phone', 'Website'].map((channel) => (
              <div key={channel} className="px-6 py-4 rounded-2xl bg-zinc-900 border border-white/10 font-semibold text-emerald-400 text-sm shadow-lg">
                {channel}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. BEFORE / AFTER */}
      <section className="py-24 bg-zinc-950/50 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-red-950/10 border border-red-500/20 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-red-400 mb-6">Without Smart Cleaning Desk</h3>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> Missed calls</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> Slow replies</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> Lost leads</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> Forgotten follow-ups</li>
              </ul>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-emerald-400 mb-6">With Smart Cleaning Desk</h3>
              <ul className="space-y-4 text-zinc-200 font-medium">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> Instant replies</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> AI phone answering</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> Organized leads</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> More time to run the business</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 10. PRICING */}
      <section id="pricing" className="py-24 bg-black border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-zinc-400 text-lg mt-4">Choose the plan that fits your cleaning business.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* STARTER */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="text-zinc-400 font-semibold text-sm uppercase mb-2">Starter</div>
                <div className="text-4xl font-extrabold mb-4">$49<span className="text-zinc-400 text-sm font-normal">/month</span></div>
                <p className="text-zinc-400 text-sm mb-6">For cleaning businesses getting started with AI.</p>
                <div className="space-y-3 text-sm border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>AI Messaging</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Facebook & Instagram</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Lead Capture</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Customer Inbox</span></div>
                </div>
              </div>
              <div className="pt-8">
                <Link href="/sign-in" className="w-full block text-center bg-zinc-800 hover:bg-zinc-700 font-semibold py-3 rounded-xl transition-all text-sm">Start Free Trial</Link>
              </div>
            </div>

            {/* BUSINESS */}
            <div className="bg-zinc-900 border-2 border-emerald-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <div className="text-emerald-400 font-semibold text-sm uppercase mb-2">Business</div>
                <div className="text-4xl font-extrabold mb-4">$99<span className="text-zinc-400 text-sm font-normal">/month</span></div>
                <p className="text-zinc-400 text-sm mb-6">For growing cleaning businesses.</p>
                <div className="space-y-3 text-sm border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Everything in Starter</span></div>
                  <div className="flex items-center gap-3 font-medium text-white"><Check className="w-4 h-4 text-emerald-400" /><span>AI Voice — 100 min/month</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Appointment Booking</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400" /><span>Automated Follow-Ups</span></div>
                </div>
              </div>
              <div className="pt-8">
                <Link href="/sign-in" className="w-full block text-center bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all text-sm shadow-lg">Start Free Trial</Link>
              </div>
            </div>

            {/* PRO */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="text-cyan-400 font-semibold text-sm uppercase mb-2">Pro</div>
                <div className="text-4xl font-extrabold mb-4">$249<span className="text-zinc-400 text-sm font-normal">/month</span></div>
                <p className="text-zinc-400 text-sm mb-6">Full AI receptionist ready to automate everything.</p>
                <div className="space-y-3 text-sm border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-cyan-400" /><span>Everything in Business</span></div>
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-cyan-400" /><span>Dedicated Phone Number</span></div>
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

      {/* 13. CLEANING BUSINESS TYPES */}
      <section className="py-24 bg-zinc-950/50 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-16">Built for Cleaning Businesses</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { title: 'Residential Cleaning', icon: Home },
              { title: 'Commercial Cleaning', icon: Building2 },
              { title: 'Deep Cleaning', icon: Sparkle },
              { title: 'Airbnb Cleaning', icon: SprayCan },
              { title: 'Move-In / Move-Out', icon: Key },
              { title: 'Maid Services', icon: UserCheck }
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
                  <IconComponent className="w-6 h-6 text-emerald-400" />
                  <span className="font-semibold text-sm">{item.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 15. FAQ */}
      <section id="faq" className="py-24 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center mb-16">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-2">Does Smart Cleaning Desk answer phone calls?</h3>
              <p className="text-zinc-400 text-sm">Yes, voice AI capabilities are included in our Business (100 mins) and Pro (500 mins) plans.</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-2">Can I connect my social media accounts?</h3>
              <p className="text-zinc-400 text-sm">Yes, you can connect supported channels like WhatsApp, Facebook, and Instagram seamlessly.</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-2">Can I cancel my subscription?</h3>
              <p className="text-zinc-400 text-sm">Yes, you can cancel your subscription at any time directly from your account settings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 16. FINAL CTA */}
      <section className="py-24 bg-gradient-to-t from-emerald-950/30 to-black border-t border-white/10 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Stop Missing Cleaning Jobs.</h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">Let AI handle your customer conversations while you focus on running your cleaning business.</p>
          <div className="pt-4">
            <Link href="/sign-in" className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base transition-all shadow-lg inline-flex items-center gap-2">
              Start Your Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
