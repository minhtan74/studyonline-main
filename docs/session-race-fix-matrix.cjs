const {chromium}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');const assert=require('node:assert/strict'),fs=require('node:fs');const checks=[];const check=(n,v)=>{assert.ok(v,n);checks.push(n)};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});try{
 const cases=[
 {name:'old 401 after new login',initial:'old-fixture',current:'new-fixture',status:401},
 {name:'guest 401 after login',initial:null,current:'new-fixture',status:401},
 {name:'old 401 after local logout',initial:'old-fixture',current:null,status:401},
 {name:'current 401',initial:'current-fixture',current:'current-fixture',status:401,redirect:true},
 {name:'current 403',initial:'current-fixture',current:'current-fixture',status:403},
 {name:'auth login 401',initial:'current-fixture',current:'current-fixture',status:401,path:'/api/auth/login'},
 ];
 for(const c of cases){const context=await browser.newContext();await context.addInitScript(initial=>{if(!sessionStorage.getItem('seeded')){if(initial)localStorage.setItem('token',initial);sessionStorage.setItem('seeded','1')}},c.initial);
 let release,seen;const gate=new Promise(r=>release=r),started=new Promise(r=>seen=r);let count=0,sent;
 const target=c.path||'/api/audit-delayed';
 await context.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
 await context.route('**/api/**',async r=>{const u=new URL(r.request().url());if(!u.pathname.startsWith('/api/'))return r.fallback();if(u.pathname===target){count++;sent=r.request().headers().authorization;seen();await gate;return r.fulfill({status:c.status,json:{success:false,message:'Fixture only'}})}return r.fulfill({json:{success:true,data:[]}})});
 const page=await context.newPage();await page.goto('http://127.0.0.1:5174/');
 await page.evaluate(async path=>{const {default:api}=await import('/src/api/axiosClient.js');window.auditDone=false;api.post(path,{}).then(result=>{window.auditResult=result;window.auditDone=true})},target);await started;
 await page.evaluate(current=>{if(current)localStorage.setItem('token',current);else localStorage.removeItem('token')},c.current);release();
 if(c.redirect){await page.waitForURL('**/login',{waitUntil:'domcontentloaded'});check(c.name+': revoked token cleared',await page.evaluate(()=>localStorage.getItem('token'))===null)}
 else{await page.waitForFunction(()=>window.auditDone);check(c.name+': current storage preserved',await page.evaluate(()=>localStorage.getItem('token'))===c.current);check(c.name+': response settles normally',await page.evaluate(()=>window.auditResult.ok===false&&[401,403].includes(window.auditResult.status)));check(c.name+': no unexpected redirect',!page.url().endsWith('/login'))}
 check(c.name+': no automatic replay of POST',count===1);check(c.name+': correct original bearer',sent===(c.initial?'Bearer '+c.initial:undefined));await context.close();
 }
 fs.writeFileSync('docs/session-race-fix-matrix-results.json',JSON.stringify({mode:'mocked_api_no_real_credentials',passed:checks.length,checks},null,2));console.log(JSON.stringify({passed:checks.length}));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
