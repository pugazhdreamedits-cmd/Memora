import fs from 'fs';
const rawPath='src/data/syllabus/raw/btech-cse-2024.txt';
const raw = fs.existsSync(rawPath)?fs.readFileSync(rawPath,'utf8'):'', outDir='src/data/syllabus/pondicherry/university/extractions';
fs.mkdirSync(outDir,{recursive:true});
const subjects=['CSPC503','CSPC504','CSPC601','CSPC602','CSPC603'];
for(const code of subjects){
  const idx = raw.indexOf(code);
  let start = idx;
  if(idx===-1){ // try name lookup
    // map code to name heuristics
  }
  if(start===-1){ fs.writeFileSync(`${outDir}/${code}.txt`, 'NOT FOUND in raw txt'); continue; }
  // extract up to next subject code occurrence
  const nextCodes = ['CSPC504','CSPC601','CSPC602','CSPC603','CSPC504','CSPC502','CSPC601','CSPC602','CSPC503','CSPL501'];
  let end = raw.length;
  for(const nc of nextCodes){ if(nc===code) continue; const j=raw.indexOf('\n'+nc,start+1); if(j!==-1 && j<end) end=j; }
  const chunk = raw.substring(start,end);
  // find UNIT blocks
  const unitRegex = /(UNIT\s+[IVX]+[\s\S]*?)(?=UNIT\s+[IVX]+|$)/gi;
  const units=[]; let m;
  while((m=unitRegex.exec(chunk))!==null){ units.push(m[1].trim()); }
  const out = units.length?units.join('\n\n---\n\n'):'NO UNITS FOUND';
  fs.writeFileSync(`${outDir}/${code}.txt`, out);
}
console.log('WROTE extractions');
