<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>

<style>
.form-card { border: none; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,.09); }
.form-label { font-weight: 600; }
.form-control, .form-select {
    border-radius: 10px; border: 2px solid #e9ecef;
    transition: border-color .2s;
}
.form-control:focus, .form-select:focus {
    border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.15);
}
.btn-save {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none; color: #fff; border-radius: 10px;
    padding: 10px 30px; font-weight: 700;
}
.btn-save:hover { opacity: .85; color: #fff; }
.page-title { color: #764ba2; font-weight: 800; }
</style>

<div class="container py-4" style="max-width: 640px;">
    <div class="d-flex align-items-center gap-2 mb-4">
        <a href="?page=quiz<?= $courseId ? '&course_id='.$courseId : '' ?>" class="btn btn-sm btn-outline-secondary rounded-pill">← Quay lại</a>
        <h2 class="page-title mb-0">📝 Tạo Quiz mới</h2>
    </div>

    <div class="card form-card p-4">
        <form method="POST" action="?page=store-quiz">
            <div class="mb-3">
                <label class="form-label">Khóa học <span class="text-danger">*</span></label>
                <select name="course_id" class="form-select" required>
                    <option value="">-- Chọn khóa học --</option>
                    <?php foreach ($courses as $course): ?>
                        <option value="<?= $course['id'] ?>"
                            <?= ($courseId == $course['id']) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($course['title']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label">Tiêu đề Quiz <span class="text-danger">*</span></label>
                <input type="text" name="title" class="form-control"
                       placeholder="VD: Kiểm tra PHP cơ bản" required>
            </div>

            <div class="mb-4">
                <label class="form-label">Mô tả</label>
                <textarea name="description" class="form-control" rows="3"
                          placeholder="Mô tả ngắn về bài quiz này..."></textarea>
            </div>

            <div class="d-flex gap-2">
                <button type="submit" class="btn-save btn">💾 Lưu & Thêm câu hỏi</button>
                <a href="?page=quiz<?= $courseId ? '&course_id='.$courseId : '' ?>"
                   class="btn btn-outline-secondary rounded-pill">Hủy</a>
            </div>
        </form>
    </div>
</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>
