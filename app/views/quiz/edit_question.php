<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>

<style>
.form-card { border: none; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,.09); }
.form-label { font-weight: 600; }
.form-control, .form-select {
    border-radius: 10px; border: 2px solid #e9ecef; transition: border-color .2s;
}
.form-control:focus, .form-select:focus {
    border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.15);
}
.option-row { display: flex; align-items: center; gap: .75rem; margin-bottom: .6rem; }
.option-badge {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff; font-weight: 700; font-size: .85rem;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.btn-save {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none; color: #fff; border-radius: 10px;
    padding: 10px 30px; font-weight: 700;
}
.btn-save:hover { opacity: .85; color: #fff; }
.answer-option label { cursor: pointer; padding: 6px 14px; border-radius: 20px; border: 2px solid #e9ecef; font-weight: 600; transition: all .15s; }
.answer-option input:checked + label { background: #667eea; color: #fff; border-color: #667eea; }
</style>

<div class="container py-4" style="max-width: 700px;">
    <div class="d-flex align-items-center gap-2 mb-4">
        <a href="?page=quiz-questions&quiz_id=<?= $quiz['id'] ?>" class="btn btn-sm btn-outline-secondary rounded-pill">← Quay lại</a>
        <h2 class="fw-bold mb-0" style="color:#764ba2;">✏️ Sửa câu hỏi</h2>
    </div>
    <p class="text-muted mb-4">Quiz: <strong><?= htmlspecialchars($quiz['title']) ?></strong></p>

    <div class="card form-card p-4">
        <form method="POST" action="?page=update-question">
            <input type="hidden" name="id" value="<?= $question['id'] ?>">
            <input type="hidden" name="quiz_id" value="<?= $question['quiz_id'] ?>">

            <div class="mb-4">
                <label class="form-label">Nội dung câu hỏi <span class="text-danger">*</span></label>
                <textarea name="content" class="form-control" rows="3" required><?= htmlspecialchars($question['content']) ?></textarea>
            </div>

            <div class="mb-3">
                <label class="form-label mb-3">Các đáp án <span class="text-danger">*</span></label>
                <?php foreach (['A','B','C','D'] as $letter): ?>
                    <?php $optKey = 'option_' . strtolower($letter); ?>
                <div class="option-row">
                    <span class="option-badge"><?= $letter ?></span>
                    <input type="text" name="option_<?= strtolower($letter) ?>"
                           class="form-control"
                           value="<?= htmlspecialchars($question[$optKey]) ?>"
                           placeholder="Đáp án <?= $letter ?>..." required>
                </div>
                <?php endforeach; ?>
            </div>

            <div class="mb-3">
                <label class="form-label">Đáp án đúng <span class="text-danger">*</span></label>
                <div class="d-flex gap-2 flex-wrap">
                    <?php foreach (['A','B','C','D'] as $letter): ?>
                    <div class="answer-option">
                        <input type="radio" name="correct_answer" id="ans_<?= $letter ?>"
                               value="<?= $letter ?>" class="d-none"
                               <?= $question['correct_answer'] === $letter ? 'checked' : '' ?>>
                        <label for="ans_<?= $letter ?>"><?= $letter ?></label>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label">Thứ tự</label>
                <input type="number" name="order_index" class="form-control"
                       value="<?= $question['order_index'] ?>" min="0" style="max-width:120px;">
            </div>

            <div class="d-flex gap-2">
                <button type="submit" class="btn-save btn">💾 Lưu thay đổi</button>
                <a href="?page=quiz-questions&quiz_id=<?= $question['quiz_id'] ?>"
                   class="btn btn-outline-secondary rounded-pill">Hủy</a>
            </div>
        </form>
    </div>
</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>
