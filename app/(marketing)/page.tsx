export default function IndexPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
        Smart Cleaning Desk
      </h1>
      <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
        Manage your cleaning business appointments, client requests, and daily operations effortlessly.
      </p>
      <div>
        <a
          href="/pricing"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90"
        >
          View Pricing
        </a>
      </div>
    </div>
  );
}
