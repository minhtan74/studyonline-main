const { chromium } = require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert = require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}}); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{localStorage.setItem('token','ui-fixture-only-not-a-session');localStorage.setItem('user',JSON.stringify({id:7,role:'teacher',fullname:'Giảng viên mẫu'}));});
let fail=false; let failedResource=''; const calls=[];
const fixtures={courses:[{id:1,teacher_id:7,title:'Khóa Git',lesson_count:4},{id:2,teacher_id:'7',title:'Khóa Python',lesson_count:6},{id:3,teacher_id:8,title:'Khóa người khác',lesson_count:9}],enrollments:[{course_id:1,user_id:10,user_name:'An',user_email:'an@example.test',course_title:'Khóa Git',total_lessons:4,completed_lessons:2,avg_quiz_score:0},{course_id:2,user_id:11,user_name:'Bình',user_email:'binh@example.test',course_title:'Khóa Python',total_lessons:6,completed_lessons:6,avg_quiz_score:null}],payments:[{course_id:1,status:'completed',amount:100000}],quizzes:[{course_id:1},{course_id:2}]};
await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.pathname.startsWith('/api/')) {calls.push(u.pathname);return route.fulfill({status:(fail||u.pathname===failedResource)?500:200,json:(fail||u.pathname===failedResource)?{success:false}:{success:true,data:fixtures[u.pathname.split('/')[2]]||[]}});}if(!['127.0.0.1','localhost'].includes(u.hostname))return route.abort();return route.continue();});
await page.goto('http://127.0.0.1:5174/teacher/reports?course_id=1#students');
await page.getByRole('heading',{name:'Dashboard Giảng viên'}).waitFor();
await page.getByText('100.000đ',{exact:true}).waitFor();
assert.equal(new URL(page.url()).pathname,'/teacher');assert.equal(new URL(page.url()).search,'?course_id=1');assert.equal(new URL(page.url()).hash,'#students');
assert.equal(await page.locator('a[href="/teacher/reports"]').count(),0);
assert.equal(await page.getByText('Khóa người khác',{exact:true}).count(),0);
assert.equal(await page.locator('.teacher-dashboard-metrics .stat-card').count(),6);
assert.equal(await page.locator('tbody tr').count(),1);
await page.getByLabel('Lọc Dashboard theo khóa học').selectOption('all');
await page.getByRole('heading',{name:'👨‍🎓 Lượt đăng ký (2)'}).waitFor();
await page.getByLabel('Tìm học viên theo tên hoặc email').fill('binh@');assert.equal(await page.locator('tbody tr').count(),1);await page.getByText('Bình',{exact:true}).waitFor();
await page.getByLabel('Tìm học viên theo tên hoặc email').fill('');
await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'docs/teacher-dashboard-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'docs/teacher-dashboard-mobile.png',fullPage:true});
// One failed API must preserve unrelated content and retry only that API.
failedResource='/api/payments';await page.reload();await page.getByRole('heading',{name:'👨‍🎓 Lượt đăng ký (2)'}).waitFor();
await page.locator('.teacher-dashboard-chart').filter({hasText:'Doanh thu theo tháng'}).getByRole('alert').waitFor();
assert.equal(await page.locator('tbody tr').count(),2);
const before=calls.filter(p=>p==='/api/courses').length;failedResource='';await page.locator('.teacher-dashboard-chart').filter({hasText:'Doanh thu theo tháng'}).getByRole('button',{name:'Thử lại'}).click();await page.getByText('100.000đ',{exact:true}).waitFor();assert.equal(calls.filter(p=>p==='/api/courses').length,before);
// Pagination, search reset and course reset.
fixtures.enrollments=Array.from({length:23},(_,i)=>({...fixtures.enrollments[0],user_id:100+i,user_name:`Học viên ${i}`,user_email:`user${i}@example.test`}));
await page.reload();await page.getByRole('heading',{name:'👨‍🎓 Lượt đăng ký (23)'}).waitFor();assert.equal(await page.locator('tbody tr').count(),10);
await page.getByRole('button',{name:'Trang sau',exact:true}).click();await page.getByRole('button',{name:'Trang sau',exact:true}).click();assert.equal(await page.locator('tbody tr').count(),3);
await page.getByLabel('Tìm học viên theo tên hoặc email').fill('user0@');await page.getByText('Học viên 0',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Trang trước',exact:true}).isDisabled(),true);
await page.getByLabel('Tìm học viên theo tên hoặc email').fill('');await page.getByRole('button',{name:'Trang sau',exact:true}).click();await page.getByLabel('Lọc Dashboard theo khóa học').selectOption('2');await page.getByText('Không tìm thấy học viên nào.').waitFor();assert.equal(await page.getByRole('button',{name:'Trang trước',exact:true}).isDisabled(),true);
assert.equal(await page.locator('.teacher-bar-number').count(),12);
fail=true;await page.reload();await page.getByRole('heading',{name:'Chưa tải được Dashboard.'}).waitFor();assert.equal(await page.locator('.teacher-dashboard-metrics').count(),0);
fail=false;await page.getByRole('button',{name:'Thử lại',exact:true}).click();await page.locator('.teacher-dashboard-metrics').waitFor();
assert.equal(calls.some(p=>p.includes('lessons')||p.includes('chapters')),false);assert.deepEqual(errors,[]);
console.log('PASS: redirect/query/hash, menu, ownership, metrics, filter, search, mobile, retry, no N+1, no page errors');await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});

