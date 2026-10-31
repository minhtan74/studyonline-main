const {chromium}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');const assert=require('node:assert/strict'),fs=require('node:fs');const checks=[];const check=(n,v)=>{assert.ok(v,n);checks.push(n)};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addInitScript(()=>{localStorage.setItem('token','ui-fixture-only-not-a-session');localStorage.setItem('user',JSON.stringify({id:90001,fullname:'Học viên mẫu',role:'student'}))});
 let mode='progressError',cat=0,enr=0,prog=0;const writes=[],errors=[];
 await context.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
 await context.route('**/api/**',r=>{const u=new URL(r.request().url());if(!u.pathname.startsWith('/api/'))return r.fallback();if(r.request().method()!=='GET')writes.push(u.pathname);
 if(u.pathname==='/api/courses'){cat++;return r.fulfill(mode==='catalogError'?{status:503,json:{success:false}}:{json:{success:true,data:[{id:1,title:'Khóa mẫu 1'},{id:2,title:'Khóa chưa đăng ký'}]}})}
 if(u.pathname==='/api/enrollments'){enr++;if(mode==='network')return r.abort();return r.fulfill(mode==='enrollmentError'?{status:503,json:{success:false}}:{json:{success:true,data:mode==='empty'?[]:mode==='malformed'?{}:['1']}})}
 if(u.pathname==='/api/progress'){prog++;return r.fulfill(mode==='progressError'?{status:503,json:{success:false}}:{json:{success:true,data:{courses:mode==='missing'?[]:[{course_id:1,total_lessons:mode==='zero'?0:10,done_lessons:mode==='invalid'?15:mode==='zero'?0:6}]}}})}
 return r.fulfill({json:{success:true,data:[]}});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));const visit=()=>page.goto('http://127.0.0.1:5174/student/my-courses');const cards=()=>page.locator('#courseGrid .s-course-card');
 await visit();await page.getByText('Chưa tải được tiến độ học tập.',{exact:true}).waitFor();
 check('Progress failure keeps enrolled course visible',await cards().count()===1);
 check('Progress failure never invents 0 percent or not-started',await cards().innerText().then(t=>!t.includes('0%')&&!t.includes('Chưa bắt đầu')&&!t.includes('0/0')));
 check('Unknown progress hides progressbar',await cards().getByRole('progressbar').count()===0);
 check('Course remains accessible',await cards().getByRole('link',{name:'Vào khóa học'}).getAttribute('href')==='/chapters?course_id=1');
 const before=[cat,enr];mode='normal';await page.getByRole('button',{name:'Thử lại tiến độ học tập'}).click();await cards().getByText('60% hoàn thành',{exact:true}).waitFor();
 check('Progress retry does not refetch catalog or enrollment',cat===before[0]&&enr===before[1]);
 check('Progress restored to real values',(await cards().innerText()).includes('6/10'));
 check('String enrollment IDs supported and unenrolled courses excluded',await cards().count()===1&&!(await cards().innerText()).includes('chưa đăng ký'));
 await page.getByRole('button',{name:'Hoàn thành',exact:true}).click();await page.getByText('Không có khóa học phù hợp bộ lọc',{exact:true}).waitFor();
 check('Filter miss offers reset',await page.getByRole('button',{name:'Xóa bộ lọc'}).count()===1);await page.getByRole('button',{name:'Xóa bộ lọc'}).click();await cards().first().waitFor();
 mode='enrollmentError';await visit();await page.getByText('Chưa tải được trạng thái đăng ký.',{exact:true}).waitFor();
 check('Enrollment error shows warning without false empty state',await cards().count()===0&&await page.getByText('Bạn chưa đăng ký khóa học nào',{exact:true}).count()===0);
 const beforeCatalog=cat;mode='normal';await page.getByRole('button',{name:'Thử lại trạng thái đăng ký'}).click();await cards().first().waitFor();check('Enrollment retry restores only failed resource',cat===beforeCatalog);
 mode='catalogError';await visit();await page.getByText('Chưa tải được danh sách khóa học.',{exact:true}).waitFor();check('Catalog error offers retry',await page.getByRole('button',{name:'Thử lại danh sách khóa học'}).count()===1);
 mode='empty';await visit();await page.getByText('Bạn chưa đăng ký khóa học nào',{exact:true}).waitFor();check('Real empty enrollment links to discovery',await page.getByRole('link',{name:'Khám phá khóa học',exact:true}).getAttribute('href')==='/student/courses');
 for(const scenario of ['missing','invalid','zero']){mode=scenario;await visit();await cards().first().waitFor();const t=await cards().innerText();check(scenario+': no invented percentage',!t.includes('% hoàn thành'));check(scenario+': accurate unknown or empty state',t.includes(scenario==='zero'?'Chưa có bài học':'Chưa xác định tiến độ'))}
 mode='malformed';await visit();await page.getByText('Chưa tải được trạng thái đăng ký.',{exact:true}).waitFor();check('Malformed payload reported as error',await cards().count()===0);
 mode='network';await visit();await page.getByText('Chưa tải được trạng thái đăng ký.',{exact:true}).waitFor();check('Network failure reported',await page.getByRole('alert').count()>0);
 mode='normal';await visit();await cards().first().waitFor();await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);check('Mobile has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'docs/my-courses-fixed-mobile.png',fullPage:true});
 check('No learning data written',writes.length===0);check('No runtime errors',errors.length===0);
 fs.writeFileSync('docs/my-courses-fix-browser-results.json',JSON.stringify({mode:'mocked_api_no_real_credentials',passed:checks.length,checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,errors}));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
