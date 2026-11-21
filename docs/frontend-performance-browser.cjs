const {chromium}=require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('node:fs'),assert=require('node:assert/strict');const checks=[];const check=(n,v)=>{assert.ok(v,n);checks.push(n)};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});try{
 async function context(role=null){const c=await browser.newContext({viewport:{width:1440,height:1000}});if(role)await c.addInitScript(role=>{localStorage.setItem('token','ui-fixture-only-not-a-session');localStorage.setItem('user',JSON.stringify({id:90001,fullname:'User mẫu',email:'fixture@example.test',role}))},role);
 await c.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.fallback():r.abort());
 await c.route('**/api/**',r=>{const u=new URL(r.request().url());if(!u.pathname.startsWith('/api/'))return r.fallback();let data=[];
 if(u.pathname==='/api/quizzes/results')return r.fulfill({json:{success:true,result_id:91,quiz:{id:3,title:'Quiz mẫu',course_id:1,course_title:'Khóa mẫu',passing_score:70},score:1,total:1,percent:100,passed:true,answers_revealed:true,details:[{question_id:101,content:'Công thức [[math:x^2+1]]',option_a:'Một',option_b:'Hai',chosen:'A',correct_answer:'A',is_right:true}]}});
 if(u.pathname==='/api/progress'&&!u.search)data={courses:[]};if(u.pathname==='/api/recommendations')data={current:{items:[],based_on:{knowledge:{units:[]}}}};
 return r.fulfill({json:{success:true,data}})});return c}
 const c=await context();const page=await c.newPage();const assets=[];const errors=[];page.on('request',r=>{if(r.resourceType()==='script')assets.push(new URL(r.url()).pathname)});page.on('pageerror',e=>errors.push(e.message));
 let release,seen;const gate=new Promise(r=>release=r),started=new Promise(r=>seen=r);await page.route('**/assets/Help-*.js',async r=>{seen();await gate;await r.fallback()});
 await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});
 check('Home does not download KaTeX or Chart.js',!assets.some(p=>/RichText-|chart-/.test(p)));check('Home does not download role pages',!assets.some(p=>/Dashboard-|Users-|Quizzes-/.test(p)));
 check('Font stylesheet declared once',await page.locator('link[rel=stylesheet][href*="fonts.googleapis.com"]').count()===1);
 const navbar=await page.locator('#navbar').elementHandle();await page.getByRole('contentinfo').getByRole('link',{name:'Hướng dẫn sử dụng',exact:true}).click();await started;
 await page.getByRole('status').filter({hasText:'Đang tải trang'}).waitFor();check('Loading status shown during delayed route chunk',await page.getByRole('status').filter({hasText:'Đang tải trang'}).isVisible());
 check('Navbar and footer remain usable during route loading',await page.locator('#navbar').isVisible()&&await page.getByRole('contentinfo').isVisible());release();await page.getByRole('heading',{name:'Học thuận tiện hơn với StudyOnline'}).waitFor();
 check('Help route loads after chunk arrives',page.url().endsWith('/help'));check('Public shell not remounted',await navbar.evaluate(el=>el.isConnected));
 await page.getByRole('contentinfo').getByRole('link',{name:'Đăng nhập',exact:true}).click();await page.locator('input[type=password]').waitFor();check('Lazy login route works',page.url().endsWith('/login'));
 check('No runtime errors on successful public routes',errors.length===0);await c.close();
 const failed=await context();const failedPage=await failed.newPage();let fail=true;await failedPage.route('**/assets/Help-*.js',r=>fail?r.abort():r.fallback());await failedPage.goto('http://127.0.0.1:5174/help');await failedPage.getByRole('alert').filter({hasText:'Chưa tải được trang.'}).waitFor();
 check('Chunk network failure has useful recovery UI',await failedPage.getByRole('button',{name:'Tải lại trang',exact:true}).count()===1);check('Chunk failure retains public navigation',await failedPage.locator('#navbar').isVisible());
 fail=false;await failedPage.getByRole('button',{name:'Tải lại trang',exact:true}).click();await failedPage.getByRole('heading',{name:'Học thuận tiện hơn với StudyOnline'}).waitFor();check('Reload recovers failed chunk',await failedPage.locator('.public-help').isVisible());await failed.close();
 const guest=await context();const gp=await guest.newPage();const requested=[];gp.on('request',r=>requested.push(r.url()));await gp.goto('http://127.0.0.1:5174/admin/users');await gp.waitForURL('**/login');await gp.locator('input[type=password]').waitFor();check('Guest guard still redirects to login',gp.url().endsWith('/login'));check('Guest does not download admin Users chunk',!requested.some(p=>/\/Users-/.test(p)));await guest.close();
 for(const [role,path,selector] of [['student','/student/dashboard','.dash-focus'],['teacher','/teacher/profile','.main-content input[type=password]'],['admin','/admin/users','#admin-user-email']]){
  const rc=await context(role);const rp=await rc.newPage();const runtime=[];rp.on('pageerror',e=>runtime.push(e.message));await rp.goto('http://127.0.0.1:5174'+path);
  if(role==='admin')await rp.getByText('Quản lý Thành viên',{exact:false}).first().waitFor();else await rp.locator(selector).first().waitFor();
  check(role+' direct route opens',new URL(rp.url()).pathname===path);check(role+' route has no runtime errors',runtime.length===0);await rc.close();
 }
 const student=await context('student');const sp=await student.newPage();const scripts=[];sp.on('request',r=>{if(r.resourceType()==='script')scripts.push(r.url())});await sp.goto('http://127.0.0.1:5174/student/quiz-result?result_id=91');await sp.locator('.katex').waitFor();
 check('KaTeX loads only on a math-using route',scripts.some(s=>/RichText-/.test(s)));check('Math rendered with KaTeX styles',await sp.locator('.katex').evaluate(e=>getComputedStyle(e).fontFamily.includes('KaTeX')));
 check('Quiz result still hides suggestions',await sp.locator('.study-recommendation-summary,.knowledge-assessment').count()===0);await student.close();
 fs.writeFileSync('docs/frontend-performance-browser-results.json',JSON.stringify({mode:'production_build_mocked_api_no_real_credentials',passed:checks.length,checks},null,2));console.log(JSON.stringify({passed:checks.length}));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
