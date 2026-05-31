#!/usr/bin/env python3
"""
Regenerate assets/search-index.json from all article HTML files.

Run from the repo root before committing:
    python3 .github/scripts/update_index.py
"""

import json, re, sys
from pathlib import Path

SECTION_NAMES = {
    'arts': 'Arts', 'atlas': 'Atlas', 'civilization': 'Civilization',
    'faith': 'Faith', 'hizmet': 'Hizmet', 'learning': 'Learning',
    'life': 'Life', 'spirit': 'Spirit', 'tech': 'Tech',
}

def folder_to_name(folder):
    return folder.replace('-and-', ' & ').replace('-', ' ')

def extract_meta(html):
    title_m = re.search(r'<title[^>]*>([^<]+)</title>', html, re.I)
    title = title_m.group(1).strip() if title_m else ''
    title = re.sub(r'\s*\|\s*Yasir Bilgin\s*$', '', title).strip()

    desc_m = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)', html, re.I)
    if not desc_m:
        desc_m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']', html, re.I)
    desc = desc_m.group(1).strip() if desc_m else ''

    date_m = re.search(r'"datePublished"\s*:\s*"([^"]+)"', html)
    date = date_m.group(1) if date_m else ''

    return title, desc, date

root = Path(__file__).resolve().parent.parent.parent  # repo root
entries = []

for section_dir in sorted(root.iterdir()):
    if not section_dir.is_dir() or section_dir.name not in SECTION_NAMES:
        continue
    section_name = SECTION_NAMES[section_dir.name]
    for subsec_dir in sorted(section_dir.iterdir()):
        if not subsec_dir.is_dir():
            continue
        subsec_name = folder_to_name(subsec_dir.name)
        for html_file in sorted(subsec_dir.rglob('*.html')):
            if html_file.name == 'index.html':
                continue
            rel = html_file.relative_to(root)
            url = 'https://yasirbilgin.com/' + str(rel).replace('\\', '/')
            html = html_file.read_text(errors='ignore')
            title, desc, date = extract_meta(html)
            if not title:
                continue
            entries.append({
                'url': url,
                'section': section_name, 'subsec': subsec_name,
                'title': title, 'desc': desc,
                'date': date,
            })

out = root / 'assets' / 'search-index.json'
out.write_text(json.dumps(entries, ensure_ascii=False, indent=2))
print(f'search-index.json: {len(entries)} entries ({out.stat().st_size // 1024} KB)')

# Bump service worker cache version so browsers discard the old cached search-index.json
sw = root / 'sw.js'
sw_text = sw.read_text()
m = re.search(r"const CACHE = 'ynb-v(\d+)'", sw_text)
if m:
    old_v = int(m.group(1))
    new_v = old_v + 1
    sw.write_text(sw_text.replace(f"ynb-v{old_v}", f"ynb-v{new_v}"))
    print(f'sw.js: cache bumped ynb-v{old_v} → ynb-v{new_v}')
