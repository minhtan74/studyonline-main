<?php if (!isset($lesson) || !$lesson): ?>
    <p class="text-danger">Không tìm thấy bài học.</p>
<?php else: ?>

<h2>Chỉnh sửa bài học</h2>

<form method="POST" action="?page=edit-lesson&id=<?= $lesson['id'] ?>">

    <div class="mb-3">
        <label class="form-label">Tên bài học</label>
        <input type="text" name="title" class="form-control"
               value="<?= htmlspecialchars($lesson['title']) ?>" required>
    </div>

    <div class="mb-3">
        <label class="form-label">Mô tả</label>
        <textarea name="description" class="form-control" rows="4"><?= htmlspecialchars($lesson['description'] ?? '') ?></textarea>
    </div>

    <button type="submit" class="btn btn-primary">Cập nhật</button>

    <a href="?page=lessons&chapter_id=<?= $lesson['chapter_id'] ?>" class="btn btn-secondary">
        Hủy
    </a>

</form>

<?php endif; ?>
