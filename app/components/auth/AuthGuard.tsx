import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";
import { isAdmin, isAllowedEmail } from "./accessControl";
import { signOutUser } from "../lib/oauth2";

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: "main" | "admin";
}

export default function AuthGuard({
  children,
  requireRole = "main",
}: AuthGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user && !loading) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        Checking authentication...
      </div>
    );
  }

  if (!isAllowedEmail(user.email)) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-950 border border-red-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="text-4xl mb-4">⛔</div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Your email is not registered and cannot access the page.
            <br />
            <span className="text-xs text-zinc-500 mt-2 block">
              Logged in as:{" "}
              <strong className="text-zinc-300">{user.email}</strong>
            </span>
          </p>
          <button
            onClick={() => signOutUser()}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold transition"
          >
            Sign Out & Switch Account
          </button>
        </div>
      </div>
    );
  }
  if (requireRole === "admin" && !isAdmin(user.email)) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-950 border border-amber-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Admin Only</h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Your account does not have permission to view the evaluation
            console.
            <br />
            <span className="text-xs text-zinc-500 mt-2 block">
              Logged in as:{" "}
              <strong className="text-zinc-300">{user.email}</strong>
            </span>
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push("/")}
              className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition"
            >
              Return to Player View
            </button>
            <button
              onClick={() => signOutUser()}
              className="w-full py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-400 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requireRole === "main" && !isAllowedEmail(user.email)) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-950 border border-orange-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="text-4xl mb-4">🎃</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Participant Access Restricted
          </h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Your institutional email is recognized, but your account is not
            currently listed in the active Halloween buddy hunt roster.
            <br />
            <span className="text-xs text-zinc-500 mt-2 block">
              Logged in as:{" "}
              <strong className="text-zinc-300">{user.email}</strong>
            </span>
          </p>
          <button
            onClick={() => signOutUser()}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
