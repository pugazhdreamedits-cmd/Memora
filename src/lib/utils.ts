import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskLevel } from "@/types";
import { RISK_THRESHOLDS } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getRiskLevel(retention: number): RiskLevel {
  if (retention >= RISK_THRESHOLDS.LOW.min) return "LOW";
  if (retention >= RISK_THRESHOLDS.MEDIUM.min) return "MEDIUM";
  return "HIGH";
}

export function getRiskColor(risk: RiskLevel): string {
  const map = { LOW: "#10B981", MEDIUM: "#F59E0B", HIGH: "#EF4444" };
  return map[risk];
}

export function getRiskBgColor(risk: RiskLevel): string {
  const map = {
    LOW: "bg-status-success/10 text-status-success border-status-success/20",
    MEDIUM: "bg-status-warning/10 text-status-warning border-status-warning/20",
    HIGH: "bg-status-danger/10 text-status-danger border-status-danger/20",
  };
  return map[risk];
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function round(n: number, decimals = 1): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

export function hashPassword(password: string): string {
  // Simple deterministic hash for demo (NOT for production)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hash_${Math.abs(hash).toString(16)}_${password.length}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

export function getRetentionGradient(retention: number): string {
  if (retention >= 80) return "from-status-success to-brand-secondary";
  if (retention >= 50) return "from-status-warning to-brand-primary";
  return "from-status-danger to-status-warning";
}

export function getNodeSize(retention: number): number {
  return 40 + (retention / 100) * 40; // 40–80px
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
