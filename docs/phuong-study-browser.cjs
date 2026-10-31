const {chromium,request}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{
 const api=await request.newContext({baseURL:'http://127.0.0.1:8080'});
 const auth=await(await api.post('/api/auth/login',{data:{email:'phuong.vu@gmail.com',password:'123456'}})).json();assert.ok(auth.token);
 const headers={Authorization:'Bearer '+auth.token};
 const rec=await(await api.get('/api/recommendations',{headers})).json();
 const before=await(await api.get('/api/progress',{headers})).json();
 const {buildStudyRecommendations}=await import('../frontend/src/utils/studyRecommendations.js');
 const data=buildStudyRecommendations(rec.data.current);const checks=[],errors=[],blocked=[];
 const check=(name,value)=>{assert.ok(value,name);checks.push(name);};
 const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 try{
 const context=await browser.newContext({viewport:{width:1488,height:900}});
 await context.addInitScript(auth=>{localStorage.setItem('token',auth.token);localStorage.setItem('user',JSON.stringify(auth.user));},auth);
 await context.route('**/api/**',route=>{if(route.request().method()==='GET')return route.continue();blocked.push({path:new URL(route.request().url()).pathname,body:route.request().postDataJSON()});return route.fulfill({json:{success:true}});});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const card=page.locator('.study-recommendation-summary');
 await page.goto('http://localhost:5173/student/progress');await card.locator('.study-compact-row').first().waitFor();
 check('Real summary starts with five',await card.locator('.study-compact-row').count()===Math.min(5,data.rows.length));
 let visible=5;
 while(await card.getByRole('button',{name:'Xem thêm',exact:true}).count()){await card.getByRole('button',{name:'Xem thêm',exact:true}).click();visible+=5;check('Show '+Math.min(visible,data.rows.length)+' real lessons',await card.locator('.study-compact-row').count()===Math.min(visible,data.rows.length));}
 check('Full summary matches real API count',await card.locator('.study-compact-row').count()===data.rows.length);
 check('Insufficient lessons labelled check',await card.locator('.study-priority-check').count()===data.rows.filter(r=>r.priority==='check').length);
 check('Summary separates both real categories',await card.innerText().then(t=>t.includes(`${data.rows.filter(r=>r.priority==='review').length} bài nên ôn`)&&t.includes(`${data.rows.filter(r=>r.priority==='check').length} bài cần kiểm tra thêm`)));
 await card.locator('.study-why-btn').first().click();check('Real explanation shown',await card.locator('.study-compact-reason').count()===1);
 if(data.rows.length>1){await card.locator('.study-why-btn').nth(1).click();check('Only one explanation',await card.locator('.study-compact-reason').count()===1);}
 const evidenceLink=card.locator('.study-compact-reason a[href*="quiz-result"]').first();
 if(await evidenceLink.count()){const href=await evidenceLink.getAttribute('href');await evidenceLink.click();await page.waitForURL('**'+href);check('Real Quiz evidence opens',await page.locator('main').innerText().then(t=>!t.includes('Không tìm thấy kết quả')));await page.goto('http://localhost:5173/student/progress');await card.locator('.study-compact-row').first().waitFor();}
 await card.screenshot({path:__dirname+'/phuong-study-summary.png'});
 const review=card.locator('.study-compact-action').first(),href=await review.getAttribute('href');await review.click();await page.waitForURL('**'+href);
 const id=Number(new URL('http://localhost'+href).searchParams.get('id'));check('Exact real lesson checkpoint',blocked.some(w=>w.path==='/api/recommendations/study'&&w.body.unit_id===id&&data.rows.some(r=>r.lessonId===id&&r.courseId===w.body.course_id)));
 await page.goto('http://localhost:5173/student/recommendations');await page.locator('.study-results-info').waitFor();check('Full list count matches',Number(await page.locator('.study-stat strong').first().innerText())===data.rows.length);
 const chapter=page.locator('.study-course-group:not([hidden]) .study-chapter-group').first();await chapter.locator('.study-chapter-toggle').click();check('Chapter collapses',!(await chapter.getAttribute('open'))&&await chapter.getAttribute('open')===null);await chapter.locator('.study-chapter-toggle').click();check('Chapter expands',await chapter.getAttribute('open')!==null);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(350);check('Mobile no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.goto('http://localhost:5173/student/progress');await card.locator('.study-compact-row').first().waitFor();check('Mobile summary no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await card.screenshot({path:__dirname+'/phuong-study-summary-mobile.png'});
 const after=await(await api.get('/api/progress',{headers})).json();check('Saved progress unchanged',JSON.stringify(before)===JSON.stringify(after));check('No JavaScript exceptions',errors.length===0);
 const report={account:'phuong.vu@gmail.com',name:auth.user?.full_name||auth.user?.name,passed:checks.length,checks,totalLessons:data.rows.length,courses:[...new Set(data.rows.map(r=>r.courseTitle))],review:data.rows.filter(r=>r.priority==='review').length,check:data.rows.filter(r=>r.priority==='check').length,progress:before.data,errors,note:'Real API data only; study/progress POST requests intercepted to preserve account.'};
 fs.writeFileSync(__dirname+'/phuong-study-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();await api.dispose();}
})().catch(e=>{console.error(e);process.exitCode=1;});
