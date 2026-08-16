import json, re
from pathlib import Path

ts_path = Path('src/data/syllabus/pondicherry/university/btech-cse-2024.rebuilt.ts')
s = ts_path.read_text(encoding='utf-8')
# Find the JSON object start
m = re.search(r"=\s*(\{[\s\S]*\})\s*;\n\nexport default", s)
if not m:
    print('JSON block not found')
    raise SystemExit(1)
json_text = m.group(1)
obj = json.loads(json_text)
subjects = obj['subjects']
Total_subjects = len(subjects)
units_total = 0
units_completed = 0
topics_total = 0
topics_completed = 0
labs_total = 0
labs_completed = 0
subjects_complete = 0
subjects_partial = 0
subjects_missing = 0
missing_subjects_list = []
for sub in subjects:
    subs_units = len(sub.get('units',[]))
    units_total += subs_units
    sub_topics = 0
    sub_topics_filled = 0
    for u in sub.get('units',[]):
        topics = u.get('topics', [])
        topics_total += max(1, len(topics))
        if len(topics) > 0:
            topics_completed += len(topics)
        # treat unit as completed if topics present
        if len(topics) > 0:
            units_completed += 1
        # labs detection
        title = u.get('title','').lower()
        if 'experiment' in title or 'list of' in title or 'lab' in sub.get('name','').lower():
            labs_total += 1
            if len(topics) > 0:
                labs_completed += 1
    # subject completeness heuristic: all units have topics
    all_units_have_topics = all(len(u.get('topics',[]))>0 for u in sub.get('units',[]))
    any_unit_has_topics = any(len(u.get('topics',[]))>0 for u in sub.get('units',[]))
    if all_units_have_topics and subs_units>0:
        subjects_complete += 1
    elif any_unit_has_topics:
        subjects_partial += 1
    else:
        subjects_missing += 1
        missing_subjects_list.append(sub.get('code'))

# pages unreadable: from extraction_report.json, threshold <200 chars
report = json.loads(Path('c:/temp/pdf_pages_text/extraction_report.json').read_text(encoding='utf-8'))
unreadable = [p['page'] for p in report['pages'] if p['chars'] < 200]
ambiguous = []
# search for PENDING or 'verbatim fragment' markers
if 'PENDING' in s or 'verbatim fragment' in s or 'PARTIAL' in s:
    ambiguous.append('PENDING/verbatim markers present in rebuilt file')

out = {
    'Total subjects': Total_subjects,
    'Subjects complete': subjects_complete,
    'Subjects partial': subjects_partial,
    'Subjects missing': subjects_missing,
    'Units completed': units_completed,
    'Units total': units_total,
    'Topics completed': topics_completed,
    'Topics total': topics_total,
    'Labs total (detected)': labs_total,
    'Labs completed (detected)': labs_completed,
    'Unreadable pages (<200 chars)': unreadable,
    'Ambiguous markers': ambiguous,
    'Missing subjects list': missing_subjects_list
}

out_path = Path('docs/CSE_RAW_SYLLABUS_AUDIT.md')
content = []
content.append('# CSE RAW SYLLABUS PDF REBUILD AUDIT\n')
content.append('Summary of automated PDF-based rebuild of Pondicherry University B.Tech CSE syllabus.\n')
for k,v in out.items():
    content.append(f'- **{k}**: {v}\n')
content.append('\n# Notes\n')
content.append('- Rebuild was automated by extracting per-page text and parsing UNIT I–V markers.\n')
content.append('- Ambiguous marker present means some sections still contain placeholders from the previous transcription or extraction fragments.\n')
content.append('- Do NOT set `verified: true` until a manual pass confirms wording and per-topic accuracy.\n')

out_path.write_text('\n'.join(content), encoding='utf-8')
print('WROTE', out_path)
