const {chromium}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addInitScript(()=>{if(!sessionStorage.getItem('audit-seeded')){localStorage.setItem('token','ui-fixture-only-not-a-session');localStorage.setItem('user',JSON.stringify({id:90001,fullname:'User mẫu',role:'student',email:'fixture@example.test'}));sessionStorage.setItem('audit-seeded','1')}});
 let release;const gate=new Promise(resolve=>release=resolve);const findings=[];
 await context.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
 await context.route('**/api/**',async r=>{const u=new URL(r.request().url());if(!u.pathname.startsWith('/api/'))return r.fallback();
 if(u.pathname==='/api/enrollments'){await gate;return r.fulfill({status:401,json:{success:false,message:'Phiên cũ'}})}
 if(u.pathname==='/api/auth/change-password')return r.fulfill({json:{success:true,token:'ui-fresh-fixture-not-a-session'}});
 return r.fulfill({json:{success:true,data:[]}});
 });const page=await context.newPage();await page.goto('http://127.0.0.1:5174/student/profile');const inputs=page.locator('input[type=password]');await inputs.first().fill('AuditOld123!');await inputs.nth(1).fill('AuditNew456!');await inputs.nth(2).fill('AuditNew456!');await page.locator('#pwForm').getByRole('button').click();await page.waitForFunction(()=>localStorage.getItem('token')==='ui-fresh-fixture-not-a-session');release();await page.waitForTimeout(1200); await page.waitForLoadState('domcontentloaded');
 findings.push({case:'late_401_from_old_request_after_password_rotation',fresh_session_cleared:await page.evaluate(()=>localStorage.getItem('token')===null),redirected_to_login:page.url().endsWith('/login')});
 fs.writeFileSync('docs/deep-audit-session-race.json',JSON.stringify({mode:'mocked_api_no_real_credentials',findings},null,2));console.log(JSON.stringify(findings));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
