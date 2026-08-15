import React, { useMemo } from "react";
import { Lightbulb, BookOpen } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { RetentionStore, StudyStore, MLStore } from "@/lib/storage";
import { buildMemoryProfile } from "@/lib/memoryProfile";
import { round, timeAgo } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Insight {
  type: "positive" | "warning" | "info";
  title: string;
  body: string;
  source: string;
}

function generateInsights(userId: string): Insight[] {
  const retention = RetentionStore.getByUser(userId);
  const sessions = StudyStore.getByUser(userId);
  const ml = MLStore.getByUser(userId);
  const profile = buildMemoryProfile(userId);

  if (retention.length < 2) {
    return [{
      type: "info",
      title: "Not enough data yet",
      body: "Complete more recall sessions to unlock personalized insights. MEMORA needs at least 2 sessions to detect patterns.",
      source: "System",
    }];
  }

  const insights: Insight[] = [];
  const avg = profile.averageRetention;

  // Strong topics
  const strong = retention.filter(r => r.retentionScore >= 80);
  const weak = retention.filter(r => r.retentionScore < 50);

  if (strong.length > 0) {
    insights.push({
      type: "positive",
      title: `Strong retention in ${strong[0].topic}`,
      body: `Your retention of ${strong[0].topic} (${strong[0].retentionScore}%) is above your personal average of ${round(avg)}%. Keep it up.`,
      source: `Retention Record · ${timeAgo(strong[0].recordedAt)}`,
    });
  }

  if (weak.length > 0) {
    insights.push({
      type: "warning",
      title: `Rapid forgetting detected: ${weak[0].topic}`,
      body: `Your recent quiz performance suggests faster-than-average forgetting for ${weak[0].topic} (${weak[0].retentionScore}%). A recovery session is recommended.`,
      source: `Risk Analysis · ${timeAgo(weak[0].recordedAt)}`,
    });
  }

  if (profile.revisionResponse > 70) {
    insights.push({
      type: "positive",
      title: "High revision response detected",
      body: `You respond strongly to revision sessions (score: ${round(profile.revisionResponse)}%). Short, frequent review sessions are particularly effective for you.`,
      source: "Memory DNA Analysis",
    });
  }

  const practiceSessions = sessions.filter(s => s.studyMethod === "Practice" || s.studyMethod === "Problem Solving");
  if (practiceSessions.length > 2) {
    const practiceRecs = retention.filter(r => practiceSessions.some(s => s.id === r.sessionId));
    const practiceAvg = practiceRecs.reduce((a, b) => a + b.retentionScore, 0) / (practiceRecs.length || 1);
    if (practiceAvg > avg + 8) {
      insights.push({
        type: "positive",
        title: "Practice-based learning works best for you",
        body: `Sessions using Practice or Problem Solving methods show ${round(practiceAvg - avg)}% higher retention than your average. Consider prioritizing active practice.`,
        source: "Study Method Analysis",
      });
    }
  }

  if (profile.consistency < 50) {
    insights.push({
      type: "warning",
      title: "Inconsistent retention pattern detected",
      body: `Your retention varies significantly across topics (consistency score: ${round(profile.consistency)}%). Focus extra attention on lower-retention subjects.`,
      source: "Consistency Analysis",
    });
  }

  const decayRate = profile.averageForgettingRate;
  if (decayRate > 0.8) {
    insights.push({
      type: "warning",
      title: "Your memory decays significantly after day 3",
      body: `Your estimated forgetting rate (${round(decayRate, 2)}/day) indicates rapid decay. MEMORA predicts revision within 3 days will preserve 60%+ retention for most topics.`,
      source: "Forgetting Rate Model",
    });
  }

  if (sessions.length >= 5 && profile.longTermRetention > 65) {
    insights.push({
      type: "positive",
      title: "Good long-term memory formation",
      body: `Your long-term retention score (${round(profile.longTermRetention)}%) suggests effective memory consolidation after spaced repetition.`,
      source: "Long-Term Analysis",
    });
  }

  insights.push({
    type: "info",
    title: "How MEMORA predicts your memory",
    body: `Your predictions use ${ml.length} data points. Input data → preprocessing → Random Forest model → retention probability → forgetting risk → recommendation. All estimates depend on available training data.`,
    source: "Model Transparency",
  });

  return insights.slice(0, 6);
}

export default function Insights() {
  const { user } = useRequireAuth();

  const insights = useMemo(() => {
    if (!user) return [];
    return generateInsights(user.id);
  }, [user]);

  if (!user) return null;

  const iconColors = { positive: "#10B981", warning: "#F59E0B", info: "#6366F1" };
  const bgColors = { positive: "bg-status-success/5 border-status-success/20", warning: "bg-status-warning/5 border-status-warning/20", info: "bg-brand-primary/5 border-brand-primary/20" };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Lightbulb className="w-6 h-6 text-brand-primary-light" />
          <h1 className="text-2xl font-bold text-text-primary">MEMORA Intelligence</h1>
        </div>
        <p className="text-text-secondary text-sm">
          Rule and model-based insights derived from your personal study data — not generic advice.
        </p>
      </div>

      <div className="space-y-4">
        {insights.map((ins, i) => (
          <div key={i} className={`glass-elevated rounded-2xl p-5 border ${bgColors[ins.type]}`}>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${iconColors[ins.type]}20` }}>
                <Lightbulb className="w-4 h-4" style={{ color: iconColors[ins.type] }} />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1.5">{ins.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{ins.body}</p>
                <p className="text-xs text-text-muted mt-2">{ins.source}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 glass-panel rounded-2xl p-6 border border-border-subtle">
        <h2 className="section-heading mb-3">How MEMORA Generates Insights</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {["Your study data", "→", "Pattern detection", "→", "Risk thresholds", "→", "ML model output", "→", "Rule-based insight engine", "→", "Personalized recommendations"].map((s, i) => (
            <span key={i} className={s === "→" ? "text-text-muted" : "px-2.5 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary-light font-medium"}>
              {s}
            </span>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-3">Insights are generated only when supported by your available data. All values are model estimates.</p>
      </div>
    </div>
  );
}
