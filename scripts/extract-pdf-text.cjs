const fs = require('fs');
const path = require('path');
const { PdfReader } = require('pdfreader');

const PDF_PATH = path.resolve(__dirname, '../src/data/syllabus/raw/Syllabus_Affiliated_Eng_B.Tech_.-Computer-Science-Engineering-2023-24.pdf');
const OUT_PATH = path.resolve(__dirname, '../src/data/syllabus/raw/btech-cse-2024.txt');

function extractText(pdfPath, outPath) {
  return new Promise((resolve, reject) => {
    const rows = {};
    new PdfReader().parseFileItems(pdfPath, function(err, item){
      if (err) return reject(err);
      if (!item) {
        // end
        const pageText = Object.keys(rows).sort((a,b)=>a-b).map(k=>rows[k].join(' ')).join('\n');
        fs.writeFileSync(outPath, pageText, 'utf8');
        return resolve({ path: outPath });
      }
      if (item.text) {
        const y = Math.round(item.y);
        rows[y] = rows[y] || [];
        rows[y].push(item.text);
      }
    });
  });
}

(async ()=>{
  try {
    console.log('Extracting from', PDF_PATH);
    const res = await extractText(PDF_PATH, OUT_PATH);
    console.log('Wrote', res.path);
  } catch (e) {
    console.error('Failed to extract:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
