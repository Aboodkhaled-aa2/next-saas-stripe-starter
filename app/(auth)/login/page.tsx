import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/forms/user-auth-form";
import { Icons } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col items-center justify-center relative px-4">
      {/* Back Button */}
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "absolute left-4 top-4 md:left-8 md:top-8 text-gray-300 hover:text-white hover:bg-gray-800/60"
        )}
      >
        <Icons.chevronLeft className="mr-2 size-4" />
        Back
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px] bg-[#0d1322] border border-gray-800/80 p-8 rounded-2xl shadow-2xl">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30 mb-2">
            AI
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-sm text-gray-400">
            Enter your email to sign in to your account
          </p>
        </div>

        <Suspense>
          <UserAuthForm />
        </Suspense>

        <p className="px-8 text-center text-sm text-gray-400">
          <Link
            href="/register"
            className="hover:text-blue-400 underline underline-offset-4 transition"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
