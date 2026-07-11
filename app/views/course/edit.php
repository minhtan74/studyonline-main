<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="container mt-4">

    <h2>Sửa khóa học</h2>

    <form method="POST" action="?page=update-course">

        <input type="hidden" name="id" value="<?= htmlspecialchars($course['id'] ?? '') ?>">

        <div class="mb-3">
            <label class="form-label">Tên khóa học</label>
            <input type="text" name="title"
                   value="<?= htmlspecialchars($course['title'] ?? '') ?>"
                   class="form-control">
        </div>

        <div class="mb-3">
            <label class="form-label">Mô tả</label>
            <textarea name="description" class="form-control" rows="5"><?= htmlspecialchars($course['description'] ?? '') ?></textarea>
        </div>

        <button type="submit" class="btn btn-success">Cập nhật</button>
        <a href="?page=courses" class="btn btn-secondary">Hủy</a>

    </form>

</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>