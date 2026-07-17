const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Danh sách đăng ký (theo vai trò), hoặc kiểm tra trạng thái đăng ký
 *     description: >
 *       - `?course_id=` → trả `{enrolled}` cho khóa đó.
 *       - `?ids_only=1` → trả mảng course_id đã đăng ký.
 *       - Không tham số → admin thấy tất cả, teacher thấy theo khóa của mình, student thấy của mình.
 *     tags: [Enrollments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema: { type: integer }
 *       - in: query
 *         name: ids_only
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Đăng ký khóa học miễn phí
 *     tags: [Enrollments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [course_id]
 *             properties:
 *               course_id: { type: integer }
 *     responses:
 *       200: { description: Đăng ký thành công. }
 *       409: { description: Đã đăng ký rồi. }
 *   delete:
 *     summary: Hủy đăng ký khóa học
 *     tags: [Enrollments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Đã hủy đăng ký. }
 */
router.get('/', authenticate, asyncHandler(enrollmentController.index));
router.post('/', authenticate, asyncHandler(enrollmentController.create));
router.delete('/', authenticate, asyncHandler(enrollmentController.remove));

module.exports = router;
