import { test, expect, type Page } from '@playwright/test';

/**
 * Responsive layout guardrails.
 *
 * These tests load every public page at common phone, tablet, laptop and
 * desktop widths and fail when the layout causes horizontal scrolling or
 * pushes content outside the viewport.
 */

const VIEWPORTS = [
  { name: 'phone-320', width: 320, height: 568 },
  { name: 'phone-360', width: 360, height: 640 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'phone-414', width: 414, height: 896 },
  { name: 'phablet-480', width: 480, height: 900 },
  { name: 'tablet-640', width: 640, height: 960 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-834', width: 834, height: 1112 },
  { name: 'landscape-844', width: 844, height: 390 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

const PAGES = [
  { path: '/en', name: 'home (en)' },
  { path: '/ne', name: 'home (ne)' },
  { path: '/en/doctors', name: 'doctors' },
  { path: '/en/doctors/prof-dr-shaileja-chhetri', name: 'doctor detail' },
  { path: '/en/services', name: 'services' },
  { path: '/en/services/general-opd-consultation', name: 'service detail' },
  { path: '/en/lab-tests', name: 'lab tests' },
  { path: '/en/lab-tests/complete-blood-count-cbc', name: 'lab test detail' },
  { path: '/en/book', name: 'booking' },
  { path: '/ne/book', name: 'booking (ne)' },
  { path: '/en/explore/about', name: 'about' },
  { path: '/en/explore/faq', name: 'faq' },
  { path: '/en/explore/health-info', name: 'health info' },
  { path: '/en/privacy', name: 'privacy' },
  { path: '/en/terms', name: 'terms' },
  { path: '/en/portal/login', name: 'patient login' },
  { path: '/en/portal/register', name: 'patient register' },
  { path: '/en/portal/forgot-password', name: 'forgot password' },
  { path: '/sai-clinic-management/login', name: 'staff login' },
];

async function collectOverflow(page: Page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const cache = new Map<Element, CSSStyleDeclaration>();
    const cs = (el: Element) => {
      if (!cache.has(el)) cache.set(el, getComputedStyle(el));
      return cache.get(el)!;
    };

    const hasFixedAncestor = (el: Element) => {
      let p: Element | null = el;
      while (p && p !== document.documentElement) {
        if (cs(p).position === 'fixed') return true;
        p = p.parentElement;
      }
      return false;
    };

    const isRendered = (el: Element) => {
      const s = cs(el);
      if (s.display === 'none' || s.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };

    const insideScrollOrClip = (el: Element) => {
      let p = el.parentElement;
      while (p && p !== document.body) {
        if (cs(p).overflowX !== 'visible') return true;
        p = p.parentElement;
      }
      return false;
    };

    const offenders: string[] = [];
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      if (!isRendered(el) || hasFixedAncestor(el) || insideScrollOrClip(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 2 || r.left < -2) {
        const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
        offenders.push(
          `<${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}> ${Math.round(r.left)}..${Math.round(r.right)} "${(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50)}"`
        );
      }
    }

    return {
      viewport: vw,
      scrollWidth: document.documentElement.scrollWidth,
      offenders: offenders.slice(0, 10),
    };
  });
}

test.describe('responsive layouts', () => {
  for (const pageDef of PAGES) {
    test(`${pageDef.name} fits every viewport`, async ({ page }) => {
      for (const vp of VIEWPORTS) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(pageDef.path, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle').catch(() => {});

        const result = await collectOverflow(page);
        expect(
          result.scrollWidth,
          `${pageDef.path} scrolls horizontally at ${vp.name} (${result.scrollWidth}px > ${vp.width}px)`
        ).toBeLessThanOrEqual(vp.width + 1);
        expect(
          result.offenders,
          `${pageDef.path} has content outside the viewport at ${vp.name}`
        ).toEqual([]);
      }
    });
  }
});

test.describe('navigation behavior', () => {
  test('mobile drawer opens, lists links and closes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const drawer = page.locator('nav[aria-label="Mobile"]');
    const drawerWrapper = drawer.locator('xpath=ancestor::div[@aria-hidden][1]');
    await expect(drawerWrapper).toHaveAttribute('aria-hidden', 'true');

    await page.getByRole('button', { name: /open menu/i }).click();
    await expect(drawerWrapper).toHaveAttribute('aria-hidden', 'false');
    await expect(drawer.getByRole('link', { name: 'Doctors' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: /book a session/i })).toBeVisible();

    await page.getByRole('button', { name: /close menu/i }).click();
    await expect(drawerWrapper).toHaveAttribute('aria-hidden', 'true');
  });

  test('desktop shows the main navigation and hides the hamburger', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('nav[aria-label="Main"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /open menu/i })).toBeHidden();
  });

  test('tablet uses the mobile drawer instead of the desktop navigation', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 1000 });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('nav[aria-label="Main"]')).toBeHidden();
    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();
  });
});

test.describe('authenticated layouts', () => {
  test.setTimeout(600_000);
  test.skip(
    !process.env.E2E_PATIENT_EMAIL || !process.env.E2E_PATIENT_PASSWORD,
    'Set E2E_PATIENT_EMAIL / E2E_PATIENT_PASSWORD to audit the patient dashboard'
  );

  test('patient dashboard fits phone and desktop widths', async ({ page, request }) => {
    const login = await request.post('/api/auth/patient/login', {
      data: { email: process.env.E2E_PATIENT_EMAIL, password: process.env.E2E_PATIENT_PASSWORD },
    });
    expect(login.ok()).toBeTruthy();

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/en/portal/dashboard', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});
      await expect(page).toHaveURL(/\/portal\/dashboard/);

      const result = await collectOverflow(page);
      expect(result.scrollWidth, `dashboard scrolls horizontally at ${vp.name}`).toBeLessThanOrEqual(vp.width + 1);
      expect(result.offenders, `dashboard content outside viewport at ${vp.name}`).toEqual([]);
    }
  });
});

test.describe('staff CMS layouts', () => {
  test.setTimeout(600_000);
  test.skip(
    !process.env.E2E_STAFF_EMAIL || !process.env.E2E_STAFF_PASSWORD,
    'Set E2E_STAFF_EMAIL / E2E_STAFF_PASSWORD to audit the CMS'
  );

  const cmsPages = [
    '/sai-clinic-management',
    '/sai-clinic-management/bookings',
    '/sai-clinic-management/patients',
    '/sai-clinic-management/doctors',
    '/sai-clinic-management/services',
    '/sai-clinic-management/lab-catalogue',
    '/sai-clinic-management/reports',
    '/sai-clinic-management/articles',
    '/sai-clinic-management/settings',
    '/sai-clinic-management/users',
    '/sai-clinic-management/audit',
  ];

  test('CMS pages fit phone, tablet and desktop widths', async ({ page, request }) => {
    const login = await request.post('/api/auth/staff/login', {
      data: { email: process.env.E2E_STAFF_EMAIL, password: process.env.E2E_STAFF_PASSWORD },
    });
    expect(login.ok()).toBeTruthy();

    for (const path of cmsPages) {
      for (const vp of VIEWPORTS) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle').catch(() => {});
        await expect(page).toHaveURL(new RegExp(path.replace(/\//g, '\\/')));

        const result = await collectOverflow(page);
        expect(result.scrollWidth, `${path} scrolls horizontally at ${vp.name}`).toBeLessThanOrEqual(vp.width + 1);
        expect(result.offenders, `${path} content outside viewport at ${vp.name}`).toEqual([]);
      }
    }
  });
});
