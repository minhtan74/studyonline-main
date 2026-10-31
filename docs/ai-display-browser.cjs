// Mocks AI answers only; reads actual authorized sources. Blocks all in-page writes.
const { chromium, request } = require(process.env.PLAYWRIGHT_MODULE || 'F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const origin = 'http://localhost:5173';
const checks = [], errors = [];
function check(name, value) { assert.ok(value, name); checks.push(name); }
(async () => {
  const api = await request.newContext({ baseURL: 'http://127.0.0.1:8080' });
  const sessions = {};
  for (const [role, email] of [['student', 'em.hoang@gmail.com'], ['admin', 'admin@gmail.com']]) {
    const res = await api.post('/api/auth/login', { data: { email, password: '123456' } }); assert.ok(res.ok()); sessions[role] = await res.json();
  }
  const enrolled = (await (await api.get('/api/enrollments?ids_only=1', { headers: { Authorization: 'Bearer ' + sessions.student.token } })).json()).data;
  const docs = (await (await api.get('/api/ai/documents', { headers: { Authorization: 'Bearer ' + sessions.admin.token } })).json()).data;
  let doc;
  for (const candidate of docs.filter(d => enrolled.includes(d.course_id) && d.file_type === 'pdf' && d.lesson_id && d.status === 'indexed')) {
    if ((await api.get(`/api/ai/documents/${candidate.id}/source`, { headers: { Authorization: 'Bearer ' + sessions.student.token } })).ok()) { doc = candidate; break; }
  }
  assert.ok(doc, 'Need one accessible source document for the browser audit');
  const answer = [
    '## Ví dụ Python', '', '**Giải thích rõ ràng** với `print`.', '', '1. Đọc dữ liệu', '2. In kết quả', '',
    '| Biến | Giá trị |', '| --- | --- |', '| x | 2 |', '',
    '```python', 'print("<script>chỉ là chuỗi</script>")', '# ' + 'long_code_'.repeat(36), '```', '',
    '[Tài liệu tham khảo](https://example.org/docs)', '[Liên kết không an toàn](javascript:alert(1))', '',
    '<script>window.__aiInjected = true</script>', '<img src="x" onerror="window.__aiInjected = true">',
    '![Ảnh không tự tải](https://tracking.invalid/pixel.png)',
  ].join('\n');
  const sources = [{ document_id: doc.id, document: 'Nguồn PDF kiểm thử', page: 2 }, { document: 'Nguồn lịch sử thiếu mã', page: 1 }];
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe' });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
    await context.addInitScript(({ token, user }) => {
      if (location.origin !== 'http://localhost:5173') return;
      try { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); } catch { /* PDF viewer frames do not use app storage. */ }
    }, sessions.student);
    let trackingRequests = 0;
    await context.route('**/api/**', route => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/ai/chat') return route.fulfill({ json: { success: true, data: { answer, sources, conversation_id: 987654, used_context: true, response_status: 'ok' } } });
      if (url.pathname === '/api/ai/conversations' && route.request().method() === 'GET') return route.fulfill({ json: { success: true, data: [{ id: 987654, title: 'Lịch sử Markdown kiểm thử', course_id: doc.course_id }] } });
      if (url.pathname === '/api/ai/conversations/987654') return route.fulfill({ json: { success: true, data: { conversation: { id: 987654, course_id: doc.course_id, lesson_id: null }, messages: [{ role: 'user', content: 'Câu hỏi cũ' }, { role: 'assistant', content: answer, sources }] } } });
      if (route.request().method() !== 'GET') return route.fulfill({ json: { success: true } });
      return route.continue();
    });
    context.on('request', request => { if (request.url().includes('tracking.invalid')) trackingRequests++; });
    context.on('page', page => page.on('pageerror', e => errors.push(e.message)));
    const page = await context.newPage();
    async function verifyChat(name, chat) {
      await chat.locator('pre code').waitFor();
      check(name + ': fenced code rendered', (await chat.locator('pre code').innerText()).includes('print('));
      check(name + ': code label present', (await chat.locator('.ai-code-toolbar').innerText()).includes('python'));
      check(name + ': Markdown headings and emphasis', await chat.locator('.ai-markdown h2').count() === 1 && await chat.locator('.ai-markdown strong').count() === 1);
      check(name + ': list and table rendered', await chat.locator('.ai-markdown ol li').count() === 2 && await chat.locator('.ai-markdown table tbody tr').count() === 1);
      check(name + ': dangerous links not clickable', await chat.locator('a[href^="javascript:"], script, img').count() === 0);
      check(name + ': raw HTML not executed', !await page.evaluate(() => window.__aiInjected));
      check(name + ': code stays inside scroll region', await chat.locator('pre').evaluate(n => n.scrollWidth > n.clientWidth && getComputedStyle(n).overflowX === 'auto'));
      await chat.getByRole('button', { name: 'Sao chép mã' }).click();
      check(name + ': copy uses actual code text', (await page.evaluate(() => navigator.clipboard.readText())).includes('print("<script>chỉ là chuỗi</script>")'));
      check(name + ': source link contains page and no token', await chat.getByRole('link', { name: /Nguồn PDF kiểm thử/ }).getAttribute('href') === `/ai-source?document_id=${doc.id}&page=2`);
      check(name + ': legacy source has explanation', (await chat.innerText()).includes('Chưa có liên kết'));
    }
    await page.goto(origin + '/student/ai-tutor');
    await page.locator('#ai-tutor-course').selectOption(String(doc.course_id));
    await page.getByLabel('Câu hỏi cho AI Tutor', { exact: true }).fill('Cho ví dụ **nguyên văn**');
    await page.getByLabel('Câu hỏi cho AI Tutor', { exact: true }).press('Enter');
    const chat = page.locator('.ai-tutor-chat');
    await verifyChat('AI Tutor', chat);
    const popupPromise = context.waitForEvent('page');
    await chat.getByRole('link', { name: /Nguồn PDF kiểm thử/ }).click();
    const source = await popupPromise;
    await source.getByRole('heading', { name: 'Tài liệu nguồn AI' }).waitFor();
    await source.getByRole('link', { name: 'Tải tài liệu' }).waitFor();
    check('Real PDF source opens correct page', (await source.locator('iframe').getAttribute('src')).endsWith('#page=2'));
    check('Source page has no auth token in URL', !/token|Bearer|sig=/.test(source.url()));
    await source.screenshot({ path: path.join(__dirname, 'ai-source-viewer.png'), fullPage: true });
    await source.close();
    await page.getByText('Lịch sử Markdown kiểm thử', { exact: false }).first().click();
    await chat.locator('pre code').waitFor();
    check('Historical answers use the same renderer', await chat.locator('.ai-markdown h2').count() === 1);
    await page.screenshot({ path: path.join(__dirname, 'ai-markdown-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(300);
    check('AI Tutor mobile has no page overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(__dirname, 'ai-markdown-mobile.png'), fullPage: true });
    await page.goto(origin + '/lesson?id=' + doc.lesson_id);
    await page.getByTitle('Hỏi AI về bài học', { exact: true }).click();
    await page.getByLabel('Câu hỏi cho AI về bài học', { exact: true }).fill('Giải thích ví dụ');
    await page.getByLabel('Câu hỏi cho AI về bài học', { exact: true }).press('Enter');
    const lessonChat = page.locator('.s-card').filter({ has: page.getByLabel('Câu hỏi cho AI về bài học', { exact: true }) });
    await verifyChat('Lesson AI', lessonChat);
    check('Lesson mobile has no page overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await lessonChat.screenshot({ path: path.join(__dirname, 'ai-lesson-markdown-mobile.png') });

    const viewer = await context.newPage();
    await viewer.goto(origin + '/ai-source?document_id=invalid');
    await viewer.getByRole('alert').waitFor();
    check('Invalid source ID shows an error, not infinite loading', (await viewer.getByRole('alert').innerText()).includes('không hợp lệ'));
    await viewer.goto(origin + '/ai-source?document_id=2147483000');
    await viewer.getByRole('alert').waitFor();
    check('Deleted source has clear error and retry', await viewer.getByRole('button', { name: 'Thử lại', exact: true }).isVisible());
    await viewer.route('**/api/ai/documents/900001/source', r => r.fulfill({ status: 403, json: { success: false, message: 'Bạn cần đăng ký khóa học để mở tài liệu nguồn.' } }));
    await viewer.goto(origin + '/ai-source?document_id=900001'); await viewer.getByRole('alert').waitFor();
    check('Permission error is understandable', (await viewer.getByRole('alert').innerText()).includes('đăng ký khóa học'));
    let format = 'txt';
    await viewer.route('**/api/ai/documents/900002/source', r => r.fulfill({ json: { success: true, data: { id: 900002, title: 'Nguồn văn bản', filename: 'source.' + format, file_type: format, course_id: doc.course_id } } }));
    await viewer.route('**/api/ai/documents/900002/content', r => r.fulfill({ contentType: format === 'txt' ? 'text/plain' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', body: '<script>window.__sourceInjected=true</script>' }));
    await viewer.goto(origin + '/ai-source?document_id=900002'); await viewer.locator('pre').waitFor();
    check('Text source displays HTML as literal text', (await viewer.locator('pre').innerText()).includes('<script>') && !await viewer.evaluate(() => window.__sourceInjected));
    check('Text source can also be downloaded', await viewer.getByRole('link', { name: 'Tải tài liệu' }).isVisible());
    format = 'docx'; await viewer.reload(); await viewer.getByRole('link', { name: 'Tải tài liệu' }).waitFor();
    check('Word source has a download instead of broken preview', await viewer.locator('iframe').count() === 0 && (await viewer.locator('main').innerText()).includes('Word'));
    const retryPage = await context.newPage();
    await retryPage.route('**/AiMarkdownRenderer.jsx*', route => route.abort(), { times: 1 });
    await retryPage.goto(origin + '/student/ai-tutor');
    await retryPage.locator('#ai-tutor-course').selectOption(String(doc.course_id));
    await retryPage.getByLabel('Câu hỏi cho AI Tutor', { exact: true }).fill('Kiểm tra tải định dạng');
    await retryPage.getByLabel('Câu hỏi cho AI Tutor', { exact: true }).press('Enter');
    await retryPage.getByRole('button', { name: 'Tải lại trang', exact: true }).waitFor();
    check('Parser load failure preserves the answer text', (await retryPage.locator('.ai-tutor-chat').innerText()).includes('Ví dụ Python'));
    await retryPage.getByRole('button', { name: 'Tải lại trang', exact: true }).click();
    await retryPage.getByText('Lịch sử Markdown kiểm thử', { exact: false }).first().click();
    await retryPage.locator('pre code').waitFor({ timeout: 5000 });
    check('Reload and reopening history restores formatting', true);
    check('No remote tracking images loaded', trackingRequests === 0);
    if (errors.length) console.error(JSON.stringify({ browserErrors: errors }));
    check('No JavaScript exceptions', errors.length === 0);
    fs.writeFileSync(path.join(__dirname, 'ai-display-browser-results.json'), JSON.stringify({ passed: checks.length, checks, errors, aiAnswers: 'simulated', sourcePdf: 'real authenticated file', actualAiRequests: 0 }, null, 2));
    console.log(JSON.stringify({ passed: checks.length, errors: errors.length }));
  } finally { await browser.close(); await api.dispose(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
