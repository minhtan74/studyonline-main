import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStudyRecommendations as build, filterStudyRecommendations as filter, groupStudyRecommendations as group, STUDY_PRIORITIES, STUDY_PRIORITY_LABELS, studyCountLabel, studyCourseOptions } from './studyRecommendations.js';
const unit = (id, extra = {}) => ({ kind:'lesson', id, course_id:1, course_title:'Lập trình', chapter_id:10, chapter_name:'Điều kiện', title:`Bài ${id}`, available:true, answered:5, correct:2, avg_score:40, sufficient_data:true, needs_review:true, latest_result_id:10, ...extra });
const current = units => ({ items:[], based_on:{ knowledge:{ units } } });
test('uses full units rather than the truncated top-three items', () => {
  assert.equal(build(current([1,2,3,4,5].map(id => unit(id)))).rows.length,5);
});

test('mixed summary separates established review from small-sample checks', () => {
  const data=build(current([unit(1),unit(2,{answered:2,correct:0,sufficient_data:false,needs_review:false})]));
  assert.equal(studyCountLabel(data.rows),'1 bài nên ôn · 1 bài chưa đủ dữ liệu');
  assert.equal(STUDY_PRIORITY_LABELS.review,'Nên ôn tập');
  assert.equal(STUDY_PRIORITY_LABELS.check,'Chưa đủ dữ liệu');
});
test('duplicate lesson keeps latest evidence without adding attempts', () => {
  const data = build(current([unit(1),unit(1,{latest_result_id:11,correct:3,avg_score:60})]));
  assert.equal(data.rows.length,1); assert.equal(data.rows[0].evidence.answered,5); assert.equal(data.rows[0].evidence.correct,3);
});
test('latest successful or unavailable evidence does not resurrect old review', () => {
  assert.equal(build(current([unit(1),unit(1,{latest_result_id:11,needs_review:false,correct:5})])).rows.length,0);
  assert.equal(build(current([unit(1),unit(1,{latest_result_id:11,available:false})])).rows.length,0);
});
test('insufficient evidence stays distinct and below review priority', () => {
  const data = build(current([unit(1,{answered:2,correct:0,sufficient_data:false,needs_review:false}),unit(2)]));
  assert.deepEqual(data.rows.map(row => row.priority),['review','check']);
  assert.equal(data.rows[1].evidence.sufficient_data,false);
  assert.equal(filter(data,'check','').rows.length,1);
  assert.deepEqual(STUDY_PRIORITIES.map(item=>item.key),['all','review','check']);
});
test('chapter notes are not counted as lessons or duplicated over lesson rows', () => {
  const chapter = unit(10,{kind:'chapter'});
  assert.equal(build(current([chapter])).rows.length,0);
  assert.equal(build(current([chapter])).chapterNotes.length,1);
  assert.equal(build(current([chapter,unit(1)])).chapterNotes.length,0);
});
test('Vietnamese search and priorities produce consistent groups', () => {
  const data = build(current([unit(1),unit(2,{course_id:2,course_title:'Cơ sở dữ liệu',chapter_id:20,chapter_name:'Bảng'})]));
  const found = filter(data,'review','dieu kien'); assert.equal(found.rows.length,1); assert.equal(group(found).length,1);
  assert.equal(filter(data,'all','co so du lieu').rows[0].courseId,2);
});
test('progress comes only from real matching data; lesson link is exact', () => {
  const data = build(current([unit(55)])); assert.equal(group(data)[0].progress,undefined);
  assert.equal(group(data,[{course_id:1,total_lessons:8,done_lessons:3}])[0].progress.percent,38);
  assert.equal(data.rows[0].url,'/lesson?id=55');
});
test('empty Quiz data stays empty', () => { const data = build(null); assert.equal(data.rows.length,0); assert.equal(data.hasQuizEvidence,false); });
test('same category sorts lower score first and more evidence next', () => {
  const data=build(current([unit(1,{avg_score:60,answered:10}),unit(2,{avg_score:40,answered:5}),unit(3,{avg_score:40,answered:10})]));
  assert.deepEqual(data.rows.map(row=>row.lessonId),[3,2,1]);
});
test('a single wrong answer is a check, not an established review recommendation', () => {
  const data=build(current([unit(1,{answered:1,correct:0,avg_score:0,sufficient_data:false,needs_review:false})]));
  assert.equal(data.rows[0].priority,'check');assert.equal(data.rows[0].practiceUrl,'/quiz');
});
test('practice action uses an exact existing Quiz URL only when provided',()=>{
  const data=current([unit(1,{answered:1,correct:0,avg_score:0,sufficient_data:false,needs_review:false})]);
  data.items=[{knowledge_evidence:{kind:'lesson',id:1,course_id:1},practice_url:'/quiz-show?id=44'}];
  assert.equal(build(data).rows[0].practiceUrl,'/quiz-show?id=44');
  data.items[0].practice_url='https://untrusted.example';
  assert.equal(build(data).rows[0].practiceUrl,'/quiz');
});

test('course filter combines with priority and Vietnamese search by course ID',()=>{
  const data=build(current([unit(1),unit(2,{course_id:2}),unit(3,{course_id:2,answered:2,correct:0,sufficient_data:false,needs_review:false})]));
  assert.deepEqual(filter(data,'all','',2).rows.map(row=>row.lessonId),[2,3]);
  assert.deepEqual(filter(data,'check','bai 3','2').rows.map(row=>row.lessonId),[3]);
  assert.equal(filter(data,'review','bai 3','2').rows.length,0);
  assert.equal(filter(data,'all','',999).rows.length,0);
  assert.equal(filter(data,'all','','all').rows.length,3);
});

test('course filtering includes chapter-only suggestions and updates grouping',()=>{
  const data=build(current([unit(1),unit(20,{kind:'chapter',course_id:2,chapter_id:20})]));
  const selected=filter(data,'all','','2');
  assert.equal(selected.rows.length,0);assert.equal(selected.chapterNotes.length,1);
  assert.deepEqual(group(selected).map(course=>course.id),[2]);
});

test('course options stay available even with no current suggestions or no Quiz',()=>{
  const data=build(current([unit(1),unit(2,{course_id:2,course_title:'Đã đạt',needs_review:false,correct:5})]));
  const options=studyCourseOptions(data,[{course_id:1,course_title:'Tên từ ghi danh'},{course_id:3,course_title:'Chưa làm Quiz'}]);
  assert.equal(options.length,3);
  assert.equal(options.find(c=>c.id===1).title,'Tên từ ghi danh');
  assert.equal(filter(data,'all','','2').rows.length,0);
  assert.equal(filter(data,'all','','3').rows.length,0);
  assert.equal(studyCourseOptions(filter(data,'review','không khớp'),[{course_id:3,course_title:'Chưa làm Quiz'}]).length,3);
});
