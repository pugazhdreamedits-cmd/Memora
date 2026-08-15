// ============================================================
// MEMORA — Demo Data Seed
// All records labeled as DEMO DATA — not mixed with real data
// ============================================================

import type {
  User, StudentProfile, StudySession, QuizAttempt,
  RetentionRecord, MemoryProfile, MLDataPoint
} from "@/types";
import { DEMO_USER_ID, DEMO_USER_EMAIL, DEMO_USER_NAME, DEMO_PASSWORD } from "@/constants";
import { hashPassword } from "@/lib/utils";
import { UserStore, ProfileStore, StudyStore, QuizStore, RetentionStore, MemoryProfileStore, MLStore } from "@/lib/storage";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const DEMO_SESSIONS: StudySession[] = [
  { id: "demo-s-001", userId: DEMO_USER_ID, subject: "Computer Science", topic: "Python Lists", studyDuration: 45, difficulty: "Easy", studyMethod: "Practice", initialScore: 82, revisionCount: 2, studiedAt: daysAgo(14), isDemo: true },
  { id: "demo-s-002", userId: DEMO_USER_ID, subject: "Machine Learning", topic: "Linear Regression", studyDuration: 60, difficulty: "Medium", studyMethod: "Notes", initialScore: 74, revisionCount: 1, studiedAt: daysAgo(12), isDemo: true },
  { id: "demo-s-003", userId: DEMO_USER_ID, subject: "Computer Science", topic: "Binary Trees", studyDuration: 55, difficulty: "Hard", studyMethod: "Problem Solving", initialScore: 61, revisionCount: 1, studiedAt: daysAgo(10), isDemo: true },
  { id: "demo-s-004", userId: DEMO_USER_ID, subject: "Data Science", topic: "Pandas DataFrames", studyDuration: 40, difficulty: "Medium", studyMethod: "Practice", initialScore: 78, revisionCount: 2, studiedAt: daysAgo(8), isDemo: true },
  { id: "demo-s-005", userId: DEMO_USER_ID, subject: "Machine Learning", topic: "Neural Networks", studyDuration: 90, difficulty: "Hard", studyMethod: "Video", initialScore: 55, revisionCount: 0, studiedAt: daysAgo(7), isDemo: true },
  { id: "demo-s-006", userId: DEMO_USER_ID, subject: "Computer Science", topic: "Sorting Algorithms", studyDuration: 50, difficulty: "Medium", studyMethod: "Flashcards", initialScore: 80, revisionCount: 3, studiedAt: daysAgo(6), isDemo: true },
  { id: "demo-s-007", userId: DEMO_USER_ID, subject: "Data Science", topic: "Statistical Testing", studyDuration: 35, difficulty: "Hard", studyMethod: "Reading", initialScore: 58, revisionCount: 0, studiedAt: daysAgo(5), isDemo: true },
  { id: "demo-s-008", userId: DEMO_USER_ID, subject: "Machine Learning", topic: "Decision Trees", studyDuration: 65, difficulty: "Medium", studyMethod: "Problem Solving", initialScore: 71, revisionCount: 1, studiedAt: daysAgo(4), isDemo: true },
  { id: "demo-s-009", userId: DEMO_USER_ID, subject: "Computer Science", topic: "Operating Systems", studyDuration: 45, difficulty: "Hard", studyMethod: "Notes", initialScore: 47, revisionCount: 0, studiedAt: daysAgo(3), isDemo: true },
  { id: "demo-s-010", userId: DEMO_USER_ID, subject: "Data Science", topic: "Data Visualization", studyDuration: 30, difficulty: "Easy", studyMethod: "Practice", initialScore: 88, revisionCount: 1, studiedAt: daysAgo(2), isDemo: true },
];

const RETENTION_VALUES = [86, 71, 62, 78, 44, 83, 38, 68, 35, 91];

const DEMO_RETENTION: RetentionRecord[] = DEMO_SESSIONS.map((s, i) => ({
  id: `demo-r-${String(i + 1).padStart(3, "0")}`,
  userId: DEMO_USER_ID,
  sessionId: s.id,
  topic: s.topic,
  subject: s.subject,
  retentionScore: RETENTION_VALUES[i],
  forgettingRisk: RETENTION_VALUES[i] >= 80 ? "LOW" : RETENTION_VALUES[i] >= 50 ? "MEDIUM" : "HIGH",
  daysSinceStudy: Math.floor((Date.now() - new Date(s.studiedAt).getTime()) / 86400000),
  recordedAt: s.studiedAt,
  isDemo: true,
}));

const DEMO_MEMORY_PROFILE: MemoryProfile = {
  userId: DEMO_USER_ID,
  retentionSpeed: 72,
  forgettingSpeed: 58,
  revisionResponse: 81,
  longTermRetention: 65,
  consistency: 69,
  averageRetention: 65.6,
  averageForgettingRate: 0.72,
  revisionEffectiveness: 76,
  topicProfiles: DEMO_SESSIONS.map((s, i) => ({
    topic: s.topic,
    subject: s.subject,
    retentionScore: RETENTION_VALUES[i],
    forgettingRisk: RETENTION_VALUES[i] >= 80 ? "LOW" : RETENTION_VALUES[i] >= 50 ? "MEDIUM" : "HIGH",
    lastStudied: s.studiedAt,
    sessionId: s.id,
    revisionCount: s.revisionCount,
    trend: i < 3 ? "improving" : i < 6 ? "stable" : "declining",
  })),
  updatedAt: new Date().toISOString(),
};

const METHOD_MAP: Record<string, number> = {
  Reading: 0, Practice: 1, Video: 2, Notes: 3, Flashcards: 4, "Problem Solving": 5,
};
const DIFF_MAP: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };

const DEMO_ML_POINTS: MLDataPoint[] = DEMO_SESSIONS.map((s, i) => ({
  studentId: DEMO_USER_ID,
  subject: s.subject,
  topic: s.topic,
  studyDuration: s.studyDuration,
  difficulty: DIFF_MAP[s.difficulty],
  studyMethod: METHOD_MAP[s.studyMethod],
  initialScore: s.initialScore,
  revisionCount: s.revisionCount,
  daysSinceStudy: Math.floor((Date.now() - new Date(s.studiedAt).getTime()) / 86400000),
  previousRetention: i > 0 ? RETENTION_VALUES[i - 1] : s.initialScore,
  quizScore: RETENTION_VALUES[i],
  quizAccuracy: RETENTION_VALUES[i] / 100,
  quizTime: 180 + Math.random() * 240,
  retentionScore: RETENTION_VALUES[i],
  forgettingRisk: RETENTION_VALUES[i] >= 80 ? 0 : RETENTION_VALUES[i] >= 50 ? 1 : 2,
}));

// Larger synthetic dataset for ML training (50 records)
export function generateSyntheticDataset(userId: string): MLDataPoint[] {
  const points: MLDataPoint[] = [];
  const topics = ["Arrays", "Recursion", "Sorting", "Graphs", "DP", "Probability", "Calculus", "Statistics", "CNN", "RNN"];
  const subjects = ["CS", "Math", "ML", "DS"];
  for (let i = 0; i < 50; i++) {
    const dur = 20 + Math.floor(Math.random() * 100);
    const diff = Math.floor(Math.random() * 3);
    const method = Math.floor(Math.random() * 6);
    const init = 40 + Math.floor(Math.random() * 55);
    const rev = Math.floor(Math.random() * 4);
    const days = Math.floor(Math.random() * 14);
    const stab = 1.5 + (init / 100) * 3 - [0, 0.3, 0.7][diff] + [0.1, 0.5, 0.2, 0.3, 0.6, 0.5][method] + rev * 0.4;
    const retention = Math.max(0, Math.min(100, Math.exp(-days / Math.max(stab, 0.5)) * init * (0.9 + Math.random() * 0.2)));
    points.push({
      studentId: userId,
      subject: subjects[i % subjects.length],
      topic: topics[i % topics.length],
      studyDuration: dur,
      difficulty: diff,
      studyMethod: method,
      initialScore: init,
      revisionCount: rev,
      daysSinceStudy: days,
      previousRetention: Math.max(0, retention + (Math.random() - 0.5) * 20),
      quizScore: Math.max(0, Math.min(100, retention + (Math.random() - 0.5) * 10)),
      quizAccuracy: Math.max(0, Math.min(1, retention / 100 + (Math.random() - 0.5) * 0.2)),
      quizTime: 120 + Math.random() * 480,
      retentionScore: Math.round(retention),
      forgettingRisk: retention >= 80 ? 0 : retention >= 50 ? 1 : 2,
    });
  }
  return points;
}

export function seedDemoData(): void {
  // Demo user
  const existing = UserStore.getByEmail(DEMO_USER_EMAIL);
  if (!existing) {
    const demoUser: User = {
      id: DEMO_USER_ID,
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_NAME,
      passwordHash: hashPassword(DEMO_PASSWORD),
      createdAt: daysAgo(30),
    };
    UserStore.save(demoUser);

    const demoProfile: StudentProfile = {
      userId: DEMO_USER_ID,
      age: "18–22",
      academicLevel: "Undergraduate",
      subjects: ["Computer Science", "Data Science", "Machine Learning"],
      preferredStudyDuration: 45,
      learningDifficulty: 3,
      onboardingCompleted: true,
      createdAt: daysAgo(30),
    };
    ProfileStore.save(demoProfile);

    DEMO_SESSIONS.forEach(s => StudyStore.save(s));
    DEMO_RETENTION.forEach(r => RetentionStore.save(r));
    MemoryProfileStore.save(DEMO_MEMORY_PROFILE);

    const allML = [...DEMO_ML_POINTS, ...generateSyntheticDataset(DEMO_USER_ID)];
    MLStore.setAll(allML);
  }
}
