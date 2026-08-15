import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User, AppSession } from "@/types";
import { getSession, getCurrentUser, logout } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    const u = getCurrentUser();
    setSession(s);
    setUser(u);
    setLoading(false);
  }, []);

  const signOut = () => {
    logout();
    setUser(null);
    setSession(null);
    window.location.href = "/";
  };

  return { user, session, loading, signOut, isDemo: session?.isDemo ?? false };
}

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  return { user, loading };
}
