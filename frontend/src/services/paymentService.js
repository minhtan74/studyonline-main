import axiosClient from '../api/axiosClient';

export const paymentService = {
  getPayments() {
    return axiosClient.get('/api/payments');
  },
  checkPayment(courseId) {
    return axiosClient.get(`/api/payments/check?course_id=${courseId}`);
  },
  pay(courseId, method, cardData = {}) {
    return axiosClient.post('/api/payments', { course_id: courseId, method, ...cardData });
  },
};
