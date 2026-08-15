import type { SyllabusDocument } from "@/types";

const BTech_Materials_2024: SyllabusDocument & { sourceType: string; sourceName: string; sourceReference: string; verified: boolean } = {
  university: "Pondicherry University",
  sourceType: "official",
  sourceName: "Pondicherry University",
  sourceReference: "https://www.pondiuni.edu.in/wp-content/uploads/2024/07/Syllabus-B.TechMaterialScienceTechnology2024-25.pdf",
  regulation: "Current Regulation (2024)",
  degree: "B.Tech",
  branch: "B.Tech. Material Science & Technology",
  semester: undefined,
  subjects: [],
  meta: {
    note: "Pending extraction: official PDF referenced; subject details not yet parsed.",
    sourcedAt: new Date().toISOString(),
  },
  verified: false,
};

export default BTech_Materials_2024;
