// ============================================================
// MEMORA — Memory Profile Builder
// ============================================================

import type { MemoryProfile, TopicMemoryProfile } from "@/types";
import { RetentionStore, StudyStore } from "@/lib/storage";
import { getRiskLevel } from "@/lib/utils";
import { clamp, round } from "@/lib/utils";

export function buildMemoryProfile(userId: string): MemoryProfile {
  const retention = RetentionStore.getByUser(userId);
  const sessions = StudyStore.getByUser(userId);

  if (retention.length === 0) {
    return emptyProfile(userId);
  }

  const avgRetention = retention.reduce((s, r) => s + r.retentionScore, 0) / retention.length;

  // Estimate forgetting speed from decay across days
  const decays: number[] = retention
    .filter(r => r.daysSinceStudy > 0)
    .map(r => {
      const session = sessions.find(s => s.id === r.sessionId);
      if (!session) return 0.65;
      const initialScore = session.initialScore;
      return initialScore > 0 ? -Math.log(r.retentionScore / initialScore) / r.daysSinceStudy : 0.65;
    });

  const avgDecay = decays.length > 0 ? decays.reduce((a, b) => a + b, 0) / decays.length : 0.65;
  const forgettingSpeed = clamp((avgDecay / 2.0) * 100, 0, 100);

  // Revision response
  const revisedSessions = sessions.filter(s => s.revisionCount >= 2);
  const revisionEffect = revisedSessions.length > 0
    ? revisedSessions.reduce((s, sess) => {
        const r = retention.find(r => r.sessionId === sess.id);
        return s + (r ? r.retentionScore : 0);
      }, 0) / revisedSessions.length
    : avgRetention;

  // Long-term vs short-term
  const longTerm = retention.filter(r => r.daysSinceStudy >= 7).map(r => r.retentionScore);
  const shortTerm = retention.filter(r => r.daysSinceStudy < 7).map(r => r.retentionScore);

  const avgLT = longTerm.length > 0 ? longTerm.reduce((a, b) => a + b, 0) / longTerm.length : avgRetention;
  const avgST = shortTerm.length > 0 ? shortTerm.reduce((a, b) => a + b, 0) / shortTerm.length : avgRetention;

  // Consistency: stddev-based
  const variance = retention.reduce((s, r) => s + (r.retentionScore - avgRetention) ** 2, 0) / retention.length;
  const stdDev = Math.sqrt(variance);
  const consistency = clamp(100 - (stdDev / 50) * 100, 0, 100);

  // Topic profiles
  const topicMap = new Map<string, typeof retention>();
  for (const r of retention) {
    const key = `${r.topic}|${r.subject}`;
    if (!topicMap.has(key)) topicMap.set(key, []);
    topicMap.get(key)!.push(r);
  }

  const topicProfiles: TopicMemoryProfile[] = Array.from(topicMap.entries()).map(([key, records]) => {
    const [topic, subject] = key.split("|");
    const latest = records.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
    const session = sessions.find(s => s.id === latest.sessionId);
    const avgScore = records.reduce((s, r) => s + r.retentionScore, 0) / records.length;

    let trend: "improving" | "stable" | "declining" = "stable";
    if (records.length > 1) {
      const first = records[records.length - 1].retentionScore;
      const last = records[0].retentionScore;
      if (last > first + 5) trend = "improving";
      else if (last < first - 5) trend = "declining";
    }

    return {
      topic,
      subject,
      retentionScore: round(avgScore),
      forgettingRisk: getRiskLevel(avgScore),
      lastStudied: latest.recordedAt,
      sessionId: latest.sessionId,
      revisionCount: session?.revisionCount ?? 0,
      trend,
    };
  });

  return {
    userId,
    retentionSpeed: clamp(round((100 - forgettingSpeed) * 0.8 + avgRetention * 0.2), 0, 100),
    forgettingSpeed: round(forgettingSpeed),
    revisionResponse: clamp(round(revisionEffect), 0, 100),
    longTermRetention: clamp(round(avgLT), 0, 100),
    consistency: clamp(round(consistency), 0, 100),
    averageRetention: round(avgRetention),
    averageForgettingRate: round(avgDecay, 3),
    revisionEffectiveness: clamp(round((revisionEffect / avgRetention - 1) * 100 + 50), 0, 100),
    topicProfiles,
    updatedAt: new Date().toISOString(),
  };
}

function emptyProfile(userId: string): MemoryProfile {
  return {
    userId,
    retentionSpeed: 0,
    forgettingSpeed: 0,
    revisionResponse: 0,
    longTermRetention: 0,
    consistency: 0,
    averageRetention: 0,
    averageForgettingRate: 0,
    revisionEffectiveness: 0,
    topicProfiles: [],
    updatedAt: new Date().toISOString(),
  };
}
