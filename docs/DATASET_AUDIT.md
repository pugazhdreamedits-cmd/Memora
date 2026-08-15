# MEMORA — Dataset Audit (C1)

This file documents how MEMORA obtains ML training data and summarizes the current dataset as discovered in the codebase (static analysis). No runtime localStorage values were read — this audit is based on repository source.

1) Dataset provenance
- The ML dataset is stored via `MLStore` in `src/lib/storage.ts` (keys persisted to `localStorage`).
- Data points are added by user actions in the UI: `StudySession` calls `MLStore.addPoint()` when a session is created; `Quiz` updates ML points when a quiz completes (it finds an existing point and updates fields via `MLStore.setAll()`).
- The repository contains a demo seeding helper `seedDemoData()` in `src/lib/demoData.ts` which writes demo sessions, retention records, a memory profile, and ML points.

2) Dataset type
- The project supports mixed data: user-generated (from `StudySession` and `Quiz` flows) and demo/synthetic data (seeded by `seedDemoData()`).
- Important: demo ML points are associated with the demo user id (so separation is by `studentId`), but MLDataPoint objects do not include an `isDemo` flag.

3) Example row (one sample)
- Schema: `MLDataPoint` (see `src/types/index.ts`). Fields:
  - `studentId` (string)
  - `subject` (string)
  - `topic` (string)
  - `studyDuration` (number, minutes)
  - `difficulty` (number; encoded 0=Easy,1=Medium,2=Hard)
  - `studyMethod` (number; encoded 0-5)
  - `initialScore` (number, 0-100)
  - `revisionCount` (number)
  - `daysSinceStudy` (number)
  - `previousRetention` (number, 0-100)
  - `quizScore` (number, 0-100)
  - `quizAccuracy` (number, 0-1)
  - `quizTime` (number, seconds)
  - `retentionScore` (number, target, 0-100)
  - `forgettingRisk` (number; 0=LOW,1=MEDIUM,2=HIGH)

4) What one sample represents
- A single `MLDataPoint` represents a student-topic observation at (or shortly after) study/recall: it encodes the study session properties, quiz results (if any), previous retention, and the recorded retention score which is used as the target.

5) How many samples are currently present in the repository (static seed)
- The demo seed builds `DEMO_ML_POINTS` (one per demo session, 10 points) and then calls `generateSyntheticDataset()` which generates 50 synthetic points. When `seedDemoData()` runs it writes `MLStore.setAll([...DEMO_ML_POINTS, ...generateSyntheticDataset(...)])` — total = 60 ML points for the demo user (10 demo + 50 synthetic).
- Runtime user-generated samples depend on app usage and localStorage; their count cannot be determined from static files.

6) Features present (as used by `encodeFeatures()` in `src/lib/ml.ts`)
- `studyDuration` (normalized by /120)
- `difficulty` (0-2 mapped to /2)
- `studyMethod` (0-5 mapped to /5)
- `initialScore` (0-100 mapped to /100)
- `revisionCount` (capped /5)
- `daysSinceStudy` (capped /14)
- `previousRetention` (0-100 -> /100)
- `quizScore` (0-100 -> /100)
- `quizAccuracy` (0-1)
- `quizTime` (capped /600)

7) Target variable
- `retentionScore` (0-100) in `MLDataPoint` is used as the regression target. In training the code maps `yReg = data.map(d => d.retentionScore / 100)`.

8) Units and ranges
- See field list above. `encodeFeatures()` normalizes many features to 0-1 using fixed denominators (e.g., studyDuration/120, quizTime/600).

9) Missing values
- Some fields may be zero before a quiz occurs (e.g., `quizScore=0`, `quizAccuracy=0`, `quizTime=0`) — the app writes initial ML points on session creation and then updates them after quizzes.
- The code does not perform explicit global imputation; zero values are used in feature encoding and thus will influence training unless filtered.

10) Duplicate samples
- `MLStore.addPoint()` appends points without deduplication. The `Quiz` flow attempts to find an existing ML point for the same `studentId`/`topic`/`daysSinceStudy===0` and updates it; duplicates can still occur (multiple sessions for same topic, manual re-submissions). There is no strong de-duplication enforcement.

11) Demo record separation
- Study sessions and retention records include `isDemo: boolean` in their types and storage flows. ML points (`MLDataPoint`) do not include `isDemo`, but demo ML points are associated with the demo user's `studentId`. Consequently, demo/synthetic ML data is separated by `studentId` (DEMO_USER_ID) but ML points themselves lack an explicit demo flag.

12) Is the dataset sufficient for ML training?
- Static demo seed provides 60 ML points for the demo user (10 demo + 50 synthetic). This is a small dataset for robust, generalizable regression models across many topics and students.
- Real user-generated data is required for per-user personalization. If the application is used by a single real user with only a few sessions, the dataset will be too small to produce reliable, unbiased performance estimates.

Recommendation: Collect longitudinal, per-user retention/quiz pairs (multiple topics across days) before conducting model performance evaluation. See next phases (C2–C25) for structured validation and a data collection plan.

References (code locations):
- `src/lib/storage.ts` (MLStore API)
- `src/lib/demoData.ts` (DEMO_ML_POINTS, generateSyntheticDataset, seedDemoData)
- `src/pages/StudySession.tsx` (MLStore.addPoint on session create)
- `src/pages/Quiz.tsx` (MLStore update on quiz completion)
- `src/lib/ml.ts` (encodeFeatures, trainModels, predictRetention)
- `src/types/index.ts` (MLDataPoint schema)
