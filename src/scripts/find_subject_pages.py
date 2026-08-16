import re
from pathlib import Path
import json

codes = [
"CSBS101","CSBS102","CSES103","CSBL101","CSEL102","CSEL103","CSHL104","CSHS201","CSBS202","CSBS203","CSES204","CSBL201","CSEL202","CSEL203","CSPC302","CSPC401","CSPC402","CSPC403","CSPC404","CSPC501","CSPC502","CSPC503","CSPC504","CSPC601","CSPC602","CSPC603","CSPC604","CSPE301","CSPE502","CSPL501","CSPL502","CSPL503"
]
path = Path("c:/temp/pdf_pages_text")
results = {}
for txt in sorted(path.glob('page_*.txt')):
    text = txt.read_text(encoding='utf-8')
    for code in codes:
        if code in text:
            results.setdefault(code, []).append(int(txt.stem.split('_')[1]))

out = Path('c:/temp/subject_page_map.json')
out.write_text(json.dumps(results, indent=2), encoding='utf-8')
print('WROTE', out)
