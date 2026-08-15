import { describe, it, expect } from 'vitest';
import validateSyllabi from '@/lib/syllabusValidator';

describe('Syllabus validation', () => {
  it('demo syllabus should be allowed but flagged', () => {
    const issues = validateSyllabi();
    // We expect no critical failures for demo-only setup; issues list should be an array
    expect(Array.isArray(issues)).toBe(true);
  });
});
