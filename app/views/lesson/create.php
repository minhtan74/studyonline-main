<form method="POST" action="?page=store-lesson" enctype="multipart/form-data">

    <input type="hidden" name="chapter_id" value="<?= $_GET['chapter_id'] ?? 0 ?>">

    <label>

        Tên bài học

    </label>

    <input type="text" name="title" class="form-control">

    <br>

    <label>

        Mô tả

    </label>

    <textarea name="description" class="form-control">
</textarea>

    <br>

    <label>

        Video

    </label>

    <input type="file" name="video">

    <br><br>

    <label>

        PDF

    </label>

    <input type="file" name="document">

    <br><br>

    <button class="btn btn-success">

        Lưu bài học

    </button>

</form>