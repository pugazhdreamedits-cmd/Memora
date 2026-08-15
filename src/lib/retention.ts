// ============================================================
// MEMORA — Retention & Forgetting Curve Engine
// Implements Ebbinghaus-inspired decay with personalization
// ============================================================

import { clamp } from "@/lib/utils";
import type { MLDataPoint, PredictionResult, StudentProfile } from "@/types";
import { RECALL_DAYS } from "@/constants";

// ─── Ebbinghaus Forgetting Curve ────────────────────────────
// R(t) = e^(-t / S)
// S = stability, higher means slower forgetting
// We enhance this with personal factors

export function calculateStability(
  initialScore: number,
  difficulty: number, // 0=Easy,1=Medium,2=Hard
  studyMethod: number, // 0-5
  revisionCount: number
): number {
  const baseStability = 1.5 + (initialScore / 100) * 3;
  const difficultyPenalty = [0, 0.3, 0.7][difficulty] ?? 0.3;
  const methodBonus = [0.1, 0.5, 0.2, 0.3, 0.6, 0.5][studyMethod] ?? 0.3;
  const revisionBonus = Math.min(revisionCount * 0.4, 2);
  return Math.max(0.5, baseStability - difficultyPenalty + methodBonus + revisionBonus);
}

export function ebbinghausRetention(stability: number, daysSinceStudy: number): number {
  if (daysSinceStudy <= 0) return 100;
  const r = Math.exp(-daysSinceStudy / stability) * 100;
  return clamp(r, 0, 100);
}

export function predictRetentionCurve(
  initialScore: number,
  difficulty: number,
  studyMethod: number,
  revisionCount: number,
  days: number[] = RECALL_DAYS
): number[] {
  const stability = calculateStability(initialScore, difficulty, studyMethod, revisionCount);
  return days.map(d => {
    const base = ebbinghausRetention(stability, d);
    const noise = (Math.random() - 0.5) * 3; // slight variation
    return clamp(base + noise, 0, 100);
  });
}

// ─── Personalized Decay Rate ─────────────────────────────────
export function personalizedDecayRate(
  historicalData: MLDataPoint[],
  defaultRate = 0.65
): number {
  if (historicalData.length < 3) return defaultRate;
  const rates: number[] = [];
  for (let i = 1; i < historicalData.length; i++) {
    const prev = historicalData[i - 1];
    const curr = historicalData[i];
    if (curr.daysSinceStudy > 0) {
      const observed = curr.retentionScore / 100;
      const predicted = Math.exp(-curr.daysSinceStudy / 2);
      if (predicted > 0) rates.push(-Math.log(observed) / curr.daysSinceStudy);
    }
  }
  if (rates.length === 0) return defaultRate;
  return clamp(rates.reduce((a, b) => a + b, 0) / rates.length, 0.1, 2.0);
}

// ─── Forecast Next N Days ────────────────────────────────────
export interface RetentionForecast {
  day: number;
  predicted: number;
  actual?: number;
  label: string;
}

export function generateForecast(
  currentRetention: number,
  forgettingRate: number,
  days: number[] = [0, 1, 3, 7, 14]
): RetentionForecast[] {
  return days.map(d => ({
    day: d,
    predicted: clamp(currentRetention * Math.exp(-forgettingRate * d), 0, 100),
    label: d === 0 ? "Now" : `+${d}d`,
  }));
}

// ─── Recommended Revision Timing ─────────────────────────────
export function recommendRevisionDays(
  currentRetention: number,
  forgettingRate: number,
  personalThreshold = 60
): number {
  if (currentRetention <= personalThreshold) return 0; // Revise now
  // Solve: threshold = currentRetention * e^(-rate * t)
  const t = -Math.log(personalThreshold / currentRetention) / forgettingRate;
  return clamp(Math.floor(t), 0, 14);
}

// ─── Revision Effectiveness ──────────────────────────────────
export function calcRevisionEffectiveness(
  beforeScore: number,
  afterScore: number
): number {
  return clamp(((afterScore - beforeScore) / (100 - beforeScore)) * 100, 0, 100);
}

// ─── Overall Retention Score from Quiz ───────────────────────
export function quizToRetention(
  quizScore: number,
  daysSinceStudy: number,
  initialScore: number
): number {
  const dayFactor = Math.exp(-0.1 * daysSinceStudy);
  const base = quizScore * 0.7 + initialScore * 0.3 * dayFactor;
  return clamp(base, 0, 100);
}

// ─── Revision Description ─────────────────────────────────────
export function getRevisionReason(
  currentRetention: number,
  days: number,
  risk: string
): string {
  if (days === 0) return "Your retention is already below your personal stability threshold. Revise now.";
  if (risk === "HIGH") return `Predicted retention will fall critically within ${days} day${days > 1 ? "s" : ""}. Immediate revision recommended.`;
  if (risk === "MEDIUM") return `Model estimate: your retention will reach medium-risk zone in approximately ${days} day${days > 1 ? "s" : ""}.`;
  return `Retention looks stable. Predicted to remain healthy for approximately ${days} more day${days > 1 ? "s" : ""}.`;
}
