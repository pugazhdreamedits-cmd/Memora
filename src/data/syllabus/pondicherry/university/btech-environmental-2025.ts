import type { SyllabusDocument } from "@/types";

const BTech_Env_2025: SyllabusDocument & { sourceType: string; sourceName: string; sourceReference: string; verified: boolean } = {
  university: "Pondicherry University",
  sourceType: "official",
  sourceName: "Pondicherry University",
  sourceReference: "https://www.pondiuni.edu.in/wp-content/uploads/2025/06/PUSyllabus-BTechEnvironmentalEngg.pdf",
  regulation: "Current Regulation (2025)",
  degree: "B.Tech",
  branch: "B.Tech. Environmental Engineering",
  semester: undefined,
  subjects: [],
  meta: {
    note: "Pending extraction: official PDF referenced; subject details not yet parsed.",
    sourcedAt: new Date().toISOString(),
  },
  verified: false,
};

export default BTech_Env_2025;
