import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

const routes = [
  '/en',
  '/ne',
  '/en/doctors',
  '/ne/doctors',
  '/en/doctors/prof-dr-shaileja-chhetri',
  '/en/services',
  '/en/services/general-opd-consultation',
  '/en/lab-tests',
  '/en/lab-tests/complete-blood-count-cbc',
  '/en/book',
  '/ne/book',
  '/en/explore/about',
  '/en/explore/faq',
  '/en/explore/health-info',
  '/en/explore/health-info/hypertension-awareness-stage5',
  '/en/privacy',
  '/en/terms',
  '/en/portal/login',
  '/en/portal/register',
  '/en/portal/forgot-password',
  '/sai-clinic-management/login',
];

const viewports = [
  { name: 'mobile-320', width: 320, height: 640, mobile: true },
  { name: 'mobile-360', width: 360, height: 740, mobile: true },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-414', width: 414, height: 896, mobile: true },
  { name: 'phablet-480', width: 480, height: 900, mobile: true },
  { name: 'tablet-640', width: 640, height: 960, mobile: true },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true },
  { name: 'tablet-834', width: 834, height: 1112, mobile: true },
  { name: 'landscape-844', width: 844, height: 390, mobile: true },
  { name: 'laptop-1024', width: 1024, height: 768, mobile: false },
  { name: 'laptop-1280', width: 1280, height: 800, mobile: false },
  { name: 'desktop-1440', width: 1440, height: 900, mobile: false },
  { name: 'desktop-1920', width: 1920, height: 1080, mobile: false },
];

const only = process.env.ONLY;
const onlyViewport = process.env.ONLY_VIEWPORT;

const auditPage = (page) =>
  page.evaluate(() => {
    const vw = window.innerWidth;
    const res = { pageOverflow: Math.max(0, document.documentElement.scrollWidth - vw), offenders: [], smallTargets: [] };
    const cache = new Map();
    const cs = (el) => { if (!cache.has(el)) cache.set(el, getComputedStyle(el)); return cache.get(el); };
    const fixedAncestor = (el) => {
      let p = el;
      while (p && p !== document.documentElement) { if (cs(p).position === 'fixed') return true; p = p.parentElement; }
      return false;
    };
    const isVisible = (el) => {
      const s = cs(el);
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };
    const scrollOrClip = (el) => {
      let p = el.parentElement;
      while (p && p !== document.body) {
        if (cs(p).overflowX !== 'visible') return p;
        p = p.parentElement;
      }
      return null;
    };
    const desc = (el) => {
      const r = el.getBoundingClientRect();
      const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 4).join('.') : '';
      return {
        sel: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls : ''}`,
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 65),
        left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
      };
    };
    const seen = new Set();
    for (const el of document.querySelectorAll('body *')) {
      if (!isVisible(el) || fixedAncestor(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right <= vw + 2 && r.left >= -2) continue;
      if (scrollOrClip(el)) continue;
      const d = desc(el);
      const k = `${d.sel}|${d.left}|${d.right}`;
      if (seen.has(k)) continue;
      seen.add(k);
      res.offenders.push(d);
    }
    res.offenders = res.offenders.slice(0, 20);

    for (const el of document.querySelectorAll('a, button, [role="button"], input[type="submit"]')) {
      if (!isVisible(el) || fixedAncestor(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.height < 24 || r.width < 24) res.smallTargets.push({ ...desc(el), height: Math.round(r.height) });
    }
    const tseen = new Set();
    res.smallTargets = res.smallTargets.filter((o) => {
      const k = `${o.sel}|${o.text}`;
      if (tseen.has(k)) return false;
      tseen.add(k);
      return true;
    }).slice(0, 15);
    return res;
  });

const main = async () => {
  const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}
  );
  const results = [];
  const shotsDir = '/tmp/opencode/responsive-shots';
  const takeShots = process.env.SKIP_SHOTS !== '1';
  await fs.mkdir(shotsDir, { recursive: true });

  for (const vp of viewports) {
    if (onlyViewport && vp.name !== onlyViewport) continue;
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    page.on('pageerror', (err) => results.push({ route: 'PAGEERROR', vp: vp.name, error: String(err) }));
    for (const route of routes) {
      if (only && !route.includes(only)) continue;
      try {
        let data;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
            await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
            await page.waitForTimeout(300);
            data = await auditPage(page);
            break;
          } catch (e) {
            if (attempt === 3) throw e;
            await page.waitForTimeout(1500);
          }
        }
        const ok = data.pageOverflow === 0 && data.offenders.length === 0;
        results.push({ route, vp: vp.name, ...data, ok });
        if (
          takeShots &&
          (route === '/en' || route === '/en/doctors' || route === '/en/book' || route === '/ne')
        ) {
          await page.screenshot({ path: `${shotsDir}/${vp.name}${route.replace(/\//g, '_')}.png`, fullPage: true });
        }
      } catch (e) {
        results.push({ route, vp: vp.name, error: String(e).slice(0, 200) });
      }
    }
    await context.close();
  }
  await browser.close();
  await fs.writeFile('/tmp/opencode/responsive-results.json', JSON.stringify(results, null, 2));
  const bad = results.filter((r) => r.error || r.ok === false);
  console.log(`Checked ${results.length} combinations. Layout issues: ${bad.length}`);
  let smallPages = 0;
  for (const r of results) if (r.smallTargets?.length) smallPages++;
  console.log(`Pages with sub-24px tap targets: ${smallPages}`);
  for (const r of bad) {
    console.log(`\n[${r.vp}] ${r.route} pageOverflow=${r.pageOverflow ?? '-'} offenders=${r.offenders?.length ?? '-'} ${r.error ?? ''}`);
    for (const o of r.offenders ?? []) console.log(`   -> ${o.sel} ${o.left}-${o.right} w=${o.width} :: ${o.text}`);
  }
};

main();
