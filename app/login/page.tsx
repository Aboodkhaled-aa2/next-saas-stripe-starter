"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Chrome,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error === "EMAIL_NOT_VERIFIED") {
        setErrorMsg(
          "Please verify your email before logging in."
        );
        setLoading(false);
        return;
      }

      if (result?.error) {
        setErrorMsg("Invalid email or password.");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setGoogleLoading(true);

    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
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
            href="/signup"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-16 w-full flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">
            Welcome Back
          </h1>

          <p className="mt-2 text-slate-400 text-sm">
            Log in to manage your cleaning business.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm leading-relaxed">
              {errorMsg}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
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

          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />

                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              {loading ? "Signing in..." : "Log In"}

              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to Smart Cleaning Desk?{" "}
          <Link
            href="/signup"
            className="text-blue-400 hover:text-blue-300 font-medium transition"
          >
            Create an account
          </Link>
        </p>
      </div>

      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        © {new Date().getFullYear()} Smart Cleaning Desk. All rights reserved.
      </footer>
    </main>
  );
}
