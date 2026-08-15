import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, Check } from "lucide-react";
import { useRequireAuth } from "@/hooks/useAuth";
import { StudyStore, MLStore } from "@/lib/storage";
import type { StudySession, StudyMethod, Difficulty } from "@/types";
import { generateId, cn } from "@/lib/utils";
import { STUDY_METHODS, DIFFICULTIES, DEFAULT_SUBJECTS } from "@/constants";
import { toast } from "sonner";

const METHOD_MAP: Record<string, number> = { Reading: 0, Practice: 1, Video: 2, Notes: 3, Flashcards: 4, "Problem Solving": 5 };
const DIFF_MAP: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };

export default function StudySession() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject: "",
    topic: "",
    studyDuration: 30,
    difficulty: "Medium" as Difficulty,
    studyMethod: "Reading" as StudyMethod,
    initialScore: 70,
    revisionCount: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.topic) {
      toast.error("Please fill in subject and topic.");
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));

    const sessionId = generateId();
    const session: StudySession = {
      id: sessionId,
      userId: user.id,
      subject: form.subject.trim(),
      topic: form.topic.trim(),
      studyDuration: form.studyDuration,
      difficulty: form.difficulty,
      studyMethod: form.studyMethod,
      initialScore: form.initialScore,
      revisionCount: form.revisionCount,
      studiedAt: new Date().toISOString(),
      isDemo: false,
    };
    StudyStore.save(session);

    // Add to ML dataset
    MLStore.addPoint({
      studentId: user.id,
      subject: form.subject,
      topic: form.topic,
      studyDuration: form.studyDuration,
      difficulty: DIFF_MAP[form.difficulty],
      studyMethod: METHOD_MAP[form.studyMethod],
      initialScore: form.initialScore,
      revisionCount: form.revisionCount,
      daysSinceStudy: 0,
      previousRetention: form.initialScore,
      quizScore: 0,
      quizAccuracy: 0,
      quizTime: 0,
      retentionScore: form.initialScore,
      forgettingRisk: form.initialScore >= 80 ? 0 : form.initialScore >= 50 ? 1 : 2,
    });

    toast.success("Session logged! Starting initial quiz…");
    setSubmitting(false);
    navigate(`/quiz?sessionId=${sessionId}&type=initial`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-brand-primary-light" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">New Study Session</h1>
            <p className="text-text-secondary text-sm">Log what you studied to build your memory model.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject & Topic */}
        <div className="glass-elevated rounded-2xl p-6 space-y-4">
          <h2 className="section-heading">What did you study?</h2>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Subject</label>
            <input
              list="subjects-list"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. Computer Science"
              className="input-field" required
            />
            <datalist id="subjects-list">
              {DEFAULT_SUBJECTS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Topic</label>
            <input
              type="text" value={form.topic}
              onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              placeholder="e.g. Binary Search Trees"
              className="input-field" required
            />
          </div>
        </div>

        {/* Duration */}
        <div className="glass-elevated rounded-2xl p-6">
          <h2 className="section-heading mb-4">Study Duration</h2>
          <div className="flex items-center gap-4 mb-2">
            <input
              type="range" min={5} max={180} step={5} value={form.studyDuration}
              onChange={e => setForm(f => ({ ...f, studyDuration: parseInt(e.target.value) }))}
              className="flex-1 accent-brand-primary"
            />
            <span className="font-mono text-xl font-bold text-brand-primary-light w-20 text-right">
              {form.studyDuration}m
            </span>
          </div>
          <div className="flex justify-between text-xs text-text-muted"><span>5 min</span><span>3 hours</span></div>
        </div>

        {/* Difficulty */}
        <div className="glass-elevated rounded-2xl p-6">
          <h2 className="section-heading mb-4">Topic Difficulty</h2>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map(d => (
              <button type="button" key={d} onClick={() => setForm(f => ({ ...f, difficulty: d as Difficulty }))}
                className={cn(
                  "py-3 rounded-xl font-semibold text-sm border transition-all",
                  form.difficulty === d ? (
                    d === "Easy" ? "bg-status-success/20 border-status-success/50 text-status-success" :
                    d === "Medium" ? "bg-status-warning/20 border-status-warning/50 text-status-warning" :
                    "bg-status-danger/20 border-status-danger/50 text-status-danger"
                  ) : "border-border-default text-text-secondary hover:border-border-strong"
                )}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Study Method */}
        <div className="glass-elevated rounded-2xl p-6">
          <h2 className="section-heading mb-4">Study Method</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STUDY_METHODS.map(m => (
              <button type="button" key={m} onClick={() => setForm(f => ({ ...f, studyMethod: m as StudyMethod }))}
                className={cn(
                  "py-2.5 px-3 rounded-xl text-sm font-medium border transition-all text-left",
                  form.studyMethod === m
                    ? "bg-brand-primary/20 border-brand-primary/50 text-brand-primary-light"
                    : "border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary"
                )}>
                {form.studyMethod === m && <Check className="w-3 h-3 inline mr-1.5" />}
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Initial Score */}
        <div className="glass-elevated rounded-2xl p-6">
          <h2 className="section-heading mb-4">How well do you think you understood it?</h2>
          <div className="flex items-center gap-4 mb-2">
            <input
              type="range" min={0} max={100} step={5} value={form.initialScore}
              onChange={e => setForm(f => ({ ...f, initialScore: parseInt(e.target.value) }))}
              className="flex-1 accent-brand-primary"
            />
            <span className="font-mono text-xl font-bold text-brand-primary-light w-16 text-right">
              {form.initialScore}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-text-muted"><span>Nothing</span><span>Mastered</span></div>
        </div>

        {/* Revision Count */}
        <div className="glass-elevated rounded-2xl p-6">
          <h2 className="section-heading mb-4">How many times have you revised this topic before?</h2>
          <div className="flex gap-2 flex-wrap">
            {[0, 1, 2, 3, 4, "5+"].map(n => (
              <button type="button" key={n}
                onClick={() => setForm(f => ({ ...f, revisionCount: typeof n === "string" ? 5 : n }))}
                className={cn(
                  "w-12 h-12 rounded-xl font-bold border transition-all",
                  form.revisionCount === (typeof n === "string" ? 5 : n)
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "border-border-default text-text-secondary hover:border-border-strong"
                )}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60">
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Log Session & Take Initial Quiz <ChevronRight className="w-5 h-5" /></>
          )}
        </button>
      </form>
    </div>
  );
}
