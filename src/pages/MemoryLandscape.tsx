import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Map, RefreshCw, TrendingDown } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { MemoryProfileStore, RetentionStore } from "@/lib/storage";
import { buildMemoryProfile } from "@/lib/memoryProfile";
import TopicNode from "@/components/features/TopicNode";
import RetentionBadge from "@/components/features/RetentionBadge";
import type { TopicMemoryProfile } from "@/types";
import { timeAgo, round, getRiskColor } from "@/lib/utils";

export default function MemoryLandscape() {
  const { user } = useRequireAuth();
  const [selected, setSelected] = useState<TopicMemoryProfile | null>(null);

  const profile = useMemo(() => {
    if (!user) return null;
    let mp = MemoryProfileStore.getByUser(user.id);
    if (!mp) { mp = buildMemoryProfile(user.id); }
    return mp;
  }, [user]);

  if (!user) return null;

  const topics = profile?.topicProfiles ?? [];
  if (topics.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Map className="w-12 h-12 text-brand-primary-light mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Your memory landscape is waiting.</h2>
        <p className="text-text-secondary max-w-md mb-6">Complete your first study session to begin mapping your topics.</p>
        <Link to="/study" className="btn-primary">Start First Session</Link>
      </div>
    );
  }
  // Insufficient data state: topics exist but retention scores are all zero
  const insufficientData = topics.length > 0 && topics.every(t => (t.retentionScore ?? 0) <= 0);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Memory Landscape</h1>
        <p className="text-text-secondary text-sm">Each node represents a topic. Size and color indicate retention strength.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Landscape Canvas */}
        <div className="lg:col-span-2 glass-elevated rounded-2xl p-6 min-h-[420px] relative overflow-hidden">
          {/* Map area: positioned nodes within a responsive container */}
          <div className="w-full h-[420px] relative" aria-hidden={insufficientData}>
            {insufficientData && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <Map className="w-10 h-10 text-text-muted mb-3" />
                <h3 className="text-lg font-semibold text-text-primary">Memory map is forming</h3>
                <p className="text-text-secondary max-w-xs">We need more study and recall activity to visualize topic relationships. Complete sessions to populate your landscape.</p>
              </div>
            )}

            {!insufficientData && (
              <div className="absolute inset-0">
                {/* compute simple deterministic positions based on index + retention */}
                {topics.map((t, i) => {
                  const angle = (i / topics.length) * Math.PI * 2;
                  // radius scaled by retention (higher retention => closer to center)
                  const baseR = 90 + (Math.max(0, 100 - (t.retentionScore ?? 50)) * 0.9);
                  const cx = `calc(50% + ${Math.round(Math.cos(angle) * baseR)}px)`;
                  const cy = `calc(50% + ${Math.round(Math.sin(angle) * baseR)}px)`;
                  return (
                    <div key={t.topic} style={{ position: 'absolute', left: cx, top: cy, transform: 'translate(-50%, -50%)' }}>
                      <div className="flex flex-col items-center gap-2">
                        <TopicNode
                          topic={t}
                          onClick={() => setSelected(t)}
                          selected={selected?.topic === t.topic}
                        />
                        <div className="text-center">
                          <p className="text-xs font-semibold text-text-primary max-w-[120px] truncate" style={{ maxWidth: 120 }}>{t.topic}</p>
                          <p className="text-xs text-text-muted truncate max-w-[120px]">{t.subject}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Legend */}
          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-border-subtle flex flex-wrap gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-status-success" /> HIGH retention (80–100%)</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-status-warning" /> MEDIUM (50–79%)</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-status-danger" /> HIGH RISK (&lt;50%) · pulsing</div>
          </div>

        </div>

        {/* Detail Panel */}
        <div className="glass-elevated rounded-2xl p-6">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-text-primary">{selected.topic}</h3>
                  <p className="text-sm text-text-muted">{selected.subject}</p>
                </div>
                <RetentionBadge risk={selected.forgettingRisk} />
              </div>
              <div
                className="w-full h-2 rounded-full mb-6"
                style={{ background: `linear-gradient(to right, ${getRiskColor(selected.forgettingRisk)}, ${getRiskColor(selected.forgettingRisk)}40)` }}
              >
                <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                  style={{ width: `${selected.retentionScore}%` }} />
              </div>

              <div className="space-y-3">
                {[
                  { label: "Retention", value: `${round(selected.retentionScore)}%` },
                  { label: "Risk Level", value: selected.forgettingRisk },
                  { label: "Last Studied", value: timeAgo(selected.lastStudied) },
                  { label: "Revisions", value: selected.revisionCount },
                  { label: "Trend", value: selected.trend },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">{label}</span>
                    <span className="font-medium text-text-primary capitalize">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <Link to="/forecast" className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5">
                  <TrendingDown className="w-4 h-4" /> View Forecast
                </Link>
                {selected.forgettingRisk !== "LOW" && (
                  <Link to="/recovery" className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2.5">
                    <RefreshCw className="w-4 h-4" /> Start Recovery
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center">
              <Map className="w-10 h-10 text-text-muted mb-3" />
              <p className="text-text-secondary text-sm">Click a topic node to see its memory profile.</p>
            </div>
          )}
        </div>
      </div>

      {/* Topic Table */}
      <div className="mt-6 glass-elevated rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h2 className="section-heading">All Topics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                {["Topic", "Subject", "Retention", "Risk", "Last Studied", "Trend"].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs text-text-muted font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topics.map(t => (
                <tr key={t.topic} className="border-b border-border-subtle/50 hover:bg-bg-elevated/30 transition-colors cursor-pointer"
                  onClick={() => setSelected(t)}>
                  <td className="px-6 py-3 font-medium text-text-primary">{t.topic}</td>
                  <td className="px-6 py-3 text-text-secondary">{t.subject}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.retentionScore}%`, background: getRiskColor(t.forgettingRisk) }} />
                      </div>
                      <span className="font-mono">{round(t.retentionScore)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3"><RetentionBadge risk={t.forgettingRisk} size="sm" /></td>
                  <td className="px-6 py-3 text-text-muted">{timeAgo(t.lastStudied)}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs capitalize ${t.trend === "improving" ? "text-status-success" : t.trend === "declining" ? "text-status-danger" : "text-text-muted"}`}>
                      {t.trend === "improving" ? "↑" : t.trend === "declining" ? "↓" : "→"} {t.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
