import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, TrendingDown, RefreshCw, ArrowRight, Zap, Brain, Clock, Target } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { RetentionStore, StudyStore, MemoryProfileStore } from "@/lib/storage";
import { buildMemoryProfile } from "@/lib/memoryProfile";
import MemoryCore from "@/components/features/MemoryCore";
import TopicNode from "@/components/features/TopicNode";
import RetentionBadge from "@/components/features/RetentionBadge";
import { getRiskBgColor, timeAgo, round, cn } from "@/lib/utils";
import { useSimulatedDays } from "@/hooks/useSimulatedDays";

export default function Dashboard() {
  const { user } = useRequireAuth();
  const { offset } = useSimulatedDays();

  const { memoryProfile, retentionRecords, studySessions, hasData } = useMemo(() => {
    if (!user) return { memoryProfile: null, retentionRecords: [], studySessions: [], hasData: false };
    const rr = RetentionStore.getByUser(user.id);
    const ss = StudyStore.getByUser(user.id);
    let mp = MemoryProfileStore.getByUser(user.id);
    if (!mp || rr.length > 0) {
      mp = buildMemoryProfile(user.id);
      MemoryProfileStore.save(mp);
    }
    return { memoryProfile: mp, retentionRecords: rr, studySessions: ss, hasData: rr.length > 0 };
  }, [user, offset]);

  if (!user) return null;

  const avgRetention = memoryProfile?.averageRetention ?? 0;
  const overallRisk = avgRetention >= 80 ? "LOW" : avgRetention >= 50 ? "MEDIUM" : "HIGH";
  const highRiskTopics = memoryProfile?.topicProfiles.filter(t => t.forgettingRisk === "HIGH") ?? [];
  const recentSessions = studySessions.slice(-3).reverse();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back, <span className="gradient-text">{user.name.split(" ")[0]}</span>
          </h1>
          <p className="text-text-secondary mt-1">Your memory intelligence dashboard.</p>
        </div>
        <Link to="/study" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <BookOpen className="w-4 h-4" />
          New Study Session
        </Link>
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-6">
            <Brain className="w-10 h-10 text-brand-primary-light" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Your memory landscape is waiting.</h2>
          <p className="text-text-secondary max-w-md mb-6">
            Complete your first study session to begin building your personal memory profile.
          </p>
          <Link to="/study" className="btn-primary flex items-center gap-2">
            START FIRST SESSION <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Memory Core Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Memory Core */}
            <div className="lg:col-span-1 memora-card flex flex-col items-center">
              <h2 className="stat-label mb-4 self-start">MEMORY CORE</h2>
              <MemoryCore
                retention={avgRetention}
                risk={overallRisk}
                stability={memoryProfile?.retentionSpeed ?? 70}
                consistency={memoryProfile?.consistency ?? 65}
                size={200}
              />
              <div className="grid grid-cols-3 gap-4 mt-6 w-full">
                <div className="text-center">
                  <div className="font-mono text-lg font-bold text-text-primary">{round(avgRetention)}%</div>
                  <div className="text-xs text-text-muted mt-0.5 uppercase tracking-wide">Avg Retention</div>
                </div>
                <div className="text-center">
                  <RetentionBadge risk={overallRisk} size="sm" />
                  <div className="text-xs text-text-muted mt-1 uppercase tracking-wide">Risk</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-lg font-bold text-text-primary">{memoryProfile?.topicProfiles.length ?? 0}</div>
                  <div className="text-xs text-text-muted mt-0.5 uppercase tracking-wide">Topics</div>
                </div>
              </div>
            </div>

            {/* Memory Landscape Preview */}
            <div className="lg:col-span-2 memora-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="stat-label">MEMORY LANDSCAPE</h2>
                <Link to="/landscape" className="text-xs text-brand-primary-light hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {memoryProfile && memoryProfile.topicProfiles.length > 0 ? (
                <div className="flex flex-wrap gap-6 items-end justify-around py-4 min-h-[140px]">
                  {memoryProfile.topicProfiles.slice(0, 6).map(topic => (
                    <div key={topic.topic} className="flex flex-col items-center gap-2">
                      <TopicNode topic={topic} />
                      <div className="text-center">
                        <p className="text-xs font-medium text-text-primary max-w-[80px] truncate">{topic.topic}</p>
                        <p className="text-xs text-text-muted">{topic.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-text-muted text-sm">
                  No topics yet
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Sessions", value: studySessions.length, icon: BookOpen, color: "#6366F1" },
              { label: "Avg Forgetting Rate", value: `${round(memoryProfile?.averageForgettingRate ?? 0, 2)}/d`, icon: TrendingDown, color: "#F59E0B" },
              { label: "Revision Effectiveness", value: `${round(memoryProfile?.revisionEffectiveness ?? 0)}%`, icon: RefreshCw, color: "#10B981" },
              { label: "High Risk Topics", value: highRiskTopics.length, icon: Zap, color: "#EF4444" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="memora-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                </div>
                <div className="font-mono text-2xl font-bold text-text-primary">{value}</div>
                <div className="stat-label mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* High Risk Alert */}
          {highRiskTopics.length > 0 && (
            <div className="glass-panel rounded-xl p-4 border border-status-danger/20 bg-status-danger/5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-status-danger" />
                <h3 className="text-sm font-semibold text-status-danger">High Forgetting Risk — Revise Now</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {highRiskTopics.map(t => (
                  <Link key={t.topic} to="/recovery" className="px-3 py-1.5 rounded-lg bg-status-danger/10 border border-status-danger/20 text-sm text-status-danger hover:bg-status-danger/20 transition-colors">
                    {t.topic} · {t.retentionScore}%
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* DNA + Recent Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Memory DNA Quick View */}
            <div className="memora-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="stat-label">MEMORY DNA</h2>
                <Link to="/dna" className="text-xs text-brand-primary-light hover:underline flex items-center gap-1">
                  Full Profile <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Retention Speed", value: memoryProfile?.retentionSpeed ?? 0 },
                  { label: "Forgetting Resistance", value: 100 - (memoryProfile?.forgettingSpeed ?? 0) },
                  { label: "Revision Response", value: memoryProfile?.revisionResponse ?? 0 },
                  { label: "Long-Term Retention", value: memoryProfile?.longTermRetention ?? 0 },
                  { label: "Consistency", value: memoryProfile?.consistency ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-36 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${value}%`,
                          background: value >= 70 ? "#10B981" : value >= 45 ? "#F59E0B" : "#EF4444"
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs text-text-secondary w-8 text-right">{round(value)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="memora-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="stat-label">RECENT SESSIONS</h2>
                <Link to="/history" className="text-xs text-brand-primary-light hover:underline flex items-center gap-1">
                  All History <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentSessions.length > 0 ? recentSessions.map(session => {
                  const retention = retentionRecords.find(r => r.sessionId === session.id);
                  return (
                    <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated/50 hover:bg-bg-elevated transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-brand-primary-light" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{session.topic}</p>
                        <p className="text-xs text-text-muted">{session.subject} · {timeAgo(session.studiedAt)}</p>
                      </div>
                      {retention && <RetentionBadge risk={retention.forgettingRisk} size="sm" />}
                    </div>
                  );
                }) : (
                  <p className="text-sm text-text-muted py-4 text-center">No sessions yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Start Recovery", path: "/recovery", icon: RefreshCw, desc: "Revise high-risk topics" },
              { label: "View Forecast", path: "/forecast", icon: TrendingDown, desc: "Predict future retention" },
              { label: "Read Insights", path: "/insights", icon: Zap, desc: "AI-generated insights" },
              { label: "Analytics", path: "/analytics", icon: Target, desc: "Model performance" },
            ].map(({ label, path, icon: Icon, desc }) => (
              <Link key={path} to={path}
                className="memora-card flex flex-col items-start gap-2 hover:border-brand-primary/30 group">
                <Icon className="w-5 h-5 text-brand-primary-light group-hover:text-brand-secondary transition-colors" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">{label}</p>
                  <p className="text-xs text-text-muted">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
