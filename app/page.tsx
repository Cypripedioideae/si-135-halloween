"use client";

import Link from "next/link";
import AuthGuard from "./components/auth/AuthGuard";
import { useAuth } from "./components/auth/AuthContext";
import { signOutUser } from "./components/lib/oauth2";
import HintGrid from "./components/dashboard/HintGrid";
import { isAdmin as checkIsAdmin } from "./components/auth/accessControl";

export default function Home() {
  // add the isAdmin state, will implement admin page
  const { user, loading } = useAuth();
  const isAdmin = checkIsAdmin(user?.email);
  return (
    <AuthGuard requireRole="main">
      <div className="min-h-screen bg-black text-zinc-100 selection:bg-orange-500 selection:text-white">
        {/* Navigation bar */}
        <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎃</span>
              <span className="font-bold text-lg tracking-tight bg-linear-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                Halloween Buddy Hunt
              </span>
            </div>

            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 text-purple-300 hover:bg-purple-900/50 transition font-medium"
                >
                  Admin Portal
                </Link>
              )}
              <div className="text-sm font-medium text-zinc-300 hidden sm:inline">
                {/* {user?.displayName || user?.email} */}
              </div>
              <button
                onClick={() => signOutUser()}
                className="text-xs text-zinc-400 hover:text-red-400 transition ml-1"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Progress & Buddy Overview Banner */}
          <section className="rounded-3xl p-6 sm:p-8 bg-linear-to-br from-zinc-900 via-zinc-950 to-orange-950/30 border border-orange-500/20 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-3">
                  <span>🕵️‍♂️ Secret Buddy Assignment</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Who is your Secret Buddy?
                </h1>
                <p className="text-zinc-400 text-sm mt-1 max-w-xl">
                  Complete daily missions to unlock hints from the mysterious
                  ghost council. Can you deduce their identity before Halloween
                  night?
                </p>
              </div>

              {/* Hint Progress Indicator */}
              {/* <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4 min-w-55">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-zinc-400">Progress</span>
                  <span className="text-orange-400">1 of 5 Hints</span>
                </div>
                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-linear-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: "20%" }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-2 text-center">
                  4 hints remaining to be deciphered
                </p>
              </div> */}
            </div>
          </section>

          {/* 5 Hints Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <span>Your Clues & Missions</span>
              </h2>
              <span className="text-xs text-zinc-500">
                Click active mission cards to submit proof
              </span>
            </div>

            <HintGrid />
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}
