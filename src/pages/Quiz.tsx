import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, X, Clock, ChevronRight, ArrowRight } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { StudyStore, QuizStore, RetentionStore, MLStore } from "@/lib/storage";
import { getQuizQuestions, scoreQuiz } from "@/lib/quizData";
import { quizToRetention } from "@/lib/retention";
import type { QuizAttempt, QuizQuestion, RetentionRecord } from "@/types";
import { generateId, getRiskLevel, cn, round } from "@/lib/utils";
import { toast } from "sonner";

export default function Quiz() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("sessionId") ?? "";
  const quizType = params.get("type") ?? "initial";

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [startTime] = useState(Date.now());
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof scoreQuiz> | null>(null);
  const [retentionScore, setRetentionScore] = useState(0);

  const session = StudyStore.getById(sessionId);
  const topic = session?.topic ?? "General";

  useEffect(() => {
    const qs = getQuizQuestions(topic, 5);
    setQuestions(qs);
  }, [topic]);

  const handleSelect = useCallback((idx: number) => {
    if (confirmed) return;
    setSelected(idx);
  }, [confirmed]);

  const handleConfirm = useCallback(() => {
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
        // Finish
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const scored = scoreQuiz(questions, newAnswers);
        const daysSinceStudy = 0;
        const retention = quizToRetention(scored.score, daysSinceStudy, session?.initialScore ?? 70);
        const risk = getRiskLevel(retention);

        if (user && session) {
          const attempt: QuizAttempt = {
            id: generateId(),
            userId: user.id,
            sessionId,
            topic,
            subject: session.subject,
            questions,
            answers: newAnswers,
            score: scored.score,
            accuracy: scored.accuracy,
            timeTaken,
            difficulty: session.difficulty,
            daysAfterStudy: daysSinceStudy,
            completedAt: new Date().toISOString(),
            isDemo: false,
          };
          QuizStore.save(attempt);

          const retRecord: RetentionRecord = {
            id: generateId(),
            userId: user.id,
            sessionId,
            topic,
            subject: session.subject,
            retentionScore: round(retention),
            forgettingRisk: risk,
            daysSinceStudy,
            recordedAt: new Date().toISOString(),
            isDemo: false,
          };
          RetentionStore.save(retRecord);

          // Update ML dataset
          const mlData = MLStore.getByUser(user.id);
          const existing = mlData.find(d => d.topic === topic && d.studentId === user.id && d.daysSinceStudy === 0);
          if (existing) {
            existing.quizScore = scored.score;
            existing.quizAccuracy = scored.accuracy;
            existing.quizTime = timeTaken;
            existing.retentionScore = round(retention);
            MLStore.setAll([...mlData.filter(d => d !== existing), existing]);
          }
        }

        setResult(scored);
        setRetentionScore(round(retention));
        setDone(true);
      }
    }, 600);
  }, [selected, answers, current, questions, startTime, user, session, sessionId, topic]);

  if (!user || questions.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
    </div>
  );

  if (done && result) {
    const risk = getRiskLevel(retentionScore);
    return (
      <div className="p-6 lg:p-8 max-w-lg mx-auto flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{
          background: risk === "LOW" ? "rgba(16,185,129,0.1)" : risk === "MEDIUM" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
          border: `2px solid ${risk === "LOW" ? "#10B981" : risk === "MEDIUM" ? "#F59E0B" : "#EF4444"}`,
        }}>
          <span className="font-mono font-black text-2xl" style={{ color: risk === "LOW" ? "#10B981" : risk === "MEDIUM" ? "#F59E0B" : "#EF4444" }}>
            {result.score}%
          </span>
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Quiz Complete</h2>
        <p className="text-text-secondary mb-6">
          {result.correct}/{result.total} correct · Initial retention: <span className="font-mono font-bold text-text-primary">{retentionScore}%</span>
        </p>
        <div className="glass-elevated rounded-2xl p-6 w-full mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="font-mono text-xl font-bold text-text-primary">{result.score}%</div><div className="stat-label">Score</div></div>
            <div><div className="font-mono text-xl font-bold text-text-primary">{result.correct}/{result.total}</div><div className="stat-label">Correct</div></div>
            <div>
              <div className="font-bold text-xl" style={{ color: risk === "LOW" ? "#10B981" : risk === "MEDIUM" ? "#F59E0B" : "#EF4444" }}>{risk}</div>
              <div className="stat-label">Risk</div>
            </div>
          </div>
          {risk !== "LOW" && (
            <div className="mt-4 p-3 rounded-xl bg-status-warning/5 border border-status-warning/20 text-sm text-text-secondary">
              MEMORA will predict your forgetting curve and recommend a revision time based on this quiz result.
            </div>
          )}
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={() => navigate("/dashboard")} className="btn-secondary flex-1">
            Dashboard
          </button>
          <button onClick={() => navigate("/forecast")} className="btn-primary flex-1 flex items-center justify-center gap-2">
            View Forecast <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest">{quizType === "initial" ? "Initial Assessment" : "Recall Quiz"}</p>
            <h2 className="font-semibold text-text-primary">{topic}</h2>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Clock className="w-4 h-4" />
            <span>{current + 1}/{questions.length}</span>
          </div>
        </div>
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div className="h-full bg-brand-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="glass-elevated rounded-2xl p-6 mb-4">
        <div className="flex items-start gap-3 mb-6">
          <span className="w-7 h-7 rounded-lg bg-brand-primary/20 flex items-center justify-center text-xs font-bold text-brand-primary-light shrink-0 mt-0.5">
            {current + 1}
          </span>
          <p className="text-text-primary font-medium leading-relaxed">{q.text}</p>
        </div>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let state: "default" | "selected" | "correct" | "wrong" = "default";
            if (confirmed) {
              if (i === q.correctIndex) state = "correct";
              else if (i === selected) state = "wrong";
            } else if (i === selected) {
              state = "selected";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={confirmed}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3",
                  state === "default" && "border-border-default text-text-secondary hover:border-brand-primary/40 hover:bg-brand-primary/5 hover:text-text-primary",
                  state === "selected" && "border-brand-primary/60 bg-brand-primary/10 text-brand-primary-light",
                  state === "correct" && "border-status-success/50 bg-status-success/10 text-status-success",
                  state === "wrong" && "border-status-danger/50 bg-status-danger/10 text-status-danger",
                )}
              >
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0",
                  state === "default" && "border-border-default",
                  state === "selected" && "border-brand-primary bg-brand-primary text-white",
                  state === "correct" && "border-status-success bg-status-success text-white",
                  state === "wrong" && "border-status-danger bg-status-danger text-white",
                )}>
                  {state === "correct" ? <Check className="w-3 h-3" /> : state === "wrong" ? <X className="w-3 h-3" /> : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={selected === null || confirmed}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {confirmed ? (
          current + 1 < questions.length ? "Next Question" : "View Results"
        ) : "Confirm Answer"}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
