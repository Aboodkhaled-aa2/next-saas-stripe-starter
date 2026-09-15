export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col justify-between">
            
            <div>
                {/* Header / Navbar */}
                <header className="border-b border-gray-800/60 sticky top-0 z-50 bg-[#0b0f19]/80 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <a href="/" className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-600/20">
                                    AI
                                </div>
                                <span className="text-xl font-bold tracking-tight text-white">CleanAgent<span className="text-blue-500">.ai</span></span>
                            </a>
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                            <a href="/how-it-works" className="text-white transition">How it Works</a>
                            <a href="/#pricing" className="hover:text-white transition">Pricing</a>
                        </div>
                        <div>
                            <a href="/#pricing" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-lg shadow-blue-600/25">
                                Get Started
                            </a>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative pt-20 pb-16 overflow-hidden">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/25 text-blue-400 text-xs font-semibold mb-6">
                            Workflow & Automation Guide
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
                            How CleanAgent.ai Handles Your <br />
                            <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 bg-clip-text text-transparent">Cleaning Business Operations</span>
                        </h1>
                        
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Discover how your dedicated AI employee seamlessly takes over calls, qualifies cleaning leads, and syncs appointments without human intervention.
                        </p>
                    </div>
                </section>

                {/* Detailed Steps Section */}
                <section className="py-16 border-t border-gray-800/60 bg-[#080b13]">
                    <div className="max-w-5xl mx-auto px-6 space-y-16">
                        
                        {/* Step 1 */}
                        <div className="grid md:grid-cols-2 gap-8 items-center bg-[#131b2e]/40 border border-gray-800/80 rounded-2xl p-8">
                            <div>
                                <div className="text-blue-500 font-bold text-sm tracking-widest uppercase mb-2">Step 01</div>
                                <h2 className="text-2xl font-bold text-white mb-4">Instant Communication Setup</h2>
                                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                    Your AI employee links directly with your communication channels. Whether it is your business phone line or WhatsApp Business account, setup takes less than 5 minutes.
                                </p>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">✓ No complex software installation</li>
                                    <li className="flex items-center gap-2">✓ Works with existing phone numbers</li>
                                </ul>
                            </div>
                            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
                                [ Live WhatsApp & Voice Integration ]
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="grid md:grid-cols-2 gap-8 items-center bg-[#131b2e]/40 border border-gray-800/80 rounded-2xl p-8">
                            <div className="order-2 md:order-1 bg-[#0b0f19] border border-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
                                [ Smart Lead Qualification Engine ]
                            </div>
                            <div className="order-1 md:order-2">
                                <div className="text-blue-500 font-bold text-sm tracking-widest uppercase mb-2">Step 02</div>
                                <h2 className="text-2xl font-bold text-white mb-4">Answering & Qualifying Leads</h2>
                                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                    When prospective clients message or call asking for price estimates or available slots, the AI engages in a natural, human-like conversation tailored specifically to cleaning services.
                                </p>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">✓ Instant 24/7 replies in seconds</li>
                                    <li className="flex items-center gap-2">✓ Gathers property size and location details</li>
                                </ul>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="grid md:grid-cols-2 gap-8 items-center bg-[#131b2e]/40 border border-gray-800/80 rounded-2xl p-8">
                            <div>
                                <div className="text-blue-500 font-bold text-sm tracking-widest uppercase mb-2">Step 03</div>
                                <h2 className="text-2xl font-bold text-white mb-4">Booking & Schedule Sync</h2>
                                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                    Once the client agrees, the AI locks down the appointment time, confirms details, and coordinates everything automatically so your cleaning team is always on track.
                                </p>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">✓ Zero double-bookings</li>
                                    <li className="flex items-center gap-2">✓ Automated confirmation messages sent</li>
                                </ul>
                            </div>
                            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
                                [ Calendar & Operations Auto-Sync ]
                            </div>
                        </div>

                    </div>
                </section>
            </div>

            {/* Dark Footer */}
            <footer className="border-t border-gray-800/60 bg-[#060910] py-12 text-center text-gray-500 text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>© 2026 CleanAgent.ai. All rights reserved.</div>
                    <div className="flex gap-6">
                        <a href="/how-it-works" className="hover:text-gray-300 transition">How it Works</a>
                        <a href="/#pricing" className="hover:text-gray-300 transition">Pricing</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
