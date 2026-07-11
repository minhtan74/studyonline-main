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
</style>

<div class="container py-4" style="max-width: 640px;">
    <div class="d-flex align-items-center gap-2 mb-4">
        <a href="?page=quiz&course_id=<?= $quiz['course_id'] ?>" class="btn btn-sm btn-outline-secondary rounded-pill">← Quay lại</a>
        <h2 class="fw-bold mb-0" style="color:#764ba2;">✏️ Sửa Quiz</h2>
    </div>

    <div class="card form-card p-4">
        <form method="POST" action="?page=update-quiz">
            <input type="hidden" name="id" value="<?= $quiz['id'] ?>">

            <div class="mb-3">
                <label class="form-label">Khóa học <span class="text-danger">*</span></label>
                <select name="course_id" class="form-select" required>
                    <option value="">-- Chọn khóa học --</option>
                    <?php foreach ($courses as $course): ?>
                        <option value="<?= $course['id'] ?>"
                            <?= ($quiz['course_id'] == $course['id']) ? 'selected' : '' ?>>
                            <?= htmlspecialchars($course['title']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label">Tiêu đề Quiz <span class="text-danger">*</span></label>
                <input type="text" name="title" class="form-control"
                       value="<?= htmlspecialchars($quiz['title']) ?>" required>
            </div>

            <div class="mb-4">
                <label class="form-label">Mô tả</label>
                <textarea name="description" class="form-control" rows="3"><?= htmlspecialchars($quiz['description'] ?? '') ?></textarea>
            </div>

            <div class="d-flex gap-2">
                <button type="submit" class="btn-save btn">💾 Lưu thay đổi</button>
                <a href="?page=quiz&course_id=<?= $quiz['course_id'] ?>"
                   class="btn btn-outline-secondary rounded-pill">Hủy</a>
            </div>
        </form>
    </div>
</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>
