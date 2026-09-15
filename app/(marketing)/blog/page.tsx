export default function Page() {
    return (
        <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
            
            {/* Header / Navbar */}
            <header className="border-b border-gray-800/60 sticky top-0 z-50 bg-[#0b0f19]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-600/20">
                            AI
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">CleanAgent<span className="text-blue-500">.ai</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                        <a href="#features" className="hover:text-white transition">How it Works</a>
                        <a href="#pricing" className="hover:text-white transition">Pricing</a>
                    </div>
                    <div>
                        <a href="#pricing" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-lg shadow-blue-600/25">
                            Get Started
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/25 text-blue-400 text-xs font-semibold mb-8">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        The 24/7 AI Employee for Cleaning Businesses
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
                        Never Miss a Cleaning <br />
                        <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 bg-clip-text text-transparent">Customer Again.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Meet your tireless AI receptionist. It answers calls, replies to WhatsApp messages, qualifies leads, and books cleaning jobs automatically while you sleep.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#pricing" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-base transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2">
                            Hire Your AI Employee Now
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </a>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 border-t border-gray-800/60 relative">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-gray-400 text-base">A 24/7 AI employee for a fraction of the cost of a human receptionist.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        
                        {/* Monthly Plan */}
                        <div className="bg-[#131b2e] border border-gray-800 rounded-2xl p-8 flex flex-col justify-between relative shadow-xl hover:border-gray-700 transition">
                            <div>
                                <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Growth Monthly</div>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-extrabold text-white">$49</span>
                                    <span className="text-gray-400 text-sm">/ month</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-8">Perfect for cleaning companies looking to automate WhatsApp & social media messages instantly.</p>
                                
                                <ul className="space-y-4 text-sm text-gray-300 mb-8">
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        24/7 Auto-reply on WhatsApp & Instagram
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Basic Cleaning Schedule Integration
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Unlimited Text Leads & Follow-ups
                                    </li>
                                </ul>
                            </div>
                            
                            <a href="#" className="w-full bg-gray-800 hover:bg-gray-700 text-white text-center py-3.5 rounded-xl font-medium text-sm transition">
                                Get Started Monthly
                            </a>
                        </div>

                        {/* Annual Plan */}
                        <div className="bg-gradient-to-b from-[#131b2e] to-[#1a233d] border-2 border-blue-600 rounded-2xl p-8 flex flex-col justify-between relative shadow-2xl shadow-blue-600/10">
                            <div className="absolute -top-3.5 right-6 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                                Best Value + Voice AI
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Pro Annual (Full Suite)</div>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-extrabold text-white">$499</span>
                                    <span className="text-gray-400 text-sm">/ year</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-8">The complete powerhouse: Chat automation + Dedicated Phone Number + AI Voice Receptionist.</p>
                                
                                <ul className="space-y-4 text-sm text-gray-200 mb-8">
                                    <li className="flex items-center gap-3 font-medium">
                                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-white">Dedicated Business Phone Number</span>
                                    </li>
                                    <li className="flex items-center gap-3 font-medium">
                                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-white">AI Voice Receptionist (Answers calls 24/7)</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Everything in Monthly Chat & Social Plan
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Priority VIP Support & Setup Assistance
                                    </li>
                                </ul>
                            </div>
                            
                            <a href="#" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-600/30">
                                Claim Your AI Employee (Annual)
                            </a>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
