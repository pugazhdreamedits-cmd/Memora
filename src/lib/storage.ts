// ============================================================
// MEMORA — LocalStorage Persistence Layer
// ============================================================

import { STORAGE_KEYS } from "@/constants";
import type {
  User, StudentProfile, StudySession, QuizAttempt,
  RetentionRecord, MemoryProfile, MLDataPoint, AppSession,
  ModelMetrics
} from "@/types";

function get<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getOne<T>(key: string, id: string, field = "id"): T | null {
  const items = get<Record<string, unknown>>(key);
  return (items.find(i => i[field] === id) as T) ?? null;
}

// ─── Auth ─────────────────────────────────────────────────────
export const AuthStore = {
  getSession(): AppSession | null {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.SESSION);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  },
  setSession(session: AppSession): void {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },
};

// ─── Users ────────────────────────────────────────────────────
export const UserStore = {
  getAll: () => get<User>(STORAGE_KEYS.USERS),
  getById: (id: string) => getOne<User>(STORAGE_KEYS.USERS, id),
  getByEmail: (email: string) => {
    const users = get<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.email === email) ?? null;
  },
  save(user: User): void {
    const users = get<User>(STORAGE_KEYS.USERS);
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) users[idx] = user; else users.push(user);
    set(STORAGE_KEYS.USERS, users);
  },
};

// ─── Profiles ─────────────────────────────────────────────────
export const ProfileStore = {
  getByUser: (userId: string) => {
    const profiles = get<StudentProfile>(STORAGE_KEYS.PROFILES);
    return profiles.find(p => p.userId === userId) ?? null;
  },
  save(profile: StudentProfile): void {
    const profiles = get<StudentProfile>(STORAGE_KEYS.PROFILES);
    const idx = profiles.findIndex(p => p.userId === profile.userId);
    if (idx >= 0) profiles[idx] = profile; else profiles.push(profile);
    set(STORAGE_KEYS.PROFILES, profiles);
  },
};

// ─── Study Sessions ───────────────────────────────────────────
export const StudyStore = {
  getAll: () => get<StudySession>(STORAGE_KEYS.STUDY_SESSIONS),
  getByUser: (userId: string) => get<StudySession>(STORAGE_KEYS.STUDY_SESSIONS).filter(s => s.userId === userId),
  getById: (id: string) => getOne<StudySession>(STORAGE_KEYS.STUDY_SESSIONS, id),
  save(session: StudySession): void {
    const sessions = get<StudySession>(STORAGE_KEYS.STUDY_SESSIONS);
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) sessions[idx] = session; else sessions.push(session);
    set(STORAGE_KEYS.STUDY_SESSIONS, sessions);
  },
};

// ─── Quiz Attempts ────────────────────────────────────────────
export const QuizStore = {
  getAll: () => get<QuizAttempt>(STORAGE_KEYS.QUIZ_ATTEMPTS),
  getByUser: (userId: string) => get<QuizAttempt>(STORAGE_KEYS.QUIZ_ATTEMPTS).filter(q => q.userId === userId),
  getBySession: (sessionId: string) => get<QuizAttempt>(STORAGE_KEYS.QUIZ_ATTEMPTS).filter(q => q.sessionId === sessionId),
  save(attempt: QuizAttempt): void {
    const attempts = get<QuizAttempt>(STORAGE_KEYS.QUIZ_ATTEMPTS);
    const idx = attempts.findIndex(a => a.id === attempt.id);
    if (idx >= 0) attempts[idx] = attempt; else attempts.push(attempt);
    set(STORAGE_KEYS.QUIZ_ATTEMPTS, attempts);
  },
};

// ─── Retention Records ────────────────────────────────────────
export const RetentionStore = {
  getAll: () => get<RetentionRecord>(STORAGE_KEYS.RETENTION_RECORDS),
  getByUser: (userId: string) => get<RetentionRecord>(STORAGE_KEYS.RETENTION_RECORDS).filter(r => r.userId === userId),
  getBySession: (sessionId: string) => get<RetentionRecord>(STORAGE_KEYS.RETENTION_RECORDS).filter(r => r.sessionId === sessionId),
  getByTopic: (userId: string, topic: string) => get<RetentionRecord>(STORAGE_KEYS.RETENTION_RECORDS).filter(r => r.userId === userId && r.topic === topic),
  save(record: RetentionRecord): void {
    const records = get<RetentionRecord>(STORAGE_KEYS.RETENTION_RECORDS);
    const idx = records.findIndex(r => r.id === record.id);
    if (idx >= 0) records[idx] = record; else records.push(record);
    set(STORAGE_KEYS.RETENTION_RECORDS, records);
  },
};

// ─── Memory Profiles ──────────────────────────────────────────
export const MemoryProfileStore = {
  getByUser: (userId: string) => {
    const profiles = get<MemoryProfile>(STORAGE_KEYS.MEMORY_PROFILES);
    return profiles.find(p => p.userId === userId) ?? null;
  },
  save(profile: MemoryProfile): void {
    const profiles = get<MemoryProfile>(STORAGE_KEYS.MEMORY_PROFILES);
    const idx = profiles.findIndex(p => p.userId === profile.userId);
    if (idx >= 0) profiles[idx] = profile; else profiles.push(profile);
    set(STORAGE_KEYS.MEMORY_PROFILES, profiles);
  },
};

// ─── ML Dataset ──────────────────────────────────────────────
export const MLStore = {
  getAll: () => get<MLDataPoint>(STORAGE_KEYS.ML_DATASET),
  getByUser: (userId: string) => get<MLDataPoint>(STORAGE_KEYS.ML_DATASET).filter(d => d.studentId === userId),
  addPoint(point: MLDataPoint): void {
    const dataset = get<MLDataPoint>(STORAGE_KEYS.ML_DATASET);
    dataset.push(point);
    set(STORAGE_KEYS.ML_DATASET, dataset);
  },
  setAll(data: MLDataPoint[]): void {
    set(STORAGE_KEYS.ML_DATASET, data);
  },
};

// ─── Model Metrics ────────────────────────────────────────────
export const MetricsStore = {
  get: () => {
    try {
      const m = localStorage.getItem(STORAGE_KEYS.MODEL_METRICS);
      return m ? JSON.parse(m) as ModelMetrics[] : null;
    } catch { return null; }
  },
  set: (metrics: ModelMetrics[]) => {
    localStorage.setItem(STORAGE_KEYS.MODEL_METRICS, JSON.stringify(metrics));
  },
};

// ─── Demo Day Simulation ─────────────────────────────────────
export const SimStore = {
  getOffset: (): number => parseInt(localStorage.getItem(STORAGE_KEYS.SIM_DAYS_OFFSET) || "0"),
  setOffset: (days: number) => localStorage.setItem(STORAGE_KEYS.SIM_DAYS_OFFSET, String(days)),
  addDays: (days: number) => {
    const current = SimStore.getOffset();
    SimStore.setOffset(current + days);
  },
  getCurrentDate: () => {
    const offset = SimStore.getOffset();
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString();
  },
};

// ─── Settings ─────────────────────────────────────────────────
export const SettingsStore = {
  get: () => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return s ? JSON.parse(s) : { theme: "dark", riskThresholds: { low: 80, medium: 50 }, notifications: true };
    } catch { return { theme: "dark", riskThresholds: { low: 80, medium: 50 }, notifications: true }; }
  },
  set: (settings: unknown) => localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)),
};
