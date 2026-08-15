// Syllabus index: exports available syllabus documents and metadata.
// Official/verified syllabus files should be added under this folder and
// exported here. Demo or unverified records must be clearly marked with
// `sourceType: "demo"` and `verified: false`.

import Pondicherry_Demo from './pondicherry';
import BTech_CSE_2024 from './pondicherry/university/btech-cse-2024';
import BTech_ECE_2026 from './pondicherry/university/btech-ece-2026';
import BTech_Env_2025 from './pondicherry/university/btech-environmental-2025';
import BTech_Energy_2024 from './pondicherry/university/btech-energy-2024';
import BTech_Materials_2024 from './pondicherry/university/btech-materials-2024';

export const SYLLABI = [
	Pondicherry_Demo,
	BTech_CSE_2024,
	BTech_ECE_2026,
	BTech_Env_2025,
	BTech_Energy_2024,
	BTech_Materials_2024,
];

export default SYLLABI;
