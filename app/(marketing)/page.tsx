export default function Page() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Header / Navbar */}
      <header className="border-b border-gray-800/60 sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-white text-sm sm:text-base shadow-lg shadow-blue-600/30">
              AI
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">CleanAgent<span className="text-blue-500">.ai</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="/how-it-works" className="hover:text-white transition">How it Works</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>
          <div>
            <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium transition shadow-md shadow-blue-600/20">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            AI-Powered Operations for Cleaning Businesses
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Never Miss a Cleaning <span className="text-blue-500">Customer Again.</span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Meet your tireless AI receptionist. It answers calls, replies to WhatsApp messages instantly, qualifies leads, and books jobs around the clock.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition shadow-lg shadow-blue-600/30">
              Hire Your AI Employee Now &rarr;
            </a>
            <a href="/how-it-works" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-8 py-4 rounded-xl font-semibold transition">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-gray-800/60 bg-[#0d1322]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Built Specifically for Cleaning Companies</h2>
            <p className="text-gray-400">Everything you need to automate customer acquisition, scheduling, and follow-ups.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#0b0f19] border border-gray-800 p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center text-xl font-bold mb-6">📞</div>
              <h3 className="text-xl font-semibold text-white mb-3">24/7 Call & WhatsApp AI</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Never lose a lead to voicemail. Your AI assistant engages customers instantly on phone calls and WhatsApp.</p>
            </div>
            <div className="bg-[#0b0f19] border border-gray-800 p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center text-xl font-bold mb-6">📅</div>
              <h3 className="text-xl font-semibold text-white mb-3">Automated Booking</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Qualifies lead requirements and locks down appointments directly into your calendar.</p>
            </div>
            <div className="bg-[#0b0f19] border border-gray-800 p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center text-xl font-bold mb-6">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Follow-ups</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Re-engages past clients, sends review requests, and handles reminders effortlessly with zero manual effort.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-gray-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400">Choose the plan that fits your cleaning business growth.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-[#0d1322] border border-gray-800 p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                <p className="text-gray-400 text-sm mb-6">Perfect for independent cleaners & small local teams.</p>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-6">$49 - $59<span className="text-sm font-normal text-gray-400">/month</span></div>
                <ul className="space-y-4 text-sm text-gray-300 mb-8">
                  <li className="flex items-center gap-3">✓ WhatsApp AI Assistant</li>
                  <li className="flex items-center gap-3">✓ Up to 50–75 Bookings/mo</li>
                  <li className="flex items-center gap-3">✓ Calendar Integration</li>
                  <li className="flex items-center gap-3">✓ Basic Follow-ups</li>
                </ul>
              </div>
              <a href="/login" className="w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition">
                Get Started
              </a>
            </div>

            {/* Growth Plan (Popular) */}
            <div className="bg-[#0d1322] border-2 border-blue-600 p-8 rounded-2xl flex flex-col justify-between relative shadow-xl shadow-blue-600/10">
              <div className="absolute -top-3.5 right-8 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Growth</h3>
                <p className="text-gray-400 text-sm mb-6">For scaling cleaning companies wanting full automation.</p>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-6">$129 - $149<span className="text-sm font-normal text-gray-400">/month</span></div>
                <ul className="space-y-4 text-sm text-gray-300 mb-8">
                  <li className="flex items-center gap-3">✓ WhatsApp AI + Voice AI</li>
                  <li className="flex items-center gap-3">✓ 150–250 Bookings/mo</li>
                  <li className="flex items-center gap-3">✓ CRM & Follow-ups</li>
                  <li className="flex items-center gap-3">✓ Lead Capture & Auto Booking</li>
                </ul>
              </div>
              <a href="/login" className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition shadow-md shadow-blue-600/20">
                Get Started
              </a>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#0d1322] border border-gray-800 p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <p className="text-gray-400 text-sm mb-6">High-volume operations requiring customized AI setups.</p>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-6">$249 - $299<span className="text-sm font-normal text-gray-400">/month</span></div>
                <ul className="space-y-4 text-sm text-gray-300 mb-8">
                  <li className="flex items-center gap-3">✓ Unlimited / High-volume</li>
                  <li className="flex items-center gap-3">✓ Voice + WhatsApp AI</li>
                  <li className="flex items-center gap-3">✓ Advanced CRM & Reactivation</li>
                  <li className="flex items-center gap-3">✓ Custom AI Workflows</li>
                  <li className="flex items-center gap-3">✓ Priority Support</li>
                </ul>
              </div>
              <a href="/login" className="w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
