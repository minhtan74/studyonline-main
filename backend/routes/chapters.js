const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const { requireRole } = require('../middlewares/role');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/chapters:
 *   get:
 *     summary: Danh sách chương theo course_id, hoặc chi tiết 1 chương nếu truyền id
 *     tags: [Chapters]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *       - in: query
 *         name: course_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Thiếu course_id hoặc id. }
 *       404: { description: Không tìm thấy chương. }
 *   post:
 *     summary: Tạo chương học
 *     tags: [Chapters]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [course_id, chapter_name]
 *             properties:
 *               course_id: { type: integer }
 *               chapter_name: { type: string }
 *     responses:
 *       200: { description: Tạo thành công. }
 *   put:
 *     summary: Cập nhật chương học
 *     tags: [Chapters]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, chapter_name]
 *             properties:
 *               id: { type: integer }
 *               chapter_name: { type: string }
 *     responses:
 *       200: { description: Cập nhật thành công. }
 *   delete:
 *     summary: Xóa chương học
 *     tags: [Chapters]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Xóa thành công. }
 */
router.get('/', asyncHandler(chapterController.index));
router.post('/', requireRole('admin', 'teacher'), asyncHandler(chapterController.create));
router.put('/', requireRole('admin', 'teacher'), asyncHandler(chapterController.update));
router.delete('/', requireRole('admin', 'teacher'), asyncHandler(chapterController.remove));

module.exports = router;
