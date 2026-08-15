import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Dna, BookOpen, TrendingDown } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { MemoryProfileStore } from "@/lib/storage";
import { buildMemoryProfile } from "@/lib/memoryProfile";
import RadarDNA from "@/components/features/RadarDNA";
import { round, cn } from "@/lib/utils";

export default function MemoryDNA() {
  const { user } = useRequireAuth();

  const profile = useMemo(() => {
    if (!user) return null;
    return MemoryProfileStore.getByUser(user.id) ?? buildMemoryProfile(user.id);
  }, [user]);

  if (!user) return null;

  const hasData = (profile?.topicProfiles.length ?? 0) > 0;

  const dims = [
    { key: "retentionSpeed", label: "Retention Speed", desc: "How quickly you form strong memories after studying.", value: profile?.retentionSpeed ?? 0 },
    { key: "forgettingSpeed", label: "Forgetting Speed", desc: "Rate at which memories decay without revision.", value: profile?.forgettingSpeed ?? 0, invert: true },
    { key: "revisionResponse", label: "Revision Response", desc: "How much your retention improves after review sessions.", value: profile?.revisionResponse ?? 0 },
    { key: "longTermRetention", label: "Long-Term Retention", desc: "Average retention after 7+ days without revision.", value: profile?.longTermRetention ?? 0 },
    { key: "consistency", label: "Consistency", desc: "Uniformity of your retention across different topics.", value: profile?.consistency ?? 0 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Dna className="w-6 h-6 text-brand-primary-light" />
          <h1 className="text-2xl font-bold text-text-primary">Memory DNA</h1>
        </div>
        <p className="text-text-secondary text-sm">Your unique memory fingerprint, derived from your study behavior and quiz performance.</p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <Dna className="w-12 h-12 text-text-muted mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">YOUR MEMORY DNA IS STILL FORMING</h2>
          <p className="text-text-secondary max-w-md mb-6">Complete more study and recall sessions to reveal your personal pattern.</p>
          <Link to="/study" className="btn-primary">Start a Session</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="glass-elevated rounded-2xl p-6">
            <h2 className="section-heading mb-2">Radar Profile</h2>
            <p className="text-xs text-text-muted mb-4">Based on your completed sessions and recall checkpoints.</p>
            {profile && <RadarDNA profile={profile} />}
          </div>

          {/* Dimension Breakdown */}
          <div className="glass-elevated rounded-2xl p-6">
            <h2 className="section-heading mb-4">Dimension Breakdown</h2>
            <div className="space-y-5">
              {dims.map(({ label, desc, value, invert }) => {
                const display = invert ? 100 - value : value;
                const color = display >= 70 ? "#10B981" : display >= 45 ? "#F59E0B" : "#EF4444";
                return (
                  <div key={label}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{label}</p>
                        <p className="text-xs text-text-muted">{desc}</p>
                      </div>
                      <span className="font-mono text-sm font-bold ml-4 shrink-0" style={{ color }}>
                        {round(invert ? value : value)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-base overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${display}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="glass-elevated rounded-2xl p-6">
            <h2 className="section-heading mb-4">Key Memory Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Avg Retention", value: `${round(profile?.averageRetention ?? 0)}%`, color: "#6366F1" },
                { label: "Forgetting Rate", value: `${round(profile?.averageForgettingRate ?? 0, 3)}/day`, color: "#F59E0B" },
                { label: "Revision Effectiveness", value: `${round(profile?.revisionEffectiveness ?? 0)}%`, color: "#10B981" },
                { label: "Topics Tracked", value: profile?.topicProfiles.length ?? 0, color: "#22D3EE" },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-4 rounded-xl bg-bg-base/50 border border-border-subtle">
                  <div className="font-mono text-xl font-bold mb-1" style={{ color }}>{value}</div>
                  <div className="text-xs text-text-muted uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* What This Means */}
          <div className="glass-elevated rounded-2xl p-6">
            <h2 className="section-heading mb-4">What This Means</h2>
            <div className="space-y-3">
              {[
                profile && (profile.revisionResponse > 70)
                  ? "You respond strongly to revision sessions — consistent review significantly boosts your retention."
                  : "Your revision response is moderate. Consider more structured review sessions.",
                profile && (profile.forgettingSpeed > 60)
                  ? "Your forgetting rate is above average. Short, frequent revision sessions will serve you better than long, infrequent ones."
                  : "Your memory stability is good. You retain information well over time.",
                profile && (profile.consistency > 65)
                  ? "Your retention is consistent across topics — a sign of systematic study habits."
                  : "Your retention varies significantly across topics. Focus extra attention on weaker areas.",
              ].filter(Boolean).map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                  <span className="text-brand-primary-light text-xs mt-0.5 font-bold">→</span>
                  <p className="text-sm text-text-secondary leading-relaxed">{insight as string}</p>
                </div>
              ))}
              <p className="text-xs text-text-muted mt-2">
                * All metrics are model estimates based on your collected data. More sessions improve accuracy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
