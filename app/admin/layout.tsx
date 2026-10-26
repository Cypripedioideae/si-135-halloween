"use client";

import Link from "next/link";
import AuthGuard from "../components/auth/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireRole="admin">
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
        {/* Admin Top Header */}
        <header className="border-b border-zinc-800 bg-zinc-950/80 sticky top-0 z-30 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🧙‍♂️</span>
              <span className="font-bold tracking-tight text-white">
                Admin Evaluation Console
              </span>
              <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 font-medium px-2 py-0.5 rounded-full">
                Staff Only
              </span>
            </div>

            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-orange-400 transition flex items-center gap-1 font-medium"
            >
              <span>← Exit to Player View</span>
            </Link>
          </div>
        </header>

        {/* Main Admin Section */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
