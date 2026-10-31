// Controlled AI delay/errors only; no actual LLM calls or progress writes.
const { chromium, request } = require(process.env.PLAYWRIGHT_MODULE || 'F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const checks = [], errors = [];
function check(name, value) { assert.ok(value, name); checks.push(name); }
(async () => {
  const api = await request.newContext({ baseURL: 'http://127.0.0.1:8080' });
  async function login(email) { return (await api.post('/api/auth/login', { data: { email, password: '123456' } })).json(); }
  const student = await login('em.hoang@gmail.com'), admin = await login('admin@gmail.com');
  const enrolled = (await (await api.get('/api/enrollments?ids_only=1', { headers: { Authorization: 'Bearer ' + student.token } })).json()).data;
  const docs = (await (await api.get('/api/ai/documents', { headers: { Authorization: 'Bearer ' + admin.token } })).json()).data;
  const doc = docs.find(d => d.lesson_id && enrolled.includes(d.course_id) && d.status === 'indexed'); assert.ok(doc);
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe' });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(({ token, user }) => {
      if (location.origin !== 'http://localhost:5173') return;
      try { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); } catch {}
    }, student);
    let mode = 'slow', release, requests = 0;
    await context.route('**/api/**', async route => {
      if (new URL(route.request().url()).pathname === '/api/ai/chat') {
        requests++;
        if (mode === 'slow') await new Promise(resolve => { release = resolve; });
        if (mode === 'error') return route.fulfill({ status: 503, json: { success: false, message: 'AI tạm gián đoạn.' } });
        return route.fulfill({ json: { success: true, data: { answer: 'Câu trả lời đã sẵn sàng.', sources: [], response_status: 'ok' } } });
      }
      if (route.request().method() !== 'GET') return route.fulfill({ json: { success: true } });
      return route.continue();
    });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.clock.install();
    for (const lesson of [false, true]) {
      const name = lesson ? 'Lesson AI' : 'AI Tutor'; mode = 'slow';
      await page.goto('http://localhost:5173/' + (lesson ? 'lesson?id=' + doc.lesson_id : 'student/ai-tutor'));
      if (lesson) await page.getByTitle('Hỏi AI về bài học', { exact: true }).click();
      else await page.locator('#ai-tutor-course').selectOption(String(doc.course_id));
      const input = page.getByLabel(lesson ? 'Câu hỏi cho AI về bài học' : 'Câu hỏi cho AI Tutor', { exact: true });
      await input.fill('Kiểm tra trả lời ' + name); await input.press('Enter');
      await page.getByRole('status', { name: 'Đang chờ câu trả lời' }).waitFor();
      check(name + ': only compact dots while waiting', await page.locator('.ai-typing span').count() === 3 && await page.locator('.ai-chat-waiting').count() === 0);
      check(name + ': timer and stop button removed', !(await page.locator('main').innerText()).includes('Đã chờ') && await page.getByRole('button', { name: 'Dừng chờ', exact: true }).count() === 0);
      check(name + ': duplicate input disabled', await input.isDisabled());
      await page.clock.fastForward(46000);
      check(name + ': no long waiting notice appears', !(await page.locator('main').innerText()).includes('AI đang mất nhiều thời gian'));
      check(name + ': indicator stays small', await page.locator('.ai-typing').evaluate(n => n.getBoundingClientRect().width < 80 && n.getBoundingClientRect().height <= 40));
      await page.screenshot({ path: path.join(__dirname, `ai-minimal-wait-${lesson ? 'lesson' : 'tutor'}.png`), fullPage: !lesson });
      mode = 'success'; release();
      await page.getByText('Câu trả lời đã sẵn sàng.', { exact: true }).waitFor();
      check(name + ': answer replaces waiting dots', await page.locator('.ai-typing').count() === 0);
      check(name + ': no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    mode = 'error';
    const input = page.getByLabel('Câu hỏi cho AI về bài học', { exact: true });
    await input.fill('Câu hỏi khi lỗi'); await input.press('Enter');
    await page.getByRole('alert').waitFor();
    check('Service errors still offer retry and edit', await page.getByRole('button', { name: 'Thử lại', exact: true }).isVisible() && await page.getByRole('button', { name: 'Sửa câu hỏi', exact: true }).isVisible());
    mode = 'success'; await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
    await page.getByRole('alert').waitFor({ state: 'detached' });
    check('Retry still works without duplicate question', await page.getByText('Câu hỏi khi lỗi', { exact: true }).count() === 1);
    check('Exactly four simulated requests', requests === 4);
    check('No JavaScript exceptions', errors.length === 0);
    fs.writeFileSync(path.join(__dirname, 'ai-minimal-wait-results.json'), JSON.stringify({ passed: checks.length, checks, errors, aiRequests: 'simulated' }, null, 2));
    console.log(JSON.stringify({ passed: checks.length, errors: errors.length }));
  } finally { await browser.close(); await api.dispose(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
