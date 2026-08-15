import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Zap, ArrowRight, Check } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { RetentionStore, StudyStore, QuizStore } from "@/lib/storage";
import { getQuizQuestions, scoreQuiz } from "@/lib/quizData";
import { quizToRetention } from "@/lib/retention";
import type { QuizAttempt, RetentionRecord, QuizQuestion } from "@/types";
import { generateId, getRiskLevel, round, cn, getRiskColor } from "@/lib/utils";
import RetentionBadge from "@/components/features/RetentionBadge";
import { toast } from "sonner";

type Phase = "select" | "ready" | "quiz" | "done";

export default function RecoveryMode() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedRec, setSelectedRec] = useState<RetentionRecord | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [beforeScore, setBeforeScore] = useState(0);
  const [afterScore, setAfterScore] = useState(0);
  const [startTime] = useState(Date.now());

  const riskTopics = useMemo(() => {
    if (!user) return [];
    return RetentionStore.getByUser(user.id)
      .filter(r => r.forgettingRisk !== "LOW")
      .sort((a, b) => a.retentionScore - b.retentionScore);
  }, [user]);

  if (!user) return null;

  const startRecovery = (rec: RetentionRecord) => {
    setSelectedRec(rec);
    const qs = getQuizQuestions(rec.topic, 5);
    setQuestions(qs);
    setBeforeScore(rec.retentionScore);
    setPhase("ready");
  };

  const beginQuiz = () => setPhase("quiz");

  const handleSelect = (idx: number) => {
    if (confirmed) return;
    setSelected(idx);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setConfirmed(true);
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1);
        setSelected(null);
        setConfirmed(false);
      } else {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const scored = scoreQuiz(questions, newAnswers);
        const retention = quizToRetention(scored.score, 0, beforeScore);
        setAfterScore(round(retention));

        if (user && selectedRec) {
          const attempt: QuizAttempt = {
            id: generateId(),
            userId: user.id,
            sessionId: selectedRec.sessionId,
            topic: selectedRec.topic,
            subject: selectedRec.subject,
            questions,
            answers: newAnswers,
            score: scored.score,
            accuracy: scored.accuracy,
            timeTaken,
            difficulty: "Medium",
            daysAfterStudy: selectedRec.daysSinceStudy,
            completedAt: new Date().toISOString(),
            isDemo: false,
          };
          QuizStore.save(attempt);

          const updated: RetentionRecord = {
            ...selectedRec,
            id: generateId(),
            retentionScore: round(retention),
            forgettingRisk: getRiskLevel(retention),
            daysSinceStudy: 0,
            recordedAt: new Date().toISOString(),
          };
          RetentionStore.save(updated);
          toast.success("Memory updated after recovery session!");
        }
        setPhase("done");
      }
    }, 600);
  };

  if (phase === "select") {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <RefreshCw className="w-6 h-6 text-brand-primary-light" />
            <h1 className="text-2xl font-bold text-text-primary">Recovery Mode</h1>
          </div>
          <p className="text-text-secondary text-sm">Focus-recovery sessions for your weakest memories. Short, targeted, effective.</p>
        </div>

        {riskTopics.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <Check className="w-12 h-12 text-status-success mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">All topics look stable!</h2>
            <p className="text-text-secondary mb-6">No high or medium risk topics detected.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="section-heading">Topics Needing Recovery</h2>
            {riskTopics.map(rec => (
              <div key={rec.id} className={cn(
                "glass-elevated rounded-2xl p-5 border transition-all hover:border-brand-primary/30",
                rec.forgettingRisk === "HIGH" ? "border-status-danger/20" : "border-status-warning/20"
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-text-primary">{rec.topic}</h3>
                    <p className="text-sm text-text-muted">{rec.subject}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-xl font-bold" style={{ color: getRiskColor(rec.forgettingRisk) }}>
                        {rec.retentionScore}%
                      </div>
                      <RetentionBadge risk={rec.forgettingRisk} size="sm" />
                    </div>
                    <button onClick={() => startRecovery(rec)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
                      <Zap className="w-4 h-4" /> Recover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (phase === "ready" && selectedRec) {
    const riskColor = getRiskColor(selectedRec.forgettingRisk);
    return (
      <div className="p-6 lg:p-8 max-w-lg mx-auto flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-pulse-slow"
          style={{ background: `${riskColor}15`, border: `2px solid ${riskColor}50` }}>
          <span className="font-mono font-black text-3xl" style={{ color: riskColor }}>{selectedRec.retentionScore}%</span>
        </div>
        <h2 className="text-3xl font-black gradient-text mb-2">MEMORY RECOVERY</h2>
        <h3 className="text-xl font-bold text-text-primary mb-2">{selectedRec.topic}</h3>
        <RetentionBadge risk={selectedRec.forgettingRisk} size="lg" />
        <div className="glass-elevated rounded-2xl p-6 w-full my-6 text-left">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="font-mono text-xl font-bold text-status-danger">{selectedRec.retentionScore}%</div><div className="stat-label">Current</div></div>
            <div><div className="font-mono text-xl font-bold text-status-warning">5</div><div className="stat-label">Questions</div></div>
            <div><div className="font-mono text-xl font-bold text-brand-secondary">~5 min</div><div className="stat-label">Session</div></div>
          </div>
        </div>
        <button onClick={beginQuiz} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base shadow-glow-primary">
          <RefreshCw className="w-5 h-5" /> START RECOVERY
        </button>
      </div>
    );
  }

  if (phase === "quiz" && selectedRec && questions.length > 0) {
    const q = questions[current];
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest">Recovery Mode</p>
              <h2 className="font-semibold text-text-primary">{selectedRec.topic}</h2>
            </div>
            <span className="text-text-secondary text-sm">{current + 1}/{questions.length}</span>
          </div>
          <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div className="h-full bg-status-danger rounded-full transition-all duration-500" style={{ width: `${(current / questions.length) * 100}%` }} />
          </div>
        </div>
        <div className="glass-elevated rounded-2xl p-6 mb-4">
          <p className="text-text-primary font-medium leading-relaxed mb-6">{q.text}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              let cls = "border-border-default text-text-secondary hover:border-brand-primary/40 hover:text-text-primary";
              if (confirmed) {
                if (i === q.correctIndex) cls = "border-status-success/50 bg-status-success/10 text-status-success";
                else if (i === selected) cls = "border-status-danger/50 bg-status-danger/10 text-status-danger";
              } else if (i === selected) {
                cls = "border-brand-primary/60 bg-brand-primary/10 text-brand-primary-light";
              }
              return (
                <button key={i} onClick={() => handleSelect(i)} disabled={confirmed}
                  className={cn("w-full text-left px-4 py-3 rounded-xl border text-sm transition-all", cls)}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={handleConfirm} disabled={selected === null || confirmed}
          className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed">
          {confirmed ? (current + 1 < questions.length ? "Next" : "Finish") : "Confirm"}
        </button>
      </div>
    );
  }

  if (phase === "done") {
    const improved = afterScore > beforeScore;
    const delta = afterScore - beforeScore;
    return (
      <div className="p-6 lg:p-8 max-w-lg mx-auto flex flex-col items-center text-center">
        <div className="flex items-center gap-6 mb-8">
          <div className="text-center">
            <div className="font-mono text-3xl font-black text-status-danger">{beforeScore}%</div>
            <div className="stat-label mt-1">Before</div>
          </div>
          <ArrowRight className="w-8 h-8 text-text-muted" />
          <div className="text-center">
            <div className="font-mono text-3xl font-black text-status-success">{afterScore}%</div>
            <div className="stat-label mt-1">After</div>
          </div>
        </div>
        <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-4",
          improved ? "bg-status-success/10 border-2 border-status-success/50" : "bg-status-warning/10 border-2 border-status-warning/50")}>
          <span className="font-mono font-black text-xl" style={{ color: improved ? "#10B981" : "#F59E0B" }}>
            {improved ? `+${delta}` : delta}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {improved ? "Memory Restored!" : "Keep Practicing"}
        </h2>
        <p className="text-text-secondary mb-6 text-sm">
          {improved
            ? `Your retention improved from ${beforeScore}% to ${afterScore}%. The memory node has been updated.`
            : `Retention stayed at ${afterScore}%. Consider reviewing the study material again.`}
        </p>
        <div className="flex gap-3 w-full">
          <button onClick={() => { setPhase("select"); setCurrent(0); setAnswers([]); setSelected(null); }}
            className="btn-secondary flex-1">New Recovery</button>
          <button onClick={() => navigate("/landscape")} className="btn-primary flex-1 flex items-center justify-center gap-2">
            Memory Landscape <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
