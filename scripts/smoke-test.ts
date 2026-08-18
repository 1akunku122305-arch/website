/**
 * HTTP smoke test untuk WangStore.
 * Jalankan setelah aplikasi berjalan (npm run dev / build):
 *   npx tsx scripts/smoke-test.ts [baseUrl]
 */

const BASE = process.argv[2] || process.env.WANGSTORE_SMOKE_URL || 'http://localhost:3000';

let failures = 0;
let cookieJar = '';

async function get(path: string, opts?: RequestInit) {
  const headers: Record<string, string> = { ...((opts?.headers as Record<string, string>) ?? {}) };
  if (cookieJar) headers['Cookie'] = cookieJar;
  const res = await fetch(BASE + path, { redirect: 'manual', ...opts, headers });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const name = setCookie.split(';')[0];
    if (name) cookieJar = name;
  }
  return res;
}

function check(name: string, cond: boolean, extra?: string) {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failures++;
    console.error(`  ✗ ${name}${extra ? ' — ' + extra : ''}`);
  }
}

async function run() {
  console.log(`Smoke test terhadap ${BASE}\n`);

  // Public pages → 200
  const publicPages = ['/', '/about', '/infrastructure', '/server-builder', '/features', '/why-wangstore', '/faq', '/testimonials', '/blog', '/knowledge-base', '/status', '/contact', '/terms', '/privacy', '/refund', '/sla', '/acceptable-use', '/cookie-policy'];
  console.log('Public pages (HTTP 200):');
  for (const p of publicPages) {
    const res = await get(p);
    check(p, res.status === 200, `got ${res.status}`);
  }

  console.log('\nPricing API:');
  // Low minimum → 45000
  let r = await get('/api/pricing', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'low', cpu: 2, ram: 4, storage: 20 }),
  });
  let j = await r.json();
  check('Low minimum price = 45000', r.status === 200 && j.data?.quote?.price === 45000, JSON.stringify(j).slice(0, 120));

  // Low normalization
  r = await get('/api/pricing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier: 'low', cpu: 20, ram: 64, storage: 900 }) });
  j = await r.json();
  const cfg = j.data?.quote?.config ?? {};
  check('Low overflow normalized to 16/32/160', cfg.cpu === 16 && cfg.ram === 32 && cfg.storage === 160, JSON.stringify(cfg));

  // Medium → 409
  r = await get('/api/pricing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier: 'medium' }) });
  check('Medium → 409', r.status === 409, `got ${r.status}`);

  // Fake high package → 422
  r = await get('/api/pricing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier: 'high', packageId: 'fake' }) });
  check('Fake high package → 422', r.status === 422, `got ${r.status}`);

  // High packages exact prices
  console.log('\nHigh packages:');
  const hi = { 'high-2c4g': 300000, 'high-3c6g': 420000, 'high-4c8g': 600000, 'high-6c12g': 850000, 'high-8c16g': 1100000, 'high-10c32g': 2100000 };
  for (const [id, price] of Object.entries(hi)) {
    r = await get('/api/pricing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier: 'high', packageId: id }) });
    j = await r.json();
    check(`${id} = ${price}`, r.status === 200 && j.data?.quote?.price === price, `got ${j.data?.quote?.price}`);
  }

  console.log('\nPrivate route:');
  r = await get('/dashboard');
  const body = await r.text();
  const redirected = r.status === 307 || r.status === 302 || r.status === 308 || body.includes('NEXT_REDIRECT;replace;/login');
  check('/dashboard redirects (guest → /login)', redirected, `got ${r.status}`);

  console.log('\nOrder API (guest):');
  // Acquire CSRF token (double-submit).
  const csrfRes = await get('/api/csrf');
  const csrfJson = await csrfRes.json();
  const csrfToken = csrfJson?.data?.token ?? csrfJson?.token;
  check('CSRF token issued', Boolean(csrfToken), 'no token');

  // Order without agreement → 422
  r = await get('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
    body: JSON.stringify({ tier: 'low', cpu: 2, ram: 4, storage: 20, name: 'Test', whatsapp: '6281234567890', email: 'test@example.com', serverName: 'srv', agreed: false }),
  });
  check('Order tanpa persetujuan → 422', r.status === 422, `got ${r.status}`);

  // Medium order → 409
  r = await get('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
    body: JSON.stringify({ tier: 'medium', name: 'Test', whatsapp: '6281234567890', email: 'test@example.com', serverName: 'srv', agreed: true }),
  });
  check('Order Medium → 409', r.status === 409, `got ${r.status}`);

  // Fake high package → 422
  r = await get('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
    body: JSON.stringify({ tier: 'high', packageId: 'fake', name: 'Test', whatsapp: '6281234567890', email: 'test@example.com', serverName: 'srv', agreed: true }),
  });
  check('Order paket palsu → 422', r.status === 422, `got ${r.status}`);

  // Valid Low order → 201, price = 45000 (client price ignored)
  r = await get('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
    body: JSON.stringify({ tier: 'low', cpu: 2, ram: 4, storage: 20, name: 'Test', whatsapp: '6281234567890', email: 'test@example.com', serverName: 'srv', agreed: true }),
  });
  j = await r.json();
  check('Order Low valid → 201', r.status === 201, `got ${r.status}`);
  check('Order total = 45000 (client price ignored)', j?.data?.order?.total === 45000, `got ${j?.data?.order?.total}`);

  // CSRF cross-origin denied (send bogus token)
  r = await get('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': 'wrong' },
    body: JSON.stringify({ tier: 'low', cpu: 2, ram: 4, storage: 20, name: 'Test', whatsapp: '6281234567890', email: 't@e.com', serverName: 's', agreed: true }),
  });
  check('CSRF cross-origin write → 403', r.status === 403, `got ${r.status}`);

  console.log('\nHasil smoke test:');
  if (failures === 0) {
    console.log('Semua pemeriksaan lulus ✓');
  } else {
    console.error(`${failures} pemeriksaan gagal ✗`);
    process.exitCode = 1;
  }
}

run().catch((e) => {
  console.error('Gagal menjalankan smoke test:', e);
  process.exitCode = 1;
});
