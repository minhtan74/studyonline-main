// Live frontend + live backend + local MySQL. The short-lived test session stays in memory.
const {chromium}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const {execFileSync}=require('node:child_process');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const code=`import json\nfrom sqlalchemy import text\nfrom app.core.database import engine\nfrom app.core.security import create_token\nfrom app.core.config import settings\nwith engine.connect() as c:\n u=dict(c.execute(text('SELECT id,fullname,email,role,token_version FROM users WHERE id=7')).mappings().one())\n assert u['role']=='student'\n settings.jwt_expire=300\n print(json.dumps({'token':create_token(u),'user':u}))`;
(async()=>{
 const session=JSON.parse(execFileSync(path.join(root,'backend/.venv/Scripts/python.exe'),['-c',code],{cwd:path.join(root,'backend'),encoding:'utf8'}));
 const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 const checks=[],errors=[],responses=[],writes=[];const check=(name,value)=>{assert.ok(value,name);checks.push(name)};
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(s=>{localStorage.setItem('token',s.token);localStorage.setItem('user',JSON.stringify(s.user))},session);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))responses.push({path:new URL(r.url()).pathname,status:r.status()})});
  page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/')&&r.method()!=='GET')writes.push({path:new URL(r.url()).pathname,method:r.method()})});
  const summary=page.locator('.study-recommendation-summary');
  await page.goto('http://127.0.0.1:5173/student/progress?course_id=7');
  try { await summary.locator('.study-compact-item').first().waitFor({timeout:10000}); }
  catch(e) { console.error(JSON.stringify({url:page.url(),body:(await page.locator('body').innerText()).slice(0,1800),responses,errors})); throw e; }
  check('Live authenticated progress page opens',page.url().includes('/student/progress'));
  check('Phuong is the active user',await page.locator('#headerName').textContent()==='Phương');
  check('0/30 lesson appears from live API',(await summary.innerText()).includes('0/30 câu'));
  check('70 percent lesson not marked review',!(await summary.locator('.study-compact-list').innerText()).includes('Bài 1: Khái niệm về hệ điều hành'));
  await summary.getByRole('button',{name:/Vì sao gợi ý:.*Phân loại/}).click();
  check('Live topic explanation opens',(await summary.locator('.study-compact-reason').innerText()).includes('Hệ thống phân tán'));
  check('Detailed knowledge appears for distributed systems',(await summary.locator('.study-compact-reason').innerText()).includes('Kênh liên lạc giữa các nút phân tán'));
  check('Detailed parallel-system guidance appears',(await summary.locator('.study-compact-reason').innerText()).includes('Giới hạn tăng tốc khi tăng số bộ xử lý'));
  check('Specific guidance remains visible',await summary.locator('.study-review-guidance ul > li').count()>0);
  await summary.getByRole('button',{name:/bài chưa đủ dữ liệu/}).click();
  check('Small sample group opens',await summary.locator('#study-insufficient-content').isVisible());
  check('No percent conclusion for small samples',!(await summary.locator('#study-insufficient-content').innerText()).includes('%'));
  check('Study link targets real lesson',await summary.getByRole('link',{name:/Ôn tập:.*Phân loại/}).getAttribute('href')==='/lesson?id=56');
  await page.screenshot({path:path.join(root,'docs/phuong-real-web-desktop.png'),fullPage:true});
  await summary.locator('select').selectOption('515');
  check('Course filter updates URL',page.url().includes('course_id=515'));
  check('Testing course recommendations visible',(await summary.innerText()).includes('Kiểm thử phần mềm nhập môn'));
  check('Passing project lesson excluded',!(await summary.innerText()).includes('Dự án nhỏ: kế hoạch kiểm thử'));
  await summary.locator('select').selectOption('4');
  check('HTML course has no false review',(await summary.innerText()).includes('chưa có bài học cần ôn'));
  await summary.locator('select').selectOption('7');
  await page.reload();await summary.locator('.study-compact-item').first().waitFor();
  check('Course survives reload',await summary.locator('select').inputValue()==='7');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
  check('Live mobile layout fits',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(root,'docs/phuong-real-web-mobile.png'),fullPage:true});
  await page.goto('http://127.0.0.1:5173/student/recommendations?course_id=7');
  await page.locator('.study-course-group').first().waitFor();
  check('Full recommendation page loads live',await page.locator('.study-course-group').count()>0);
  check('Full list has OS lesson',(await page.locator('main').innerText()).includes('Phân loại hệ điều hành'));
  check('All live API responses successful',responses.length>=8&&responses.every(r=>r.status===200));
  check('No API writes during inspection',writes.length===0);
  check('No browser runtime errors',errors.length===0);
  fs.writeFileSync(path.join(root,'docs/phuong-real-web-results.json'),JSON.stringify({mode:'live_frontend_live_backend_live_mysql_no_mocking',session:'local_5_minute_signed_session_not_password_login',passed:checks.length,checks,responses,writes,errors},null,2));
  console.log(JSON.stringify({passed:checks.length,apiResponses:responses.length,writes: writes.length,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e.message);process.exit(1)});
