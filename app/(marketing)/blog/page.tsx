<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Cleaning Receptionist - Never Miss a Customer</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        darkBg: '#0b0f19',
                        cardBg: '#131b2e',
                        primary: '#3b82f6',
                        primaryHover: '#2563eb',
                        accent: '#10b981'
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-darkBg text-gray-100 font-sans antialiased selection:bg-primary selection:text-white">

    <!-- Header / Navbar -->
    <header class="border-b border-gray-800/60 sticky top-0 z-50 bg-darkBg/80 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-primary/20">
                    AI
                </div>
                <span class="text-xl font-bold tracking-tight text-white">CleanAgent<span class="text-primary">.ai</span></span>
            </div>
            <div class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                <a href="#features" class="hover:text-white transition">How it Works</a>
                <a href="#pricing" class="hover:text-white transition">Pricing</a>
            </div>
            <div>
                <a href="#pricing" class="bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-lg shadow-primary/25">
                    Get Started
                </a>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-24 pb-20 overflow-hidden">
        <!-- Glow background effects -->
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div class="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-8">
                <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                The 24/7 AI Employee for Cleaning Businesses
            </div>
            
            <h1 class="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
                Never Miss a Cleaning <br>
                <span class="bg-gradient-to-r from-primary via-blue-400 to-accent bg-clip-text text-transparent">Customer Again.</span>
            </h1>
            
            <p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Meet your tireless AI receptionist. It answers calls, replies to WhatsApp messages, qualifies leads, and books cleaning jobs automatically while you sleep.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="#pricing" class="w-full sm:w-auto bg-primary hover:bg-primaryHover text-white px-8 py-4 rounded-xl font-semibold text-base transition shadow-xl shadow-primary/30 flex items-center justify-center gap-2">
                    Hire Your AI Employee Now
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </a>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-24 border-t border-gray-800/60 relative">
        <div class="max-w-6xl mx-auto px-6">
            <div class="text-center max-w-2xl mx-auto mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
                <p class="text-gray-400 text-base">A 24/7 AI employee for a fraction of the cost of a human receptionist.</p>
            </div>

            <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                
                <!-- Monthly Plan -->
                <div class="bg-cardBg border border-gray-800 rounded-2xl p-8 flex flex-col justify-between relative shadow-xl hover:border-gray-700 transition">
                    <div>
                        <div class="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Growth Monthly</div>
                        <div class="flex items-baseline gap-1 mb-4">
                            <span class="text-4xl font-extrabold text-white">$49</span>
                            <span class="text-gray-400 text-sm">/ month</span>
                        </div>
                        <p class="text-gray-400 text-sm mb-8">Perfect for cleaning companies looking to automate WhatsApp & social media messages instantly.</p>
                        
                        <ul class="space-y-4 text-sm text-gray-300 mb-8">
                            <li class="flex items-center gap-3">
                                <svg class="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                24/7 Auto-reply on WhatsApp & Instagram
                            </li>
                            <li class="flex items-center gap-3">
                                <svg class="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                Basic Cleaning Schedule Integration
                            </li>
                            <li class="flex items-center gap-3">
                                <svg class="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                Unlimited Text Leads & Follow-ups
                            </li>
                        </ul>
                    </div>
                    
                    <a href="#" class="w-full bg-gray-800 hover:bg-gray-700 text-white text-center py-3.5 rounded-xl font-medium text-sm transition">
                        Get Started Monthly
                    </a>
                </div>

                <!-- Annual Plan (Pro/Killer Feature) -->
                <div class="bg-gradient-to-b from-cardBg to-[#1a233d] border-2 border-primary rounded-2xl p-8 flex flex-col justify-between relative shadow-2xl shadow-primary/10">
                    <div class="absolute -top-3.5 right-6 bg-primary text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                        Best Value + Voice AI
                    </div>

                    <div>
                        <div class="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pro Annual (Full Suite)</div>
                        <div class="flex items-baseline gap-1 mb-4">
                            <span class="text-4xl font-extrabold text-white">$499</span>
                            <span class="text-gray-400 text-sm">/ year</span>
                        </div>
                        <p class="text-gray-400 text-sm mb-8">The complete powerhouse: Chat automation + Dedicated Phone Number + AI Voice Receptionist.</p>
                        
                        <ul class="space-y-4 text-sm text-gray-200 mb-8">
                            <li class="flex items-center gap-3 font-medium">
                                <svg class="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                <span class="text-white">Dedicated Business Phone Number</span>
                            </li>
                            <li class="flex items-center gap-3 font-medium">
                                <svg class="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                <span class="text-white">AI Voice Receptionist (Answers calls 24/7)</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <svg class="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                Everything in Monthly Chat & Social Plan
                            </li>
                            <li class="flex items-center gap-3">
                                <svg class="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                Priority VIP Support & Setup Assistance
                            </li>
                        </ul>
                    </div>
                    
                    <a href="#" class="w-full bg-primary hover:bg-primaryHover text-white text-center py-3.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-primary/30">
                        Claim Your AI Employee (Annual)
                    </a>
                </div>

            </div>
        </div>
    </section>

</body>
</html>
