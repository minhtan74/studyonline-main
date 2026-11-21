// Isolated UI scenarios: every API response is mocked; no real account or DB writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const base = process.env.STUDY_TEST_URL || 'http://127.0.0.1:5173';
const checks = [], errors = [], writes = [];
const check = (name, value) => { assert.ok(value, name); checks.push(name); };
const unit = (id, n = 5, correct = 2, course = 1, extra = {}) => ({ kind: 'lesson', id, title: `Bài kiểm thử ${id}`, course_id: course, course_title: `Khóa ${course}`, chapter_id: course, chapter_name: `Chương ${course}`, answered: n, correct, avg_score: correct / n * 100, sufficient_data: n >= 5, needs_review: n >= 5 && correct / n < .7, available: true, latest_result_id: id, ...extra });
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : { executablePath: 'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe' }) });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(() => { localStorage.setItem('token', 'mock-only'); localStorage.setItem('user', JSON.stringify({ id: 90001, fullname: 'Học viên kiểm thử', role: 'student' })); });
    let units = [], mode = 'ok', checkpointFailure = false;
    await context.route('**/*', r => ['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.fallback() : r.abort());
    await context.route('**/api/**', async r => {
      const u = new URL(r.request().url());
      if (!u.pathname.startsWith('/api/')) return r.fallback();
      if (r.request().method() !== 'GET') writes.push({ path: u.pathname, body: r.request().postDataJSON() });
      if (u.pathname === '/api/recommendations/study') return r.fulfill({ status: checkpointFailure ? 500 : 200, json: { success: !checkpointFailure } });
      if (u.pathname === '/api/recommendations') {
        if (mode === 'error') return r.fulfill({ status: 500, json: { success: false, message: 'Lỗi gợi ý kiểm thử' } });
        if (mode === 'network') return r.abort();
        if (mode === 'loading') await new Promise(resolve => setTimeout(resolve, 700));
        return r.fulfill({ json: { success: true, data: { current: { items: [], based_on: { knowledge: { units }, min_topic_questions: 5, topic_review_threshold: 70 } } } } });
      }
      if (u.pathname === '/api/progress') return r.fulfill({ json: { success: true, data: u.search ? [] : { total_lessons: 20, done_lessons: 3, courses: [1, 2, 3].map(id => ({ course_id: id, course_title: `Khóa ${id}`, total_lessons: 10, done_lessons: 1 })) } } });
      return r.fulfill({ json: { success: true, data: [] } });
    });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    const summary = page.locator('.study-recommendation-summary');
    const visit = async (query = '') => { await page.goto(`${base}/student/progress${query}`); try { await summary.waitFor({ timeout: 10000 }); } catch (error) { console.error(JSON.stringify({ url: page.url(), errors, body: (await page.locator('body').innerText()).slice(0, 2500) })); throw error; } await page.waitForFunction(() => !document.querySelector('.study-recommendation-summary [role="status"]')?.textContent.includes('Đang tải')); };
    units = []; await visit();
    check('Empty evidence has explicit empty message', (await summary.innerText()).includes('Chưa có dữ liệu Quiz'));
    check('Enrolled courses remain selectable without evidence', await summary.locator('select option').count() === 4);
    units = [unit(1, 1, 0), unit(2, 5, 3), unit(3, 10, 7), unit(4, 5, 5), unit(5, 5, 0, 2)]; await visit();
    check('Only two established review rows shown', await summary.locator('.study-compact-item').count() === 2);
    check('Insufficient group starts collapsed', await summary.locator('#study-insufficient-content').count() === 0);
    await summary.getByRole('button', { name: /1 bài chưa đủ dữ liệu/ }).click();
    check('Small sample expands without percent conclusion', !(await summary.locator('#study-insufficient-content').innerText()).includes('%'));
    await summary.getByRole('button', { name: 'Vì sao gợi ý: Bài kiểm thử 2' }).click();
    check('Why explains 70 percent threshold', (await summary.locator('.study-compact-reason').innerText()).includes('70%'));
    await summary.getByRole('button', { name: 'Vì sao gợi ý: Bài kiểm thử 2' }).click();
    check('Why collapses', await summary.locator('.study-compact-reason').count() === 0);
    await summary.locator('select').selectOption('2');
    check('Course filter removes other course rows', await summary.locator('.study-compact-item').count() === 1 && (await summary.innerText()).includes('Bài kiểm thử 5'));
    check('Full list link preserves selected course', await summary.getByRole('link', { name: 'Xem tất cả gợi ý' }).getAttribute('href') === '/student/recommendations?course_id=2');
    await summary.locator('select').selectOption('3');
    check('Enrolled course with no suggestions displays empty state', (await summary.innerText()).includes('Khóa học này chưa có bài học cần ôn'));
    await visit('?course_id=999');
    check('Unknown course is handled without crash', await summary.locator('select').inputValue() === '999');
    units = Array.from({ length: 8 }, (_, i) => unit(i + 10)); await visit();
    check('Summary initially limited to five', await summary.locator('.study-compact-item').count() === 5);
    await summary.getByRole('button', { name: 'Xem thêm bài nên ôn' }).click();
    check('Show more reveals all eight', await summary.locator('.study-compact-item').count() === 8);
    await summary.getByRole('button', { name: 'Thu gọn bài nên ôn' }).click();
    check('Collapse returns to five', await summary.locator('.study-compact-item').count() === 5);
    units = [unit(50, 5, 1, 1, { kind: 'chapter' })]; await visit();
    check('Chapter-only evidence directs to full suggestions', (await summary.innerText()).includes('Có nội dung cần ôn ở cấp chương'));
    mode = 'error'; await visit();
    check('API error shown with retry', (await summary.getByRole('alert').innerText()).includes('Lỗi gợi ý kiểm thử'));
    mode = 'ok'; units = [unit(60)]; await summary.getByRole('button', { name: 'Thử lại' }).click(); await summary.locator('.study-compact-item').waitFor();
    check('Retry recovers', await summary.locator('.study-compact-item').count() === 1);
    mode = 'network'; await visit();
    check('Network failure shown', await summary.getByRole('button', { name: 'Thử lại' }).count() === 1);
    mode = 'loading'; await page.goto(`${base}/student/progress`); await summary.getByText('Đang tải gợi ý học tập…').waitFor();
    check('Course filter disabled while loading', await summary.locator('select').isDisabled());
    await summary.locator('.study-compact-item').waitFor(); mode = 'ok';
    units = [unit(70, 5, 1, 1, { title: 'Tên bài rất dài để kiểm tra bố cục trên điện thoại '.repeat(4) })]; await visit();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500); // Let the sidebar/header resize transitions finish.
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) console.error(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 15).map(e => ({ tag: e.tagName, class: e.className, width: e.getBoundingClientRect().width, right: e.getBoundingClientRect().right })))));
    check('Mobile has no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: 'docs/study-summary-mobile.png', fullPage: true });
    checkpointFailure = true;
    await summary.getByRole('link', { name: /^Ôn tập:/ }).click(); await page.waitForURL('**/lesson?id=70');
    check('Study still navigates when checkpoint fails', page.url().endsWith('/lesson?id=70'));
    check('Checkpoint uses exact evidence scope', writes.length === 1 && writes[0].body.course_id === 1 && writes[0].body.unit_id === 70 && writes[0].body.knowledge_kind === 'lesson');
    check('No unrelated writes', writes.every(w => w.path === '/api/recommendations/study'));
    check('No browser runtime errors', errors.length === 0);
    fs.writeFileSync('docs/study-summary-browser-results.json', JSON.stringify({ mode: 'mocked_api_no_real_credentials_or_database_writes', passed: checks.length, checks, errors }, null, 2));
    console.log(JSON.stringify({ passed: checks.length, checks, errors }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
