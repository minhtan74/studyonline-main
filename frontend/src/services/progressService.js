import axiosClient from '../api/axiosClient';

export const progressService = {
  getProgress() {
    return axiosClient.get('/api/progress');
  },
  getProgressByCourse(courseId) {
    return axiosClient.get(`/api/progress?course_id=${courseId}`);
  },
  getWeeklyProgress() {
    return axiosClient.get('/api/progress?weekly=1');
  },
  updateProgress(lessonId, watchedSec, isCompleted) {
    return axiosClient.post('/api/progress', {
      lesson_id: lessonId,
      watched_sec: watchedSec,
      is_completed: isCompleted,
    });
  },
};
