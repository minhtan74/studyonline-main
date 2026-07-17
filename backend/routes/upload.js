const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middlewares/auth');
const handleUpload = require('../middlewares/upload');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload file video / tài liệu PDF / ảnh
 *     tags: [Upload]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *               type: { type: string, enum: [video, document, image], default: document }
 *     responses:
 *       200:
 *         description: Upload thành công, trả về url công khai của file.
 *       400:
 *         description: File không hợp lệ (sai định dạng hoặc vượt giới hạn dung lượng).
 *       401:
 *         description: Chưa đăng nhập.
 */
router.post('/', authenticate, handleUpload, asyncHandler(uploadController.upload));

module.exports = router;
