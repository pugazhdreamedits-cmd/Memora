from PyPDF2 import PdfReader
from pathlib import Path
import json

pdf_path = Path("src/data/syllabus/raw/Syllabus_Affiliated_Eng_B.Tech_.-Computer-Science-Engineering-2023-24.pdf")
out_dir = Path("c:/temp/pdf_pages_text")
out_dir.mkdir(parents=True, exist_ok=True)
report = {"pages": []}

reader = PdfReader(str(pdf_path))
for i, page in enumerate(reader.pages, start=1):
    try:
        text = page.extract_text() or ""
    except Exception:
        text = ""
    p = out_dir / f"page_{i:03d}.txt"
    p.write_text(text, encoding="utf-8")
    report["pages"].append({"page": i, "chars": len(text)})

report_path = out_dir / "extraction_report.json"
report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
print(f"WROTE {len(report['pages'])} pages to {out_dir}")
print(f"Report: {report_path}")
