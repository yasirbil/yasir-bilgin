/*!
 * nav.js — Yasir Bilgin dynamic site navigation
 * Drop in any page:  <script src="/nav.js"></script>
 * No dependencies. Desktop: mega-dropdown. Mobile: slide-in drawer.
 * Includes: Google Translate language menu (right side of nav bar).
 */
(function () {
  'use strict';

  const SITE      = 'https://yasirbilgin.com';
  const SITEMAP   = SITE + '/sitemap.xml';
  const NAV_H     = 62;
  const MOBILE_BP = 768;

  /* ─────────────────────────────────────────────
     LANGUAGE MENU CONFIG
     Add or remove languages here as needed.
  ───────────────────────────────────────────── */
  const LANGUAGES = [
    { code: 'en',    label: 'English'  },
    { code: 'tr',    label: 'Türkçe'   },
    { code: 'ar',    label: 'العربية'  },
    { code: 'fr',    label: 'Français' },
    { code: 'de',    label: 'Deutsch'  },
    { code: 'es',    label: 'Español'  },
    { code: 'zh-CN', label: '中文'     },
    { code: 'ja',    label: '日本語'   },
    { code: 'ru',    label: 'Русский'  },
    { code: 'pt',    label: 'Português'},
  ];

  /* ─────────────────────────────────────────────
     1. STYLES
  ───────────────────────────────────────────── */
  const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Lato:wght@400;700&family=Lora:wght@400;600&display=swap');

.ynb-nav *,
.ynb-nav *::before,
.ynb-nav *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── NAV BAR ── */
.ynb-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 2147483646;
  height: ${NAV_H}px;
  background: #f7f3ec;
  border-bottom: 1px solid #d5c9b5;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  font-family: 'Lato', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── BRAND ── */
.ynb-brand {
  font-family: 'Cinzel', serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #1c1812;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.2s;
}
.ynb-brand:hover { color: #8B4513; }

.ynb-divider {
  width: 1px;
  height: 24px;
  background: #d5c9b5;
  margin: 0 1.4rem;
  flex-shrink: 0;
}

/* ── DESKTOP LIST ── */
.ynb-list {
  display: flex;
  align-items: center;
  list-style: none;
  flex: 1;
  min-width: 0;
}
.ynb-item { position: relative; }

.ynb-trigger {
  display: flex;
  align-items: center;
  gap: 0.28rem;
  padding: 0 0.85rem;
  height: ${NAV_H}px;
  font-family: 'Lato', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #38322a;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.18s;
  position: relative;
}
.ynb-trigger::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0.85rem; right: 0.85rem;
  height: 2px;
  background: #8B4513;
  transform: scaleX(0);
  transition: transform 0.2s ease;
}
.ynb-trigger:hover,
.ynb-item.ynb-open .ynb-trigger { color: #8B4513; }
.ynb-trigger:hover::after,
.ynb-item.ynb-open .ynb-trigger::after { transform: scaleX(1); }

.ynb-chevron {
  width: 10px; height: 10px;
  transition: transform 0.25s ease;
  opacity: 0.6; flex-shrink: 0;
}
.ynb-item.ynb-open .ynb-chevron { transform: rotate(180deg); opacity: 1; }

/* ── HAMBURGER ── */
.ynb-hamburger {
  display: none;
  margin-left: auto;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px; height: 40px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
  transition: background 0.15s;
}
.ynb-hamburger:hover { background: rgba(139,69,19,0.08); }
.ynb-hamburger span {
  display: block;
  height: 2px;
  background: #38322a;
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.2s ease;
  transform-origin: center;
}
.ynb-hamburger.ynb-active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.ynb-hamburger.ynb-active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.ynb-hamburger.ynb-active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── SHIMMER ── */
.ynb-skeleton { display: flex; align-items: center; gap: 1rem; flex: 1; }
.ynb-skel-pill {
  height: 12px; border-radius: 6px;
  background: linear-gradient(90deg, #d5c9b5 25%, #efe8db 50%, #d5c9b5 75%);
  background-size: 200% 100%;
  animation: ynb-shimmer 1.4s infinite;
}
@keyframes ynb-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── DESKTOP DROPDOWN ── */
.ynb-dropdown {
  display: none;
  position: fixed;
  min-width: 360px;
  max-width: 720px;
  background: #f7f3ec;
  border: 1px solid #d5c9b5;
  border-top: 3px solid #8B4513;
  box-shadow: 0 8px 32px rgba(28,24,18,0.18);
  padding: 1.4rem 1.6rem 0;
  border-radius: 0 0 6px 6px;
  z-index: 2147483647;
}
.ynb-dropdown.ynb-visible { display: block; }

.ynb-cols {
  display: grid;
  grid-template-columns: repeat(var(--ynb-cols,2), 1fr);
  gap: 0 2rem;
}
.ynb-col { padding-bottom: 1rem; }

.ynb-cat-label {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 0.6rem; font-weight: 600;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: #8B4513; margin-bottom: 0.5rem;
}
.ynb-col-links { display: flex; flex-direction: column; }

.ynb-link {
  display: block;
  font-family: 'Lora', Georgia, serif;
  font-size: 0.84rem; color: #38322a;
  text-decoration: none;
  padding: 0.3rem 0 0.3rem 0.5rem;
  margin-left: -0.5rem;
  line-height: 1.4;
  border-left: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}
.ynb-link:hover { color: #8B4513; border-left-color: #8B4513; }

.ynb-drop-footer {
  border-top: 1px solid #d5c9b5;
  margin: 0 -1.6rem;
  padding: 0.65rem 1.6rem;
  display: flex; justify-content: flex-end;
}
.ynb-drop-footer a {
  font-family: 'Lato', sans-serif;
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #b5651d; text-decoration: none;
  transition: color 0.15s;
}
.ynb-drop-footer a:hover { color: #8B4513; }

/* ── MOBILE DRAWER ── */
.ynb-drawer {
  position: fixed;
  top: ${NAV_H}px; left: 0; right: 0; bottom: 0;
  z-index: 2147483645;
  background: #f7f3ec;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateX(-100%);
  transition: transform 0.28s ease;
  border-top: 1px solid #d5c9b5;
}
.ynb-drawer.ynb-drawer-open { transform: translateX(0); }

.ynb-drawer-inner { padding: 0.5rem 0 4rem; }

.ynb-drawer-item { border-bottom: 1px solid #ece7df; }

.ynb-drawer-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.5rem;
  font-family: 'Lato', sans-serif;
  font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #1c1812;
  text-decoration: none;
  background: none; border: none;
  cursor: pointer; text-align: left;
  transition: color 0.15s, background 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.ynb-drawer-trigger:hover,
.ynb-drawer-item.ynb-drawer-open .ynb-drawer-trigger {
  color: #8B4513;
  background: rgba(139,69,19,0.04);
}

.ynb-drawer-chevron {
  width: 12px; height: 12px;
  flex-shrink: 0;
  transition: transform 0.25s ease;
  opacity: 0.45;
}
.ynb-drawer-item.ynb-drawer-open .ynb-drawer-chevron {
  transform: rotate(180deg);
  opacity: 1;
}

.ynb-drawer-sub {
  display: none;
  padding: 0.2rem 1.5rem 1rem 2.2rem;
  background: rgba(139,69,19,0.025);
}
.ynb-drawer-item.ynb-drawer-open .ynb-drawer-sub { display: block; }

.ynb-drawer-sub-link {
  display: block;
  font-family: 'Lora', Georgia, serif;
  font-size: 0.9rem; color: #5c4e3a;
  text-decoration: none;
  padding: 0.5rem 0 0.5rem 0.8rem;
  border-left: 2px solid #d5c9b5;
  margin-bottom: 0.1rem;
  transition: color 0.15s, border-color 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.ynb-drawer-sub-link:hover,
.ynb-drawer-sub-link:active {
  color: #8B4513;
  border-left-color: #8B4513;
}

.ynb-drawer-view-all {
  display: inline-block;
  margin-top: 0.8rem;
  font-family: 'Lato', sans-serif;
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #b5651d; text-decoration: none;
}
.ynb-drawer-view-all:hover { color: #8B4513; }

.ynb-drawer-subfolder {
  font-family: 'Cinzel', serif;
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8B4513;
  padding: 0.7rem 0 0.3rem 0.8rem;
  margin-top: 0.4rem;
}
.ynb-drawer-subfolder:first-child { margin-top: 0; }

.ynb-drawer-sub-link--nested {
  padding-left: 1.4rem !important;
}

/* ── SCRIM ── */
.ynb-scrim {
  display: none;
  position: fixed;
  inset: 0; top: ${NAV_H}px;
  z-index: 2147483644;
  background: rgba(28,24,18,0.35);
}
.ynb-scrim.ynb-scrim-visible { display: block; }

/* ── LANGUAGE MENU ── */
.ynb-lang-wrap {
  position: relative;
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-left: 0.75rem;
  flex-shrink: 0;
}

/* Globe icon button */
.ynb-lang-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  height: 32px;
  padding: 0 0.65rem;
  background: none;
  border: 1px solid #c8bfb0;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Lato', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  color: #38322a;
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.ynb-lang-btn:hover {
  border-color: #8B4513;
  color: #8B4513;
  background: rgba(139,69,19,0.05);
}
.ynb-lang-btn svg {
  width: 14px; height: 14px;
  flex-shrink: 0;
  opacity: 0.7;
}
.ynb-lang-btn .ynb-lang-chevron {
  width: 8px; height: 8px;
  opacity: 0.5;
  transition: transform 0.2s ease;
}
.ynb-lang-wrap.ynb-lang-open .ynb-lang-chevron { transform: rotate(180deg); opacity: 0.8; }

/* Dropdown panel */
.ynb-lang-panel {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: #f7f3ec;
  border: 1px solid #d5c9b5;
  border-top: 3px solid #8B4513;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 8px 24px rgba(28,24,18,0.15);
  z-index: 2147483647;
  padding: 0.4rem 0;
  overflow: hidden;
}
.ynb-lang-wrap.ynb-lang-open .ynb-lang-panel { display: block; }

.ynb-lang-option {
  display: block;
  width: 100%;
  padding: 0.52rem 1rem;
  font-family: 'Lato', sans-serif;
  font-size: 0.78rem;
  color: #38322a;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
}
.ynb-lang-option:hover { background: rgba(139,69,19,0.07); color: #8B4513; }
.ynb-lang-option.ynb-lang-active {
  color: #8B4513;
  font-weight: 700;
}

/* Mobile: language row at bottom of drawer */
.ynb-drawer-lang {
  padding: 1rem 1.5rem 0.5rem;
  border-top: 1px solid #ece7df;
  margin-top: 0.5rem;
}
.ynb-drawer-lang-label {
  font-family: 'Cinzel', serif;
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8B4513;
  margin-bottom: 0.6rem;
  display: block;
}
.ynb-drawer-lang-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.ynb-drawer-lang-opt {
  padding: 0.35rem 0.75rem;
  border: 1px solid #c8bfb0;
  border-radius: 4px;
  font-family: 'Lato', sans-serif;
  font-size: 0.72rem;
  color: #38322a;
  background: none;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
  -webkit-tap-highlight-color: transparent;
}
.ynb-drawer-lang-opt:hover,
.ynb-drawer-lang-opt:active { border-color: #8B4513; color: #8B4513; background: rgba(139,69,19,0.05); }
.ynb-drawer-lang-opt.ynb-lang-active { border-color: #8B4513; color: #8B4513; font-weight: 700; }

/* Suppress Google Translate's own toolbar — we drive it via cookie */
.goog-te-banner-frame,
.goog-te-banner-frame.skiptranslate { display: none !important; }
body { top: 0 !important; }
.goog-te-gadget { display: none !important; }

/* ── RESPONSIVE ── */
@media (max-width: ${MOBILE_BP}px) {
  .ynb-divider   { display: none; }
  .ynb-list      { display: none; }
  .ynb-hamburger { display: flex; }
  .ynb-lang-wrap { display: none; } /* shown inside drawer instead */
}
@media (min-width: ${MOBILE_BP + 1}px) {
  .ynb-drawer { display: none !important; }
  .ynb-scrim  { display: none !important; }
}
`;

  /* ─────────────────────────────────────────────
     2. HELPERS
  ───────────────────────────────────────────── */
  function decodeXml(str) {
    return str
      .replace(/&amp;/g,  '&').replace(/&lt;/g,   '<')
      .replace(/&gt;/g,   '>').replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }
  function toTitleCase(slug) {
    return slug.replace(/\.html?$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') node.className = v;
      else if (k === 'textContent') node.textContent = v;
      else node.setAttribute(k, v);
    });
    if (children) children.forEach(c => c && node.appendChild(c));
    return node;
  }
  function chevronSVG(cls) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 10 6');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', cls);
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M1 1l4 4 4-4');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.5');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    return svg;
  }
  function globeSVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    `;
    return svg;
  }

  /* ─────────────────────────────────────────────
     3. FETCH
  ───────────────────────────────────────────── */
  async function fetchSitemap() {
    try {
      const r = await fetch(SITEMAP, { cache: 'no-cache' });
      if (r.ok) return await r.text();
    } catch (_) {}
    try {
      const r = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(SITEMAP)}`,
        { cache: 'no-cache' }
      );
      if (r.ok) { const j = await r.json(); if (j?.contents) return j.contents; }
    } catch (_) {}
    try {
      const r = await fetch(
        `https://corsproxy.io/?${encodeURIComponent(SITEMAP)}`,
        { cache: 'no-cache' }
      );
      if (r.ok) return await r.text();
    } catch (_) {}
    return null;
  }

  /* ─────────────────────────────────────────────
     4. PARSE
  ───────────────────────────────────────────── */
  function parseSitemap(xml) {
    const cats = new Map();
    const re = /<loc>([\s\S]*?)<\/loc>/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const url   = decodeXml(m[1].trim());
      if (!url.startsWith(SITE + '/')) continue;
      const parts = url.slice(SITE.length + 1).split('/').filter(Boolean);
      if (!parts.length) continue;
      const cat = parts[0];
      if (cat === 'home') continue;
      if (!cats.has(cat)) cats.set(cat, []);

      if (parts.length === 1) {
        // skip category root
      } else if (parts.length === 2) {
        cats.get(cat).push({ name: toTitleCase(parts[1]), url, group: '' });
      } else {
        cats.get(cat).push({
          name:  toTitleCase(parts[parts.length - 1]),
          url,
          group: toTitleCase(parts[1]),
        });
      }
    }
    return cats;
  }

  /* ─────────────────────────────────────────────
     5. LANGUAGE MENU
  ───────────────────────────────────────────── */
  function getCurrentLang() {
    // GT may rewrite cookie to /tr/tr — grab last segment only.
    // Also handle zh-CN style codes with a hyphen.
    const m = document.cookie.match(/googtrans=\/[^/]+\/([^;,\s]+)/i);
    const code = m ? m[1] : 'en';
    return LANGUAGES.find(l => l.code === code) ? code : 'en';
  }

  function nukeGTCookies() {
    const hostname = location.hostname;           // yasirbilgin.com
    const bare     = hostname.replace(/^www\./, '').replace(/^[^.]+\./, ''); // yasirbilgin.com
    const sub      = hostname;                    // yasirbilgin.com
    const exp      = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';

    // Every realistic domain GT might have used to set the cookie
    const domains = [
      '',           // no domain attr
      sub,          // yasirbilgin.com
      '.'+ sub,     // .yasirbilgin.com
      bare,         // yasirbilgin.com
      '.'+ bare,    // .yasirbilgin.com
    ];

    const paths     = ['/'];
    const sameSites = ['', '; SameSite=Lax', '; SameSite=None; Secure'];

    domains.forEach(d => {
      const dc = d ? 'domain='+ d +'; ' : '';
      paths.forEach(p => {
        sameSites.forEach(ss => {
          document.cookie = 'googtrans=; path='+ p +'; '+ dc + exp + ss;
        });
      });
    });
  }

  function switchLanguage(code) {
    nukeGTCookies();

    if (code !== 'en') {
      const hostname = location.hostname;
      const bare     = hostname.replace(/^www\./, '').replace(/^[^.]+\./, '');
      // Write on every domain variation with every SameSite variant
      [hostname, '.'+ hostname, bare, '.'+ bare].forEach(d => {
        document.cookie = 'googtrans=/en/'+ code +'; path=/; domain='+ d;
        document.cookie = 'googtrans=/en/'+ code +'; path=/; domain='+ d +'; SameSite=None; Secure';
      });
      document.cookie = 'googtrans=/en/'+ code +'; path=/';
    }

    // Small wait to ensure cookie writes are committed, then navigate fresh
    setTimeout(() => {
      const url = location.href.split('#')[0];
      location.href = url;
    }, 50);
  }

  function loadGoogleTranslate() {
    const anchor = document.createElement('div');
    anchor.id = 'google_translate_element';
    anchor.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(anchor);

    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
          // Suppress the floating GT toolbar entirely
          gaTrack: false,
        },
        'google_translate_element'
      );
    };

    const s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.head.appendChild(s);
  }

  function buildLangMenu() {
    const current = getCurrentLang();
    const currentLang = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];

    /* ── Desktop widget ── */
    const wrap = el('div', { className: 'ynb-lang-wrap' });
    wrap.setAttribute('aria-label', 'Language selector');

    const btn = document.createElement('button');
    btn.className = 'ynb-lang-btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.appendChild(globeSVG());
    const btnLabel = document.createElement('span');
    btnLabel.setAttribute('translate', 'no');
    btnLabel.textContent = currentLang.label;
    btn.appendChild(btnLabel);
    btn.appendChild(chevronSVG('ynb-lang-chevron'));

    const panel = el('div', { className: 'ynb-lang-panel', role: 'menu' });

    LANGUAGES.forEach(lang => {
      const opt = document.createElement('button');
      opt.className = 'ynb-lang-option' + (lang.code === current ? ' ynb-lang-active' : '');
      opt.setAttribute('role', 'menuitem');
      opt.setAttribute('translate', 'no');
      opt.textContent = lang.label;
      opt.addEventListener('click', () => switchLanguage(lang.code));
      panel.appendChild(opt);
    });

    // Translation quality caveat
    const caveat = el('p', {});
    caveat.style.cssText = 'font-size:10px;color:#9a8f82;padding:0.5rem 1rem 0.4rem;border-top:1px solid rgba(0,0,0,0.08);margin-top:0.25rem;line-height:1.5;';
    caveat.setAttribute('translate', 'no');
    caveat.textContent = 'Translations are automated. Arabic & classical texts may be imprecise.';
    panel.appendChild(caveat);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = wrap.classList.contains('ynb-lang-open');
      // Close any open nav dropdowns first
      document.dispatchEvent(new MouseEvent('click'));
      if (!isOpen) {
        wrap.classList.add('ynb-lang-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', () => {
      wrap.classList.remove('ynb-lang-open');
      btn.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        wrap.classList.remove('ynb-lang-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    wrap.appendChild(btn);
    wrap.appendChild(panel);
    return wrap;
  }

  function buildDrawerLangSection(drawerInner) {
    const current = getCurrentLang();
    const section = el('div', { className: 'ynb-drawer-lang' });
    section.appendChild(el('span', { className: 'ynb-drawer-lang-label', textContent: 'Language' }));
    const grid = el('div', { className: 'ynb-drawer-lang-grid' });

    LANGUAGES.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'ynb-drawer-lang-opt' + (lang.code === current ? ' ynb-lang-active' : '');
      btn.setAttribute('translate', 'no');
      btn.textContent = lang.label;
      btn.addEventListener('click', () => switchLanguage(lang.code));
      grid.appendChild(btn);
    });

    section.appendChild(grid);

    // Translation quality caveat (mobile drawer)
    const caveat = el('p', {});
    caveat.style.cssText = 'font-size:10px;color:#9a8f82;padding:0.5rem 0 0;line-height:1.5;';
    caveat.setAttribute('translate', 'no');
    caveat.textContent = 'Translations are automated. Arabic & classical texts may be imprecise.';
    section.appendChild(caveat);

    drawerInner.appendChild(section);
  }

  /* ─────────────────────────────────────────────
     6. DESKTOP ITEMS
  ───────────────────────────────────────────── */
  function buildDesktopItems(list, cats) {
    let openDrop = null, openLi = null;

    function closeAll() {
      if (openDrop) { openDrop.classList.remove('ynb-visible'); openDrop = null; }
      if (openLi)   {
        openLi.classList.remove('ynb-open');
        openLi.querySelector('.ynb-trigger')?.setAttribute('aria-expanded', 'false');
        openLi = null;
      }
    }

    cats.forEach((subs, cat) => {
      const label  = toTitleCase(cat);
      const catUrl = `${SITE}/${cat}`;
      const li     = el('li', { className: 'ynb-item', role: 'none' });

      if (subs.length === 0) {
        li.appendChild(el('a', { className: 'ynb-trigger', href: catUrl, textContent: label, role: 'menuitem' }));
      } else {
        const btn = el('button', { className: 'ynb-trigger', 'aria-haspopup': 'true', 'aria-expanded': 'false', role: 'menuitem' });
        btn.appendChild(document.createTextNode(label));
        btn.appendChild(chevronSVG('ynb-chevron'));

        const groupMap = new Map();
        subs.forEach(p => {
          const g = p.group || '';
          if (!groupMap.has(g)) groupMap.set(g, []);
          groupMap.get(g).push(p);
        });
        const groups   = [...groupMap.entries()];
        const colCount = Math.min(3, Math.max(1, groups.length));
        const colsDiv  = el('div', { className: 'ynb-cols' });
        colsDiv.style.setProperty('--ynb-cols', colCount);

        groups.forEach(([group, pages]) => {
          const linksDiv = el('div', { className: 'ynb-col-links' });
          pages.forEach(p => linksDiv.appendChild(el('a', {
            className: 'ynb-link', href: p.url, textContent: p.name,
          })));
          const heading = group || label;
          colsDiv.appendChild(el('div', { className: 'ynb-col' }, [
            el('span', { className: 'ynb-cat-label', textContent: heading }),
            linksDiv,
          ]));
        });

        const footerDiv = el('div', { className: 'ynb-drop-footer' });
        footerDiv.appendChild(el('a', { href: catUrl, textContent: `View all in ${label} →` }));

        const drop = el('div', { className: 'ynb-dropdown', role: 'region' }, [colsDiv, footerDiv]);
        document.documentElement.appendChild(drop);
        li.appendChild(btn);

        btn.addEventListener('click', e => {
          e.stopPropagation();
          const isOpen = li.classList.contains('ynb-open');
          closeAll();
          if (!isOpen) {
            const r     = btn.getBoundingClientRect();
            const dropW = Math.min(720, Math.max(360, window.innerWidth * 0.5));
            let left    = r.left + r.width / 2 - dropW / 2;
            left = Math.max(8, Math.min(left, window.innerWidth - dropW - 8));
            drop.style.top   = NAV_H + 'px';
            drop.style.left  = left + 'px';
            drop.style.width = dropW + 'px';
            drop.classList.add('ynb-visible');
            li.classList.add('ynb-open');
            btn.setAttribute('aria-expanded', 'true');
            openDrop = drop; openLi = li;
          }
        });
      }
      list.appendChild(li);
    });

    document.addEventListener('click',   closeAll);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  }

  /* ─────────────────────────────────────────────
     7. MOBILE DRAWER
  ───────────────────────────────────────────── */
  function buildDrawerContent(drawer, cats) {
    const inner = el('div', { className: 'ynb-drawer-inner' });

    cats.forEach((subs, cat) => {
      const label  = toTitleCase(cat);
      const catUrl = `${SITE}/${cat}`;
      const item   = el('div', { className: 'ynb-drawer-item' });

      if (subs.length === 0) {
        item.appendChild(el('a', { className: 'ynb-drawer-trigger', href: catUrl, textContent: label }));
      } else {
        const trig = el('button', { className: 'ynb-drawer-trigger', 'aria-expanded': 'false' });
        trig.appendChild(document.createTextNode(label));
        trig.appendChild(chevronSVG('ynb-drawer-chevron'));

        const sub = el('div', { className: 'ynb-drawer-sub' });

        const groupMap = new Map();
        subs.forEach(p => {
          const g = p.group || '';
          if (!groupMap.has(g)) groupMap.set(g, []);
          groupMap.get(g).push(p);
        });
        groupMap.forEach((pages, group) => {
          if (group) {
            sub.appendChild(el('div', { className: 'ynb-drawer-subfolder', textContent: group }));
          }
          pages.forEach(p => sub.appendChild(el('a', {
            className: 'ynb-drawer-sub-link' + (group ? ' ynb-drawer-sub-link--nested' : ''),
            href: p.url,
            textContent: p.name,
          })));
        });

        sub.appendChild(el('a', { className: 'ynb-drawer-view-all', href: catUrl, textContent: `View all in ${label} →` }));

        trig.addEventListener('click', () => {
          const isOpen = item.classList.contains('ynb-drawer-open');
          inner.querySelectorAll('.ynb-drawer-item.ynb-drawer-open').forEach(i => {
            i.classList.remove('ynb-drawer-open');
            i.querySelector('button')?.setAttribute('aria-expanded', 'false');
          });
          if (!isOpen) {
            item.classList.add('ynb-drawer-open');
            trig.setAttribute('aria-expanded', 'true');
          }
        });

        item.appendChild(trig);
        item.appendChild(sub);
      }
      inner.appendChild(item);
    });

    // Language section at the bottom of the mobile drawer
    buildDrawerLangSection(inner);

    drawer.innerHTML = '';
    drawer.appendChild(inner);
  }

  /* ─────────────────────────────────────────────
     8. INJECT
  ───────────────────────────────────────────── */
  function injectNav() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const nav = document.createElement('nav');
    nav.className = 'ynb-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Site navigation');

    nav.appendChild(el('a', { className: 'ynb-brand', href: SITE, textContent: 'Yasir Bilgin' }));
    nav.appendChild(el('span', { className: 'ynb-divider', 'aria-hidden': 'true' }));

    const list = el('ul', { className: 'ynb-list', role: 'menubar' });
    const skel = el('li', { className: 'ynb-skeleton', 'aria-hidden': 'true' });
    [72, 60, 88, 56].forEach(w => {
      const pill = el('div', { className: 'ynb-skel-pill' });
      pill.style.width = w + 'px';
      skel.appendChild(pill);
    });
    list.appendChild(skel);
    nav.appendChild(list);

    // Language menu — desktop (right side, before hamburger)
    nav.appendChild(buildLangMenu());

    const ham = el('button', {
      className: 'ynb-hamburger',
      'aria-label': 'Open navigation menu',
      'aria-expanded': 'false',
    });
    ham.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(ham);

    const drawer = el('div', { className: 'ynb-drawer' });
    const scrim  = el('div', { className: 'ynb-scrim'  });

    // Skip-to-content link (accessibility — keyboard users skip nav)
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to content';
    skipLink.style.cssText = [
      'position:absolute', 'top:-48px', 'left:1rem',
      'background:#2d4a3e', 'color:#fff',
      'padding:0.5rem 1rem', 'border-radius:0 0 6px 6px',
      'font-family:sans-serif', 'font-size:13px', 'font-weight:600',
      'z-index:2147483647', 'transition:top 0.15s', 'text-decoration:none'
    ].join(';');
    skipLink.addEventListener('focus',  () => { skipLink.style.top = '0'; });
    skipLink.addEventListener('blur',   () => { skipLink.style.top = '-48px'; });
    document.body.insertBefore(skipLink, document.body.firstChild);

    document.body.insertBefore(nav, skipLink.nextSibling);
    document.documentElement.appendChild(drawer);
    document.documentElement.appendChild(scrim);

    document.body.style.paddingTop =
      (parseInt(document.body.style.paddingTop, 10) || 0) + NAV_H + 'px';

    function openDrawer()  {
      drawer.classList.add('ynb-drawer-open');
      scrim.classList.add('ynb-scrim-visible');
      ham.classList.add('ynb-active');
      ham.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      drawer.classList.remove('ynb-drawer-open');
      scrim.classList.remove('ynb-scrim-visible');
      ham.classList.remove('ynb-active');
      ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    ham.addEventListener('click', e => {
      e.stopPropagation();
      drawer.classList.contains('ynb-drawer-open') ? closeDrawer() : openDrawer();
    });
    scrim.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

    return { list, drawer, skel };
  }

  /* ─────────────────────────────────────────────
     9. INIT
  ───────────────────────────────────────────── */
  async function init() {
    const { list, drawer, skel } = injectNav();
    loadGoogleTranslate();
    const xml = await fetchSitemap();
    skel.remove();
    if (!xml) return;
    const cats = parseSitemap(xml);
    buildDesktopItems(list, cats);
    buildDrawerContent(drawer, cats);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();