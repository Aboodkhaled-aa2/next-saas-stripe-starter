export default function IndexPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-4">
        Smart Cleaning Desk
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground mb-8">
        Manage your cleaning business appointments, client requests, and daily operations effortlessly.
      </p>
      <div className="flex gap-4">
        <a
          href="/pricing"
          className="rounded-md bg-primary px-6 py-3 text-white font-medium shadow hover:opacity-90"
        >
          View Pricing
        </a>
      </div>
    </div>
  );
}
