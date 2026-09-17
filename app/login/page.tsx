"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. تسجيل الدخول عبر Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      const user = authData.user;
      if (!user) throw new Error("User not found.");

      // 2. التحقق من قاعدة البيانات (هل الحساب مفعل ودفع اشتراكه؟)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_active, plan")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Profile data not found.");
      }

      // إذا لم يكن مفوضاً أو لم يتم الدفع
      if (!profile.is_active) {
        setErrorMsg("Your account is not active. Please complete your subscription payment.");
        setLoading(false);
        return;
      }

      // 3. التوجيه للوحة التحكم الخاصة بالمنصة إذا كان مفلاً
      router.push("/dashboard");

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in.");
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
          <Link href="/signup" className="text-sm text-slate-400 hover:text-white transition">
            Don't have an account? Sign up
          </Link>
        </div>
      </header>

      {/* Form Area */}
      <div className="max-w-md mx-auto px-4 py-16 w-full flex-grow flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">Welcome Back</h1>
          <p className="mt-2 text-slate-400 text-sm">Log in to manage your cleaning business platform.</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Business Email</label>
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

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {loading ? "Verifying..." : "Log In"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        © {new Date().getFullYear()} Smart Cleaning Desk. All rights reserved.
      </footer>
    </main>
  );
}
