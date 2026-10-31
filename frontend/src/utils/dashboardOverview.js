const STATUS_ORDER = { inprogress: 0, notstarted: 1, unknown: 2, done: 3, empty: 4 };
const courseId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;

function progressOf(row) {
  if (!row || row.total_lessons == null || row.done_lessons == null) return null;
  const total = Number(row.total_lessons), done = Number(row.done_lessons);
  if (!Number.isInteger(total) || !Number.isInteger(done) || total < 0 || done < 0 || done > total) return null;
  return { total, done, percent: total ? Math.round(done / total * 100) : 0,
    status: !total ? 'empty' : done === total ? 'done' : done ? 'inprogress' : 'notstarted' };
}

export function buildDashboardOverview(catalog, enrolledIds, courseProgress) {
  const ids = enrolledIds ? new Set(enrolledIds.map(courseId).filter(Boolean)) : null;
  const progress = new Map((courseProgress || []).map(row => [courseId(row.course_id), row]));
  const enrolled = catalog && ids ? catalog.filter(c => ids.has(courseId(c.id))).map(c => {
    const current = progressOf(progress.get(courseId(c.id)));
    return { ...c, id: courseId(c.id), progress: current, status: current?.status || 'unknown' };
  }).sort((a,b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
    (b.progress?.percent || 0) - (a.progress?.percent || 0) || a.id - b.id) : null;
  const known = enrolled !== null && enrolled.length === ids.size &&
    (enrolled.length === 0 || enrolled.every(c => c.progress));
  return {
    enrolled,
    continueCourses: enrolled?.filter(c => !['done','empty'].includes(c.status)) || [],
    suggested: catalog && ids ? catalog.filter(c => !ids.has(courseId(c.id)) && c.status === 'published') : null,
    metrics: {
      enrolled: ids?.size ?? null,
      inProgress: known ? enrolled.filter(c => c.status === 'inprogress').length : null,
      completed: known ? enrolled.filter(c => c.status === 'done').length : null,
      doneLessons: known ? enrolled.reduce((sum,c) => sum + c.progress.done,0) : null,
      totalLessons: known ? enrolled.reduce((sum,c) => sum + c.progress.total,0) : null,
    },
  };
}
