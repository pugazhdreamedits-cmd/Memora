import React, { useMemo } from "react";
import { Lightbulb, Zap, Star, AlertTriangle, Activity, Repeat } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { RetentionStore, StudyStore, QuizStore, MLStore } from "@/lib/storage";
import { buildMemoryProfile } from "@/lib/memoryProfile";
import { round, timeAgo } from "@/lib/utils";

function NeuralSpark() {
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 200 100">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <g stroke="url(#g1)" strokeWidth="0.6" fill="none">
        <path d="M5 30 C40 10, 80 50, 120 30 S195 60, 200 40" />
        <path d="M0 70 C30 90, 70 40, 110 70 S185 40, 200 60" />
      </g>
    </svg>
  );
}

export default function InsightPanel() {
  const { user } = useRequireAuth();

  const { profile, retention, sessions, quizzes, ml } = useMemo(() => {
    if (!user) return { profile: null, retention: [], sessions: [], quizzes: [], ml: [] };
    const retention = RetentionStore.getByUser(user.id).filter(r => !r.isDemo);
    const sessions = StudyStore.getByUser(user.id).filter(s => !s.isDemo);
    const quizzes = QuizStore.getByUser(user.id).filter(q => !q.isDemo);
    const ml = MLStore.getByUser(user.id);
    const profile = buildMemoryProfile(user.id);
    return { profile, retention, sessions, quizzes, ml };
  }, [user]);

  if (!user) return null;

  const minRecords = 3;
  if (!retention || retention.length < minRecords) {
    return (
      <div className="relative glass-elevated rounded-2xl p-5 overflow-hidden" role="region" aria-label="MEMORA Intelligence">
        <NeuralSpark />
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-700/10 border border-violet-600/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">MEMORA needs more learning data to identify your personal patterns.</h3>
            <p className="text-xs text-text-muted mt-1">Complete a few study sessions and quizzes for tailored insights.</p>
          </div>
        </div>
      </div>
    );
  }

  const insights: Array<{ icon: any; title: string; subtitle: string; why?: string }> = [];

  // strongest topic
  if (profile && profile.topicProfiles.length > 0) {
    const strongest = profile.topicProfiles.slice().sort((a, b) => b.retentionScore - a.retentionScore)[0];
    const weakest = profile.topicProfiles.slice().sort((a, b) => a.retentionScore - b.retentionScore)[0];
    if (strongest && profile.topicProfiles.length >= 2) {
      insights.push({ icon: Star, title: `Strongest: ${strongest.topic}`, subtitle: `${strongest.retentionScore}% average`, why: `Last studied ${timeAgo(strongest.lastStudied)}` });
    }
    if (weakest && profile.topicProfiles.length >= 2) {
      insights.push({ icon: AlertTriangle, title: `Weakest: ${weakest.topic}`, subtitle: `${weakest.retentionScore}% average`, why: `Consider a recovery session for ${weakest.topic}` });
    }
  }

  // highest forgetting risk
  const highRisk = retention.slice().sort((a, b) => a.retentionScore - b.retentionScore)[0];
  if (highRisk && highRisk.retentionScore < 50) {
    insights.push({ icon: Zap, title: `High forgetting risk: ${highRisk.topic}`, subtitle: `${highRisk.retentionScore}%`, why: `Recorded ${timeAgo(highRisk.recordedAt)}` });
  }

  // recent improvement/decline
  if (profile) {
    const changing = profile.topicProfiles.filter(t => t.trend !== "stable");
    if (changing.length > 0) {
      const pick = changing[0];
      const verb = pick.trend === "improving" ? "Improving" : "Declining";
      insights.push({ icon: Activity, title: `${verb}: ${pick.topic}`, subtitle: `${pick.retentionScore}%`, why: `Trend detected across sessions` });
    }
  }

  // revision effectiveness
  if (profile && profile.revisionEffectiveness > 0) {
    insights.push({ icon: Repeat, title: `Revision effectiveness: ${round(profile.revisionEffectiveness)}%`, subtitle: `How much revisions boost retention`, why: `Based on sessions with multiple revisions` });
  }

  // study consistency
  if (profile) {
    insights.push({ icon: Lightbulb, title: `Study consistency: ${round(profile.consistency)}%`, subtitle: `Lower is more variable across topics`, why: `Calculated from retention variability` });
  }

  const shown = insights.slice(0, 4);

  return (
    <div className="relative glass-elevated rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-violet-900/10 to-cyan-900/6 border border-violet-700/20" role="region" aria-label="MEMORA Intelligence Panel">
      <NeuralSpark />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-700/10 border border-violet-600/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">MEMORA Intelligence</h3>
            <p className="text-xs text-text-muted">Personalized insights from your study and retention data</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shown.map((ins, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-800/3 to-cyan-800/3 border border-white/3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
              <ins.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-primary truncate">{ins.title}</p>
                <p className="text-xs text-text-muted ml-2">{ins.subtitle}</p>
              </div>
              {ins.why && <p className="text-xs text-text-muted mt-1 truncate">Why? {ins.why}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
