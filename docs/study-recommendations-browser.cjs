const { chromium, request } = require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const checks=[]; const check=(name,value)=>{assert.ok(value,name);checks.push(name);};
(async()=>{
 const api=await request.newContext({baseURL:'http://127.0.0.1:8080'});
 const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 try {
 for(const email of ['em.hoang@gmail.com','phuong.vu@gmail.com']) {
  const auth=await (await api.post('/api/auth/login',{data:{email,password:'123456'}})).json(); assert.ok(auth.token);
  const context=await browser.newContext({viewport:{width:1488,height:900}});
  await context.addInitScript(auth=>{localStorage.setItem('token',auth.token);localStorage.setItem('user',JSON.stringify(auth.user));},auth);
  const errors=[]; let mode='real',gets=0,study;
  const unit=(id,extra={})=>({id,kind:'lesson',course_id:7,course_title:'Khóa học kiểm thử',chapter_id:10,chapter_name:'Điều kiện',title:`Bài học ${id}`,available:true,answered:5,correct:2,avg_score:40,sufficient_data:true,needs_review:true,latest_result_id:20,sources:[],...extra});
  const units=[unit(55),unit(55,{latest_result_id:19}),unit(56),unit(57),unit(58),unit(59,{course_id:8,course_title:'Khóa thứ hai',answered:2,correct:1,avg_score:50,sufficient_data:false,needs_review:false})];
  await context.route('**/api/**',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(req.method()!=='GET'){if(url.pathname==='/api/recommendations/study')study=req.postDataJSON();return route.fulfill({json:{success:true}});}
   if(url.pathname==='/api/recommendations'){gets++;check('All courses requested without selector '+email,!url.searchParams.has('course_id'));
    if(mode==='error')return route.fulfill({status:503,json:{success:false,message:'Không tải được gợi ý'}});
    if(mode!=='real')return route.fulfill({json:{success:true,data:{current:{items:[],based_on:{knowledge:{units:mode==='empty'?[]:units}}}}}});
   }
   if(mode==='partial'&&url.pathname==='/api/progress')return route.fulfill({status:503,json:{success:false}});
   return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:5173/student/recommendations');
  await page.locator('.study-results-info').waitFor();
  check('Real recommendations loaded '+email,await page.getByRole('heading',{name:'Gợi ý học tập',exact:true}).isVisible());
  check('No extra sidebar menu '+email,await page.locator('aside a[href="/student/recommendations"]').count()===0);
  await page.locator('main.study-recommendations-page').screenshot({path:__dirname+'/study-recommendations-'+email.split('@')[0]+'.png'});
  mode='fixture'; await page.reload();await page.locator('.study-results-info').waitFor();
  check('Deduplicated full list, not top three',await page.locator('.study-stat strong').first().innerText()==='5');
  check('Only highest group starts open',await page.locator('.study-course-toggle[aria-expanded="true"]').count()===1);
  const chapter=page.locator('.study-course-group').first().locator('.study-chapter-group').first();
  check('Lessons grouped under their chapter',await chapter.locator('.study-suggestion-row').count()===4);
  await chapter.locator('summary').first().click();
  check('Chapter collapses lessons',!(await chapter.locator('.study-suggestion-row').first().isVisible()));
  await chapter.locator('summary').first().click();
  check('Chapter expands lessons',await chapter.locator('.study-suggestion-row').first().isVisible());
  const before=gets;
  await page.getByRole('button',{name:'Cần kiểm tra thêm',exact:true}).click();
  await page.getByText('Chưa đủ dữ liệu',{exact:true}).waitFor();
  check('Check stats consistent',await page.locator('.study-stat strong').first().innerText()==='1');
  check('Insufficient label consistent with summary',await page.locator('.study-suggestion-row .study-priority').innerText()==='Cần kiểm tra thêm');
  check('Practice action selects Quiz instead of inventing match',await page.getByRole('link',{name:'Chọn Quiz để luyện: Bài học 59',exact:true}).getAttribute('href')==='/quiz');
  await page.getByRole('button',{name:'Nên ôn tập',exact:true}).click();
  check('Review category only',await page.locator('.study-stat strong').first().innerText()==='4');
  check('Unsupported priority filters removed',await page.getByRole('button',{name:'Ưu tiên thấp',exact:true}).count()===0);
  await page.getByRole('button',{name:'Tất cả',exact:true}).click();
  await page.getByRole('searchbox').fill('dieu kien');
  check('Search matches Vietnamese without accents',await page.locator('.study-stat strong').first().innerText()==='5');
  check('Filters do not refetch',gets===before);
  await page.getByRole('searchbox').fill('không có từ khóa này');
  await page.getByRole('button',{name:'Xóa bộ lọc'}).click();
  const toggle=page.locator('.study-course-toggle').first();await toggle.click();check('Collapse works',await toggle.getAttribute('aria-expanded')==='false');await toggle.click();
  for(const width of [1488,1024,768,390,320]){
    await page.setViewportSize({width,height:900});await page.waitForTimeout(350);
    check('Full list has no horizontal overflow '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check('Full review action touch target '+width,await page.getByRole('link',{name:'Ôn tập: Bài học 55',exact:true}).evaluate(n=>{const r=n.getBoundingClientRect();return r.width>=40&&r.height>=40&&r.right<=innerWidth;}));
  }
  await page.locator('main.study-recommendations-page').screenshot({path:__dirname+'/study-recommendations-mobile.png'});
  await page.getByRole('link',{name:'Ôn tập: Bài học 55',exact:true}).click();await page.waitForURL('**/lesson?id=55');
  check('Review exact lesson and checkpoint',study?.unit_id===55&&study?.course_id===7&&study?.knowledge_kind==='lesson');
  await page.goto('http://localhost:5173/student/progress');
  await page.locator('.study-recommendation-summary .study-compact-row').first().waitFor();
  check('Progress initially shows five lessons',await page.locator('.study-recommendation-summary .study-compact-row').count()===5);
  await page.getByRole('link',{name:'Xem tất cả gợi ý'}).click();await page.waitForURL('**/student/recommendations');
  mode='partial';await page.reload();await page.getByText('Chưa tải được tiến độ khóa học;', {exact:false}).waitFor();
  check('Progress failure preserves recommendations',await page.locator('.study-stat strong').first().innerText()==='5');
  mode='empty';await page.reload();await page.getByRole('heading',{name:'Chưa có dữ liệu Quiz'}).waitFor();check('Empty state available',true);
  mode='error';await page.reload();await page.getByRole('alert').waitFor();check('Error clears stale totals',await page.locator('.study-stat strong').first().innerText()==='—');
  mode='fixture';await page.getByRole('button',{name:'Thử lại',exact:true}).click();await page.locator('.study-results-info').waitFor();check('Retry restores data',await page.locator('.study-stat strong').first().innerText()==='5');
  check('No JavaScript exceptions '+email,errors.length===0);await context.close();
 }
 fs.writeFileSync(__dirname+'/study-recommendations-results.json',JSON.stringify({passed:checks.length,checks,fixtures:'Controlled edge cases only; real API also checked for two students. Study writes intercepted.'},null,2));
 console.log(JSON.stringify({passed:checks.length}));
 }finally{await browser.close();await api.dispose();}
})().catch(e=>{console.error(e);process.exitCode=1;});
