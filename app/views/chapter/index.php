<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>
<h2>Danh sách chương</h2>
<div class="d-flex gap-2 mb-3">
    <a href="?page=create-chapter&course_id=<?= $courseId ?>" class="btn btn-primary">Thêm chương</a>
    <a href="?page=quiz&course_id=<?= $courseId ?>" class="btn btn-outline-purple" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;">📝 Quiz của khóa học</a>
    <a href="?page=create-quiz&course_id=<?= $courseId ?>" class="btn btn-outline-success">+ Tạo Quiz mới</a>
</div>

<hr>
<table class="table table-bordered">
    <tr>
        <th>ID</th>
        <th>Tên chương</th>
        <th>Thao tác</th>
    </tr>
    <?php foreach ($chapters ?? [] as $chapter): ?>
        <tr>
            <td><?= $chapter['id'] ?></td>
            <td><?= $chapter['chapter_name'] ?></td>
            <td>
                <a href="?page=edit-chapter&id=<?= $chapter['id'] ?>" class="btn btn-warning">
                    Sửa
                </a>
                <a href="?page=delete-chapter&id=<?= $chapter['id'] ?>&course_id=<?= $courseId ?>"
                   class="btn btn-danger"
                   onclick="return confirm('Bạn có chắc muốn xóa chương này? Tất cả bài học trong chương cũng sẽ bị xóa.')">
                    Xóa
                </a>
                <a href="?page=lessons&chapter_id=<?= $chapter['id'] ?>" class="btn btn-primary">

                    Bài học

                </a>
            </td>
        </tr>
    <?php endforeach; ?>
</table>
<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>