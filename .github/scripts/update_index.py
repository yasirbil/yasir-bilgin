#!/usr/bin/env python3
"""
Regenerate assets/search-index.json from all article HTML files.

Run from the repo root before committing:
    python3 .github/scripts/update_index.py
"""

import json, re, sys
from datetime import date as _date
from pathlib import Path

SECTION_NAMES = {
    'arts': 'Arts', 'atlas': 'Atlas', 'civilization': 'Civilization',
    'faith': 'Faith', 'hizmet': 'Hizmet', 'learning': 'Learning',
    'life': 'Life', 'spirit': 'Spirit', 'tech': 'Tech',
}

def folder_to_name(folder):
    return folder.lower().replace('-and-', ' & ').replace('-', ' ').title()

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

    kw_m = re.search(r'<meta[^>]+name=["\']keywords["\'][^>]+content=["\']([^"\']+)', html, re.I)
    if not kw_m:
        kw_m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']keywords["\']', html, re.I)
    tags = [t.strip() for t in kw_m.group(1).split(',')] if kw_m else []

    return title, desc, date, tags

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
            url = 'https://yasirbilgin.com/' + str(rel).replace('\\', '/').lower()
            html = html_file.read_text(errors='ignore')
            title, desc, date, tags = extract_meta(html)
            if not title:
                continue
            entries.append({
                'url': url,
                'section': section_name, 'subsec': subsec_name,
                'title': title, 'desc': desc,
                'date': date,
                'tags': tags,
            })

out = root / 'assets' / 'search-index.json'
out.write_text(json.dumps(entries, ensure_ascii=False, indent=2))
print(f'search-index.json: {len(entries)} entries ({out.stat().st_size // 1024} KB)')

# Regenerate sitemap.xml from the same entries
today = _date.today().isoformat()
sitemap_lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url><loc>https://yasirbilgin.com/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>',
]
for e in entries:
    d = e.get('date') or ''
    # Only include lastmod if date looks valid (2020 or later)
    lastmod_tag = f'<lastmod>{d}</lastmod>' if d >= '2020' else ''
    sitemap_lines.append(
        f'  <url><loc>{e["url"]}</loc>{lastmod_tag}'
        f'<changefreq>monthly</changefreq><priority>0.8</priority></url>'
    )
sitemap_lines.append('</urlset>')
(root / 'sitemap.xml').write_text('\n'.join(sitemap_lines) + '\n')
print(f'sitemap.xml: {len(entries)+1} URLs')

# Bump service worker cache version so browsers discard the old cached search-index.json
sw = root / 'sw.js'
sw_text = sw.read_text()
m = re.search(r"const CACHE = 'ynb-v(\d+)'", sw_text)
if m:
    old_v = int(m.group(1))
    new_v = old_v + 1
    sw.write_text(sw_text.replace(f"ynb-v{old_v}", f"ynb-v{new_v}"))
    print(f'sw.js: cache bumped ynb-v{old_v} → ynb-v{new_v}')
