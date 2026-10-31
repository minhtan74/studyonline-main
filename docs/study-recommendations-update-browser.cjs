// UI-only fixtures: no database access, real login, or valid credentials.
const { chromium }=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const checks=[];const check=(name,value)=>{assert.ok(value,name);checks.push(name);};
const unit=(id,extra={})=>({kind:'lesson',id,course_id:1,course_title:'Python hướng đối tượng',chapter_id:10,
 chapter_name:'Chương 1: Đối tượng',title:`Bài ${id}: Thực hành đối tượng`,available:true,answered:10,correct:6,
 avg_score:60,sufficient_data:true,needs_review:true,latest_result_id:30,sources:[],...extra});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 try{
  const context=await browser.newContext({viewport:{width:1488,height:900}});
  await context.addInitScript(()=>{localStorage.setItem('token','ui-fixture-only-not-a-session');localStorage.setItem('user',JSON.stringify({id:90001,fullname:'Học viên xem thử',email:'preview@example.invalid',role:'student'}));});
  let mode='mixed';const writes=[];
  await context.route('**/*',route=>{const u=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(u.hostname)?route.fallback():route.abort();});
  await context.route('**/api/**',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(!url.pathname.startsWith('/api/'))return route.fallback();
   if(req.method()!=='GET'){writes.push(url.pathname);return route.fulfill({json:{success:true}});}
   let data=[];
   if(url.pathname==='/api/recommendations'){
    const units=mode==='empty'?[]:[unit(1),unit(2,{answered:3,correct:2,avg_score:66.7,sufficient_data:false,needs_review:false}),unit(3,{correct:7,avg_score:70,needs_review:false})];
    data={current:{items:[{knowledge_evidence:{kind:'lesson',id:2,course_id:1},practice_url:'/quiz-show?id=444'}],based_on:{knowledge:{units},min_topic_questions:5,topic_review_threshold:70}},history:[]};
   }else if(url.pathname==='/api/progress'&&!url.searchParams.has('weekly'))data={total_lessons:12,done_lessons:0,courses:[]};
   else if(url.pathname==='/api/analytics/overview')data={avg_quiz_score:75,quiz_attempts:1};
   return route.fulfill({json:{success:true,data}});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/student/progress',{waitUntil:'domcontentloaded'});
  const card=page.getByRole('region',{name:'Tóm tắt gợi ý học tập'});
  await card.locator('.study-compact-row').first().waitFor();
  check('Only review and insufficient rows are suggested',await card.locator('.study-compact-row').count()===2);
  check('Summary separates both categories',(await card.innerText()).includes('1 bài nên ôn · 1 bài cần kiểm tra thêm'));
  check('Review badge uses Nên ôn tập',await card.locator('.study-priority-review').innerText()==='Nên ôn tập');
  check('Small-sample badge uses Cần kiểm tra thêm',await card.locator('.study-priority-check').innerText()==='Cần kiểm tra thêm');
  check('Review is first',await card.locator('.study-compact-item').first().innerText().then(t=>t.includes('Bài 1:')));
  check('Review action opens the lesson',await card.getByRole('link',{name:'Ôn tập: Bài 1: Thực hành đối tượng',exact:true}).getAttribute('href')==='/lesson?id=1');
  check('Small-sample action opens exact available practice',await card.getByRole('link',{name:'Luyện Quiz: Bài 2: Thực hành đối tượng',exact:true}).getAttribute('href')==='/quiz-show?id=444');
  check('70 percent lesson does not show as weak',!(await card.innerText()).includes('Bài 3:'));
  check('Counter describes all suggestions',await card.getByRole('status').innerText()==='Đang hiển thị 2/2 bài được gợi ý');
  await card.getByRole('button',{name:'Vì sao gợi ý: Bài 2: Thực hành đối tượng',exact:true}).click();
  const reason=await card.locator('.study-compact-reason').innerText();
  check('Reason explains the three-question sample',reason.includes('3 câu khác nhau')&&reason.includes('ít nhất 5 câu'));
  check('Reason explains reused-content deduplication',reason.includes('cùng nội dung và bộ phương án được tính một lần'));
  await page.screenshot({path:path.join(__dirname,'study-recommendations-update-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth+1,null,{timeout:4000});
  check('Mobile has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:path.join(__dirname,'study-recommendations-update-mobile.png'),fullPage:true});
  mode='empty';await page.reload({waitUntil:'domcontentloaded'});
  await card.getByText('Chưa có dữ liệu Quiz để gợi ý nội dung cần ôn.').waitFor();
  check('No Quiz evidence has explicit empty state',await card.locator('.study-compact-row').count()===0);
  check('Reading and expanding does not write learning data',writes.length===0);
  check('No runtime errors',errors.length===0);
  fs.writeFileSync(path.join(__dirname,'study-recommendations-update-browser-results.json'),JSON.stringify({mode:'mocked_student_ui_no_real_credentials',passed:checks.length,checks,errors},null,2));
  console.log(JSON.stringify({passed:checks.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
