// Render the actual application with responses read from the local DB via TestClient.
// No real token is stored and the browser cannot write to the backend.
const {chromium}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const fixture=JSON.parse(fs.readFileSync('frontend/node_modules/.phuong-ui-data.json','utf8'));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 const checks=[],errors=[];const check=(name,ok)=>{assert.ok(ok,name);checks.push(name)};
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(user=>{localStorage.setItem('token','render-only-no-real-session');localStorage.setItem('user',JSON.stringify(user))},fixture.user);
  await context.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
  await context.route('**/api/**',r=>{const u=new URL(r.request().url());if(!u.pathname.startsWith('/api/'))return r.fallback();if(r.request().method()!=='GET')return r.abort();const key=u.pathname+u.search;return r.fulfill({json:fixture.api[key]||fixture.api[u.pathname]||{success:true,data:[]}})});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/student/progress?course_id=7');
  const summary=page.locator('.study-recommendation-summary');await summary.locator('.study-compact-item').first().waitFor();
  check('0/30 OS lesson is recommended', (await summary.innerText()).includes('0/30 câu'));
  check('70 percent OS lesson is absent from review rows',!(await summary.locator('.study-compact-list').innerText()).includes('Bài 1: Khái niệm về hệ điều hành'));
  await summary.getByRole('button',{name:/Vì sao gợi ý:.*Phân loại/}).click();
  check('Explanation uses actual topic evidence',(await summary.locator('.study-compact-reason').innerText()).includes('Hệ thống phân tán'));
  await summary.getByRole('button',{name:/bài chưa đủ dữ liệu/}).click();
  check('Small sample group is visible',await summary.locator('#study-insufficient-content').isVisible());
  check('Small sample group does not conclude with percent',!(await summary.locator('#study-insufficient-content').innerText()).includes('%'));
  await page.screenshot({path:'docs/phuong-live-os-desktop.png',fullPage:true});
  await summary.locator('select').selectOption('515');
  check('Testing course is filtered',(await summary.innerText()).includes('Kiểm thử phần mềm nhập môn'));
  check('100 percent lessons absent from review list',!(await summary.innerText()).includes('Dự án nhỏ: kế hoạch kiểm thử'));
  await summary.locator('select').selectOption('4');
  check('HTML all-correct small samples do not create false review',(await summary.innerText()).includes('chưa có bài học cần ôn'));
  await summary.locator('select').selectOption('7');await summary.locator('.study-compact-item').first().waitFor();
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
  check('Mobile fits viewport',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'docs/phuong-live-os-mobile.png',fullPage:true});
  check('No runtime errors',errors.length===0);
  fs.writeFileSync('docs/phuong-live-ui-results-20261107.json',JSON.stringify({mode:'real_saved_database_responses_replayed_in_actual_frontend_no_browser_writes',checks,passed:checks.length,errors},null,2));
  console.log(JSON.stringify({passed:checks.length,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
