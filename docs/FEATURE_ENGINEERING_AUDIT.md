# MEMORA — Feature Engineering Audit (C2)

This audit inspects the feature engineering pipeline in the codebase and documents the meaning, source, transformations, availability, and leakage risks for each feature used by the ML pipeline. It is based on static code inspection of `src/lib/ml.ts`, `src/types/index.ts`, `src/lib/demoData.ts`, `src/pages/StudySession.tsx`, and related files.

IMPORTANT: Current demo dataset: 60 ML points (10 demo + 50 synthetic). Any evaluation based primarily on these 60 points must be labeled "preliminary/demo evaluation" and considered insufficient for robust generalization. See the end of this document.

# Feature Engineering Audit

## Current Features (as encoded by `encodeFeatures()` in `src/lib/ml.ts`)

The `encodeFeatures()` function returns a fixed ordered array of 10 numeric features. The order is important and preserved for training and prediction.

Order (index: name):
0: `studyDuration`
1: `difficulty`
2: `studyMethod`
3: `initialScore`
4: `revisionCount`
5: `daysSinceStudy`
6: `previousRetention`
7: `quizScore`
8: `quizAccuracy`
9: `quizTime`

For each feature below we document required fields.

---

Feature: `studyDuration`
- Meaning: Length of the study session in minutes.
- Source: `StudySession` form (user input) and `MLDataPoint.studyDuration` saved by `StudySession` when creating a session or by synthetic demo generation (`src/pages/StudySession.tsx`, `src/lib/demoData.ts`).
- Data type: number (minutes).
- Raw range/unit: minutes. The UI slider in `StudySession` uses `min=5` and `max=180`, but `encodeFeatures()` normalizes by dividing by `120` (comment: "max ~120min").
- Transformation/normalization: normalized to [0,..?] by `studyDuration / 120` inside `encodeFeatures()` (so values >120 map >1 but not clamped here).
- Available at prediction time: Yes — when predicting from a session object, `studyDuration` is typically available.
- Leakage risk: Low — this is a causal input (study effort) not derived from future outcomes.

---

Feature: `difficulty`
- Meaning: Topic difficulty encoded as numeric (0=Easy,1=Medium,2=Hard).
- Source: `StudySession.difficulty` UI selection; demo mapping found in `src/lib/demoData.ts` (`DIFF_MAP`).
- Data type: number (0,1,2).
- Raw range/unit: discrete levels 0..2. `encodeFeatures()` divides by 2 producing 0, 0.5, 1.
- Transformation/normalization: `difficulty / 2`.
- Available at prediction time: Yes — topic difficulty is known at session creation or can be supplied by user.
- Leakage risk: Low — user-declared property; not derived from target.

---

Feature: `studyMethod`
- Meaning: Encoded study method (e.g., Reading, Practice, Video, Notes, Flashcards, Problem Solving) mapped to numeric 0..5.
- Source: `StudySession.studyMethod` and mapping `METHOD_MAP` in `src/pages/StudySession.tsx` and `src/lib/demoData.ts`.
- Data type: number (integer 0..5).
- Raw range/unit: discrete encoding 0..5. `encodeFeatures()` divides by 5 to normalize to ~0..1.
- Transformation/normalization: `studyMethod / 5`.
- Available at prediction time: Yes — study method is known when the session is created.
- Leakage risk: Low — this is a pre-outcome input.

---

Feature: `initialScore`
- Meaning: Initial self-assessed or measured score (0–100) at time of study (used as baseline ability/initial retention).
- Source: `StudySession.initialScore` from user input; demo generation sets this as well.
- Data type: number (0–100).
- Raw range/unit: percent/score. `encodeFeatures()` normalizes by dividing by 100.
- Transformation/normalization: `initialScore / 100`.
- Available at prediction time: Yes — initial score is available at session creation time.
- Leakage risk: Low — baseline score precedes retention outcome.

---

Feature: `revisionCount`
- Meaning: Number of prior revisions for the topic (integer count).
- Source: `StudySession.revisionCount` and demo data.
- Data type: integer (0,1,2,...).
- Raw range/unit: counts. `encodeFeatures()` applies `Math.min(revisionCount / 5, 1)`, effectively clipping at 5 and scaling to 0..1.
- Transformation/normalization: capped and scaled by `/5` and `min(...,1)`.
- Available at prediction time: Yes — number of previous revisions is known at prediction time.
- Leakage risk: Low — historic revision count is a prior input.

Potential issue: revision count may be updated after a quiz or recovery action; ensure the recorded revisionCount at prediction time is not updated using future information. In the current code revisionCount is read from the session record (no evidence of future leakage), but edge cases exist if sessions are retroactively edited.

---

Feature: `daysSinceStudy`
- Meaning: Number of days elapsed since the study session.
- Source: Calculated when ML point is created/updated; demo generation computes it based on `studiedAt` dates.
- Data type: number (days).
- Raw range/unit: days. `encodeFeatures()` uses `Math.min(daysSinceStudy / 14, 1)` to cap scaling at 14 days.
- Transformation/normalization: capped at 14 and scaled by `/14` (0..1, after which values >1 map to >1 but are not clamped here except by `min` which ensures <=1).
- Available at prediction time: Yes — days since study is computable from timestamps.
- Leakage risk: Moderate — if the training examples are generated with dates and the train/test split shuffles time-ordered records, future records may be present in the train set relative to test records. A temporal split might be safer for longitudinal data.

---

Feature: `previousRetention`
- Meaning: Previous retention estimate/value for the topic (0–100). In session creation, it is set to `initialScore` in `StudySession`. In demo/synthetic data it may reflect the prior recorded retention value.
- Source: `MLDataPoint.previousRetention` stored in `MLStore`.
- Data type: number (0–100).
- Raw range/unit: percent/score. `encodeFeatures()` divides by 100.
- Transformation/normalization: `previousRetention / 100`.
- Available at prediction time: Sometimes — it depends on whether a prior retention record exists. For initial sessions `previousRetention` is often set to `initialScore` at insertion.
- Leakage risk: Potential — if `previousRetention` is equal to (or directly derived from) the target `retentionScore` in a way that uses future information (e.g., if the ML data row was populated using the final retention before training), this can leak target information. In the demo data many ML points have `quizScore` equal to `retentionScore` and `previousRetention` may be similar to retentionScore; this is a leakage risk that must be examined.

---

Feature: `quizScore`
- Meaning: The recall/quiz score (0–100) measured during a quiz; may be zero if no quiz yet.
- Source: `QuizAttempt.score` and demo ML points (demo uses `RETENTION_VALUES` as `quizScore`). The `StudySession` flow initially sets `quizScore=0` when creating an ML point; `Quiz` flow updates ML points after quiz completion.
- Data type: number (0–100).
- Raw range/unit: score percent. `encodeFeatures()` divides by 100.
- Transformation/normalization: `quizScore / 100`.
- Available at prediction time: Only after a quiz has been taken. For initial prediction just after session creation, `quizScore` is often 0 (meaning missing/unknown) in MLStore entries.
- Leakage risk: High — in many demo ML points `quizScore` equals `retentionScore` (the target) and therefore including `quizScore` as a feature while training and evaluating can cause direct leakage. This is especially critical when `quizScore` is populated with the same observation used as the target or when synthetic/demo data assigns identical values. Using `quizScore` as a feature must be carefully controlled: if the quiz that produced `quizScore` is the same event that defines the target `retentionScore`, then `quizScore` may be tautologically correlated or identical to the target and leak information.

---

Feature: `quizAccuracy`
- Meaning: Fraction of correct answers in the quiz (0–1). Demo uses `RETENTION_VALUES[i] / 100` as `quizAccuracy` in `demoData` and synthetic generation.
- Source: `QuizAttempt.accuracy` and demo generation.
- Data type: number (0–1).
- Raw range/unit: proportion. `encodeFeatures()` uses `quizAccuracy` directly (no scaling beyond assumed 0–1 range).
- Transformation/normalization: none (assumes 0–1).
- Available at prediction time: Only after a quiz has been taken; otherwise may be 0 in initial ML points.
- Leakage risk: Similar to `quizScore` — if `quizAccuracy` is computed from the same event used to produce the retention target, it can leak information. In demo data accuracy is derived from retention values and therefore may be correlated with the target.

---

Feature: `quizTime`
- Meaning: Time taken to complete the quiz (seconds).
- Source: `QuizAttempt.timeTaken` in `Quiz` flow; demo generation uses random values.
- Data type: number (seconds).
- Raw range/unit: seconds. `encodeFeatures()` normalizes via `Math.min(d.quizTime / 600, 1)` (scaled to ~10 minutes, capped at 600s).
- Transformation/normalization: capped and scaled by `/600`.
- Available at prediction time: Only once a quiz is recorded; before quiz it may be 0.
- Leakage risk: Low–moderate — generally pre-outcome, but if the quiz measured is the same event as the target observation then it can be directly correlated with target.

---

Target: `retentionScore`
- Meaning: Observed retention score (0–100) that the model is trained to predict; in code this is converted to regression target via `yReg = retentionScore / 100` during `trainModels()`.
- Source: `MLDataPoint.retentionScore` (from `Quiz` or initial session record which sets retentionScore = initialScore when created).
- Data type: number (0–100).
- Range/unit: percent 0–100.

Classification target: `forgettingRisk` (0=LOW,1=MEDIUM,2=HIGH) is derived from `retentionScore` thresholds in multiple places; `trainModels()` also creates a binary label `yCls = retentionScore >= 0.6 ? 1 : 0` (note: this uses normalized 0.6 threshold on 0..1 target), which indicates a binary high-retention label.

---

## Feature Transformations & Ordering
- `encodeFeatures()` defines the exact ordering and normalization. Training (`trainModels()`) uses `data.map(encodeFeatures)` and prediction (`predictRetention()`) also calls `encodeFeatures()` on the provided `MLDataPoint`. Ordering appears consistent between training and prediction.

## Prediction-Time Availability
- Several features (`quizScore`, `quizAccuracy`, `quizTime`, `previousRetention`) may be unavailable or zero before a quiz has occurred. The app inserts ML points at session creation with quiz fields zeroed and later updates them after a quiz attempt.
- When `predictRetention()` is called in flows like `RetentionForecast` and `RecoveryMode`, callers build a `dataPoint` object combining `RetentionRecord` and `StudySession` fields. In those callers the code typically fills missing quiz fields with retention values or quiz-derived fields, which can cause inconsistent values compared to features used during training.

## Missing values handling
- The current pipeline uses numeric zeros to represent missing quiz data (e.g., `quizScore=0`, `quizAccuracy=0`, `quizTime=0`) when a quiz hasn't occurred. There is no explicit missing-value indicator; zeros are fed through `encodeFeatures()` into training and prediction.

Risk: Zero conflation — zero may represent a true score of 0 or a missing value. This ambiguity can bias the model. A recommended mitigation is to include an explicit `hasQuiz` flag or use `NaN`/separate imputation strategy before training.

## Data Leakage Risks (findings)
1. `quizScore` / `quizAccuracy` leakage risk — In demo ML points and synthetic data, `quizScore` and `retentionScore` are often identical or highly correlated (demo code sets `quizScore = RETENTION_VALUES[i]` and `retentionScore = RETENTION_VALUES[i]`), which means including `quizScore` as a feature while predicting `retentionScore` leads to direct leakage. This will make models appear artificially accurate on demo data.

2. `previousRetention` usage — if `previousRetention` is populated using the same observation as the target (for example when session insertion sets both `previousRetention` and `retentionScore` to `initialScore`), it may contain redundant or target-like information, increasing risk of leakage.

3. Train/test splitting randomness for longitudinal data — `trainModels()` performs an 80/20 split after applying a seeded shuffle across all records. If the dataset contains time-series or sequential observations for the same topic/student, randomly shuffling can result in future observations appearing in the training set relative to test records (temporal leakage). For longitudinal per-user personalization, consider time-based or grouped splitting (per-user holdout) instead.

4. Synthetic/demo data characteristics — synthetic data generation in `demoData.generateSyntheticDataset()` may include generated retention values derived from the same stability equations used by `predictRetention()` logic; models trained and evaluated on this synthetic data may reflect the generator's assumptions rather than independent empirical signals. This is fine for demo UX but must be labeled as synthetic/demo evaluation.

## Inconsistent or problematic preprocessing differences
- Training: `trainModels()` calls `encodeFeatures()` on stored `MLDataPoint` objects in `MLStore`. Prediction: `predictRetention()` calls `encodeFeatures()` on the provided `dataPoint`. The encoding function is consistent — ordering and normalization match. However, in some call sites (e.g., `RetentionForecast.tsx`), the prediction `dataPoint` is assembled manually and code sometimes sets `quizScore` to `rec.retentionScore` or uses `rec.retentionScore` for `quizScore/quizAccuracy`, which may not match the ML points' original representation (source-of-truth mismatch). This inconsistency can lead to mismatches between training and inference distributions.

## Problems Found (summary)
- Primary: Potential target leakage via `quizScore` and `quizAccuracy` when these fields are equal or tightly coupled with `retentionScore` in demo/synthetic points.
- Secondary: Ambiguous missing-value treatment (zeros used for missing quiz fields) can bias models.
- Temporal leakage risk: randomized train/test split may leak future information for longitudinal sequences; consider time-aware splitting or group-by-user splits for personalization evaluation.
- Demo/synthetic dataset structure: synthetic/demo points may not represent independent empirical samples; they can inflate apparent performance.

## Recommended Changes (do not implement here; document only)
1. For evaluation (not code change yet): clearly separate demo/synthetic user data from real users when reporting metrics. Only evaluate models on real user data (or label metrics as "preliminary/demo evaluation").
2. Consider excluding `quizScore` and `quizAccuracy` from input features when they are derived from the same event that defines the target, or ensure that the feature represents a prior quiz (not the target event). If retaining these features, only use them when they represent past quizzes (strict temporal separation).
3. Introduce a clear missing-value indicator for quiz-derived features (e.g., `hasQuiz` boolean) instead of relying on `0` to mean missing.
4. For longitudinal personalization evaluation, use temporal splits (train on earlier dates, test on later) or grouped splits that hold out entire topics/users to avoid leakage.
5. Implement deduplication or canonicalization for ML points (e.g., ensure one ML point per user/session/topic combination) to avoid duplicate records.
6. When reporting any metrics computed on the demo dataset (60 points), label them explicitly as "preliminary/demo evaluation" and do not present them as generalizable results.

## Demo/Synthetic Data Limitation
Current demo dataset: 60 ML points (10 demo + 50 synthetic). This is insufficient to claim robust or generalizable model performance. Any evaluation based primarily on these points must be labeled "preliminary/demo evaluation".

---

References (code locations consulted):
- `src/lib/ml.ts` (encodeFeatures, trainModels, predictRetention)
- `src/types/index.ts` (MLDataPoint definition)
- `src/lib/demoData.ts` (demo ML points, synthetic generator)
- `src/pages/StudySession.tsx` (MLStore.addPoint on session create)
- `src/pages/Quiz.tsx` (MLStore update on quiz completion)
- `src/lib/storage.ts` (MLStore API)

*** End of Feature Engineering Audit (C2)
