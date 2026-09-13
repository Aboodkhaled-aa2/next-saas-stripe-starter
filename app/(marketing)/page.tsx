export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center mx-auto space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Automate Your Cleaning Business Operations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Say goodbye to messy spreadsheets and paper schedules. Smart Cleaning Desk brings your bookings, client requests, and daily operations into one powerful platform.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/pricing" className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition">
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
