import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useAuth";
import type { AIQuestion } from "@/types";
import { generateId } from "@/lib/utils";
import { QuizStore, MLStore, RetentionStore } from "@/lib/storage";
import { quizToRetention, calcRevisionEffectiveness } from "@/lib/retention";
import { getRiskLevel, round } from "@/lib/utils";

export default function QuestionLabTake() {
  const { user } = useRequireAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const state = (loc.state as any) || {};
  const questions: AIQuestion[] = state.questions || [];
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [start] = useState(Date.now());

  useEffect(() => {
    if (!user) navigate('/auth');
    if (questions.length === 0) navigate('/question-lab');
  }, [user, questions, navigate]);

  if (!user) return null;

  const q = questions[current];
  const select = (opt: string) => {
    setAnswers(a => { const na = [...a]; na[current] = opt; return na; });
    if (current + 1 < questions.length) setCurrent(c => c + 1);
    else finish();
  };

  const finish = () => {
    const timeTaken = Math.floor((Date.now() - start) / 1000);
    const correct = questions.reduce((s, qq, i) => s + ((qq.correctAnswer && answers[i] === qq.correctAnswer) ? 1 : 0), 0);
    const total = questions.length;
    const score = Math.round((correct / Math.max(1, total)) * 100);
    const accuracy = correct / Math.max(1, total);

    const attempt = {
      id: generateId(),
      userId: user.id,
      sessionId: `ql-${generateId()}`,
      topic: questions[0]?.topic ?? 'General',
      subject: questions[0]?.subject ?? 'General',
      questions: questions as any,
      answers: answers as any,
      score,
      accuracy,
      timeTaken,
      difficulty: "Medium",
      daysAfterStudy: 0,
      completedAt: new Date().toISOString(),
      isDemo: false,
    };
    QuizStore.save(attempt);

    // Update retention and ML dataset (simple integration)
    const retention = round(quizToRetention(score, 0, 70));
    const rec = {
      id: generateId(),
      userId: user.id,
      sessionId: attempt.sessionId,
      topic: attempt.topic,
      subject: attempt.subject,
      retentionScore: retention,
      forgettingRisk: getRiskLevel(retention),
      daysSinceStudy: 0,
      recordedAt: new Date().toISOString(),
      isDemo: false,
    };
    RetentionStore.save(rec);

    const mlPoint = {
      studentId: user.id,
      subject: attempt.subject,
      topic: attempt.topic,
      studyDuration: 30,
      difficulty: 1,
      studyMethod: 1,
      initialScore: 70,
      revisionCount: 0,
      daysSinceStudy: 0,
      previousRetention: retention,
      quizScore: score,
      quizAccuracy: accuracy,
      quizTime: timeTaken,
      retentionScore: retention,
      forgettingRisk: retention >= 80 ? 0 : retention >= 50 ? 1 : 2,
    };
    MLStore.addPoint(mlPoint as any);

    navigate('/quiz?result=generated');
  };

  if (!q) return <div className="p-6">No questions found.</div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Take Generated Quiz</h1>
      <div className="glass-elevated rounded-2xl p-6">
        <div className="mb-4">Question {current + 1}/{questions.length}</div>
        <div className="font-medium text-lg mb-4">{q.question}</div>
        {q.options && q.options.map(o => (
          <button key={o} onClick={() => select(o)} className="w-full text-left p-3 mb-2 rounded-lg border">{o}</button>
        ))}
      </div>
    </div>
  );
}
