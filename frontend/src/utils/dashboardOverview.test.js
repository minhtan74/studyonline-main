import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardOverview as build } from './dashboardOverview.js';

const catalog = [1,2,3,4,5].map(id=>({id,title:`Khóa ${id}`,status:id===5?'draft':'published'}));
const progress = [
  {course_id:1,total_lessons:10,done_lessons:4}, {course_id:2,total_lessons:10,done_lessons:10},
  {course_id:3,total_lessons:8,done_lessons:0}, {course_id:4,total_lessons:12,done_lessons:12},
];

test('normalizes enrolled IDs and excludes trial-course progress from metrics',()=>{
  const data=build(catalog,['1',2,3,2],progress);
  assert.deepEqual(data.metrics,{enrolled:3,inProgress:1,completed:1,doneLessons:14,totalLessons:28});
  assert.deepEqual(data.enrolled.map(c=>c.id),[1,3,2]);
  assert.deepEqual(data.continueCourses.map(c=>c.id),[1,3]);
  assert.deepEqual(data.suggested.map(c=>c.id),[4]);
});
test('missing progress remains unknown and does not invent zero completion',()=>{
  const data=build(catalog,[1,2],null);
  assert.equal(data.metrics.enrolled,2);assert.equal(data.metrics.inProgress,null);
  assert.equal(data.metrics.doneLessons,null);
  assert.ok(data.continueCourses.every(c=>c.progress===null&&c.status==='unknown'));
});
test('missing catalogue or enrollment is not treated as an empty learner',()=>{
  assert.equal(build(null,[1],progress).enrolled,null);
  assert.equal(build(catalog,null,progress).enrolled,null);
  assert.equal(build(catalog,null,progress).suggested,null);
  assert.equal(build(catalog,null,progress).metrics.enrolled,null);
});
test('an enrolled course missing progress prevents an inaccurate aggregate',()=>{
  const data=build(catalog,[1,3],progress.filter(p=>p.course_id===1));
  assert.equal(data.metrics.completed,null);assert.equal(data.metrics.doneLessons,null);
  assert.equal(data.enrolled.find(c=>c.id===1).progress.percent,40);
  assert.equal(data.enrolled.find(c=>c.id===3).progress,null);
});
test('invalid progress values never become false completed courses',()=>{
  const data=build(catalog,[1],[{course_id:1,total_lessons:10,done_lessons:11}]);
  assert.equal(data.metrics.completed,null);assert.equal(data.enrolled[0].status,'unknown');
});
test('empty learner and fully completed learner have distinct valid metrics',()=>{
  assert.deepEqual(build(catalog,[],[]).metrics,{enrolled:0,inProgress:0,completed:0,doneLessons:0,totalLessons:0});
  const done=build(catalog,[2],progress);
  assert.equal(done.metrics.completed,1);assert.equal(done.continueCourses.length,0);
});
test('ongoing courses are prioritized by progress before unstarted courses',()=>{
  const data=build(catalog,[1,2,3],[{course_id:1,total_lessons:10,done_lessons:2},{course_id:2,total_lessons:10,done_lessons:8},{course_id:3,total_lessons:8,done_lessons:0}]);
  assert.deepEqual(data.continueCourses.map(c=>c.id),[2,1,3]);
});
test('zero-lesson course does not count as completed or offer a learning continuation',()=>{
  const data=build(catalog,[1],[{course_id:1,total_lessons:0,done_lessons:0}]);
  assert.equal(data.metrics.completed,0);assert.equal(data.enrolled[0].status,'empty');
  assert.equal(data.continueCourses.length,0);
});
