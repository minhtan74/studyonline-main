const {chromium}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');const assert=require('node:assert/strict'),fs=require('node:fs');const checks=[];const check=(n,v)=>{assert.ok(v,n);checks.push(n)};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});try{
for(const role of ['student','teacher']){
 const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addInitScript(role=>{localStorage.setItem('token','ui-fixture-only-not-a-session');localStorage.setItem('user',JSON.stringify({id:90001,fullname:'User mẫu',email:'fixture@example.test',role}))},role);
 let failLogout=true,logoutAuth='',changeAuth='';const errors=[];
 await context.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
 await context.route('**/api/**',r=>{const u=new URL(r.request().url());if(!u.pathname.startsWith('/api/'))return r.fallback();
 if(u.pathname==='/api/auth/change-password'){changeAuth=r.request().headers().authorization;return r.fulfill({json:{success:true,token:'ui-rotated-fixture-not-a-session',message:'Đã thu hồi phiên cũ'}})}
 if(u.pathname==='/api/auth/logout'){logoutAuth=r.request().headers().authorization;return failLogout?r.abort():r.fulfill({json:{success:true}})}
 return r.fulfill({json:{success:true,data:[]}});
 });const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:5174/${role}/profile`);
 const inputs=page.locator('input[type=password]');await inputs.first().waitFor();await inputs.nth(0).fill('OldPass123!');await inputs.nth(1).fill('NewPass456!');await inputs.nth(2).fill('NewPass456!');
 await inputs.first().locator('xpath=ancestor::form').getByRole('button',{name:/Đổi mật khẩu|Cập nhật mật khẩu/}).click();
 await page.waitForFunction(()=>localStorage.getItem('token')==='ui-rotated-fixture-not-a-session');
 check(role+': password change sends current bearer',changeAuth==='Bearer ui-fixture-only-not-a-session');
 check(role+': fresh token saved',await page.evaluate(()=>localStorage.getItem('token'))==='ui-rotated-fixture-not-a-session');
 check(role+': remains on profile',page.url().endsWith('/'+role+'/profile'));
 check(role+': password cleared',await inputs.first().inputValue()==='');
 const button=page.locator(role==='student'?'.s-logout':'.sidebar-logout');await button.click();await page.getByText('Chưa thể thu hồi phiên đăng nhập. Kiểm tra kết nối rồi thử đăng xuất lại.').waitFor();
 check(role+': network failure keeps token for retry',await page.evaluate(()=>localStorage.getItem('token'))==='ui-rotated-fixture-not-a-session');
 check(role+': logout sends fresh bearer before storage clear',logoutAuth==='Bearer ui-rotated-fixture-not-a-session');
 failLogout=false;await button.click();await page.waitForURL('http://127.0.0.1:5174/');
 check(role+': confirmed logout clears storage',await page.evaluate(()=>localStorage.getItem('token')===null&&localStorage.getItem('user')===null));
 check(role+': no runtime errors',errors.length===0);await context.close();
}
fs.writeFileSync('docs/session-revocation-browser-results.json',JSON.stringify({mode:'mocked_api_no_real_credentials',passed:checks.length,checks},null,2));console.log(JSON.stringify({passed:checks.length}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
