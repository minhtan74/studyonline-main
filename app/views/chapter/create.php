<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>
<h1 class="mb-4">Thêm chương</h1>
<form action="?page=add-chapter" method="post">
    <div class="mb-3">
        <label for="course_id" class="form-label">Khóa học</label>
        <input type="text" class="form-control" id="course_id" name="course_id" required>
    </div>
    <div class="mb-3">
        <label for="chapter_name" class="form-label">Tên chương</label>
        <input type="text" class="form-control" id="chapter_name" name="chapter_name" required>
    </div>
    <button type="submit" class="btn btn-primary">Lưu</button>
    <a href="?page=courses" class="btn btn-secondary">Quay lại</a>
</form>
<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>