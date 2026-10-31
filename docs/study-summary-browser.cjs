const { chromium, request } = require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const checks=[];function check(name,value){assert.ok(value,name);checks.push(name);}
(async()=>{
 const api=await request.newContext({baseURL:'http://127.0.0.1:8080'});
 const auth=await(await api.post('/api/auth/login',{data:{email:'em.hoang@gmail.com',password:'123456'}})).json();assert.ok(auth.token);
 const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 try{
  const context=await browser.newContext({viewport:{width:1488,height:900}});
  await context.addInitScript(auth=>{localStorage.setItem('token',auth.token);localStorage.setItem('user',JSON.stringify(auth.user));},auth);
  let mode='real',writes=[],gets=0;const errors=[];
  const units=Array.from({length:17},(_,i)=>({kind:'lesson',id:55+i,course_id:i%2?7:8,course_title:'Khóa học '+i%2+' với tên dài để kiểm tra hiển thị',chapter_id:10,chapter_name:'Chương điều kiện',title:'Bài học '+i+' với tên rất dài cần được rút gọn bằng dấu ba chấm',available:true,answered:i===0?1:10,correct:i===0?0:4,avg_score:i===0?0:40,sufficient_data:i!==0,needs_review:i!==0,latest_result_id:10,sources:[{result_id:10,quiz_title:'Quiz căn cứ',correct:4,answered:10,submitted_at:'2026-10-30 09:00:00'}]}));
  await context.route('**/api/**',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(req.method()!=='GET'){writes.push({path:url.pathname,body:req.postDataJSON()});return route.fulfill({json:{success:true}});}
   if(url.pathname==='/api/recommendations'){gets++;assert.equal(url.search,'');
    if(mode==='error')return route.fulfill({status:503,json:{success:false}});
    if(mode!=='real')return route.fulfill({json:{success:true,data:{current:{items:[],based_on:{knowledge:{units:mode==='empty'?[]:units}}}}}});
   }return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const card=page.locator('.study-recommendation-summary');
  await page.goto('http://localhost:5173/student/progress');await card.locator('.study-compact-row').first().waitFor();
  check('Real API loads at most five lessons',await card.locator('.study-compact-row').count()<=5);
  mode='fixture';await page.reload();await card.locator('.study-compact-row').first().waitFor();
  check('Five initial rows',await card.locator('.study-compact-row').count()===5);
  check('Initial counter',await card.getByRole('status').innerText()==='Đang hiển thị 5/17 bài được gợi ý');
  check('Summary separates review from incomplete evidence',await card.innerText().then(t=>t.includes('16 bài nên ôn')&&t.includes('1 bài cần kiểm tra thêm')));
  check('Desktop row height 65-80px',await card.locator('.study-compact-row').first().evaluate(n=>{const h=n.getBoundingClientRect().height;return h>=65&&h<=80;}));
  check('Lesson title tooltip exists',!!(await card.locator('.study-compact-topic h3').first().getAttribute('title')));
  check('Reason hidden initially',await card.locator('.study-compact-reason').count()===0);
  await card.locator('.study-why-btn').nth(0).click();await card.locator('.study-why-btn').nth(1).click();
  check('Only one reason opens',await card.locator('.study-compact-reason').count()===1&&await card.locator('.study-why-btn[aria-expanded=true]').count()===1);
  check('Evidence result link retained',await card.locator('.study-compact-reason a[href="/student/quiz-result?result_id=10"]').count()===1);
  await card.getByRole('button',{name:'Xem thêm',exact:true}).click();check('Ten rows',await card.locator('.study-compact-row').count()===10);
  await card.getByRole('button',{name:'Xem thêm',exact:true}).click();check('Fifteen rows',await card.locator('.study-compact-row').count()===15);
  await card.getByRole('button',{name:'Xem thêm',exact:true}).click();check('All seventeen, more hidden',await card.locator('.study-compact-row').count()===17&&await card.getByRole('button',{name:'Xem thêm',exact:true}).count()===0);
  check('Single wrong question labelled check and sorted last',await card.locator('.study-compact-item').last().locator('.study-priority').innerText()==='Cần kiểm tra thêm');
  const lastAction=card.locator('.study-compact-item').last().locator('.study-compact-action');
  check('Incomplete evidence action offers Quiz selection',await lastAction.getAttribute('href')==='/quiz'&&(await lastAction.innerText()).includes('Chọn Quiz'));
  await card.locator('.study-why-btn').last().click();check('Insufficient evidence explained',await card.locator('.study-compact-reason').innerText().then(t=>t.includes('Chưa đủ dữ liệu')&&t.includes('1 câu')));
  const getCount=gets;await card.getByRole('button',{name:'Thu gọn',exact:true}).click();
  check('Collapse restores five and closes reason',await card.locator('.study-compact-row').count()===5&&await card.locator('.study-compact-reason').count()===0);
  check('Pagination makes no API requests',gets===getCount);
  await card.screenshot({path:__dirname+'/study-summary-desktop.png'});
  for(const width of [1488,1024,768,390,320]){
    await page.setViewportSize({width,height:900});await page.waitForTimeout(350);
    check('No overflow '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check('Summary action fits and remains touchable '+width,await card.locator('.study-compact-action').first().evaluate(n=>{const r=n.getBoundingClientRect();return r.width>=40&&r.height>=40&&r.right<=innerWidth;}));
    check('Topic and action do not overlap '+width,await card.locator('.study-compact-row').first().evaluate(n=>{const a=n.querySelector('.study-compact-topic').getBoundingClientRect(),b=n.querySelector('.study-compact-action').getBoundingClientRect();return a.right<=b.left+1||a.bottom<=b.top+1;}));
  }
  await card.screenshot({path:__dirname+'/study-summary-mobile.png'});
  const first=card.locator('.study-compact-action').first(),href=await first.getAttribute('href');await first.click();await page.waitForURL('**'+href);
  check('Exact lesson and course checkpoint',writes.some(w=>w.path==='/api/recommendations/study'&&w.body.unit_id===56&&w.body.course_id===7));
  mode='empty';await page.goto('http://localhost:5173/student/progress');await card.getByText('Chưa có dữ liệu Quiz để gợi ý nội dung cần ôn.').waitFor();check('Empty state',true);
  mode='error';await page.reload();await card.getByRole('alert').waitFor();check('Error state',true);
  mode='fixture';await card.getByRole('button',{name:'Thử lại',exact:true}).click();await card.locator('.study-compact-row').first().waitFor();check('Retry resets to five',await card.locator('.study-compact-row').count()===5);
  await card.getByRole('link',{name:'Xem tất cả gợi ý'}).click();await page.waitForURL('**/student/recommendations');check('Full list navigation',true);
  check('No JavaScript exceptions',errors.length===0);
  fs.writeFileSync(__dirname+'/study-summary-results.json',JSON.stringify({passed:checks.length,checks,notes:'Real API checked; edge cases use browser fixtures; writes intercepted.'},null,2));console.log({passed:checks.length});
 }finally{await browser.close();await api.dispose();}
})().catch(e=>{console.error(e);process.exitCode=1;});
