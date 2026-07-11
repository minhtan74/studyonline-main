<h2>Danh sách bài học</h2>

<a href="?page=create-lesson&chapter_id=<?= $chapterId ?>" class="btn btn-success mb-3">
    + Thêm bài học
</a>

<?php if (empty($lessons)): ?>
    <p class="text-muted">Chưa có bài học nào trong chương này.</p>
<?php else: ?>
    <table class="table table-bordered table-hover">
        <thead class="table-dark">
            <tr>
                <th>#</th>
                <th>Tiêu đề</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($lessons as $index => $lesson): ?>
                <tr>
                    <td><?= $index + 1 ?></td>
                    <td><?= htmlspecialchars($lesson['title']) ?></td>
                    <td><?= htmlspecialchars($lesson['description'] ?? '') ?></td>
                    <td>
                        <a href="?page=show-lesson&id=<?= $lesson['id'] ?>" class="btn btn-info btn-sm">
                            Xem
                        </a>
                        <a href="?page=edit-lesson&id=<?= $lesson['id'] ?>" class="btn btn-warning btn-sm">
                            Sửa
                        </a>
                        <a href="?page=delete-lesson&id=<?= $lesson['id'] ?>"
                           class="btn btn-danger btn-sm"
                           onclick="return confirm('Xóa bài học này?')">
                            Xóa
                        </a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php endif; ?>