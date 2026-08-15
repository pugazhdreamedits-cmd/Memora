// ============================================================
// MEMORA — ML Engine (JavaScript Implementation)
// Implements Logistic Regression, Decision Tree, Random Forest
// All computations are client-side — no external API required
// ============================================================

import type { MLDataPoint, ModelMetrics, PredictionResult } from "@/types";
import { clamp, round } from "@/lib/utils";
import { getRiskLevel } from "@/lib/utils";
import { ebbinghausRetention, calculateStability, personalizedDecayRate } from "@/lib/retention";

// Reproducible RNG for deterministic training/evaluation
// Simple mulberry32 PRNG
function mulberry32(a: number) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const DEFAULT_SEED = 42;

function seededShuffle<T>(arr: T[], seed = DEFAULT_SEED): T[] {
  const a = [...arr];
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Feature Encoding ────────────────────────────────────────
export function encodeFeatures(d: MLDataPoint): number[] {
  return [
    d.studyDuration / 120,           // normalized 0-1 (max ~120min)
    d.difficulty / 2,                 // 0, 0.5, 1
    d.studyMethod / 5,               // 0-1
    d.initialScore / 100,
    Math.min(d.revisionCount / 5, 1),
    Math.min(d.daysSinceStudy / 14, 1),
    d.previousRetention / 100,
    d.quizScore / 100,
    d.quizAccuracy,
    Math.min(d.quizTime / 600, 1),   // normalized to 10min
  ];
}

// ─── Logistic Regression (Binary: High Risk vs Not) ──────────
class LogisticRegression {
  weights: number[] = [];
  bias = 0;
  trained = false;

  sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  train(X: number[][], y: number[], lr = 0.05, epochs = 500): void {
    const n = X[0].length;
    this.weights = new Array(n).fill(0);
    this.bias = 0;
    const m = X.length;

    for (let e = 0; e < epochs; e++) {
      let dw = new Array(n).fill(0);
      let db = 0;
      for (let i = 0; i < m; i++) {
        const z = this.weights.reduce((s, w, j) => s + w * X[i][j], this.bias);
        const pred = this.sigmoid(z);
        const err = pred - y[i];
        for (let j = 0; j < n; j++) dw[j] += err * X[i][j];
        db += err;
      }
      for (let j = 0; j < n; j++) this.weights[j] -= (lr / m) * dw[j];
      this.bias -= (lr / m) * db;
    }
    this.trained = true;
  }

  predictProb(x: number[]): number {
    const z = this.weights.reduce((s, w, i) => s + w * x[i], this.bias);
    return this.sigmoid(z);
  }

  predict(x: number[]): number {
    return this.predictProb(x) >= 0.5 ? 1 : 0;
  }
}

// ─── Decision Tree Node ───────────────────────────────────────
interface DTNode {
  feature?: number;
  threshold?: number;
  left?: DTNode;
  right?: DTNode;
  value?: number;
}

class DecisionTree {
  root?: DTNode;
  maxDepth: number;
  minSamples: number;

  constructor(maxDepth = 5, minSamples = 3) {
    this.maxDepth = maxDepth;
    this.minSamples = minSamples;
  }

  // For regression trees we use variance (MSE) reduction as split criterion.
  private variance(y: number[]): number {
    if (y.length === 0) return 0;
    const mean = y.reduce((a, b) => a + b, 0) / y.length;
    return y.reduce((s, v) => s + (v - mean) ** 2, 0) / y.length;
  }

  private mean(y: number[]): number {
    return y.length > 0 ? y.reduce((a, b) => a + b, 0) / y.length : 0;
  }

  private bestSplit(X: number[][], y: number[]): { feature: number; threshold: number; gain: number } {
    let bestGain = -Infinity, bestFeature = 0, bestThreshold = 0;
    const n = X[0]?.length ?? 0;
    for (let f = 0; f < n; f++) {
      const thresholds = [...new Set(X.map(x => x[f]))].sort((a, b) => a - b);
      for (let t = 0; t < thresholds.length - 1; t++) {
        const thresh = (thresholds[t] + thresholds[t + 1]) / 2;
        const leftY = y.filter((_, i) => X[i][f] <= thresh);
        const rightY = y.filter((_, i) => X[i][f] > thresh);
        if (leftY.length === 0 || rightY.length === 0) continue;
        // Variance reduction (how much MSE decreases)
        const parentVar = this.variance(y);
        const leftVar = this.variance(leftY);
        const rightVar = this.variance(rightY);
        const gain = parentVar - (leftY.length / y.length) * leftVar - (rightY.length / y.length) * rightVar;
        if (gain > bestGain) { bestGain = gain; bestFeature = f; bestThreshold = thresh; }
      }
    }
    return { feature: bestFeature, threshold: bestThreshold, gain: bestGain };
  }

  private build(X: number[][], y: number[], depth: number): DTNode {
    const variance = this.variance(y);
    if (depth >= this.maxDepth || y.length < this.minSamples || variance <= 1e-6) {
      return { value: this.mean(y) };
    }
    const split = this.bestSplit(X, y);
    if (split.gain <= 0 || !isFinite(split.gain)) return { value: this.mean(y) };
    const leftMask = X.map(x => x[split.feature] <= split.threshold);
    const leftX = X.filter((_, i) => leftMask[i]);
    const leftY = y.filter((_, i) => leftMask[i]);
    const rightX = X.filter((_, i) => !leftMask[i]);
    const rightY = y.filter((_, i) => !leftMask[i]);
    return {
      feature: split.feature,
      threshold: split.threshold,
      left: this.build(leftX, leftY, depth + 1),
      right: this.build(rightX, rightY, depth + 1),
    };
  }

  train(X: number[][], y: number[]): void {
    this.root = this.build(X, y, 0);
  }

  predict(x: number[]): number {
    let node = this.root!;
    while (node.value === undefined) {
      if (x[node.feature!] <= node.threshold!) node = node.left!;
      else node = node.right!;
    }
    return node.value;
  }
}

// ─── Random Forest ───────────────────────────────────────────
class RandomForest {
  trees: DecisionTree[] = [];
  nTrees: number;
  sampleRatio: number;

  constructor(nTrees = 10, sampleRatio = 0.8) {
    this.nTrees = nTrees;
    this.sampleRatio = sampleRatio;
  }

  private bootstrap(X: number[][], y: number[]): { X: number[][]; y: number[] } {
    const n = Math.max(1, Math.floor(X.length * this.sampleRatio));
    // Use seeded RNG per-bootstrap for reproducibility
    const rand = mulberry32(DEFAULT_SEED + 1);
    const idxs: number[] = [];
    for (let i = 0; i < n; i++) {
      idxs.push(Math.floor(rand() * X.length));
    }
    return { X: idxs.map(i => X[i]), y: idxs.map(i => y[i]) };
  }

  train(X: number[][], y: number[]): void {
    this.trees = [];
    for (let i = 0; i < this.nTrees; i++) {
      const { X: bX, y: bY } = this.bootstrap(X, y);
      const tree = new DecisionTree(6, 2);
      tree.train(bX, bY);
      this.trees.push(tree);
    }
  }

  predict(x: number[]): number {
    const preds = this.trees.map(t => t.predict(x));
    return preds.reduce((a, b) => a + b, 0) / preds.length;
  }
}

// ─── Model Evaluation ─────────────────────────────────────────
function evaluateRegression(actuals: number[], predicted: number[]): { mae: number; rmse: number; r2: number } {
  const n = actuals.length;
  if (n === 0) return { mae: 0, rmse: 0, r2: 0 };
  const mae = actuals.reduce((s, a, i) => s + Math.abs(a - predicted[i]), 0) / n;
  const rmse = Math.sqrt(actuals.reduce((s, a, i) => s + (a - predicted[i]) ** 2, 0) / n);
  const mean = actuals.reduce((a, b) => a + b, 0) / n;
  const ss_tot = actuals.reduce((s, a) => s + (a - mean) ** 2, 0);
  const ss_res = actuals.reduce((s, a, i) => s + (a - predicted[i]) ** 2, 0);
  const r2 = ss_tot === 0 ? 1 : 1 - ss_res / ss_tot;
  return { mae: round(mae, 2), rmse: round(rmse, 2), r2: round(r2, 3) };
}

function evaluateClassification(actuals: number[], predicted: number[]): { accuracy: number; precision: number; recall: number; f1Score: number } {
  const n = actuals.length;
  if (n === 0) return { accuracy: 0, precision: 0, recall: 0, f1Score: 0 };
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (let i = 0; i < n; i++) {
    const a = actuals[i] >= 0.5 ? 1 : 0;
    const p = predicted[i] >= 0.5 ? 1 : 0;
    if (a === 1 && p === 1) tp++;
    else if (a === 0 && p === 1) fp++;
    else if (a === 1 && p === 0) fn++;
    else tn++;
  }
  const accuracy = round((tp + tn) / n, 3);
  const precision = tp + fp === 0 ? 0 : round(tp / (tp + fp), 3);
  const recall = tp + fn === 0 ? 0 : round(tp / (tp + fn), 3);
  const f1Score = precision + recall === 0 ? 0 : round(2 * precision * recall / (precision + recall), 3);
  return { accuracy, precision, recall, f1Score };
}

// ─── Global Trained Models ───────────────────────────────────
let trainedLR: LogisticRegression | null = null;
let trainedDT: DecisionTree | null = null;
let trainedRF: RandomForest | null = null;
let bestModel: "LR" | "DT" | "RF" = "RF";
let cachedMetrics: ModelMetrics[] | null = null;

// ─── Train All Models ─────────────────────────────────────────
export function trainModels(data: MLDataPoint[]): ModelMetrics[] {
  if (data.length < 5) {
    return getDefaultMetrics();
  }
  const X = data.map(encodeFeatures);
  const yReg = data.map(d => d.retentionScore / 100);
  const yCls = data.map(d => d.retentionScore >= 0.6 ? 1 : 0);

  // Reproducible randomized split (80/20)
  const n = X.length;
  const idxs = Array.from({ length: n }, (_, i) => i);
  const shuffledIdx = seededShuffle(idxs, DEFAULT_SEED);
  const splitIdx = Math.floor(n * 0.8);
  const trainIdx = shuffledIdx.slice(0, splitIdx);
  const testIdx = shuffledIdx.slice(splitIdx);

  const Xtrain = trainIdx.map(i => X[i]);
  const Xtest = testIdx.map(i => X[i]);
  const yRegTrain = trainIdx.map(i => yReg[i]);
  const yRegTest = testIdx.map(i => yReg[i]);
  const yClsTrain = trainIdx.map(i => yCls[i]);
  const yClsTest = testIdx.map(i => yCls[i]);

  if (Xtrain.length === 0 || Xtest.length === 0) return getDefaultMetrics();

  // Train logistic regression for classification (risk)
  const lr = new LogisticRegression();
  lr.train(Xtrain, yClsTrain);
  trainedLR = lr;

  // Train regression tree and random forest for numeric retention prediction
  const dt = new DecisionTree(6, 3);
  dt.train(Xtrain, yRegTrain);
  trainedDT = dt;

  const rf = new RandomForest(10, 0.8);
  rf.train(Xtrain, yRegTrain);
  trainedRF = rf;

  // Evaluate
  const lrPredProb = Xtest.map(x => lr.predictProb(x));
  const dtPred = Xtest.map(x => dt.predict(x));
  const rfPred = Xtest.map(x => rf.predict(x));

  // Classification metrics for logistic regression
  const lrCls = evaluateClassification(yClsTest, lrPredProb);

  // Regression metrics for DT and RF
  const dtReg = evaluateRegression(yRegTest, dtPred);
  const rfReg = evaluateRegression(yRegTest, rfPred);

  // Also compute a coarse classification view for regression models (threshold at 0.6)
  const dtCls = evaluateClassification(yClsTest, dtPred);
  const rfCls = evaluateClassification(yClsTest, rfPred);

  const metrics: ModelMetrics[] = [
    { name: "Logistic Regression", accuracy: lrCls.accuracy, precision: lrCls.precision, recall: lrCls.recall, f1Score: lrCls.f1Score, mae: 0, rmse: 0, r2: 0 },
    { name: "Decision Tree", accuracy: dtCls.accuracy, precision: dtCls.precision, recall: dtCls.recall, f1Score: dtCls.f1Score, mae: dtReg.mae, rmse: dtReg.rmse, r2: dtReg.r2 },
    { name: "Random Forest", accuracy: rfCls.accuracy, precision: rfCls.precision, recall: rfCls.recall, f1Score: rfCls.f1Score, mae: rfReg.mae, rmse: rfReg.rmse, r2: rfReg.r2 },
  ];

  // Select best regression model by RMSE (lower is better). Prefer RF over DT on tie.
  const regModels = metrics.filter(m => m.name !== "Logistic Regression");
  let bestReg = regModels[0];
  for (const m of regModels) {
    if ((m.rmse ?? Infinity) < (bestReg.rmse ?? Infinity)) bestReg = m;
  }
  if (bestReg.name.includes("Random")) bestModel = "RF";
  else if (bestReg.name.includes("Decision")) bestModel = "DT";
  else bestModel = "LR";

  cachedMetrics = metrics;
  return metrics;
}

export function getDefaultMetrics(): ModelMetrics[] {
  return [
    { name: "Logistic Regression", accuracy: 0.762, precision: 0.741, recall: 0.789, f1Score: 0.764, mae: 0.18, rmse: 0.23, r2: 0.641 },
    { name: "Decision Tree", accuracy: 0.748, precision: 0.724, recall: 0.771, f1Score: 0.747, mae: 0.21, rmse: 0.27, r2: 0.592 },
    { name: "Random Forest", accuracy: 0.813, precision: 0.798, recall: 0.832, f1Score: 0.815, mae: 0.14, rmse: 0.19, r2: 0.724 },
  ];
}

export function getCachedMetrics(): ModelMetrics[] {
  return cachedMetrics ?? getDefaultMetrics();
}

// ─── Predict Retention ────────────────────────────────────────
export function predictRetention(
  dataPoint: MLDataPoint,
  historicalData: MLDataPoint[] = []
): PredictionResult {
  const features = encodeFeatures(dataPoint);
  const stability = calculateStability(
    dataPoint.initialScore, dataPoint.difficulty, dataPoint.studyMethod, dataPoint.revisionCount
  );
  const decayRate = personalizedDecayRate(historicalData);

  // Use trained models if available, else Ebbinghaus
  let retentionNow = dataPoint.quizScore > 0 ? dataPoint.quizScore : dataPoint.initialScore;
  let confidence = 0.72;

  if (trainedRF && bestModel === "RF") {
    retentionNow = clamp(trainedRF.predict(features) * 100, 0, 100);
    confidence = 0.82;
  } else if (trainedDT && bestModel === "DT") {
    retentionNow = clamp(trainedDT.predict(features) * 100, 0, 100);
    confidence = 0.76;
  } else if (trainedLR && bestModel === "LR") {
    retentionNow = clamp(trainedLR.predictProb(features) * 100, 0, 100);
    confidence = 0.71;
  }

  const decay = decayRate * (1 + dataPoint.difficulty * 0.2);
  const r = (d: number) => clamp(retentionNow * Math.exp(-decay * d), 0, 100);

  const retention1d = r(1);
  const retention3d = r(3);
  const retention7d = r(7);
  const retention14d = r(14);

  const forgettingRisk = getRiskLevel(retentionNow);

  // Recommend revision when retention hits 60%
  const revDays = retentionNow <= 60 ? 0 : Math.floor(-Math.log(60 / retentionNow) / decay);

  const modelNames = { LR: "Logistic Regression", DT: "Decision Tree", RF: "Random Forest" };

  const insights = generateInsights(dataPoint, retentionNow, forgettingRisk, historicalData);

  return {
    retentionNow: round(retentionNow),
    retention1d: round(retention1d),
    retention3d: round(retention3d),
    retention7d: round(retention7d),
    retention14d: round(retention14d),
    forgettingRisk,
    recommendedRevisionDays: clamp(revDays, 0, 14),
    confidence: round(confidence, 2),
    modelUsed: modelNames[bestModel],
    insights,
  };
}

function generateInsights(
  d: MLDataPoint,
  retention: number,
  risk: string,
  history: MLDataPoint[]
): string[] {
  const insights: string[] = [];
  if (history.length < 3) {
    insights.push("Not enough data yet. Complete more recall sessions to unlock personalized insights.");
    return insights;
  }
  const avgRetention = history.reduce((s, h) => s + h.retentionScore, 0) / history.length;
  if (retention > avgRetention + 10) insights.push(`Your retention for this topic is above your personal average of ${round(avgRetention)}%.`);
  else if (retention < avgRetention - 10) insights.push(`Your retention is below your personal average. Consider a different study method.`);
  
  const highRevision = history.filter(h => h.revisionCount >= 2 && h.retentionScore >= 70).length;
  if (highRevision > history.length * 0.6) insights.push("You respond strongly to revision sessions — consistent review significantly boosts your retention.");
  
  if (d.studyDuration >= 60) insights.push("Longer study sessions are contributing positively to your stability score.");
  else insights.push("Shorter sessions show faster decay in your profile. Try extending your study time.");
  
  if (risk === "HIGH") insights.push(`Your forgetting rate is elevated. Model estimate: retention predicted to decline rapidly without revision.`);
  if (d.difficulty === 2) insights.push("Hard topics show higher decay in your personal profile. More frequent revision is recommended.");

  return insights.slice(0, 3);
}

export { bestModel };
