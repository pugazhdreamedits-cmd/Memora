// ============================================================
// MEMORA — Authentication Utilities
// ============================================================

import type { User, AppSession } from "@/types";
import { UserStore, AuthStore, ProfileStore } from "@/lib/storage";
import { hashPassword, verifyPassword, generateId, generateToken } from "@/lib/utils";
import { seedDemoData } from "@/lib/demoData";

// Initialize demo data on first load
seedDemoData();

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  session?: AppSession;
}

export function register(name: string, email: string, password: string): AuthResult {
  if (!name.trim() || !email.trim() || !password.trim()) {
    return { success: false, error: "All fields are required." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }
  const existing = UserStore.getByEmail(email.toLowerCase());
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const user: User = {
    id: generateId(),
    email: email.toLowerCase(),
    name: name.trim(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  UserStore.save(user);

  const session: AppSession = {
    userId: user.id,
    token: generateToken(),
    isDemo: false,
    loginAt: new Date().toISOString(),
  };
  AuthStore.setSession(session);

  return { success: true, user, session };
}

export function login(email: string, password: string): AuthResult {
  const user = UserStore.getByEmail(email.toLowerCase());
  if (!user) return { success: false, error: "No account found with this email." };
  if (!verifyPassword(password, user.passwordHash)) {
    return { success: false, error: "Incorrect password." };
  }

  const session: AppSession = {
    userId: user.id,
    token: generateToken(),
    isDemo: email.toLowerCase() === "demo@memora.ai",
    loginAt: new Date().toISOString(),
  };
  AuthStore.setSession(session);
  return { success: true, user, session };
}

export function logout(): void {
  AuthStore.clearSession();
}

export function getSession(): AppSession | null {
  return AuthStore.getSession();
}

export function getCurrentUser(): User | null {
  const session = getSession();
  if (!session) return null;
  return UserStore.getById(session.userId);
}

export function isOnboarded(userId: string): boolean {
  const profile = ProfileStore.getByUser(userId);
  return profile?.onboardingCompleted ?? false;
}
