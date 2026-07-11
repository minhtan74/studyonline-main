import axiosClient from '../api/axiosClient';

export const enrollmentService = {
  getEnrollments() {
    return axiosClient.get('/api/enrollments');
  },
  getEnrolledIds() {
    return axiosClient.get('/api/enrollments?ids_only=1');
  },
  checkEnrolled(courseId) {
    return axiosClient.get(`/api/enrollments?course_id=${courseId}`);
  },
  enroll(courseId) {
    return axiosClient.post('/api/enrollments', { course_id: courseId });
  },
  unenroll(courseId) {
    return axiosClient.delete(`/api/enrollments?course_id=${courseId}`);
  },
};
