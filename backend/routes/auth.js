const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     description: Xác thực bằng email/mật khẩu và trả về JWT token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token và thông tin user.
 *       400:
 *         description: Thiếu email hoặc mật khẩu.
 *       401:
 *         description: Email hoặc mật khẩu không chính xác.
 */
router.post('/login', asyncHandler(authController.login));

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản học viên
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullname, email, password, confirm_password]
 *             properties:
 *               fullname: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               confirm_password: { type: string }
 *     responses:
 *       200: { description: Đăng ký thành công. }
 *       400: { description: Thiếu thông tin hoặc mật khẩu xác nhận không khớp. }
 *       409: { description: Email đã được đăng ký. }
 */
router.post('/register', asyncHandler(authController.register));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Auth]
 *     responses:
 *       200: { description: Đăng xuất thành công. }
 */
router.post('/logout', asyncHandler(authController.logout));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng đang đăng nhập
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Thông tin user hiện tại. }
 *       401: { description: Chưa đăng nhập hoặc token không hợp lệ. }
 */
router.get('/me', authenticate, asyncHandler(authController.me));

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Đổi mật khẩu
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [old_password, new_password]
 *             properties:
 *               old_password: { type: string }
 *               new_password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Đổi mật khẩu thành công. }
 *       400: { description: Dữ liệu không hợp lệ hoặc mật khẩu hiện tại không đúng. }
 *       401: { description: Chưa đăng nhập. }
 */
router.post('/change-password', authenticate, asyncHandler(authController.changePassword));

module.exports = router;
