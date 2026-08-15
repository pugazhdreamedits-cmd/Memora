import React, { useMemo, useState } from "react";
import { useRequireAuth } from "@/hooks/useAuth";
import SYLLABI from "@/data/syllabus";
import type { SubjectEntry, AIQuestionRequest, AIQuestion } from "@/types";
import { createAIProvider } from "@/lib/aiProvider";
import { QuizStore, MLStore, RetentionStore, StudyStore } from "@/lib/storage";
import { generateId, round } from "@/lib/utils";
import { quizToRetention, calcRevisionEffectiveness } from "@/lib/retention";
import { useNavigate } from "react-router-dom";

const provider = createAIProvider();

export default function QuestionLab() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  // Prefer the verified Pondicherry University syllabus when present
  // Prefer the Pondicherry University syllabus (official) whether or not it's marked verified,
  // so QuestionLab can operate on the extracted content immediately.
  const pondicherry = useMemo(() => SYLLABI.find(s => s.sourceName === 'Pondicherry University' && s.sourceType === 'official') ?? SYLLABI[0], []);
  const syllabus = useMemo(() => (pondicherry ? [pondicherry] : SYLLABI), [pondicherry]);
  const firstSubject = pondicherry?.subjects?.[0] ?? null;
  const [selectedSubject, setSelectedSubject] = useState<SubjectEntry | null>(firstSubject ?? null);
  const [selectedUnit, setSelectedUnit] = useState(firstSubject?.units?.[0]?.unit ?? "");
  const [selectedTopic, setSelectedTopic] = useState(firstSubject?.units?.[0]?.topics?.[0]?.title ?? "");
  const [difficulty, setDifficulty] = useState<"Easy"|"Medium"|"Hard">("Medium");
  const [qtype, setQtype] = useState<"MCQ"|"TrueFalse">("MCQ");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const subjects = syllabus.flatMap(s => s.subjects || []);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const req: AIQuestionRequest = {
        university: pondicherry.university,
        regulation: pondicherry.regulation,
        degree: pondicherry.degree,
        branch: pondicherry.branch ?? "CSE",
        semester: pondicherry.semester,
        subject: selectedSubject?.name ?? "",
        unit: selectedUnit,
        topic: selectedTopic,
        difficulty,
        questionType: qtype,
        count,
      };
      const qs = await provider.generateQuestions(req);
      setQuestions(qs);
    } catch (e) {
      console.error(e);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Simple quiz runner: support MCQ only for now
  const takeQuiz = () => {
    navigate('/question-lab/take', { state: { questions } });
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Question Lab</h1>
      <div className="glass-elevated rounded-2xl p-6 mb-6">
        <div className="mb-3 text-xs text-text-muted">
          {syllabus[0]?.sourceType === 'official' ? (
            <div>SOURCE · {syllabus[0].university} · Regulation {syllabus[0].regulation} · Verified syllabus</div>
          ) : (
            <div>DEMO DATA · Not an official syllabus source</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-secondary">Subject</label>
            <select value={selectedSubject?.name} onChange={e => {
              const s = subjects.find(x => x.name === e.target.value)!;
              setSelectedSubject(s);
              setSelectedUnit(s.units[0]?.unit ?? '');
              setSelectedTopic(s.units[0]?.topics[0]?.title ?? '');
            }} className="input-field w-full">
              {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-text-secondary">Unit</label>
            <select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)} className="input-field w-full">
              {selectedSubject?.units.map(u => <option key={u.id} value={u.unit}>{u.unit}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-text-secondary">Topic</label>
            <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} className="input-field w-full">
              {selectedSubject?.units.find(u => u.unit === selectedUnit)?.topics.map(t => <option key={t.id} value={t.title}>{t.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-text-secondary">Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="input-field w-full">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <label className="text-sm text-text-secondary">Question Type</label>
          <select value={qtype} onChange={e => setQtype(e.target.value as any)} className="input-field w-40">
            <option value="MCQ">MCQ</option>
            <option value="TrueFalse">True/False</option>
          </select>
          <label className="text-sm text-text-secondary">Count</label>
          <input type="number" value={count} onChange={e => setCount(parseInt(e.target.value||'5'))} className="input-field w-20" />
        </div>

        <div className="mt-6 flex gap-3">
          <button className="btn-primary" onClick={onGenerate} disabled={loading}>{loading? 'Generating…' : 'Generate Questions'}</button>
          <button className="btn-secondary" onClick={takeQuiz} disabled={questions.length === 0}>Take Quiz</button>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="glass-elevated rounded-2xl p-6">
          <h2 className="font-semibold mb-3">Preview</h2>
          <ol className="list-decimal list-inside space-y-3">
            {questions.map((q, i) => (
              <li key={q.id}>
                <div className="font-medium">{q.question}</div>
                {q.options && q.options.length > 0 && (
                  <div className="mt-1 text-sm text-text-secondary">
                    {q.options.map((o, j) => <div key={j}>• {o}</div>)}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
