const {chromium}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');const checks=[];const check=(n,v)=>{assert.ok(v,n);checks.push(n)};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addInitScript(()=>{localStorage.setItem('token','ui-fixture-only-not-a-session');localStorage.setItem('user',JSON.stringify({id:90001,fullname:'Học viên mẫu',role:'student'}))});
 let mode='catalogError',cat=0,enr=0;const writes=[],errors=[];
 const courses=[1,2].map(id=>({id,title:`Khóa mẫu ${id}`,price:0,teacher_name:'Giảng viên mẫu',level:'beginner',lesson_count:12,document_count:3}));
 await context.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
 await context.route('**/api/**',r=>{const u=new URL(r.request().url());if(!u.pathname.startsWith('/api/'))return r.fallback();if(r.request().method()!=='GET'){writes.push(u.pathname);return r.fulfill({json:{success:true}})}
 if(u.pathname==='/api/courses'){cat++;if(mode==='catalogError'||mode==='bothError')return r.fulfill({status:503,json:{success:false}});return r.fulfill({json:{success:true,data:mode==='empty'?[]:courses}})}
 if(u.pathname==='/api/enrollments'){enr++;if(mode==='enrollmentError'||mode==='bothError')return r.fulfill({status:503,json:{success:false}});if(mode==='malformed')return r.fulfill({json:{success:true,data:{ids:[1]}}});if(mode==='network')return r.abort();return r.fulfill({json:{success:true,data:mode==='allEnrolled'?['1','2']:['1']}})}
 return r.fulfill({json:{success:true,data:[]}});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));const visit=()=>page.goto('http://127.0.0.1:5174/student/courses');
 await visit();await page.getByText('Chưa tải được danh sách khóa học.',{exact:true}).waitFor();
 check('Catalog failure has retry',await page.getByRole('button',{name:'Thử lại danh sách khóa học'}).count()===1);
 check('Catalog failure does not show empty search result',await page.getByRole('heading',{name:'Không tìm thấy khóa học'}).count()===0);
 check('Unknown data does not show fake enrollment totals',!(await page.locator('#statsRow').innerText()).includes('0 đã đăng ký'));
 const oldEnr=enr;mode='normal';await page.getByRole('button',{name:'Thử lại danh sách khóa học'}).click();await page.locator('#card-2').waitFor();
 check('Catalog retry preserves successful enrollment request',enr===oldEnr);
 check('Catalog introduction does not claim hundreds of courses',!(await page.locator('.explore-hero').innerText()).includes('hàng trăm'));
 check('Cards use document label instead of PDF',await page.locator('#card-2 .s-course-meta').innerText().then(t=>t.includes('3 tài liệu')&&!t.includes('PDF')));
 check('New badge is not invented from list position',await page.locator('#card-2 .enroll-badge').count()===0);
 check('Search input has accessible label',await page.getByRole('searchbox',{name:'Tìm kiếm khóa học'}).count()===1);
 check('String enrollment IDs exclude already joined course',await page.locator('#card-1').count()===0);
 check('Recovered count shows only available courses',(await page.locator('#countLabel').innerText()).includes('1 / 1'));
 mode='enrollmentError';await visit();await page.getByText('Chưa tải được trạng thái đăng ký.',{exact:true}).waitFor();
 check('Enrollment failure hides unknown enrollment cards',await page.locator('#courseGrid .s-course-card').count()===0);
 check('Enrollment failure disables sorting',await page.locator('#sortSelect').isDisabled());
 const oldCat=cat;mode='normal';await page.getByRole('button',{name:'Thử lại trạng thái đăng ký'}).click();await page.locator('#card-2').waitFor();
 check('Enrollment retry preserves catalog',cat===oldCat);
 check('Enrollment recovery hides joined courses',await page.locator('#card-1').count()===0);
 await page.locator('#heroSearch').fill('không tồn tại');await page.getByRole('heading',{name:'Không tìm thấy khóa học'}).waitFor();
 check('Search miss offers clear action',await page.getByRole('button',{name:'Xóa tìm kiếm'}).count()===1);
 await page.getByRole('button',{name:'Xóa tìm kiếm'}).click();await page.locator('#card-2').waitFor();
 check('Clear search restores courses',await page.locator('#heroSearch').inputValue()==='');
 mode='empty';await visit();await page.getByRole('heading',{name:'Chưa có khóa học để khám phá'}).waitFor();check('Valid empty catalog distinguished from request failure',await page.getByRole('alert').count()===0);
 mode='allEnrolled';await visit();await page.getByRole('heading',{name:'Bạn đã đăng ký tất cả khóa học'}).waitFor();check('Fully enrolled state preserved',await page.locator('#courseGrid .s-course-card').count()===0);
 mode='malformed';await visit();await page.getByText('Chưa tải được trạng thái đăng ký.',{exact:true}).waitFor();check('Malformed successful payload not treated as empty enrollments',await page.locator('#card-1').count()===0);
 mode='network';await visit();await page.getByText('Chưa tải được trạng thái đăng ký.',{exact:true}).waitFor();check('Network failure reports enrollment error',await page.getByRole('button',{name:'Thử lại trạng thái đăng ký'}).count()===1);
 mode='bothError';await visit();await page.getByText('Chưa tải được trạng thái đăng ký.',{exact:true}).waitFor();check('Both failed resources have separate retries',await page.locator('.explore-load-error').count()===2);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);check('Error panels fit mobile',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 check('Reading and retries never submit enrollments or payments',writes.length===0);check('No runtime errors',errors.length===0);
 fs.writeFileSync('docs/explore-loading-browser-results.json',JSON.stringify({mode:'mocked_api_no_real_credentials',passed:checks.length,checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,errors}));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
