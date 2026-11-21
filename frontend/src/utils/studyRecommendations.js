// View adapter only: consume the backend's deduplicated latest knowledge units.
export const STUDY_PRIORITIES = [
  { key: 'all', label: 'Tất cả' }, { key: 'review', label: 'Nên ôn tập' },
];
export const STUDY_PRIORITY_LABELS = { review: 'Nên ôn tập', check: 'Chưa đủ dữ liệu' };
export const priorityRank = key => ({ review: 0, check: 1 }[key] ?? 2);
const studyPriority = unit => unit.sufficient_data === false ? 'check' : 'review';

export function studyCounts(rows) {
  return { review: rows.filter(row => row.priority === 'review').length, check: rows.filter(row => row.priority === 'check').length };
}

export function studyCountLabel(rows) {
  return `${studyCounts(rows).review} bài nên ôn`;
}

export function studyPracticeAction(row) {
  const specific = row.practiceUrl && row.practiceUrl !== '/quiz';
  return { url: specific ? row.practiceUrl : '/quiz', label: specific ? 'Luyện Quiz' : 'Chọn Quiz',
    ariaLabel: `${specific ? 'Luyện Quiz' : 'Chọn Quiz để luyện'}: ${row.title}` };
}
const positiveId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
// Chỉ hiển thị bài ĐỦ dữ liệu và cần ôn; đã bỏ hẳn nhóm "chưa đủ dữ liệu"
const attention = unit => unit.available !== false && Number(unit.answered) > 0 && unit.needs_review === true;
export const normalizeStudySearch = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();

export function orderStudyRows(rows) {
  return [...rows].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) ||
    Number(a.evidence.avg_score) - Number(b.evidence.avg_score) ||
    Number(b.evidence.answered) - Number(a.evidence.answered) ||
    Number(b.evidence.latest_result_id || 0) - Number(a.evidence.latest_result_id || 0) || a.key.localeCompare(b.key));
}

export function buildStudyRecommendations(current) {
  const raw = current?.based_on?.knowledge?.units || [];
  const latest = new Map();
  for (const unit of raw) {
    if (!['lesson', 'chapter'].includes(unit.kind) || !positiveId(unit.id) || !positiveId(unit.course_id)) continue;
    const key = `${unit.course_id}:${unit.kind}:${unit.id}`;
    const previous = latest.get(key);
    if (!previous || Number(unit.latest_result_id || 0) >= Number(previous.latest_result_id || 0)) latest.set(key, unit);
  }
  const units = [...latest.values()];
  const rows = orderStudyRows(units.filter(u => u.kind === 'lesson' && attention(u)).map(unit => {
    const practice = (current?.items || []).find(item => item.knowledge_evidence?.kind === 'lesson' &&
      Number(item.knowledge_evidence.id) === Number(unit.id) && Number(item.knowledge_evidence.course_id) === Number(unit.course_id));
    const validPractice = /^\/quiz-show\?id=[1-9]\d*$/.test(practice?.practice_url || '') ? practice.practice_url : '/quiz';
    return { key: `${unit.course_id}:lesson:${unit.id}`, courseId: positiveId(unit.course_id), lessonId: positiveId(unit.id),
      title: unit.title, courseTitle: unit.course_title, chapterTitle: unit.chapter_name, evidence: unit,
      // Display categories mirror Review/Insufficient; no new score thresholds.
      priority: studyPriority(unit), url: `/lesson?id=${positiveId(unit.id)}`, practiceUrl: validPractice };
  }));
  const chapterNotes = units.filter(u => u.kind === 'chapter' && attention(u) &&
    !rows.some(row => row.courseId === Number(u.course_id) && Number(row.evidence.chapter_id) === Number(u.id)))
    .map(unit => ({ key: `${unit.course_id}:chapter:${unit.id}`, courseId: positiveId(unit.course_id), courseTitle: unit.course_title,
      title: unit.title, evidence: unit, priority: studyPriority(unit), url: `/chapters?course_id=${unit.course_id}&chapter_id=${unit.id}` }));
  const courses = [...new Map(units.map(u => [Number(u.course_id), { id: Number(u.course_id), title: u.course_title }])).values()];
  return { rows, chapterNotes, courses, hasQuizEvidence: units.some(u => Number(u.answered) > 0) || Number(current?.based_on?.quiz_attempts) > 0,
    unmapped: Number(current?.based_on?.knowledge?.unmapped_answers || current?.based_on?.unclassified_answers || 0),
    minimumQuestions: current?.based_on?.min_topic_questions ?? 5,
    reviewThreshold: current?.based_on?.topic_review_threshold ?? 70 };
}

export function studyCourseOptions(data, progress = []) {
  const options = new Map();
  for (const course of progress) {
    const id = positiveId(course.course_id);
    if (id) options.set(id, { id, title: course.course_title || course.title || 'Khóa học' });
  }
  for (const course of data?.courses || []) {
    if (!options.has(course.id)) options.set(course.id, { ...course, title: course.title || 'Khóa học' });
  }
  return [...options.values()].sort((a, b) => a.title.localeCompare(b.title, 'vi') || a.id - b.id);
}

export function filterStudyRecommendations(data, priority, search, courseId = 'all') {
  const query = normalizeStudySearch(search);
  const matchesCourse = row => courseId === 'all' || row.courseId === Number(courseId);
  const rows = data.rows.filter(row => matchesCourse(row) && (priority === 'all' || row.priority === priority) &&
    (!query || normalizeStudySearch(`${row.title} ${row.chapterTitle} ${row.courseTitle}`).includes(query)));
  const chapterNotes = data.chapterNotes.filter(note => matchesCourse(note) && (priority === 'all' || note.priority === priority) &&
    (!query || normalizeStudySearch(`${note.title} ${note.courseTitle}`).includes(query)));
  return { ...data, rows, chapterNotes };
}

export function groupStudyRecommendations(data, progress = []) {
  const groups = new Map();
  for (const item of [...data.rows, ...data.chapterNotes]) {
    if (!groups.has(item.courseId)) groups.set(item.courseId, { id: item.courseId, title: item.courseTitle, rows: [], notes: [] });
    groups.get(item.courseId)[item.lessonId ? 'rows' : 'notes'].push(item);
  }
  for (const group of groups.values()) {
    group.rows = orderStudyRows(group.rows);
    group.priority = [...group.rows, ...group.notes].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))[0]?.priority;
    const course = progress?.find(course => Number(course.course_id) === group.id);
    if (course && Number(course.total_lessons) > 0 && course.done_lessons != null && Number.isFinite(Number(course.done_lessons))) {
      group.progress = { done: Number(course.done_lessons), total: Number(course.total_lessons),
        percent: Math.max(0, Math.min(100, Math.round(Number(course.done_lessons) / Number(course.total_lessons) * 100))) };
    }
  }
  return [...groups.values()].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.id - b.id);
}
