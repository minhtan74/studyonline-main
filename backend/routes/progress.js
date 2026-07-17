const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Tiến độ học tập của người dùng hiện tại
 *     description: >
 *       `?course_id=` → lesson_id[] đã hoàn thành trong khóa đó.
 *       `?weekly=1` → dữ liệu biểu đồ 7 ngày.
 *       `?recent=1&limit=` → hoạt động gần đây.
 *       Không tham số → tổng hợp tiến độ tất cả khóa học đã học/đăng ký.
 *     tags: [Progress]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema: { type: integer }
 *       - in: query
 *         name: weekly
 *         schema: { type: integer }
 *       - in: query
 *         name: recent
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Cập nhật tiến độ xem bài học (tự động đăng ký khóa học nếu chưa có)
 *     tags: [Progress]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lesson_id]
 *             properties:
 *               lesson_id: { type: integer }
 *               watched_sec: { type: integer }
 *               is_completed: { type: integer, enum: [0, 1] }
 *     responses:
 *       200: { description: Đã lưu tiến độ. }
 *       400: { description: Thiếu lesson_id. }
 */
router.get('/', authenticate, asyncHandler(progressController.index));
router.post('/', authenticate, asyncHandler(progressController.update));

module.exports = router;
