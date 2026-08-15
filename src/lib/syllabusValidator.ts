import SYLLABI from "@/data/syllabus";

export function validateSyllabi() {
  const issues: string[] = [];
  SYLLABI.forEach((doc: any) => {
    if (!doc.university) issues.push("Missing university in syllabus document");
    if (!doc.regulation && doc.sourceType === 'official') issues.push(`Official doc for ${doc.university} missing regulation`);
    if (!doc.subjects || doc.subjects.length === 0) {
      if (doc.sourceType === 'official') issues.push(`Official doc ${doc.university} has no subjects`);
    } else {
      doc.subjects.forEach((sub: any) => {
        if (!sub.name) issues.push(`Subject missing name in ${doc.university}`);
        if (!sub.units || sub.units.length === 0) {
          if (doc.sourceType === 'official') issues.push(`Official subject ${sub.name} missing units`);
        } else {
          sub.units.forEach((u: any) => {
            if (!u.topics || u.topics.length === 0) {
              if (doc.sourceType === 'official') issues.push(`Official subject ${sub.name} unit ${u.unit} has no topics`);
            }
          });
        }
      });
    }
    if (doc.sourceType === 'official') {
      if (!doc.sourceName || !doc.sourceReference) issues.push(`Official doc ${doc.university} missing source metadata`);
      if (!doc.verified) issues.push(`Official doc ${doc.university} not marked verified`);
    }
  });
  return issues;
}

export default validateSyllabi;
