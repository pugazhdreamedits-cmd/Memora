import type { SyllabusDocument } from "@/types";

const BTech_ECE_2026: SyllabusDocument & { sourceType: string; sourceName: string; sourceReference: string; verified: boolean } = {
  university: "Pondicherry University",
  sourceType: "official",
  sourceName: "Pondicherry University",
  sourceReference: "https://www.pondiuni.edu.in/wp-content/uploads/2026/07/PUSyllabusB.TechECE2026-27-21072026.pdf",
  regulation: "Current Regulation (2026)",
  degree: "B.Tech",
  branch: "B.Tech. ( Electronics & Communication Engineering )",
  semester: undefined,
  subjects: [],
  meta: {
    note: "Pending extraction: PDF available on PU site; subjects/units/topics to be parsed and verified.",
    sourcedAt: new Date().toISOString(),
  },
  verified: false,
};

export default BTech_ECE_2026;
