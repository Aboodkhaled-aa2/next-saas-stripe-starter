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

  const handleSignupAndCheckout = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
      setLoading(false);
    }
  };

  // دالة مخصصة لربط زر جوجل (يمكنك ربطها مع موفر المصادقة مثل Supabase أو Firebase لاحقاً)
  const handleGoogleSignup = () => {
    // Example: supabase.auth.signInWithOAuth({ provider: 'google' })
    alert("Google Sign-Up integration will be connected with your auth provider.");
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

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition flex items-center justify-center gap-3 shadow-md"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.22 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.12 0 9.82 0 12s.43 3.88 1.18 5.4l4.09-3.16z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="px-4 text-xs text-slate-500 uppercase tracking-wider">Or with email</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form onSubmit={handleSignupAndCheckout} className="space-y-6">
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
              {loading ? "Processing..." : "Create Account & Proceed to Checkout"}
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
