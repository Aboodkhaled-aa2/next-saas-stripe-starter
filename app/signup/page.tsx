"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Check, Lock, Mail } from "lucide-react";

function SignupContent() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "starter";
  
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const validatePassword = (pass: string) => {
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const isValidLength = pass.length >= 8;

    return hasUpperCase && hasLetters && hasSpecialChar && isValidLength;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validatePassword(password)) {
      setErrorMsg("Password must be at least 8 characters long and include an uppercase letter, letters, and a special character/symbol.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg(data.error || "Something went wrong during checkout.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-white">Smart Cleaning Desk</span>
          </Link>
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition">
            Already have an account? Log in
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-4 py-16 w-full flex-grow">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white sm:text-4xl">Create Account & Subscribe</h1>
          <p className="mt-3 text-slate-400">
            Set up your credentials, choose your plan, and proceed to secure checkout.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-6">
            {/* Plans Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Your Plan
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "starter", name: "Starter", price: "$49" },
                  { id: "business", name: "Business", price: "$99" },
                  { id: "pro", name: "Pro", price: "$249" },
                ].map((plan) => (
                  <button
                    type="button"
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                      selectedPlan === plan.id
                        ? "border-blue-500 bg-blue-500/10 text-white shadow-md shadow-blue-500/10"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="font-bold text-sm">{plan.name}</span>
                    <span className="text-xs text-slate-500 mt-1">{plan.price}/mo</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Business Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@yourcleaningco.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 chars, Uppercase & Symbol (!@#$)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Must contain an uppercase letter, lowercase letters, numbers, and a special character.
              </p>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Check className="h-4 w-4 text-blue-400" />
                <span>Instant access after secure payment verification</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span>Secured and processed safely via Stripe</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Proceed to Secure Checkout"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        © {new Date().getFullYear()} Smart Cleaning Desk. All rights reserved.
      </footer>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
