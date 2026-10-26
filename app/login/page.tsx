"use client";

import { useEffect, useState } from "react";
import { signInWithGoogle } from "../components/lib/oauth2";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/auth/AuthContext";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  async function handleGoogleLogin() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Unable to sign in. Please try again.");
      setIsSigningIn(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-md border border-orange-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-center">
        {/* Spooky Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-4xl mb-6 shadow-lg shadow-orange-500/10">
          🎃
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          Halloween Buddy Hunt
        </h1>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          Log in with your Google account to discover your secret buddy missions
          and unlock mysterious hints!
        </p>

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-2xl font-semibold text-sm transition shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-60"
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
          <span>
            {isSigningIn ? "Redirecting to Google..." : "Continue with Google"}
          </span>
        </button>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
