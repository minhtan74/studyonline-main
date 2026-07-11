<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>

<style>
.quiz-info-bar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 2rem;
}
.question-row {
    border: 2px solid #e9ecef; border-radius: 12px; padding: 1.25rem 1.5rem;
    margin-bottom: 1rem; background: #fff;
    transition: border-color .2s;
}
.question-row:hover { border-color: #667eea; }
.q-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff; font-weight: 700; font-size: .85rem; flex-shrink: 0;
}
.correct-badge {
    background: #d4edda; color: #155724; border-radius: 20px;
    padding: 3px 12px; font-size: .78rem; font-weight: 700;
}
.btn-add-q {
    background: linear-gradient(135deg, #11998e, #38ef7d);
    border: none; color: #fff; border-radius: 10px;
    padding: 10px 24px; font-weight: 700;
}
.btn-add-q:hover { opacity: .85; color: #fff; }
</style>

<div class="container py-4" style="max-width: 900px;">

    <!-- Header bar -->
    <div class="quiz-info-bar d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
            <h2 class="fw-bold mb-1">📋 Quản lý câu hỏi</h2>
            <p class="mb-0 opacity-75"><?= htmlspecialchars($quiz['title']) ?></p>
        </div>
        <div class="d-flex gap-2">
            <a href="?page=create-question&quiz_id=<?= $quiz['id'] ?>" class="btn-add-q btn">
                + Thêm câu hỏi
            </a>
            <a href="?page=quiz&course_id=<?= $quiz['course_id'] ?>"
               class="btn btn-light rounded-pill px-3">← Về Quiz</a>
        </div>
    </div>

    <!-- Stats -->
    <div class="d-flex gap-3 mb-4 flex-wrap">
        <span class="badge bg-primary rounded-pill fs-6 px-3 py-2">
            ❓ <?= count($questions) ?> câu hỏi
        </span>
        <?php if (count($questions) > 0): ?>
            <a href="?page=quiz-show&id=<?= $quiz['id'] ?>"
               class="btn btn-sm btn-outline-success rounded-pill">▶ Xem trước bài quiz</a>
        <?php endif; ?>
    </div>


    <?php if (empty($questions)): ?>
        <div class="text-center py-5">
            <div style="font-size:3rem;">🤔</div>
            <p class="text-muted fs-5 mt-2">Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!</p>
            <a href="?page=create-question&quiz_id=<?= $quiz['id'] ?>" class="btn-add-q btn mt-2">
                + Thêm câu hỏi
            </a>
        </div>
    <?php else: ?>
        <?php foreach ($questions as $index => $q): ?>
        <div class="question-row">
            <div class="d-flex align-items-start gap-3">
                <span class="q-num mt-1"><?= $index + 1 ?></span>
                <div class="flex-grow-1">
                    <p class="fw-semibold mb-2"><?= nl2br(htmlspecialchars($q['content'])) ?></p>
                    <div class="row g-1">
                        <?php foreach (['A','B','C','D'] as $letter): ?>
                            <?php $optKey = 'option_' . strtolower($letter); ?>
                            <div class="col-md-6">
                                <small class="<?= $letter === $q['correct_answer'] ? 'text-success fw-bold' : 'text-muted' ?>">
                                    <?= $letter === $q['correct_answer'] ? '✅' : '○' ?>
                                    <strong><?= $letter ?>.</strong>
                                    <?= htmlspecialchars($q[$optKey]) ?>
                                </small>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <div class="mt-2">
                        <span class="correct-badge">Đáp án: <?= $q['correct_answer'] ?></span>
                    </div>
                </div>
                <div class="d-flex gap-1 ms-2">
                    <a href="?page=edit-question&id=<?= $q['id'] ?>"
                       class="btn btn-sm btn-outline-warning rounded-pill">✏️ Sửa</a>
                    <a href="?page=delete-question&id=<?= $q['id'] ?>&quiz_id=<?= $quiz['id'] ?>"
                       class="btn btn-sm btn-outline-danger rounded-pill"
                       onclick="return confirm('Xóa câu hỏi này?')">🗑️</a>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    <?php endif; ?>

</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>
