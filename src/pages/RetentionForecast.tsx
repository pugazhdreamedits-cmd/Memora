import React, { useState, useMemo } from "react";
import { TrendingDown, Calendar, AlertTriangle } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { RetentionStore, StudyStore, MLStore } from "@/lib/storage";
import { buildMemoryProfile } from "@/lib/memoryProfile";
import { predictRetention } from "@/lib/ml";
import { generateForecast, recommendRevisionDays, getRevisionReason } from "@/lib/retention";
import ForgettingCurveChart from "@/components/features/ForgettingCurveChart";
import RetentionBadge from "@/components/features/RetentionBadge";
import { round, getRiskLevel, cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function RetentionForecast() {
  const { user } = useRequireAuth();
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const { topics, topicData } = useMemo(() => {
    if (!user) return { topics: [], topicData: {} as Record<string, any> };
    const recs = RetentionStore.getByUser(user.id);
    const sessions = StudyStore.getByUser(user.id);
    const mlData = MLStore.getByUser(user.id);

    const topicMap: Record<string, any> = {};
    for (const rec of recs) {
      const session = sessions.find(s => s.id === rec.sessionId);
      if (!session) continue;
      const historical = mlData.filter(d => d.topic === rec.topic);
      const diffMap: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };
      const methodMap: Record<string, number> = { Reading: 0, Practice: 1, Video: 2, Notes: 3, Flashcards: 4, "Problem Solving": 5 };

      const prediction = predictRetention({
        studentId: user.id,
        subject: rec.subject,
        topic: rec.topic,
        studyDuration: session.studyDuration,
        difficulty: diffMap[session.difficulty] ?? 1,
        studyMethod: methodMap[session.studyMethod] ?? 0,
        initialScore: session.initialScore,
        revisionCount: session.revisionCount,
        daysSinceStudy: rec.daysSinceStudy,
        previousRetention: rec.retentionScore,
        quizScore: rec.retentionScore,
        quizAccuracy: rec.retentionScore / 100,
        quizTime: 200,
        retentionScore: rec.retentionScore,
        forgettingRisk: rec.retentionScore >= 80 ? 0 : rec.retentionScore >= 50 ? 1 : 2,
      }, historical);

      topicMap[rec.topic] = { rec, session, prediction };
    }

    const topicList = Object.keys(topicMap);
    if (!selectedTopic && topicList.length > 0) {
      // auto-select first
    }
    return { topics: topicList, topicData: topicMap };
  }, [user]);

  const activeTopic = selectedTopic || topics[0] || "";
  const data = topicData[activeTopic];

  if (!user) return null;

  if (topics.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <TrendingDown className="w-12 h-12 text-brand-primary-light mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">No forecast data yet.</h2>
        <p className="text-text-secondary max-w-md mb-6">Complete at least one study session and quiz to generate your retention forecast.</p>
        <Link to="/study" className="btn-primary">Start a Session</Link>
      </div>
    );
  }

  const chartData = data ? [
    { label: "Now", actual: data.rec.retentionScore, predicted: data.prediction.retentionNow },
    { label: "+1d", actual: null, predicted: data.prediction.retention1d },
    { label: "+3d", actual: null, predicted: data.prediction.retention3d },
    { label: "+7d", actual: null, predicted: data.prediction.retention7d },
    { label: "+14d", actual: null, predicted: data.prediction.retention14d },
  ] : [];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <TrendingDown className="w-6 h-6 text-brand-primary-light" />
          <h1 className="text-2xl font-bold text-text-primary">Retention Forecast</h1>
        </div>
        <p className="text-text-secondary text-sm">Predicted memory decay based on your personal retention model. These are model estimates.</p>
      </div>

      {/* Topic Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {topics.map(t => (
          <button key={t} onClick={() => setSelectedTopic(t)}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium border transition-all",
              (activeTopic === t) ? "bg-brand-primary/20 border-brand-primary/50 text-brand-primary-light" :
              "border-border-default text-text-secondary hover:border-border-strong")}>
            {t}
          </button>
        ))}
      </div>

      {data && (
        <div className="space-y-6">
          {/* Forecast Numbers */}
          <div className="glass-elevated rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-text-primary">{activeTopic}</h2>
                <p className="text-sm text-text-muted">{data.rec.subject}</p>
              </div>
              <div className="flex items-center gap-3">
                <RetentionBadge risk={data.prediction.forgettingRisk} />
                <span className="text-xs text-text-muted">via {data.prediction.modelUsed}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Current", value: data.prediction.retentionNow, day: "Now" },
                { label: "+1 Day", value: data.prediction.retention1d, day: "+1d" },
                { label: "+3 Days", value: data.prediction.retention3d, day: "+3d" },
                { label: "+7 Days", value: data.prediction.retention7d, day: "+7d" },
                { label: "+14 Days", value: data.prediction.retention14d, day: "+14d" },
              ].map(({ label, value, day }) => {
                const risk = getRiskLevel(value);
                const colors = { LOW: "#10B981", MEDIUM: "#F59E0B", HIGH: "#EF4444" };
                return (
                  <div key={day} className="text-center p-3 rounded-xl bg-bg-base/50 border border-border-subtle">
                    <div className="font-mono text-xl font-bold" style={{ color: colors[risk] }}>{round(value)}%</div>
                    <div className="text-xs text-text-muted mt-1">{label}</div>
                  </div>
                );
              })}
            </div>

            <ForgettingCurveChart data={chartData} />
          </div>

          {/* Recommendation */}
          <div className={cn("glass-elevated rounded-2xl p-6 border",
            data.prediction.forgettingRisk === "HIGH" ? "border-status-danger/30 bg-status-danger/5" :
            data.prediction.forgettingRisk === "MEDIUM" ? "border-status-warning/30 bg-status-warning/5" :
            "border-status-success/30 bg-status-success/5"
          )}>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 mt-0.5 shrink-0" style={{
                color: data.prediction.forgettingRisk === "HIGH" ? "#EF4444" :
                       data.prediction.forgettingRisk === "MEDIUM" ? "#F59E0B" : "#10B981"
              }} />
              <div>
                <h3 className="font-semibold text-text-primary mb-1">
                  {data.prediction.recommendedRevisionDays === 0
                    ? "Revise Now — Below Stability Threshold"
                    : `Recommended revision within ${data.prediction.recommendedRevisionDays} day${data.prediction.recommendedRevisionDays > 1 ? "s" : ""}`}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {getRevisionReason(data.prediction.retentionNow, data.prediction.recommendedRevisionDays, data.prediction.forgettingRisk)}
                </p>
                <p className="text-xs text-text-muted mt-2">
                  Model confidence: {(data.prediction.confidence * 100).toFixed(0)}% · This is a model estimate, not a guaranteed outcome.
                </p>
              </div>
            </div>
          </div>

          {/* Insights */}
          {data.prediction.insights.length > 0 && (
            <div className="glass-elevated rounded-2xl p-6">
              <h2 className="section-heading mb-4">Model Insights</h2>
              <div className="space-y-3">
                {data.prediction.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                    <span className="text-brand-primary-light text-xs font-bold mt-0.5">→</span>
                    <p className="text-sm text-text-secondary">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to="/recovery" className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            Start Recovery Session for {activeTopic}
          </Link>
        </div>
      )}
    </div>
  );
}
