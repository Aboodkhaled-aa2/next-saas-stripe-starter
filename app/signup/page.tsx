'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      return
    }

    window.location.href = '/pricing'
  }

  const handleGoogleSignup = async () => {
    setError(null)

    await signIn('google', {
      callbackUrl: '/pricing',
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center text-white">
          Create Account
        </h1>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-800 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 bg-[#1F2937] border border-gray-700 text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 bg-[#1F2937] border border-gray-700 text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition font-medium"
          >
            Sign Up
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-700" />

          <span className="flex-shrink mx-4 text-gray-400 text-sm">
            OR
          </span>

          <div className="flex-grow border-t border-gray-700" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 bg-[#1F2937] border border-gray-700 text-white p-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>

          Sign in with Google
        </button>
      </div>
    </div>
  )
}
