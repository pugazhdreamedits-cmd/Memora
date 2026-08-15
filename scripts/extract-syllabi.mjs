import fs from 'fs';
import path from 'path';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

const OUT_DIR = path.resolve(new URL('.', import.meta.url).pathname, '../src/data/syllabus/raw');
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

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const ab = await res.arrayBuffer();
  return new Uint8Array(ab);
}

async function extractText(buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += strings.join(' ') + '\n\n';
  }
  return { text: fullText, numpages: pdf.numPages };
}

async function run() {
  for (const s of SOURCES) {
    try {
      console.log('Processing', s.id);
      const buf = await fetchBuffer(s.url);
      const data = await extractText(buf);
      const outPath = path.join(OUT_DIR, `${s.id}.txt`);
      fs.writeFileSync(outPath, data.text, 'utf8');
      console.log(`Wrote ${outPath} (${data.numpages} pages)`);
    } catch (e) {
      console.error('Error', s.id, e.message);
    }
  }
}

run().then(() => console.log('Done')).catch(e => console.error(e));
