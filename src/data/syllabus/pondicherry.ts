// DEMO syllabus scaffold for Pondicherry University — NOT an authoritative copy.
// This file is intentionally marked as demo and unverified. Replace with official JSON
// imported from Pondicherry University's published curriculum documents when available.

import type { SyllabusDocument } from "@/types";

const Pondicherry_Demo: SyllabusDocument & { sourceType: string; verified: boolean } = {
  university: "Pondicherry University",
  regulation: "demo",
  degree: "B.Tech",
  branch: "CSE",
  semester: 5,
  subjects: [],
  meta: { note: "DEMO syllabus structure — no official verification. Do not treat as official." },
  sourceType: "demo",
  verified: false,
};

export default Pondicherry_Demo;
