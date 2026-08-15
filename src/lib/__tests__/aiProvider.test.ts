import { test, expect } from 'vitest';
import { MockProvider } from "@/lib/aiProvider";

test('MockProvider generates requested count', async () => {
  const p = new MockProvider();
  const qs = await p.generateQuestions({
    university: 'Pondicherry University',
    subject: 'Theory of Computation',
    topic: 'Context Free Grammars',
    count: 4,
  });
  expect(qs.length).toBe(4);
  expect(qs[0].question).toContain('Context Free Grammars');
});
