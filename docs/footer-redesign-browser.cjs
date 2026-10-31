const {chromium}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');const assert=require('node:assert/strict'),fs=require('node:fs');const checks=[];const check=(n,v)=>{assert.ok(v,n);checks.push(n)};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];const writes=[];
 await context.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
 await context.route('**/api/**',r=>{if(!new URL(r.request().url()).pathname.startsWith('/api/'))return r.fallback();if(r.request().method()!=='GET')writes.push(r.request().method());return r.fulfill({json:{success:true,data:[]}})});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5174/help');const footer=page.getByRole('contentinfo');await footer.waitFor();
 check('One accessible shared footer',await footer.count()===1);check('Real support guidance replaces placeholders',await footer.innerText().then(t=>!t.includes('1900')&&!t.includes('support@')&&t.includes('quản trị viên')));
 check('Guest CTA leads to registration',await footer.getByRole('link',{name:/Bắt đầu học cùng/}).getAttribute('href')==='/register');
 check('Guest account links valid',await footer.getByRole('link',{name:'Đăng nhập',exact:true}).getAttribute('href')==='/login'&&await footer.getByRole('link',{name:'Tạo tài khoản',exact:true}).getAttribute('href')==='/register');
 check('No dummy links',await footer.locator('a').evaluateAll(links=>links.every(a=>a.getAttribute('href')&&a.getAttribute('href')!=='#')));
 check('Desktop uses four columns',await footer.locator('.public-footer-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length===4));
 await footer.screenshot({path:'docs/footer-desktop.png'});
 for(const [label,id] of [['Bắt đầu một khóa học','start'],['Xem bài học và tài liệu','materials'],['Làm bài Quiz','quiz'],['Hiểu gợi ý học tập','recommendations'],['Sử dụng AI Tutor','ai'],['Thông tin cần chuẩn bị','support']]){
  await footer.getByRole('link',{name:new RegExp(label)}).click();await page.waitForFunction(id=>document.getElementById(id)?.open,id);check('Guide link opens '+id,new URL(page.url()).hash==='#'+id);
 }
 await footer.getByRole('link',{name:/Hướng dẫn cấp lại mật khẩu/}).click();await page.getByRole('heading',{name:'Quên mật khẩu?'}).waitFor();check('Recovery link opens existing support flow',page.url().endsWith('/forgot-password'));
 await page.goto('http://127.0.0.1:5174/help');await footer.scrollIntoViewIfNeeded();await footer.getByRole('button',{name:/Về đầu trang/}).click();check('Back to top respects reduced motion and works',await page.evaluate(()=>scrollY)===0);
 for(const width of [768,390,320]){await page.setViewportSize({width,height:844});await footer.scrollIntoViewIfNeeded();await page.waitForTimeout(100);check('Footer fits width '+width,await footer.evaluate(el=>el.getBoundingClientRect().right<=innerWidth&&el.scrollWidth<=el.clientWidth));}
 await page.setViewportSize({width:390,height:844});await footer.scrollIntoViewIfNeeded();await footer.screenshot({path:'docs/footer-mobile.png',style:'#navbar { visibility:hidden !important; }'});await page.goto('http://127.0.0.1:5174/help#quiz');await page.locator('#quiz[open]').waitFor();check('Direct guide anchor works after reload',await page.locator('#quiz').getAttribute('open')!==null);
 await page.screenshot({path:'docs/footer-help-mobile.png',fullPage:true});
 for(const [role,path] of [['student','/student/dashboard'],['teacher','/teacher'],['admin','/admin']]){
  await page.evaluate(role=>{localStorage.setItem('token','ui-fixture-only-not-a-session');localStorage.setItem('user',JSON.stringify({id:90001,fullname:'User mẫu',role}))},role);await page.reload();
  check(role+' CTA goes to correct workspace',await footer.locator('.public-footer-cta').getAttribute('href')===path);
  check(role+' hides guest account prompts',await footer.getByRole('link',{name:'Tạo tài khoản',exact:true}).count()===0);
 }
 check('No frontend errors',errors.length===0);check('Footer does not send writes',writes.length===0);
 fs.writeFileSync('docs/footer-redesign-browser-results.json',JSON.stringify({mode:'mocked_api_no_real_credentials',passed:checks.length,checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,errors}));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
