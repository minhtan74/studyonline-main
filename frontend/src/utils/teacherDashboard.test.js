import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTeacherDashboard, teacherEnrollmentProgress } from './teacherDashboard.js';

const data = {
  courses: [{id:1,teacher_id:'7',lesson_count:4},{id:'2',teacher_id:7,lesson_count:6},{id:3,teacher_id:8,lesson_count:9}],
  enrollments: [{course_id:'1',user_id:10,total_lessons:4,completed_lessons:2},{course_id:2,user_id:'10',total_lessons:6,completed_lessons:6},{course_id:3,user_id:11,total_lessons:9,completed_lessons:9}],
  payments: [{course_id:1,status:'completed',amount:'100000'},{course_id:2,status:'pending',amount:200000},{course_id:3,status:'completed',amount:300000}],
  quizzes: [{course_id:'1'},{course_id:2},{course_id:3}],
};
test('teacher totals include owned courses, unique learners and successful payments', () => {
  const result = buildTeacherDashboard(data,{id:7,role:'teacher'});
  assert.equal(result.summary.courses,2);
  assert.equal(result.summary.students,1);
  assert.equal(result.summary.enrollments,2);
  assert.equal(result.summary.lessons,10);
  assert.equal(result.summary.quizzes,2);
  assert.equal(result.summary.avgProgress,75);
  assert.equal(result.summary.revenue,100000);
});
test('course filter scopes all datasets and rejects unowned courses', () => {
  const result = buildTeacherDashboard(data,{id:7,role:'teacher'},'2');
  assert.equal(result.summary.lessons,6);
  assert.equal(result.summary.avgProgress,100);
  assert.equal(result.summary.revenue,0);
  assert.equal(result.summary.quizzes,1);
  assert.equal(result.topCourses.length,1);
  assert.equal(buildTeacherDashboard(data,{id:7,role:'teacher'},'3').missingCourse,true);
});
test('admin can aggregate all courses', () => {
  assert.equal(buildTeacherDashboard(data,{id:99,role:'admin'}).summary.courses,3);
});
test('unknown and invalid progress do not become zero', () => {
  for (const row of [{},{total_lessons:0,completed_lessons:0},{total_lessons:2,completed_lessons:3},{total_lessons:2,completed_lessons:null}]) assert.equal(teacherEnrollmentProgress(row),null);
  assert.equal(teacherEnrollmentProgress({total_lessons:4,completed_lessons:0}),0);
  assert.equal(buildTeacherDashboard({}, {id:7,role:'teacher'}).summary.avgProgress,null);
});
