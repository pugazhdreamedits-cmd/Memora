import json
import re
from pathlib import Path

best = json.loads(Path('c:/temp/best_pages_report.json').read_text(encoding='utf-8'))
out_subjects = []
for entry in best:
    code = entry['code']
    page = entry['best_page']
    txt_path = Path(f'c:/temp/pdf_pages_text/page_{page:03d}.txt')
    if not txt_path.exists():
        continue
    text = txt_path.read_text(encoding='utf-8')
    # Normalize text
    norm = re.sub(r'\r\n|\r', '\n', text)
    # Find units by UNIT I ... UNIT V
    units = []
    # Create patterns for UNIT I .. V (allow variations like "UNIT I -" or "UNIT I :" )
    unit_positions = []
    for m in re.finditer(r'(UNIT\s+I|UNIT\s+II|UNIT\s+III|UNIT\s+IV|UNIT\s+V)', norm, flags=re.IGNORECASE):
        unit_positions.append((m.start(), m.group(0).upper()))
    if unit_positions:
        # append an end marker
        unit_positions.append((len(norm), 'END'))
        for i in range(len(unit_positions)-1):
            start = unit_positions[i][0]
            label = unit_positions[i][1]
            end = unit_positions[i+1][0]
            content = norm[start:end].strip()
            # Extract title (first line)
            lines = [l.strip() for l in content.split('\n') if l.strip()]
            title = lines[0] if lines else label
            # naive topic split: lines after the title that look like numbered lists
            topics = []
            for ln in lines[1:]:
                if re.match(r'^\d+[\.)]\s+', ln) or re.match(r'^\(\d+\)', ln) or ln.startswith('-') or ln.startswith('•'):
                    topics.append(ln)
                else:
                    # keep as long wrapped line if short
                    if len(ln) < 200:
                        topics.append(ln)
            units.append({
                'id': f"{code}-unit-{i+1}",
                'unit': label,
                'title': title,
                'topics': topics
            })
    else:
        # fallback: no unit markers, create single unit with entire text
        units.append({'id': f'{code}-unit-1', 'unit': 'UNIT I', 'title': text.strip().split('\n')[0][:200], 'topics': []})
    out_subjects.append({'code': code, 'name': code, 'units': units})

# Build TS file
out = Path('src/data/syllabus/pondicherry/university/btech-cse-2024.rebuilt.ts')
header = "import type { SyllabusDocument } from \"@/types\";\n\n// Generated rebuild from PDF text extraction (verbatim where found).\n\n"
# Compose minimal structure
obj = {
    'university': 'Pondicherry University',
    'sourceType': 'official',
    'sourceName': 'Pondicherry University (PDF rebuild)',
    'sourceReference': 'src/data/syllabus/raw/Syllabus_Affiliated_Eng_B.Tech_.-Computer-Science-Engineering-2023-24.pdf',
    'regulation': 'REGULATIONS 2023 - 24',
    'degree': 'B.Tech',
    'branch': 'Computer Science and Engineering',
    'semester': None,
    'subjects': [] ,
    'meta': {'note': 'Automated initial rebuild — verify manually.'},
    'verified': False
}
for s in out_subjects:
    subj = {
        'code': s['code'],
        'name': s.get('name', s['code']),
        'units': []
    }
    for u in s['units']:
        subj['units'].append({
            'id': u['id'],
            'unit': u['unit'],
            'title': u['title'],
            'topics': u['topics']
        })
    obj['subjects'].append(subj)

# write JSON then TS
json_text = json.dumps(obj, indent=2, ensure_ascii=False)
ts_text = header + f"const BTech_CSE_2024: any = {json_text};\n\nexport default BTech_CSE_2024;\n"
out.write_text(ts_text, encoding='utf-8')
print('WROTE', out)
