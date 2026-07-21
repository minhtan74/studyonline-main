import axiosClient from '../api/axiosClient';

export const enrollmentService = {
  getEnrollments() {
    return axiosClient.get('/enrollments');
  },
  getEnrolledIds() {
    return axiosClient.get('/enrollments?ids_only=1');
  },
  checkEnrolled(courseId) {
    return axiosClient.get(`/enrollments?course_id=${courseId}`);
  },
  enroll(courseId) {
    return axiosClient.post('/enrollments', { course_id: courseId });
  },
  unenroll(courseId) {
    return axiosClient.delete(`/enrollments?course_id=${courseId}`);
  },
};
