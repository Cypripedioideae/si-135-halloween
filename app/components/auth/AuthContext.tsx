"use client";

import { getRedirectResult, onAuthStateChanged, User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { auth } from "../lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function initAuth() {
      try {
        await getRedirectResult(auth);
      } catch (error) {
        console.error("Google sign-in redirect failed:", error);
      }

      if (!active) return;

      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          if (!active) return;
          setUser(currentUser);
          setLoading(false);
        },
        (error) => {
          console.error("Firebase auth state error:", error);
          if (!active) return;
          setUser(null);
          setLoading(false);
        },
      );
      cleanup = unsubscribe;
    }

    let cleanup: (() => void) | undefined;
    initAuth();

    return () => {
      active = false;
      if (cleanup) cleanup();
    };
  }, []);

  return <AuthContext value={{ user, loading }}>{children}</AuthContext>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
