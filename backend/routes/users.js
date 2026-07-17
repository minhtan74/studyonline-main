const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireRole } = require('../middlewares/role');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Danh sách người dùng, hoặc chi tiết 1 người dùng nếu truyền ?id=
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       403: { description: Không có quyền. }
 *       404: { description: Không tìm thấy người dùng. }
 *   post:
 *     summary: Tạo người dùng mới (Admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullname, email, password]
 *             properties:
 *               fullname: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [admin, teacher, student] }
 *     responses:
 *       200: { description: Tạo thành công. }
 *       409: { description: Email đã tồn tại. }
 *   put:
 *     summary: Cập nhật người dùng
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, fullname, email, role]
 *             properties:
 *               id: { type: integer }
 *               fullname: { type: string }
 *               email: { type: string }
 *               role: { type: string, enum: [admin, teacher, student] }
 *     responses:
 *       200: { description: Cập nhật thành công. }
 *       403: { description: Không có quyền. }
 *   delete:
 *     summary: Xóa người dùng (Admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Xóa thành công. }
 */
router.get('/', requireRole('admin', 'teacher'), asyncHandler(userController.index));
router.post('/', requireRole('admin'), asyncHandler(userController.create));
router.put('/', requireRole('admin', 'teacher', 'student'), asyncHandler(userController.update));
router.delete('/', requireRole('admin'), asyncHandler(userController.remove));

module.exports = router;
