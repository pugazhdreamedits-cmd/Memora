import { describe, it, expect } from 'vitest';
import SYLLABI from "@/data/syllabus";

describe('Pondicherry syllabus records (official)', () => {
  it('official docs include sourceReference and sourceName', () => {
    const official = SYLLABI.filter(d => d.sourceType === 'official');
    official.forEach(doc => {
      expect(doc.sourceReference).toBeTruthy();
      expect(doc.sourceName).toBeTruthy();
    });
  });

  it('verified official docs have subjects, units and topics', () => {
    const verified = SYLLABI.filter(d => d.sourceType === 'official' && d.verified === true);
    verified.forEach(doc => {
      expect(doc.subjects.length).toBeGreaterThan(0);
      doc.subjects.forEach(sub => {
        expect(sub.name).toBeTruthy();
        expect(sub.units.length).toBeGreaterThan(0);
        sub.units.forEach(u => {
          expect(u.topics.length).toBeGreaterThan(0);
        });
      });
    });
  });

  it('no duplicate subject codes within same programme when codes exist', () => {
    SYLLABI.forEach(doc => {
      const codes = doc.subjects.map(s => s.code).filter(Boolean) as string[];
      const dup = codes.find((c, i) => codes.indexOf(c) !== i);
      expect(dup).toBeUndefined();
    });
  });

  it('no duplicate topic titles inside a unit', () => {
    SYLLABI.forEach(doc => {
      doc.subjects.forEach(sub => {
        sub.units.forEach(u => {
          const titles = u.topics.map(t => t.title);
          const dup = titles.find((t, i) => titles.indexOf(t) !== i);
          expect(dup).toBeUndefined();
        });
      });
    });
  });
});
