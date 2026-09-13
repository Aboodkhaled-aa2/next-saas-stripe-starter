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
          <a href="/pricing" className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800">
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
    </main>
  );
}
