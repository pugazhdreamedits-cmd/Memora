import fs from 'fs';
const path = 'src/data/syllabus/pondicherry/university/btech-cse-2024.ts';
const s = fs.readFileSync(path, 'utf8');
const subjRegex = /\{ code: \"(.*?)\",[\s\S]*?\n\s*\],?/g;
let subjMatch; let subjects = [];
while ((subjMatch = subjRegex.exec(s)) !== null) { subjects.push(subjMatch[0]); }
const totalSubjects = subjects.length;
let unitsTotal = 0, topicsPopulated = 0, labsComplete = 0, pendingSubjects = 0;
for (const sub of subjects) {
	let hasPending = false;
	const unitRegex = /\{\s*id:\s*\"(.*?)\",\s*unit:\s*\"([\s\S]*?)\"[\s\S]*?topics:\s*\[([\s\S]*?)\]\s*\}/g;
	let ur; let subUnits = [];
	while ((ur = unitRegex.exec(sub)) !== null) { subUnits.push({ id: ur[1], unit: ur[2], topics: ur[3] }); }
	if (subUnits.length === 0) {
		const simpleUnitRegex = /unit:\s*\"([\s\S]*?)\"\s*,?\s*topics:\s*\[([\s\S]*?)\]\s*\}/g;
		let su;
		while ((su = simpleUnitRegex.exec(sub)) !== null) { subUnits.push({ id: '', unit: su[1], topics: su[2] }); }
	}
	unitsTotal += subUnits.length;
	for (const u of subUnits) {
		const unitText = (u.unit || '');
		if (unitText.includes('PENDING')) { hasPending = true; }
		const items = (u.topics.match(/\"(.*?)\"/g) || []).length;
		if (items > 0) { topicsPopulated += items; }
	}
	if (/Lab\"/.test(sub)) { if (sub.match(/topics:\s*\[[\s\S]*?\"/)) { labsComplete++; } }
	if (/PENDING/.test(sub)) { pendingSubjects++; }
}
console.log(JSON.stringify({ totalSubjects, unitsTotal, topicsPopulated, labsComplete, pendingSubjects }, null, 2));