import axiosClient from '../api/axiosClient';

export const reportService = {
  /** GET /api/reports/summary?range=today|7d|30d|1y */
  getSummary(range = '7d') {
    return axiosClient.get(`/api/reports/summary?range=${range}`);
  },
};
