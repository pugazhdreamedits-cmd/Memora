import React, { useState, useMemo } from "react";
import { Clock, Filter, BookOpen, CheckCircle, TrendingDown } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { StudyStore, QuizStore, RetentionStore } from "@/lib/storage";
import RetentionBadge from "@/components/features/RetentionBadge";
import { formatDateTime, round, timeAgo, cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function History() {
  const { user } = useRequireAuth();
  const [filter, setFilter] = useState<"all" | "sessions" | "quizzes">("all");
  const [search, setSearch] = useState("");

  const { sessions, quizzes, retention } = useMemo(() => {
    if (!user) return { sessions: [], quizzes: [], retention: [] };
    return {
      sessions: StudyStore.getByUser(user.id).reverse(),
      quizzes: QuizStore.getByUser(user.id).reverse(),
      retention: RetentionStore.getByUser(user.id),
    };
  }, [user]);

  if (!user) return null;

  const combined = [
    ...sessions.map(s => ({ type: "session" as const, date: s.studiedAt, data: s })),
    ...quizzes.map(q => ({ type: "quiz" as const, date: q.completedAt, data: q })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = combined
    .filter(item => filter === "all" || (filter === "sessions" ? item.type === "session" : item.type === "quiz"))
    .filter(item => {
      if (!search) return true;
      const text = item.type === "session"
        ? `${(item.data as any).topic} ${(item.data as any).subject}`
        : `${(item.data as any).topic} ${(item.data as any).subject}`;
      return text.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Clock className="w-6 h-6 text-brand-primary-light" />
          <h1 className="text-2xl font-bold text-text-primary">History</h1>
        </div>
        <p className="text-text-secondary text-sm">All your study sessions, quizzes, and retention records.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Sessions", value: sessions.length, icon: BookOpen },
          { label: "Quizzes", value: quizzes.length, icon: CheckCircle },
          { label: "Retention Records", value: retention.length, icon: TrendingDown },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-elevated rounded-xl p-4 text-center">
            <Icon className="w-5 h-5 text-brand-primary-light mx-auto mb-2" />
            <div className="font-mono text-2xl font-bold text-text-primary">{value}</div>
            <div className="stat-label mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex rounded-xl bg-bg-surface p-1">
          {(["all", "sessions", "quizzes"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                filter === f ? "bg-brand-primary text-white" : "text-text-secondary hover:text-text-primary")}>
              {f}
            </button>
          ))}
        </div>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search topic or subject…"
          className="input-field flex-1"
        />
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No records found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            if (item.type === "session") {
              const s = item.data as any;
              const rec = retention.find(r => r.sessionId === s.id);
              return (
                <div key={i} className="glass-elevated rounded-xl p-4 flex items-center gap-4 hover:border-border-strong transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-brand-primary-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-text-primary">{s.topic}</p>
                      {s.isDemo && <span className="demo-badge">DEMO</span>}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{s.subject} · {s.studyMethod} · {s.studyDuration}min · {s.difficulty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {rec && <RetentionBadge risk={rec.forgettingRisk} size="sm" />}
                    <p className="text-xs text-text-muted mt-1">{timeAgo(s.studiedAt)}</p>
                  </div>
                </div>
              );
            } else {
              const q = item.data as any;
              return (
                <div key={i} className="glass-elevated rounded-xl p-4 flex items-center gap-4 hover:border-border-strong transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-text-primary">{q.topic}</p>
                      {q.isDemo && <span className="demo-badge">DEMO</span>}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {q.subject} · Quiz · Score: {q.score}% · {q.questions?.length ?? "?"} questions · {q.timeTaken}s
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm font-bold" style={{ color: q.score >= 80 ? "#10B981" : q.score >= 50 ? "#F59E0B" : "#EF4444" }}>
                      {q.score}%
                    </div>
                    <p className="text-xs text-text-muted mt-1">{timeAgo(q.completedAt)}</p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
