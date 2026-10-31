// UI fixture test. All API requests are intercepted; no real credentials or DB.
const {chromium}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const checks=[];const check=(name,value)=>{assert.ok(value,name);checks.push(name);};
const titles={1:'Python căn bản',2:'FastAPI thực hành',3:'Git đã đạt ngưỡng',4:'Java chưa làm Quiz',5:'Mạng máy tính'};
const unit=(id,course_id,extra={})=>({kind:'lesson',id,course_id,course_title:titles[course_id],chapter_id:course_id*10,
 chapter_name:'Chương 1: Cơ bản',title:`Bài ${id}: Vận dụng`,available:true,answered:10,correct:6,avg_score:60,
 sufficient_data:true,needs_review:true,latest_result_id:30,sources:[],...extra});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 try{
  const context=await browser.newContext({viewport:{width:1488,height:950}});
  await context.addInitScript(()=>{localStorage.setItem('token','ui-fixture-only-not-a-session');localStorage.setItem('user',JSON.stringify({id:90001,fullname:'Học viên xem thử',role:'student'}));});
  let reads=0;const writes=[];
  await context.route('**/*',route=>{const u=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(u.hostname)?route.fallback():route.abort();});
  await context.route('**/api/**',route=>{
   const req=route.request(),url=new URL(req.url());if(!url.pathname.startsWith('/api/'))return route.fallback();
   if(req.method()!=='GET'){writes.push(url.pathname);return route.fulfill({json:{success:true}});}
   let data=[];
   if(url.pathname==='/api/recommendations'){
    reads++;
    const units=[...Array.from({length:7},(_,i)=>unit(i+1,1)),unit(20,2),unit(21,2,{answered:3,correct:2,avg_score:66.7,sufficient_data:false,needs_review:false}),
     unit(30,3,{correct:9,avg_score:90,needs_review:false}),unit(50,5,{kind:'chapter',chapter_id:50})];
    data={current:{items:[],based_on:{knowledge:{units},min_topic_questions:5,topic_review_threshold:70}},history:[]};
   }else if(url.pathname==='/api/progress'&&!url.searchParams.has('weekly'))data={total_lessons:50,done_lessons:10,courses:Object.entries(titles).map(([id,title])=>({course_id:Number(id),course_title:title,total_lessons:10,done_lessons:2}))};
   else if(url.pathname==='/api/analytics/overview')data={avg_quiz_score:65,quiz_attempts:1};
   return route.fulfill({json:{success:true,data}});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/student/progress',{waitUntil:'domcontentloaded'});
  const card=page.getByRole('region',{name:'Tóm tắt gợi ý học tập'});
  const selector=()=>page.getByRole('combobox',{name:'Lọc gợi ý theo khóa học'});
  await card.locator('.study-compact-row').first().waitFor();
  check('All courses is default',await selector().inputValue()==='all');
  await card.getByRole('button',{name:'Xem thêm',exact:true}).click();
  check('All nine lesson suggestions available',await card.locator('.study-compact-row').count()===9);
  const before=reads;await selector().selectOption('2');
  const selectedText=(await card.locator('.study-compact-row').allInnerTexts()).join('\n');
  check('Selected course shows only its two lessons',await card.locator('.study-compact-row').count()===2&&selectedText.includes(titles[2])&&!selectedText.includes(titles[1]));
  check('Course filter does not refetch recommendations',reads===before);
  check('Selection is in URL',new URL(page.url()).searchParams.get('course_id')==='2');
  check('Counter follows selected course',await card.getByRole('status').innerText()==='Đang hiển thị 2/2 bài được gợi ý');
  await card.getByRole('link',{name:'Xem tất cả gợi ý'}).click();
  await page.locator('.study-course-group').first().waitFor();
  check('Full page retains selected course',await selector().inputValue()==='2');
  check('Full page group is scoped',await page.locator('.study-course-group').count()===1&&(await page.locator('.study-course-name strong').innerText())===titles[2]);
  check('Statistics use current review categories',(await page.locator('.study-stat').filter({hasText:'Bài nên ôn'}).innerText()).includes('1')&&(await page.locator('.study-stat').filter({hasText:'Cần kiểm tra thêm'}).innerText()).includes('1'));
  await page.getByRole('button',{name:'Cần kiểm tra thêm',exact:true}).click();
  check('Priority combines with course',await page.locator('.study-suggestion-row').count()===1);
  await page.getByRole('searchbox').fill('không tồn tại');
  await page.getByRole('heading',{name:'Không có gợi ý phù hợp'}).waitFor();
  await page.getByRole('button',{name:'Xóa bộ lọc'}).click();
  await page.locator('.study-course-group').first().waitFor();
  check('Clear resets course, priority and text',await selector().inputValue()==='all'&&await page.getByRole('searchbox').inputValue()===''&&await page.getByRole('button',{name:'Tất cả',exact:true}).getAttribute('aria-pressed')==='true');
  check('All course groups restored including chapter-only notes',await page.locator('.study-course-group').count()===3);
  await selector().selectOption('4');
  await page.getByRole('heading',{name:'Không có gợi ý phù hợp'}).waitFor();
  check('Course without Quiz remains selectable',await selector().inputValue()==='4'&&await selector().locator('option').count()===6);
  await selector().selectOption('5');await page.locator('.study-course-group').first().waitFor();
  check('Chapter-only course filtering works',await page.locator('.study-course-group').count()===1&&(await page.locator('.study-course-name strong').innerText())===titles[5]);
  await selector().selectOption('2');await page.locator('.study-course-group').first().waitFor();
  await page.screenshot({path:path.join(__dirname,'study-course-filter-desktop.png'),fullPage:true});
  await page.getByRole('link',{name:'← Tiến độ học tập'}).click();
  await card.locator('.study-compact-row').first().waitFor();
  check('Back link retains course',await selector().inputValue()==='2');
  await page.reload({waitUntil:'domcontentloaded'});await card.locator('.study-compact-row').first().waitFor();
  check('Reload retains course',await selector().inputValue()==='2');
  await selector().selectOption('1');
  check('Changing course resets pagination to five',await card.locator('.study-compact-row').count()===5);
  await selector().selectOption('3');
  await card.getByText('Khóa học này chưa có bài học cần ôn từ kết quả Quiz hiện tại.').waitFor();
  check('Good course has specific empty state',await card.locator('.study-compact-row').count()===0);
  await selector().selectOption('2');
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth+1,null,{timeout:4000});
  check('Mobile course selector fits screen',await selector().evaluate(n=>n.getBoundingClientRect().right<=innerWidth));
  await page.screenshot({path:path.join(__dirname,'study-course-filter-mobile.png'),fullPage:true});
  await card.getByRole('link',{name:'Xem tất cả gợi ý'}).click();
  await page.locator('.study-course-group').first().waitFor();
  await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth+1,null,{timeout:4000});
  check('Full page course filter and search fit mobile',await selector().evaluate(n=>n.getBoundingClientRect().right<=innerWidth)&&await page.getByRole('searchbox').evaluate(n=>n.getBoundingClientRect().right<=innerWidth));
  await page.screenshot({path:path.join(__dirname,'study-course-filter-full-mobile.png'),fullPage:true});
  check('Filtering does not write learning records',writes.length===0);
  check('No runtime errors',errors.length===0);
  fs.writeFileSync(path.join(__dirname,'study-course-filter-browser-results.json'),JSON.stringify({mode:'mocked_student_ui_no_real_credentials',passed:checks.length,checks,errors},null,2));
  console.log(JSON.stringify({passed:checks.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
