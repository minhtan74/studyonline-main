// UI-only demo: intercepted APIs and an invalid fixture login marker.
const {chromium}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const checks=[];function check(name,value){assert.ok(value,name);checks.push(name);}
const unit=(id,extra={})=>({kind:'lesson',id,course_id:1,course_title:'Python hướng đối tượng',chapter_id:10,chapter_name:'Chương 1: Thực hành',title:`Bài ${id}: Kiểm tra và vận dụng`,available:true,answered:10,correct:3,avg_score:30,sufficient_data:true,needs_review:true,latest_result_id:30,sources:[],...extra});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 try{
  const context=await browser.newContext({viewport:{width:1488,height:1000}});
  await context.addInitScript(()=>{localStorage.setItem('token','ui-fixture-only-not-a-session');localStorage.setItem('user',JSON.stringify({id:90001,fullname:'Học viên xem thử',role:'student'}));});
  const writes=[];
  await context.route('**/*',route=>{const u=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(u.hostname)?route.fallback():route.abort();});
  await context.route('**/api/**',route=>{
   const req=route.request(),url=new URL(req.url());if(!url.pathname.startsWith('/api/'))return route.fallback();
   if(req.method()!=='GET'){writes.push(url.pathname);return route.fulfill({json:{success:true}});}
   let data=[];
   if(url.pathname==='/api/recommendations'){
    const units=[...Array.from({length:11},(_,i)=>unit(i+1,{correct:2+i%4,avg_score:(2+i%4)*10})),
     ...Array.from({length:8},(_,i)=>unit(i+21,{course_id:2,course_title:'Nguyên lí hệ điều hành',chapter_id:20,answered:1+i%4,correct:0,avg_score:0,sufficient_data:false,needs_review:false}))];
    data={current:{items:[],based_on:{knowledge:{units},min_topic_questions:5,topic_review_threshold:70}},history:[]};
   }else if(url.pathname==='/api/progress'&&!url.searchParams.has('weekly'))data={total_lessons:30,done_lessons:15,courses:[{course_id:1,course_title:'Python hướng đối tượng'},{course_id:2,course_title:'Nguyên lí hệ điều hành'},{course_id:3,course_title:'Git chưa làm Quiz'}]};
   else if(url.pathname==='/api/analytics/overview')data={avg_quiz_score:62,quiz_attempts:12};
   return route.fulfill({json:{success:true,data}});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/student/progress',{waitUntil:'domcontentloaded'});
  const card=page.getByRole('region',{name:'Tóm tắt gợi ý học tập'});
  const review=card.getByRole('region',{name:'Bài nên ôn tập'});
  const uncertain=card.getByRole('region',{name:'Bài chưa đủ dữ liệu'});
  const toggle=()=>uncertain.getByRole('button',{name:/8 bài chưa đủ dữ liệu/});
  await review.locator('.study-compact-row').first().waitFor();
  check('Main list starts with five established review lessons',await review.locator('.study-compact-row').count()===5);
  check('Review counter excludes all eight insufficient lessons',await review.getByRole('status').innerText()==='Đang hiển thị 5/11 bài nên ôn');
  check('Insufficient group is collapsed by default',await toggle().getAttribute('aria-expanded')==='false'&&await uncertain.locator('.study-compact-row').count()===0);
  check('Summary retains both category totals',(await card.innerText()).includes('11 bài nên ôn · 8 bài cần kiểm tra thêm'));
  await page.screenshot({path:path.join(__dirname,'study-summary-groups-desktop.png'),fullPage:true});
  await review.getByRole('button',{name:'Xem thêm bài nên ôn',exact:true}).click();
  check('Review expands to ten without opening insufficient group',await review.locator('.study-compact-row').count()===10&&await uncertain.locator('.study-compact-row').count()===0);
  await review.getByRole('button',{name:'Xem thêm bài nên ôn',exact:true}).click();
  check('All eleven review lessons are retained',await review.locator('.study-compact-row').count()===11&&await review.getByRole('status').innerText()==='Đang hiển thị 11/11 bài nên ôn');
  check('Review more button disappears at end',await review.getByRole('button',{name:'Xem thêm bài nên ôn',exact:true}).count()===0);
  await toggle().click();
  check('Insufficient group has its own five initial rows',await uncertain.locator('.study-compact-row').count()===5);
  check('Insufficient counter is separate',await uncertain.getByRole('status').innerText()==='Đang hiển thị 5/8 bài chưa đủ dữ liệu');
  check('Insufficient score does not display percentage',!(await uncertain.locator('.study-compact-score').allInnerTexts()).join(' ').includes('%'));
  await uncertain.getByRole('button',{name:'Xem thêm bài chưa đủ dữ liệu'}).click();
  check('All eight insufficient lessons remain accessible',await uncertain.locator('.study-compact-row').count()===8);
  const one=uncertain.locator('.study-compact-item').filter({has:page.getByRole('heading',{name:'Bài 21: Kiểm tra và vận dụng',exact:true})});
  check('Single-question row shows minimum evidence and wrong count',(await one.locator('.study-compact-score').innerText()).includes('1/5 câu')&&(await one.locator('.study-compact-score').innerText()).includes('1 câu sai'));
  check('Practice action is retained',await one.getByRole('link',{name:'Chọn Quiz: Bài 21: Kiểm tra và vận dụng',exact:true}).getAttribute('href')==='/quiz');
  await toggle().click();await toggle().click();
  check('Reopening insufficient group resets its own pagination',await uncertain.locator('.study-compact-row').count()===5&&await review.locator('.study-compact-row').count()===11);
  await review.getByRole('button',{name:'Thu gọn bài nên ôn'}).click();
  check('Collapsing review keeps independent group open',await review.locator('.study-compact-row').count()===5&&await toggle().getAttribute('aria-expanded')==='true');
  const select=page.getByRole('combobox',{name:'Lọc gợi ý theo khóa học'});
  await select.selectOption('2');
  await card.getByText('Chưa có bài đủ căn cứ để đề xuất ôn tập trong khóa học này.').waitFor();
  check('Only-insufficient course has no misleading review list',await card.getByRole('region',{name:'Bài nên ôn tập'}).count()===0&&await toggle().getAttribute('aria-expanded')==='false');
  await toggle().click();check('Only-insufficient course can open its lessons',await uncertain.locator('.study-compact-row').count()===5);
  await select.selectOption('3');
  await card.getByText('Khóa học này chưa có bài học cần ôn từ kết quả Quiz hiện tại.').waitFor();
  check('Empty course has no phantom insufficient group',await card.getByRole('region',{name:'Bài chưa đủ dữ liệu'}).count()===0);
  await select.selectOption('all');
  check('Course change resets both groups',await review.locator('.study-compact-row').count()===5&&await toggle().getAttribute('aria-expanded')==='false');
  await toggle().click();
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth+1,null,{timeout:4000});
  check('Both groups fit mobile',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:path.join(__dirname,'study-summary-groups-mobile.png'),fullPage:true});
  check('Reading and expanding groups never writes learning data',writes.length===0);
  check('No frontend errors',errors.length===0);
  fs.writeFileSync(path.join(__dirname,'study-summary-groups-browser-results.json'),JSON.stringify({mode:'mocked_student_ui_no_real_credentials',passed:checks.length,checks,errors},null,2));
  console.log(JSON.stringify({passed:checks.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
