import json
from pathlib import Path

mapping = json.loads(Path('c:/temp/subject_page_map.json').read_text(encoding='utf-8'))
report = []
for code, pages in mapping.items():
    best = None
    best_chars = -1
    for p in pages:
        txt = Path(f'c:/temp/pdf_pages_text/page_{p:03d}.txt')
        if not txt.exists():
            continue
        chars = len(txt.read_text(encoding='utf-8'))
        if chars > best_chars:
            best_chars = chars
            best = p
    if best is None:
        continue
    preview = Path(f'c:/temp/pdf_pages_text/page_{best:03d}.txt').read_text(encoding='utf-8')[:1000]
    out = Path(f'c:/temp/preview_{code}.txt')
    out.write_text(preview, encoding='utf-8')
    report.append({"code": code, "best_page": best, "chars": best_chars, "preview_path": str(out)})

Path('c:/temp/best_pages_report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print('WROTE report with', len(report), 'entries')
