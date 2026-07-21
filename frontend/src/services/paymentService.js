import axiosClient from '../api/axiosClient';

export const paymentService = {
  getPayments() {
    return axiosClient.get('/payments');
  },
  checkPayment(courseId) {
    return axiosClient.get(`/payments/check?course_id=${courseId}`);
  },
  pay(courseId, method, cardData = {}) {
    return axiosClient.post('/payments', { course_id: courseId, method, ...cardData });
  },
};
