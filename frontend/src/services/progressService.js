import axiosClient from '../api/axiosClient';

export const progressService = {
  /** GET /api/progress — tổng hợp tiến độ tất cả khóa học của user (bulk, 1 request) */
  getProgress() {
    return axiosClient.get('/api/progress');
  },
  getProgressByCourse(courseId) {
    return axiosClient.get(`/api/progress?course_id=${courseId}`);
  },
  getWeeklyProgress() {
    return axiosClient.get('/api/progress?weekly=1');
  },
  /** GET /api/progress?recent=1 — danh sách bài học đã hoàn thành gần nhất (kèm tên bài, tên khóa, thời gian) */
  getRecentActivities() {
    return axiosClient.get('/api/progress?recent=1');
  },
  updateProgress(lessonId, watchedSec, isCompleted) {
    return axiosClient.post('/api/progress', {
      lesson_id: lessonId,
      watched_sec: watchedSec,
      is_completed: isCompleted,
    });
  },
};
