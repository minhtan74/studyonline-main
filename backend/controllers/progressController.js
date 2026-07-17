const { success, error } = require('../utils/response');
const progressService = require('../services/progressService');
const lessonService = require('../services/lessonService');
const chapterService = require('../services/chapterService');
const enrollmentService = require('../services/enrollmentService');

/**
 * GET /api/progress
 *
 * Query params:
 *   ?course_id=X   → trả về lesson_id[] đã hoàn thành trong khóa đó
 *   ?weekly=1       → trả về dữ liệu biểu đồ 7 ngày
 *   ?recent=1       → hoạt động gần đây
 *   (không có)      → trả về tổng hợp tiến độ tất cả khóa học
 */
async function index(req, res) {
  const user = req.user;
  const q = req.query;

  if (q.course_id) {
    const ids = await progressService.getCompletedLessonIds(user.id, parseInt(q.course_id, 10));
    return success(res, { data: ids });
  }

  if (q.weekly) {
    const weekly = await progressService.getWeeklyProgress(user.id);
    return success(res, { data: weekly });
  }

  if (q.recent) {
    const limit = parseInt(q.limit ?? 10, 10);
    const recent = await progressService.getRecentCompleted(user.id, limit);
    return success(res, { data: recent });
  }

  const byCourse = await progressService.getProgressByCourse(user.id);
  const totalSec = await progressService.getTotalWatchedSec(user.id);

  let totalLessons = 0;
  let doneLessons = 0;
  for (const c of byCourse) {
    totalLessons += parseInt(c.total_lessons, 10) || 0;
    doneLessons += parseInt(c.done_lessons, 10) || 0;
  }

  return success(res, {
    data: {
      courses: byCourse,
      total_lessons: totalLessons,
      done_lessons: doneLessons,
      total_watched_sec: totalSec,
    },
  });
}

/**
 * POST /api/progress
 * Body: { lesson_id, watched_sec, is_completed }
 */
async function update(req, res) {
  const user = req.user;
  const input = req.body || {};

  const lessonId = parseInt(input.lesson_id ?? 0, 10);
  const watchedSec = parseInt(input.watched_sec ?? 0, 10);
  const isCompleted = parseInt(input.is_completed ?? 0, 10);

  if (!lessonId) {
    return error(res, 'Thiếu lesson_id.');
  }

  // Tự động đăng ký khóa học nếu chưa có enrollment
  const lesson = await lessonService.find(lessonId);
  if (lesson) {
    const chapter = await chapterService.find(parseInt(lesson.chapter_id ?? 0, 10));
    if (chapter) {
      const enrolled = await enrollmentService.isEnrolled(user.id, chapter.course_id);
      if (!enrolled) {
        await enrollmentService.enroll(user.id, chapter.course_id);
      }
    }
  }

  const ok = await progressService.upsertProgress(user.id, lessonId, watchedSec, isCompleted);

  if (ok) {
    return success(res, [], isCompleted ? 'Đã đánh dấu hoàn thành bài học.' : 'Đã lưu tiến độ.');
  }
  return error(res, 'Không thể lưu tiến độ, vui lòng thử lại.');
}

module.exports = { index, update };
