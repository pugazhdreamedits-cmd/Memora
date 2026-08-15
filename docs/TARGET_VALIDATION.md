# Target Validation

## Regression Target

- The regression target is `retentionScore` (stored on each `MLDataPoint`) and represents a percentage 0–100.
- During training, `trainModels()` converts this to a 0–1 scale via `yReg = data.map(d => d.retentionScore / 100);` (see [src/lib/ml.ts](src/lib/ml.ts#L256-L259)).

## Target Calculation

- `retentionScore` is populated from several places:
  - Initial session creation in [src/pages/StudySession.tsx](src/pages/StudySession.tsx#L57-L83) sets `retentionScore` = `initialScore`.
  - After a quiz, `quizToRetention()` from [src/lib/retention.ts](src/lib/retention.ts#L88-L104) is used to compute `retention` (uses `quizScore * 0.7 + initialScore * 0.3 * dayFactor` with `dayFactor = exp(-0.1 * daysSinceStudy)`) and rounded and saved in `RetentionStore` and `MLStore` (see [src/pages/Quiz.tsx](src/pages/Quiz.tsx#L80-L115)).
  - Demo seed (`seedDemoData()`) writes `retentionScore` values directly into demo `MLDataPoint`s and `RetentionRecord`s (see [src/lib/demoData.ts](src/lib/demoData.ts#L56-L96) and [src/lib/demoData.ts](src/lib/demoData.ts#L110-L145)).

## Target Range

- Semantically `retentionScore` is defined 0–100 in types: see `MLDataPoint.retentionScore` in [src/types/index.ts](src/types/index.ts#L44-L52).
- In practice, code assumes 0–100 and normalizes to 0–1 for regression during training.

## Classification Target

- The code constructs a binary classification label `yCls` inside `trainModels()` as `yCls = data.map(d => d.retentionScore >= 0.6 ? 1 : 0);` (see [src/lib/ml.ts](src/lib/ml.ts#L257-L259)).

## Classification Threshold

- Intended threshold appears to be 60% (0.6). However, because `retentionScore` is stored on a 0–100 scale, the implemented comparison `d.retentionScore >= 0.6` treats `0.6` as a raw value, not 60. That makes the threshold effectively 0.6 (≈0.6%), not 60%.

## Prediction Timing

- `predictRetention()` (in [src/lib/ml.ts](src/lib/ml.ts#L344-L390)) accepts a `dataPoint: MLDataPoint` and optional `historicalData` and chooses between: trained models (RF/DT/LR) or Ebbinghaus-based calculation.
- At prediction time some callers (notably [src/pages/RetentionForecast.tsx](src/pages/RetentionForecast.tsx#L30-L60) and parts of `RecoveryMode.tsx` [src/pages/RecoveryMode.tsx#L140-L180]) construct a `dataPoint` that includes `quizScore`, `quizAccuracy`, and `retentionScore` set to the observed `RetentionRecord.retentionScore`.

## Target Leakage Risks

- Multiple clear leakage paths were observed (do NOT fix here; documented only):
  - Demo ML points (seed) set `quizScore`, `quizAccuracy`, and `retentionScore` to the same demo value (`RETENTION_VALUES`), creating direct leakage in training data ([src/lib/demoData.ts](src/lib/demoData.ts#L110-L145)).
  - `RetentionForecast` builds features using `rec.retentionScore` assigned to `quizScore`, `quizAccuracy`, and `retentionScore` before calling `predictRetention()` — the target is therefore present in the feature vector at prediction-time for forecast display ([src/pages/RetentionForecast.tsx](src/pages/RetentionForecast.tsx#L28-L44)).
  - `predictRetention()` uses `dataPoint.quizScore > 0 ? dataPoint.quizScore : dataPoint.initialScore` as an early `retentionNow` baseline; if callers provide `quizScore` equal to the target, the model/prediction becomes circular ([src/lib/ml.ts](src/lib/ml.ts#L346-L356)).
  - `previousRetention` is populated on initial session creation as `initialScore` and in demo points is set to previous demo retention; its semantics vary and it can act as a proxy for the target when not temporally separated ([src/pages/StudySession.tsx](src/pages/StudySession.tsx#L62-L82), [src/lib/demoData.ts](src/lib/demoData.ts#L118-L132)).

## Relationship Between Retention and Forgetting Risk

- `forgettingRisk` in `MLDataPoint` is encoded as {0,1,2} corresponding to LOW/MEDIUM/HIGH. Demo seeding and several code paths derive risk from `retentionScore` thresholds (e.g., `>= 80 → 0`, `>= 50 → 1`, else `2`) ([src/lib/demoData.ts](src/lib/demoData.ts#L137-L144)).
- `predictRetention()` computes `forgettingRisk` for the returned `PredictionResult` by calling `getRiskLevel(retentionNow)` where `getRiskLevel` maps percentages to LOW/MEDIUM/HIGH (see usages in [src/lib/ml.ts](src/lib/ml.ts#L361-L370) and many pages).

## Problems Found

1. Classification label `yCls` is computed with `d.retentionScore >= 0.6` while `retentionScore` uses 0–100 scale. This effectively makes almost all labels `1` (except near-zero scores), so the classifier training/metrics are invalid. (See [src/lib/ml.ts](src/lib/ml.ts#L256-L259)).
2. Demo dataset directly sets `quizScore` and `retentionScore` to identical values — direct leakage from feature → target (see [src/lib/demoData.ts](src/lib/demoData.ts#L110-L145)).
3. Several prediction-time callers pass observed `retentionScore` into features (`quizScore`, `quizAccuracy`, `previousRetention`), producing circular predictions or tautological forecasts (not real forecasting). Notably [src/pages/RetentionForecast.tsx](src/pages/RetentionForecast.tsx#L28-L44) and `RecoveryMode` ([src/pages/RecoveryMode.tsx](src/pages/RecoveryMode.tsx#L140-L180)).
4. `previousRetention` semantics are inconsistent: sometimes initialScore, sometimes previous record; without temporal ordering it can leak target information.
5. `MLStore.addPoint()` appends blindly and `Quiz` updates find existing points by topic+student+daysSinceStudy==0, but duplicates are still possible (see [src/lib/storage.ts](src/lib/storage.ts#L90-L112) and [src/pages/Quiz.tsx](src/pages/Quiz.tsx#L80-L115)).

## Recommended Changes (Audit only — do NOT implement yet)

- Fix the classification label: compute `yCls = data.map(d => (d.retentionScore / 100) >= 0.6 ? 1 : 0);` to use consistent units.
- At prediction time, avoid passing `retentionScore`/`quizScore` derived from the target into features for true forecasting displays; instead pass only features available before the target is observed (e.g., `initialScore`, daysSinceStudy, prior history). For UI displays that show model quality using observed current retention, clearly label them as using observed current retention, not a pure forecast.
- Add an explicit `hasQuiz` or `quizAvailable` boolean instead of using zeros for missing `quizScore`/`quizAccuracy`/`quizTime`.
- Disambiguate `previousRetention` semantics and ensure it is always temporally earlier than the `retentionScore` being predicted.
- Prevent demo/synthetic data from being mixed with real user data during evaluation; tag and separate datasets clearly (already somewhat implemented via `isDemo`).
- De-duplicate ML points on insert (use sessionId+studentId+daysSinceStudy or a stable id).

## Demo Dataset Limitation

- Current demo dataset: 60 ML points (10 seeded demo + 50 synthetic) written by `seedDemoData()` — see [src/lib/demoData.ts](src/lib/demoData.ts#L98-L150).
- This is insufficient for robust/generalizable validation. All evaluations on this dataset must be labeled PRELIMINARY/demo-only.

"Current demo dataset contains 60 ML points and is insufficient for robust/generalizable validation."
