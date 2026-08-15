// ============================================================
// MEMORA — Application Constants
// ============================================================

export const APP_NAME = "MEMORA";
export const APP_TAGLINE = "Learn. Remember. Predict.";
export const APP_SECONDARY = "Your memory has a pattern.";
export const APP_VERSION = "1.0.0";

// ─── Risk Thresholds (Application-Defined, Not Scientific) ───
export const RISK_THRESHOLDS = {
  LOW: { min: 80, max: 100, label: "LOW", color: "#10B981" },
  MEDIUM: { min: 50, max: 79, label: "MEDIUM", color: "#F59E0B" },
  HIGH: { min: 0, max: 49, label: "HIGH", color: "#EF4444" },
} as const;

// ─── Forgetting Curve Constants ──────────────────────────────
export const EBBINGHAUS_STABILITY_BASE = 1.84;
export const DEFAULT_FORGETTING_RATE = 0.65;

// ─── Recall Checkpoints ──────────────────────────────────────
export const RECALL_DAYS = [0, 1, 3, 7, 14];

// ─── Study Methods ───────────────────────────────────────────
export const STUDY_METHODS = [
  "Reading", "Practice", "Video", "Notes", "Flashcards", "Problem Solving"
] as const;

// ─── Difficulty Options ──────────────────────────────────────
export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

// ─── Subjects ────────────────────────────────────────────────
export const DEFAULT_SUBJECTS = [
  "Mathematics",
  "Computer Science",
  "Data Science",
  "Machine Learning",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "History",
  "Literature",
  "Other",
];

// ─── Academic Levels ─────────────────────────────────────────
export const ACADEMIC_LEVELS = [
  "High School",
  "Undergraduate",
  "Graduate",
  "Professional",
] as const;

// ─── Age Ranges ──────────────────────────────────────────────
export const AGE_RANGES = ["13–17", "18–22", "23–28", "29–35", "36+"];

// ─── ML Model Names ──────────────────────────────────────────
export const ML_MODELS = {
  LR: "Logistic Regression",
  DT: "Decision Tree",
  RF: "Random Forest",
} as const;

// ─── Local Storage Keys ──────────────────────────────────────
export const STORAGE_KEYS = {
  SESSION: "memora_session",
  USERS: "memora_users",
  PROFILES: "memora_profiles",
  STUDY_SESSIONS: "memora_study_sessions",
  QUIZ_ATTEMPTS: "memora_quiz_attempts",
  RETENTION_RECORDS: "memora_retention_records",
  MEMORY_PROFILES: "memora_memory_profiles",
  ML_DATASET: "memora_ml_dataset",
  MODEL_METRICS: "memora_model_metrics",
  SIM_DAYS_OFFSET: "memora_sim_days_offset",
  SETTINGS: "memora_settings",
} as const;

// ─── Demo User ───────────────────────────────────────────────
export const DEMO_USER_ID = "demo-user-001";
export const DEMO_USER_EMAIL = "demo@memora.ai";
export const DEMO_USER_NAME = "Alex (Demo)";
export const DEMO_PASSWORD = "demo1234";

// ─── Navigation ──────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
  { label: "Study Session", path: "/study", icon: "BookOpen" },
  { label: "Memory Landscape", path: "/landscape", icon: "Map" },
  { label: "Memory DNA", path: "/dna", icon: "Dna" },
  { label: "Retention Forecast", path: "/forecast", icon: "TrendingDown" },
  { label: "Recovery Mode", path: "/recovery", icon: "RefreshCw" },
  { label: "Insights", path: "/insights", icon: "Lightbulb" },
  { label: "Analytics", path: "/analytics", icon: "BarChart3" },
  { label: "History", path: "/history", icon: "Clock" },
  { label: "Profile", path: "/profile", icon: "User" },
] as const;
