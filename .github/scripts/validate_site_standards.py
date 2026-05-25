#!/usr/bin/env python3
"""
validate_site_standards.py
Checks every HTML page on yasirbilgin.com against site standards.
Run from the repo root:
    python3 .github/scripts/validate_site_standards.py

Exit code 0 = all clear. Exit code 1 = violations found.
"""

import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

SECTIONS = {'arts','atlas','civilization','faith','hizmet','learning','life','spirit','tech'}

# Pages that are intentionally minimal (templates/partials) — skip all checks
SKIP_ALL = {
    'faith/Quran-and-Hadith/tafseer-template.html',
    'faith/Quran-and-Hadith/surah-content.html',
}

CORRECT_OG_IMAGE = 'https://yasirbilgin.com/assets/images/social-preview.jpg'

errors   = []   # hard failures — exit 1
warnings = []   # soft issues — reported but exit 0


def err(path, msg):
    errors.append(f"  ✗ {path}: {msg}")

def warn(path, msg):
    warnings.append(f"  ⚠ {path}: {msg}")


def check_file(rel: Path, html: str, is_article: bool):
    p = str(rel)
    if p in SKIP_ALL:
        return
    skip_deep = False

    # ── nav.js ───────────────────────────────────────────────────────────
    if 'nav.js' not in html:
        err(p, "missing nav.js script tag")

    # ── fonts ────────────────────────────────────────────────────────────
    if '/assets/fonts.css' not in html:
        err(p, "missing /assets/fonts.css link")
    if 'fonts.googleapis.com' in html:
        err(p, "direct Google Fonts import — use /assets/fonts.css instead")

    # ── meta description ─────────────────────────────────────────────────
    if not re.search(r'<meta[^>]+name=["\']description["\']', html, re.I):
        err(p, "missing <meta name=\"description\">")

    # ── canonical ────────────────────────────────────────────────────────
    if not re.search(r'<link[^>]+rel=["\']canonical["\']', html, re.I):
        err(p, "missing <link rel=\"canonical\">")

    # ── og:image ─────────────────────────────────────────────────────────
    og_img_m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    if not og_img_m:
        og_img_m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html, re.I)
    if not og_img_m:
        err(p, "missing og:image")
    elif og_img_m.group(1) != CORRECT_OG_IMAGE:
        warn(p, f"og:image is '{og_img_m.group(1)}' — expected '{CORRECT_OG_IMAGE}'")

    # ── og:image:alt ─────────────────────────────────────────────────────
    if not re.search(r'<meta[^>]+property=["\']og:image:alt["\']', html, re.I):
        err(p, "missing og:image:alt")

    # ── twitter:card ─────────────────────────────────────────────────────
    tw_card_m = re.search(r'<meta[^>]+name=["\']twitter:card["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    if not tw_card_m:
        err(p, "missing twitter:card")
    elif tw_card_m.group(1) != 'summary_large_image':
        err(p, f"twitter:card is '{tw_card_m.group(1)}' — expected 'summary_large_image'")

    # ── twitter:image ────────────────────────────────────────────────────
    if not re.search(r'<meta[^>]+name=["\']twitter:image["\']', html, re.I):
        err(p, "missing twitter:image")

    # ── main#main-content ────────────────────────────────────────────────
    if 'id="main-content"' not in html and "id='main-content'" not in html:
        err(p, 'missing <main id="main-content">')

    # ── duplicate og:type ────────────────────────────────────────────────
    if html.count('og:type') > 1:
        err(p, f"duplicate og:type ({html.count('og:type')} occurrences)")

    if is_article:
        # ── Article JSON-LD ───────────────────────────────────────────────
        if '"@type": "Article"' not in html and '"@type":"Article"' not in html:
            warn(p, 'missing Article JSON-LD (@type: Article)')

        # ── BreadcrumbList JSON-LD ────────────────────────────────────────
        if 'BreadcrumbList' not in html:
            warn(p, 'missing BreadcrumbList JSON-LD')

        # ── twitter:title ─────────────────────────────────────────────────
        if 'twitter:title' not in html:
            err(p, "missing twitter:title")

        # ── twitter:description ───────────────────────────────────────────
        if 'twitter:description' not in html:
            err(p, "missing twitter:description")

        # ── datePublished ─────────────────────────────────────────────────
        if '"datePublished"' not in html:
            warn(p, 'missing datePublished in JSON-LD')


# ── Collect files ─────────────────────────────────────────────────────────────

# Homepage and 404
for fname in ('index.html', '404.html'):
    f = ROOT / fname
    if f.exists():
        check_file(Path(fname), f.read_text(errors='ignore'), is_article=False)

# Section index pages
for section in SECTIONS:
    idx = ROOT / section / 'index.html'
    if idx.exists():
        check_file(idx.relative_to(ROOT), idx.read_text(errors='ignore'), is_article=False)

# Article pages
for section in SECTIONS:
    for f in sorted((ROOT / section).rglob('*.html')):
        if f.name == 'index.html':
            continue
        check_file(f.relative_to(ROOT), f.read_text(errors='ignore'), is_article=True)


# ── Report ────────────────────────────────────────────────────────────────────

if warnings:
    print(f"\nWarnings ({len(warnings)}):")
    for w in warnings:
        print(w)

if errors:
    print(f"\nErrors ({len(errors)}) — fix before merging:")
    for e in errors:
        print(e)
    print()
    sys.exit(1)
else:
    print(f"\n✓ All checks passed ({len(warnings)} warning(s)).")
    sys.exit(0)
