export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero Section */}
      <div className="mx-auto max-w-5xl px-6 py-24 text-center space-y-6 w-full">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Automate Your Cleaning Business Operations
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Say goodbye to messy spreadsheets and paper schedules. Smart Cleaning Desk brings your bookings, client requests, and daily operations into one powerful platform.
        </p>
        <div className="flex justify-center gap-4">
          <a href="#pricing" className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800">
            View Pricing
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-gray-50 px-6 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-bold text-gray-900">Smart Scheduling</h3>
            <p className="text-gray-600">Easily manage and organize daily and weekly cleaning appointments without any scheduling conflicts.</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-bold text-gray-900">Client Management</h3>
            <p className="text-gray-600">Keep track of client profiles, multiple property addresses, and full booking history in one place.</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-bold text-gray-900">Team Operations</h3>
            <p className="text-gray-600">Assign cleaning staff to jobs smoothly and keep your field operations running at peak efficiency.</p>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="w-full px-6 py-24 bg-white">
        <div className="mx-auto max-w-6xl text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Choose the right plan for your cleaning business and start automating today.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-2 gap-8">
          {/* Starter Plan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-600 mb-6">Perfect for independent cleaners and small teams.</p>
              <div className="text-4xl font-extrabold text-gray-900 mb-6">$29<span className="text-lg font-normal text-gray-500">/month</span></div>
              <ul className="space-y-3 text-gray-600 mb-8 text-left">
                <li>✓ Up to 50 bookings/month</li>
                <li>✓ Basic client management</li>
                <li>✓ Email support</li>
              </ul>
            </div>
            <a href="/register" className="w-full rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-900 text-center transition hover:bg-gray-200">
              Get Started
            </a>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl border-2 border-black bg-white p-8 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <p className="text-gray-600 mb-6">For growing cleaning companies looking to scale.</p>
              <div className="text-4xl font-extrabold text-gray-900 mb-6">$79<span className="text-lg font-normal text-gray-500">/month</span></div>
              <ul className="space-y-3 text-gray-600 mb-8 text-left">
                <li>✓ Unlimited bookings</li>
                <li>✓ Advanced team & scheduling ops</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
            <a href="/register" className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white text-center transition hover:bg-gray-800">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
