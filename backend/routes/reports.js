const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Báo cáo tổng hợp cho Admin Dashboard
 *     description: Doanh thu, đơn hàng, top khóa học, học viên mới, tỷ lệ hoàn thành, biểu đồ doanh thu theo khoảng thời gian.
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema: { type: string, enum: [today, 7d, 30d, 1y], default: 7d }
 *     responses:
 *       200: { description: OK }
 *       403: { description: Chỉ Admin mới có thể xem báo cáo. }
 */
router.get('/summary', authenticate, asyncHandler(reportController.summary));

module.exports = router;
