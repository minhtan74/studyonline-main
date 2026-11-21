const positiveId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
const count = value => value != null && Number.isInteger(Number(value)) && Number(value) >= 0 ? Number(value) : null;

export function teacherEnrollmentProgress(row) {
  const total = count(row.total_lessons), done = count(row.completed_lessons);
  return total && done != null && done <= total ? Math.round(done / total * 100) : null;
}

export function buildTeacherDashboard({ courses = [], enrollments = [], payments = [], quizzes = [] }, user, courseFilter = 'all') {
  const ownCourses = courses.filter(course => user?.role === 'admin' || positiveId(course.teacher_id) === positiveId(user?.id));
  const ownIds = new Set(ownCourses.map(course => positiveId(course.id)).filter(Boolean));
  const selectedCourses = ownCourses.filter(course => courseFilter === 'all' || positiveId(course.id) === positiveId(courseFilter));
  const selectedIds = new Set(selectedCourses.map(course => positiveId(course.id)).filter(Boolean));
  const rows = enrollments.filter(row => selectedIds.has(positiveId(row.course_id)));
  const paid = payments.filter(row => selectedIds.has(positiveId(row.course_id)) && row.status === 'completed');
  const selectedQuizzes = quizzes.filter(row => selectedIds.has(positiveId(row.course_id)));
  const percentages = rows.map(teacherEnrollmentProgress);
  const lessonCounts = selectedCourses.map(course => count(course.lesson_count));
  return {
    ownCourses, selectedCourses, enrollments: rows, paidPayments: paid,
    missingCourse: courseFilter !== 'all' && !ownIds.has(positiveId(courseFilter)),
    topCourses: selectedCourses.map(course => ({ course, count: rows.filter(row => positiveId(row.course_id) === positiveId(course.id)).length })).sort((a,b) => b.count - a.count).slice(0,3),
    summary: {
      courses: selectedCourses.length,
      students: new Set(rows.map(row => positiveId(row.user_id)).filter(Boolean)).size,
      enrollments: rows.length,
      lessons: lessonCounts.some(value => value == null) ? null : lessonCounts.reduce((sum,value) => sum + value,0),
      quizzes: selectedQuizzes.length,
      avgProgress: !rows.length || percentages.some(value => value == null) ? null : Math.round(percentages.reduce((sum,value) => sum + value,0) / rows.length),
      completedLessons: rows.some(row => count(row.completed_lessons) == null) ? null : rows.reduce((sum,row) => sum + Number(row.completed_lessons),0),
      revenue: paid.reduce((sum,row) => sum + (Number(row.amount) || 0),0),
      published: selectedCourses.filter(course => course.status === 'published').length,
      draft: selectedCourses.filter(course => course.status === 'draft').length,
    },
  };
}
