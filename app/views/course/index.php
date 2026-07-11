<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>


<div class="container mt-4">

    <h2>Danh sách khóa học</h2>

    <a href="?page=create-course" class="btn btn-success mb-3">

        Thêm khóa học

    </a>

    <table class="table table-bordered">

        <tr>

            <th>ID</th>
            <th>Tên khóa học</th>
            <th>Ảnh</th>
            <th>Hành động</th>

        </tr>

        <?php foreach ($courses ?? [] as $course): ?>

            <tr>

                <td>
                    <?= $course['id'] ?>
                </td>

                <td>
                    <?= $course['title'] ?>
                </td>

                <td>

                    <img src="/studyonline/public/uploads/<?= $course['thumbnail'] ?>" width="120">

                </td>

                <td>
                    
                    <a href="?page=edit-course&id=<?= $course['id'] ?>" class="btn btn-warning">

                        Sửa

                    </a>

                    <a href="?page=delete-course&id=<?= $course['id'] ?>" class="btn btn-danger">

                        Xóa

                    </a>
                    <a href="?page=chapters&course_id=<?= $course['id'] ?>" class="btn btn-info">

                        Chương học

                    </a>
                    <a href="?page=quizs&course_id=<?= $course['id'] ?>" class="btn btn-info">

                        Quiz

                    </a>
                </td>

            </tr>

        <?php endforeach; ?>

    </table>

</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>