import React, { useMemo } from "react";
import { User, Mail, Calendar, BookOpen } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { ProfileStore, StudyStore, RetentionStore } from "@/lib/storage";
import { buildMemoryProfile } from "@/lib/memoryProfile";
import { formatDate, round } from "@/lib/utils";
import RadarDNA from "@/components/features/RadarDNA";

export default function Profile() {
  const { user } = useRequireAuth();

  const { profile, memProf, stats } = useMemo(() => {
    if (!user) return { profile: null, memProf: null, stats: {} };
    const p = ProfileStore.getByUser(user.id);
    const mp = buildMemoryProfile(user.id);
    const sessions = StudyStore.getByUser(user.id);
    const retention = RetentionStore.getByUser(user.id);
    return {
      profile: p,
      memProf: mp,
      stats: {
        sessions: sessions.length,
        avgRetention: round(retention.length > 0 ? retention.reduce((a, b) => a + b.retentionScore, 0) / retention.length : 0),
        subjects: [...new Set(sessions.map(s => s.subject))].length,
        topics: [...new Set(sessions.map(s => s.topic))].length,
      },
    };
  }, [user]);

  if (!user) return null;

  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
        <p className="text-text-secondary text-sm">Your account details and learning preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-elevated rounded-2xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-primary/20 border-2 border-brand-primary/30 flex items-center justify-center text-2xl font-black text-brand-primary-light mx-auto mb-4">
              {initials}
            </div>
            <h2 className="font-bold text-xl text-text-primary">{user.name}</h2>
            <p className="text-text-muted text-sm mt-1">{user.email}</p>
            {profile && (
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs text-brand-primary-light font-medium">
                {profile.academicLevel}
              </div>
            )}
          </div>

          <div className="glass-elevated rounded-2xl p-6">
            <h3 className="section-heading mb-4">Account</h3>
            <div className="space-y-3">
              {[
                { icon: User, label: "Name", value: user.name },
                { icon: Mail, label: "Email", value: user.email },
                { icon: Calendar, label: "Member since", value: formatDate(user.createdAt) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <Icon className="w-4 h-4 text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">{label}</p>
                    <p className="text-text-primary font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {profile && (
            <div className="glass-elevated rounded-2xl p-6">
              <h3 className="section-heading mb-4">Learning Profile</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-text-muted">Age Range</span><span className="text-text-primary">{profile.age}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Study Duration</span><span className="text-text-primary">{profile.preferredStudyDuration}min</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Learning Difficulty</span><span className="text-text-primary">{profile.learningDifficulty}/5</span></div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-text-muted mb-2">Subjects</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.subjects.map(s => (
                    <span key={s} className="px-2 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-xs text-brand-primary-light">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats + DNA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-elevated rounded-2xl p-6">
            <h3 className="section-heading mb-4">Your Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Sessions", value: stats.sessions ?? 0, color: "#6366F1" },
                { label: "Avg Retention", value: `${stats.avgRetention ?? 0}%`, color: "#10B981" },
                { label: "Subjects", value: stats.subjects ?? 0, color: "#22D3EE" },
                { label: "Topics", value: stats.topics ?? 0, color: "#F59E0B" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-bg-base/50 border border-border-subtle">
                  <div className="font-mono text-2xl font-bold" style={{ color }}>{value}</div>
                  <div className="stat-label mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {memProf && memProf.topicProfiles.length > 0 && (
            <div className="glass-elevated rounded-2xl p-6">
              <h3 className="section-heading mb-2">Memory DNA Profile</h3>
              <p className="text-xs text-text-muted mb-4">Your unique memory fingerprint based on collected session data.</p>
              <RadarDNA profile={memProf} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
