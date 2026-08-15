import type { SyllabusDocument } from "@/types";

// NOTE: This file is a verbatim transcription attempt from
// src/data/syllabus/raw/btech-cse-2024.txt (extracted from the official PDF).
// Where unit/topic text was not clearly attributable or was truncated in the
// extraction, the section is left clearly marked as PENDING.

const BTech_CSE_2024: SyllabusDocument & { sourceType: string; sourceName: string; sourceReference: string; verified: boolean; meta: any } = {
  university: "Pondicherry University",
  sourceType: "official",
  sourceName: "Pondicherry University",
  // Source: raw extracted text file produced from the uploaded official PDF
  sourceReference: "src/data/syllabus/raw/btech-cse-2024.txt",
  regulation: "REGULATIONS 2023 - 24",
  degree: "B.Tech",
  branch: "Computer Science and Engineering",
  semester: undefined,
  subjects: [
    // The following subject entries are transcribed from the extracted text.
    // Units and topic breakdowns were not always clearly associated in the
    // extraction; those unit details are marked as PENDING below.
    { code: "CSBS101", name: "Mathematics - I", units: [ { id: "pending-1", unit: "PENDING: unit details not readable in extracted text", topics: [] } ] },
    { code: "CSBS102", name: "Physics", units: [ { id: "pending-2", unit: "PENDING: unit details not readable in extracted text", topics: [] } ] },
    { code: "CSES103", name: "Basic Electronics Engineering", units: [ { id: "pending-3", unit: "PENDING: unit details not readable in extracted text", topics: [] } ] },
    { code: "CSBL101", name: "Physics Lab", units: [ { id: "lab-physics-1", unit: "Laboratory (Practical) - details in raw text; see raw file", topics: [] } ] },
    { code: "CSEL102", name: "Basic Electronics Lab", units: [ { id: "lab-elec-1", unit: "Laboratory (Practical) - details in raw text; see raw file", topics: [] } ] },
    { code: "CSEL103", name: "Engineering Graphics & Design Lab", units: [ { id: "lab-eg-1", unit: "Laboratory (Practical) - details in raw text; see raw file", topics: [] } ] },
    { code: "CSHL104", name: "Design Thinking", units: [ { id: "pending-4", unit: "PENDING: unit details not readable in extracted text", topics: [] } ] },
    { code: "CSHS201", name: "English", units: [ { id: "pending-5", unit: "PENDING: unit details not readable in extracted text", topics: [] } ] },
    { code: "CSBS202", name: "Mathematics - II", units: [ { id: "pending-6", unit: "PENDING: unit details not readable in extracted text", topics: [] } ] },
    { code: "CSBS203", name: "Chemistry", units: [ { id: "pending-7", unit: "PENDING: unit details not readable in extracted text", topics: [] } ] },
    { code: "CSES204", name: "Programming for Problem Solving", units: [ { id: "pending-8", unit: "PENDING: unit details not readable in extracted text", topics: [] } ] },
    { code: "CSBL201", name: "Chemistry Lab", units: [ { id: "lab-chem-1", unit: "Laboratory (Practical) - details in raw text; see raw file", topics: [] } ] },
    { code: "CSEL202", name: "Programming for Problem Solving Lab", units: [ { id: "lab-prog-1", unit: "Laboratory (Practical) - details in raw text; see raw file", topics: [] } ] },
    { code: "CSEL203", name: "Workshop / Manufacturing Lab", units: [ { id: "lab-workshop-1", unit: "Laboratory (Practical) - details in raw text; see raw file", topics: [] } ] },

    // Core Computer Science subjects (codes and titles transcribed from raw text)
    { code: "CSPC302", name: "Data Structures and Algorithms", units: [ { id: "pending-cspc302", unit: "PENDING: unit titles and topics not unambiguously parsed from extracted text", topics: [] } ] },
    { code: "CSPC401", name: "Discrete Mathematics", units: [ { id: "pending-cspc401", unit: "PENDING", topics: [] } ] },
    { code: "CSPC402", name: "Computer Organization & Architecture", units: [ { id: "pending-cspc402", unit: "PENDING", topics: [] } ] },
    { code: "CSPC403", name: "Design & Analysis of Algorithms", units: [ { id: "pending-cspc403", unit: "PENDING", topics: [] } ] },
    { code: "CSPC404", name: "Advanced Programming in JAVA", units: [ { id: "pending-cspc404", unit: "PENDING", topics: [] } ] },
    { code: "CSPC501", name: "Computer Networks", units: [ { id: "pending-cspc501", unit: "PENDING", topics: [] } ] },
    { code: "CSPC502", name: "Database Systems", units: [ { id: "pending-cspc502", unit: "PENDING", topics: [] } ] },
    { code: "CSPC503", name: "Theory of Computation", units: [ { id: "pending-cspc503", unit: "PENDING", topics: [] } ] },
    { code: "CSPC504", name: "Operating Systems", units: [ { id: "pending-cspc504", unit: "PENDING", topics: [] } ] },
    { code: "CSPC601", name: "Web Technology", units: [ { id: "pending-cspc601", unit: "PENDING", topics: [] } ] },
    { code: "CSPC602", name: "Compiler Design", units: [ { id: "pending-cspc602", unit: "PENDING", topics: [] } ] },
    { code: "CSPC603", name: "Distributed Computing System", units: [ { id: "pending-cspc603", unit: "PENDING", topics: [] } ] },
    { code: "CSPC604", name: "Artificial Intelligence and Machine Learning", units: [ { id: "pending-cspc604", unit: "PENDING", topics: [] } ] },

    // Professional Electives / Open Electives and Labs (transcribed where present)
    { code: "CSPE301", name: "Cloud Computing", units: [ { id: "pending-cspe301", unit: "PENDING", topics: [] } ] },
    { code: "CSPE502", name: "Deep Learning", units: [ { id: "pending-cspe502", unit: "PENDING", topics: [] } ] },
    { code: "CSPL501", name: "Computer Networks Lab", units: [ { id: "lab-cspl501", unit: "Lab - see raw file for experiment list", topics: [] } ] },
    { code: "CSPL502", name: "Database Systems Lab", units: [ { id: "lab-cspl502", unit: "Lab - see raw file for experiment list", topics: [] } ] },
    { code: "CSPL503", name: "Operating Systems Lab", units: [ { id: "lab-cspl503", unit: "Lab - see raw file for experiment list", topics: [] } ] },
  ],
  meta: {
    rawSourceFile: "src/data/syllabus/raw/btech-cse-2024.txt",
    note: "Transcribed from raw extracted text. Unit/topic-level parsing is incomplete in many places due to extraction truncation — such sections are marked PENDING.",
  },
  verified: false,
};

export default BTech_CSE_2024;
