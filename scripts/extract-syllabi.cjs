const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const pdf = require('pdf-parse');

const OUT_DIR = path.resolve(__dirname, '../src/data/syllabus/raw');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SOURCES = [
  {
    id: 'btech-cse-2024',
    url: 'https://www.pondiuni.edu.in/wp-content/uploads/2024/07/Syllabus-B.Tech_.-ComputerScienceEngineering2024-25Revised-on-18102024.pdf'
  },
  {
    id: 'btech-ece-2026',
    url: 'https://www.pondiuni.edu.in/wp-content/uploads/2026/07/PUSyllabusB.TechECE2026-27-21072026.pdf'
  },
  {
    id: 'btech-environmental-2025',
    url: 'https://www.pondiuni.edu.in/wp-content/uploads/2025/06/PUSyllabus-BTechEnvironmentalEngg.pdf'
  },
  {
    id: 'btech-energy-2024',
    url: 'https://www.pondiuni.edu.in/wp-content/uploads/2024/07/Syllabus-B.TechEnergyScienceandTechnology2024-25.pdf'
  },
  {
    id: 'btech-materials-2024',
    url: 'https://www.pondiuni.edu.in/wp-content/uploads/2024/07/Syllabus-B.TechMaterialScienceTechnology2024-25.pdf'
  }
];

async function downloadAndExtract(src) {
  const res = await fetch(src.url);
  if (!res.ok) throw new Error(`Failed to download ${src.url}: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const data = await pdf(Buffer.from(buffer));
  const outPath = path.join(OUT_DIR, `${src.id}.txt`);
  fs.writeFileSync(outPath, data.text, 'utf8');
  console.log(`Wrote ${outPath} (${data.numpages} pages)`);
}

(async () => {
  for (const s of SOURCES) {
    try {
      console.log('Processing', s.id);
      await downloadAndExtract(s);
    } catch (e) {
      console.error('Error', s.id, e.message);
    }
  }
  console.log('Done');
})();
