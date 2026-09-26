"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  Chrome,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

type Plan = "starter" | "business" | "pro";

const validPlans: Plan[] = ["starter", "business", "pro"];

function SignupForm() {
  const searchParams = useSearchParams();

  const planParam = searchParams.get("plan");

  const initialPlan: Plan | null = validPlans.includes(planParam as Plan)
    ? (planParam as Plan)
    : null;

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(initialPlan);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedPlan) {
      setErrorMsg("Please choose a plan before creating your account.");
      return;
    }

    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMsg("Please enter your business email.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMsg("Password must include at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setErrorMsg("Password must include at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setErrorMsg("Password must include at least one number.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setErrorMsg("Password must include at least one special character.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          plan: selectedPlan,
        }),
      });

      const responseText = await response.text();

      let data: {
        error?: string;
        message?: string;
        success?: boolean;
      } = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        const serverMessage =
          data.error ||
          data.message ||
          responseText ||
          `Registration failed with status ${response.status}.`;

        setErrorMsg(serverMessage);
        setLoading(false);
        return;
      }

      window.location.href = `/verify-email?email=${encodeURIComponent(
        email.trim().toLowerCase()
      )}&plan=${selectedPlan}`;
    } catch (error) {
      console.error("Signup request error:", error);

      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMsg("");

    if (!selectedPlan) {
      setErrorMsg("Please choose a plan before continuing with Google.");
      return;
    }

    setGoogleLoading(true);

    try {
      await signIn("google", {
        callbackUrl: `/pricing?plan=${selectedPlan}`,
      });
    } catch {
      setErrorMsg("Unable to continue with Google.");
      setGoogleLoading(false);
    }
  };

  const isLoading = loading || googleLoading;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800/80 bg-slate-950/90 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>

            <span className="font-bold tracking-tight text-white">
              Smart Cleaning Desk
            </span>
          </Link>

          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            Already have an account? Log in
          </Link>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-16 w-full flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">
            Create Your Account
          </h1>

          <p className="mt-2 text-slate-400 text-sm">
            Start building your AI-powered cleaning business.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-white">Choose your plan</h2>
              <p className="text-sm text-slate-400">
                Select a plan before creating your account.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                {
                  id: "starter" as Plan,
                  name: "Starter",
                  price: "$49",
                  description: "AI customer messaging",
                },
                {
                  id: "business" as Plan,
                  name: "Business",
                  price: "$99",
                  description: "Booking, calendar, and AI voice",
                },
                {
                  id: "pro" as Plan,
                  name: "Pro",
                  price: "$249",
                  description: "Advanced booking and custom rules",
                },
              ].map((plan) => {
                const isSelected = selectedPlan === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setErrorMsg("");
                    }}
                    disabled={isLoading}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                        : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-white">{plan.name}</div>
                        <div className="mt-1 text-xs text-slate-400">
                          {plan.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{plan.price}</div>
                        <div className="text-xs text-slate-500">per month</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm leading-relaxed break-words">
              {errorMsg}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="h-5 w-5" />
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-3 text-xs text-slate-500">
                OR
              </span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />

                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Business Email
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@yourcleaningco.com"
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>

              <div className={`relative rounded-xl border transition ${
                password.length > 0 &&
                (!/[A-Z]/.test(password) ||
                  !/[a-z]/.test(password) ||
                  !/[0-9]/.test(password) ||
                  !/[^A-Za-z0-9]/.test(password) ||
                  password.length < 8)
                  ? "border-red-500/70"
                  : "border-slate-800 focus-within:border-blue-500"
              }`}>
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                  className="w-full bg-slate-950 rounded-xl pl-12 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none transition disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-300">
                    Your password must contain:
                  </p>

                  <div className="space-y-2 text-sm">
                    {[
                      { label: "At least 8 characters", valid: password.length >= 8 },
                      { label: "Uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
                      { label: "Lowercase letter (a-z)", valid: /[a-z]/.test(password) },
                      { label: "Number (0-9)", valid: /[0-9]/.test(password) },
                      { label: "Special character", valid: /[^A-Za-z0-9]/.test(password) },
                    ].map((requirement) => (
                      <div
                        key={requirement.label}
                        className={`flex items-center gap-2 ${
                          requirement.valid ? "text-emerald-400" : "text-slate-500"
                        }`}
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs">
                          {requirement.valid ? "✓" : ""}
                        </span>
                        <span>{requirement.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />

                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 font-medium transition"
          >
            Log in
          </Link>
        </p>
      </div>

      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        © {new Date().getFullYear()} Smart Cleaning Desk. All rights reserved.
      </footer>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="text-sm text-slate-400">Loading...</div>
        </main>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
