const { chromium } = require('F:/DATN/.cache/npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const backend = path.join(root, 'backend');
const auth = {token:'ui-fixture-only-not-a-session',user:{id:90001,fullname:'Học viên xem thử',email:'preview@example.invalid',role:'student'}};
const manifest = JSON.parse(fs.readFileSync(path.join(backend, 'training/course_release_20261031/generated/manifest.json'), 'utf8'));
const checks = [];
function check(name, value) { assert.ok(value, name); checks.push(name); }
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:'C:/Users/DMIN/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'});
 try {
  const context = await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(auth => { localStorage.setItem('token', auth.token); localStorage.setItem('user', JSON.stringify(auth.user)); }, auth);
  const requests=[];
  const fixtureCourses = manifest.new_courses.map((c,i)=>({...c,id:manifest.added_courses?.[i]?.id || 9001+i}));
  await context.route('**/*', route=>{const url=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(url.hostname)||url.protocol==='file:' ? route.fallback() : route.abort();});
  await context.route('**/api/**', async route => {
   const url = new URL(route.request().url());
   if (!url.pathname.startsWith('/api/')) return route.fallback();
   requests.push(url.pathname+url.search);
   const cid = Number(url.searchParams.get('course_id') || url.searchParams.get('id'));
   const course = fixtureCourses.find(c=>c.id===cid);
   const sourceMatch = url.pathname.match(/documents\/(\d+)\/(source|content)$/);
   if (sourceMatch) {
    const doc = manifest.documents.find((d,i)=>(d.document_id || 99000+i)===Number(sourceMatch[1]));
    assert.ok(doc,'Fixture document exists');
    if (sourceMatch[2]==='content') return route.fulfill({contentType:'application/pdf',body:fs.readFileSync(doc.pdf)});
    return route.fulfill({json:{success:true,data:{id:Number(sourceMatch[1]),title:doc.title,filename:doc.title+'.pdf',file_type:'pdf',pages:doc.pages,course_id:doc.course_id || 9001,lesson_id:null}}});
   }
   let data=[];
   if(url.pathname==='/api/courses') data=course || fixtureCourses;
   else if(url.pathname==='/api/chapters') data=course.chapters.map((ch,i)=>({id:course.id*100+i+1,chapter_name:`Chương ${i+1}: ${ch.title}`,review_question_count:10,review_quiz_id:88000+i}));
   else if(url.pathname==='/api/lessons') {
    const chapterId=Number(url.searchParams.get('chapter_id'));
    const selected=fixtureCourses.find(c=>Math.floor(chapterId/100)===c.id);
    const chapter=selected.chapters[chapterId%100-1];
    data=chapter.lessons.map((l,i)=>({id:chapterId*10+i+1,title:`Bài ${i+1}: ${l.title}`,description:l.objectives.join(' · '),document_url:'/fixture.pdf',locked:false,review_question_count:5}));
   } else if(url.pathname==='/api/courses/materials') {
    const doc=manifest.documents.find(d=>d.course_key===course.slug&&!d.chapter_no);
    const index=manifest.documents.indexOf(doc);
    data=[{id:doc.document_id || 99000+index,title:doc.title,file_type:'pdf',pages:doc.pages}];
   }
   return route.fulfill({json:{success:true,data}});
  });
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  const targets = fixtureCourses;
  for (const course of targets) {
   await page.goto(`http://127.0.0.1:5174/chapters?course_id=${course.id}`,{waitUntil:'domcontentloaded'});
   const materials = page.getByRole('region', {name:'Tài liệu toàn khóa'});
   await materials.locator('a').first().waitFor({timeout:10000}).catch(async error=>{
    console.error(JSON.stringify({url:page.url(),body:(await page.locator('body').innerText()).slice(0,2800),errors,requests})); throw error;
   });
   check('Course '+course.id+' resource links visible', await materials.locator('a').count() > 0);
   if (fixtureCourses.length) {
    check('Course '+course.id+' has six chapters', await page.locator('.chapter-item').count() === 6);
    check('Course '+course.id+' first chapter has two lessons', await page.locator('.chapter-item.open a[href^="/lesson?id="]').count() === 2);
    check('Course '+course.id+' handbook visible', (await materials.innerText()).includes('Sổ tay'));
   }
   if (course === targets[0]) await page.screenshot({path:path.join(__dirname,'course-release-desktop.png'),fullPage:true});
   await materials.locator('a').first().click();
   await page.locator('iframe[title]').waitFor();
   check('Course '+course.id+' resource PDF viewer opens', (await page.locator('iframe').getAttribute('src')).startsWith('blob:'));
   await page.goBack(); await materials.locator('a').first().waitFor();
   await page.setViewportSize({width:390,height:844});
   await page.waitForFunction(()=>document.documentElement.scrollWidth <= innerWidth + 1,null,{timeout:4000}).catch(()=>{});
   if (course === targets[0]) await page.screenshot({path:path.join(__dirname,'course-release-mobile.png'),fullPage:true});
   const overflow = await page.evaluate(()=>[...document.querySelectorAll('main *')].filter(n=>n.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(n=>({tag:n.tagName,cls:n.className,width:n.getBoundingClientRect().width,text:n.innerText?.slice(0,90)})));
   if(overflow.length) console.log(JSON.stringify({overflow}));
   check('Course '+course.id+' mobile has no overflow', await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 1));
   if (course === targets[0]) await page.screenshot({path:path.join(__dirname,'course-release-mobile.png'),fullPage:true});
   await page.setViewportSize({width:1440,height:1000});
  }
  const preview = await browser.newPage({viewport:{width:794,height:1123}});
  const html = path.join(backend,'training/course_release_20261031/generated/python-huong-doi-tuong-thuc-hanh_c1_l1.html');
  await preview.goto('file:///' + html.replaceAll('\\','/'));
  check('Lesson print HTML contains Vietnamese title', (await preview.locator('h1').innerText()).includes('Bài 1'));
  check('Lesson print HTML keeps code blocks', await preview.locator('pre code').count() > 0);
  await preview.screenshot({path:path.join(__dirname,'course-release-lesson-preview.png'),fullPage:true});
  check('No frontend runtime errors', errors.length === 0);
  fs.writeFileSync(path.join(__dirname,'course-release-20261031-browser-results.json'),JSON.stringify({mode:'mocked_student_ui_no_real_credentials',applied:manifest.applied,passed:checks.length,checks,errors},null,2));
  console.log(JSON.stringify({passed:checks.length,applied:manifest.applied,errors}));
 } finally { await browser.close(); }
})().catch(error=>{ console.error(error); process.exit(1); });
