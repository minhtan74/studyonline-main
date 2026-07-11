<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="container mt-4">
    <h1 class="mb-4">Sửa chương</h1>
    <form action="?page=update-chapter" method="post">

        <input type="hidden" name="id"        value="<?= $chapter['id']        ?? '' ?>">
        <input type="hidden" name="course_id" value="<?= $chapter['course_id'] ?? '' ?>">

        <div class="mb-3">
            <label for="chapter_name" class="form-label">Tên chương</label>
            <input type="text" class="form-control" id="chapter_name" name="chapter_name"
                value="<?= htmlspecialchars($chapter['chapter_name'] ?? '') ?>" required>
        </div>

        <button type="submit" class="btn btn-primary">Lưu</button>
        <a href="?page=chapters&course_id=<?= $chapter['course_id'] ?? '' ?>" class="btn btn-secondary">Quay lại</a>

    </form>
</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>