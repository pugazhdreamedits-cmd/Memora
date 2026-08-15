import { describe, it, expect } from 'vitest';
import { trainModels, getCachedMetrics, predictRetention } from '@/lib/ml';
import type { MLDataPoint } from '@/types';

function makePoint(score: number, dur = 30): MLDataPoint {
  return {
    studentId: 'u1',
    subject: 'Test',
    topic: 't1',
    studyDuration: dur,
    difficulty: 1,
    studyMethod: 1,
    initialScore: score,
    revisionCount: 0,
    daysSinceStudy: 0,
    previousRetention: score,
    quizScore: score,
    quizAccuracy: score / 100,
    quizTime: 60,
    retentionScore: score,
    forgettingRisk: score >= 80 ? 0 : score >= 50 ? 1 : 2,
  };
}

describe('ML engine basic tests', () => {
  it('trainModels returns three metrics', () => {
    const data: MLDataPoint[] = [];
    for (let s = 40; s <= 90; s += 5) data.push(makePoint(s));
    const metrics = trainModels(data);
    expect(metrics).toHaveLength(3);
  });

  it('predictRetention returns values in 0-100 range', () => {
    const data: MLDataPoint[] = [];
    for (let s = 40; s <= 90; s += 5) data.push(makePoint(s));
    trainModels(data);
    const p = makePoint(75);
    const pred = predictRetention(p, data);
    expect(pred.retentionNow).toBeGreaterThanOrEqual(0);
    expect(pred.retentionNow).toBeLessThanOrEqual(100);
  });

  it('train/test split is reproducible (cached metrics consistent)', () => {
    const data: MLDataPoint[] = [];
    for (let s = 40; s <= 90; s += 5) data.push(makePoint(s));
    const m1 = trainModels(data);
    const m2 = trainModels(data);
    expect(JSON.stringify(m1)).toEqual(JSON.stringify(m2));
    const cached = getCachedMetrics();
    expect(cached).toBeDefined();
  });
});
