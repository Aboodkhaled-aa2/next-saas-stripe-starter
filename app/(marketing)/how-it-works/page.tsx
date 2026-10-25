export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans antialiased">
      <header className="sticky top-0 z-50 border-b border-gray-800/60 bg-[#0b0f19]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">SC</div>
            <span className="text-xl font-bold tracking-tight text-white">Smart Cleaning Desk</span>
          </a>
          <nav className="flex items-center gap-6 text-sm text-gray-300">
            <a href="/how-it-works" className="text-white">How It Works</a>
            <a href="/#pricing" className="hover:text-white">Pricing</a>
            <a href="/login" className="hover:text-white">Log In</a>
          </nav>
        </div>
      </header>
      <section className="relative overflow-hidden px-6 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl">
          <p className="mb-6 inline-flex rounded-full border border-blue-600/25 bg-blue-600/10 px-4 py-2 text-xs font-semibold text-blue-300">Workflow &amp; Automation Guide</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            A smarter way to run <span className="bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">any cleaning business</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
            Smart Cleaning Desk helps cleaning teams handle customer enquiries, qualify leads, explain services, and coordinate appointments with an AI employee configured around their own operations.
          </p>
        </div>
      </section>
      <section className="border-t border-gray-800/60 bg-[#080b13] px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            { step: "01", title: "Configure your business", body: "Choose your business type and add services, service areas, working hours, pricing guidance, booking rules, and handoff instructions." },
            { step: "02", title: "Let AI handle enquiries", body: "The AI employee answers using your business information, gathers the details relevant to each job, and captures customer leads." },
            { step: "03", title: "Coordinate the next step", body: "When booking is enabled and the required details are available, the system checks appointment conflicts and helps coordinate the request." },
          ].map((item) => (
            <article key={item.step} className="rounded-2xl border border-gray-800 bg-[#131b2e]/40 p-7">
              <p className="mb-4 text-sm font-bold tracking-widest text-blue-400">STEP {item.step}</p>
              <h2 className="mb-3 text-xl font-bold text-white">{item.title}</h2>
              <p className="text-sm leading-7 text-gray-400">{item.body}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-gray-800 bg-[#131b2e]/30 p-7">
          <h2 className="text-xl font-bold text-white">Built for different cleaning operations</h2>
          <p className="mt-3 leading-7 text-gray-400">Use business-specific workflows for residential cleaning, commercial offices, hotels, car washes and detailing, industrial facilities, warehouses, and specialist cleaning services. The questions and duration rules should match the job—not assume every job is a house.</p>
        </div>
        <div className="mt-12 text-center">
          <a href="/#pricing" className="inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500">Explore Plans</a>
        </div>
      </section>
      <footer className="border-t border-gray-800/60 bg-[#060910] px-6 py-8 text-center text-sm text-gray-500">© 2026 Smart Cleaning Desk. All rights reserved.</footer>
    </main>
  );
}
