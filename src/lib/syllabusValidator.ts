import SYLLABI from "@/data/syllabus";

export function validateSyllabi() {
  const issues: string[] = [];
  SYLLABI.forEach((doc: any) => {
    if (!doc.university) issues.push("Missing university in syllabus document");
    if (!doc.regulation && doc.sourceType === 'official') issues.push(`Official doc for ${doc.university} missing regulation`);

    // Basic source metadata required for all official docs
    if (doc.sourceType === 'official') {
      if (!doc.sourceName || !doc.sourceReference) issues.push(`Official doc ${doc.university} missing source metadata`);
    }

    // Stricter validation only applies when a document is marked verified:true
    if (doc.verified) {
      if (!doc.subjects || doc.subjects.length === 0) {
        issues.push(`Verified official doc ${doc.university} has no subjects`);
      } else {
        doc.subjects.forEach((sub: any) => {
          if (!sub.name) issues.push(`Subject missing name in ${doc.university}`);
          if (!sub.units || sub.units.length === 0) {
            issues.push(`Verified official subject ${sub.name} missing units`);
          } else {
            sub.units.forEach((u: any) => {
              const isLab = (sub.name && /lab/i.test(sub.name)) || (u.title && /experiment|lab|list of/i.test(u.title));
              if (!u.topics || u.topics.length === 0) {
                if (isLab) {
                  issues.push(`Verified lab subject ${sub.name} unit ${u.unit} missing experiments/topics`);
                } else {
                  issues.push(`Verified subject ${sub.name} unit ${u.unit} has no topics`);
                }
              }
            });
          }
        });
      }
    }
  });
  return issues;
}

export default validateSyllabi;
