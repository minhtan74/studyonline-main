<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>
<form method="POST" action="?page=add-course" enctype="multipart/form-data">
    <label>Tên khóa học</label>
    <input type="text" name="title" class="form-control">

    <label>Mô tả</label>
    <textarea name="description" class="form-control"></textarea>

    <label>Ảnh khóa học</label>
    <input type="file" name="thumbnail" class="form-control">

    <br>

    <button type="submit" class="btn btn-primary">Lưu</button>

</form>
<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>