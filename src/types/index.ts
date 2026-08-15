// ============================================================
// MEMORA — Core Type Definitions
// ============================================================

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type StudyMethod = "Reading" | "Practice" | "Video" | "Notes" | "Flashcards" | "Problem Solving";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type AcademicLevel = "High School" | "Undergraduate" | "Graduate" | "Professional";

// ─── User & Profile ───────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface StudentProfile {
  userId: string;
  age: string;
  academicLevel: AcademicLevel;
  subjects: string[];
  preferredStudyDuration: number; // minutes
  learningDifficulty: number; // 1-5
  onboardingCompleted: boolean;
  createdAt: string;
}

// ─── Study & Sessions ─────────────────────────────────────────
export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  studyDuration: number; // minutes
  difficulty: Difficulty;
  studyMethod: StudyMethod;
  initialScore: number; // 0-100
  revisionCount: number;
  studiedAt: string;
  isDemo: boolean;
}

// ─── Quiz ─────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  topic: string;
  difficulty: Difficulty;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  sessionId: string;
  topic: string;
  subject: string;
  questions: QuizQuestion[];
  answers: number[];
  score: number; // 0-100
  accuracy: number; // 0-1
  timeTaken: number; // seconds
  difficulty: Difficulty;
  daysAfterStudy: number;
  completedAt: string;
  isDemo: boolean;
}

// ─── Retention ────────────────────────────────────────────────
export interface RetentionRecord {
  id: string;
  userId: string;
  sessionId: string;
  topic: string;
  subject: string;
  retentionScore: number; // 0-100
  forgettingRisk: RiskLevel;
  daysSinceStudy: number;
  recordedAt: string;
  isDemo: boolean;
}

// ─── ML / Prediction ─────────────────────────────────────────
export interface MLDataPoint {
  studentId: string;
  subject: string;
  topic: string;
  studyDuration: number;
  difficulty: number; // 0=Easy,1=Medium,2=Hard
  studyMethod: number; // encoded
  initialScore: number;
  revisionCount: number;
  daysSinceStudy: number;
  previousRetention: number;
  quizScore: number;
  quizAccuracy: number;
  quizTime: number;
  retentionScore: number; // target
  forgettingRisk: number; // 0=LOW,1=MEDIUM,2=HIGH
}

// ─── Syllabus / Academic Types ─────────────────────────────────
export interface TopicEntry {
  id: string;
  title: string;
}

export interface UnitEntry {
  id: string;
  unit: string; // e.g., "Unit I"
  topics: TopicEntry[];
}

export interface SubjectEntry {
  code?: string;
  name: string;
  units: UnitEntry[];
}

export interface SyllabusDocument {
  university: string;
  regulation?: string;
  degree?: string;
  branch?: string;
  semester?: number;
  subjects: SubjectEntry[];
  meta?: Record<string, any>;
}

// ─── AI / Question Generation Types ────────────────────────────
export type QuestionType =
  | "MCQ"
  | "TrueFalse"
  | "FillBlank"
  | "ShortAnswer"
  | "Descriptive"
  | "Numerical"
  | "Programming";

export type BloomLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";

export interface AIQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  subject?: string;
  unit?: string;
  topic?: string;
  questionType?: QuestionType;
  bloom?: BloomLevel;
}

export interface AIQuestionRequest {
  university: string;
  regulation?: string;
  degree?: string;
  branch?: string;
  semester?: number;
  subject: string;
  unit?: string;
  topic: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  questionType?: QuestionType;
  count?: number;
}

export interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mae: number;
  rmse: number;
  r2: number;
}

export interface PredictionResult {
  retentionNow: number;
  retention1d: number;
  retention3d: number;
  retention7d: number;
  retention14d: number;
  forgettingRisk: RiskLevel;
  recommendedRevisionDays: number;
  confidence: number;
  modelUsed: string;
  insights: string[];
}

// ─── Memory Profile ──────────────────────────────────────────
export interface MemoryProfile {
  userId: string;
  retentionSpeed: number; // 0-100
  forgettingSpeed: number; // 0-100
  revisionResponse: number; // 0-100
  longTermRetention: number; // 0-100
  consistency: number; // 0-100
  averageRetention: number;
  averageForgettingRate: number;
  revisionEffectiveness: number;
  topicProfiles: TopicMemoryProfile[];
  updatedAt: string;
}

export interface TopicMemoryProfile {
  topic: string;
  subject: string;
  retentionScore: number;
  forgettingRisk: RiskLevel;
  lastStudied: string;
  sessionId: string;
  revisionCount: number;
  trend: "improving" | "stable" | "declining";
}

// ─── App State ───────────────────────────────────────────────
export interface AppSession {
  userId: string;
  token: string;
  isDemo: boolean;
  loginAt: string;
}
