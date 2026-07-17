const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Danh sách giao dịch thanh toán (theo vai trò)
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Tạo giao dịch thanh toán và đăng ký khóa học sau khi thành công
 *     description: >
 *       Khóa học miễn phí sẽ được đăng ký trực tiếp (payment_required=false).
 *       Khóa học có phí sẽ tạo giao dịch, hoàn tất ngay (mô phỏng cổng thanh toán) rồi đăng ký.
 *     tags: [Payments]
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
 *               method: { type: string, enum: [card, bank_transfer, momo, zalopay] }
 *     responses:
 *       200: { description: Thanh toán / đăng ký thành công. }
 *       404: { description: Khóa học không tồn tại. }
 *       409: { description: Đã đăng ký rồi. }
 */
router.get('/', authenticate, asyncHandler(paymentController.index));
router.post('/', authenticate, asyncHandler(paymentController.create));

/**
 * @swagger
 * /api/payments/check:
 *   get:
 *     summary: Kiểm tra trạng thái thanh toán + đăng ký của 1 khóa học
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: course_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
router.get('/check', authenticate, asyncHandler(paymentController.check));

module.exports = router;
