<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>

<style>
.quiz-hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff; border-radius: 16px; padding: 2rem; margin-bottom: 2rem;
}
.question-card {
    border: 2px solid #e9ecef; border-radius: 14px;
    padding: 1.5rem; margin-bottom: 1.5rem;
    transition: border-color .2s;
    background: #fff;
}
.question-card:hover { border-color: #667eea; }
.question-number {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff; font-weight: 700; font-size: .9rem;
    margin-right: .75rem; flex-shrink: 0;
}
.option-label {
    display: flex; align-items: center; gap: .75rem;
    border: 2px solid #e9ecef; border-radius: 10px;
    padding: .75rem 1rem; cursor: pointer;
    transition: all .15s; margin-bottom: .5rem;
    background: #fafafa;
}
.option-label:hover { border-color: #667eea; background: #f0f0ff; }
input[type=radio]:checked + .option-label {
    border-color: #667eea; background: #ede9ff; font-weight: 600;
}
.option-letter {
    width: 28px; height: 28px; border-radius: 50%;
    background: #667eea; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: .8rem; flex-shrink: 0;
}
.progress-bar-quiz {
    height: 6px; border-radius: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
}
.btn-submit-quiz {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none; color: #fff; border-radius: 12px;
    padding: 12px 40px; font-weight: 700; font-size: 1.05rem;
    transition: opacity .2s;
}
.btn-submit-quiz:hover { opacity: .85; color: #fff; }
.already-done-card {
    background: linear-gradient(135deg, #f0f7ff, #e8f5e9);
    border: 2px solid #667eea; border-radius: 16px;
    padding: 2rem; text-align: center;
}
</style>

<div class="container py-4" style="max-width: 820px;">

    <!-- Quiz Hero -->
    <div class="quiz-hero">
        <div class="d-flex align-items-start gap-3">
            <div style="font-size:2.5rem;">📝</div>
            <div>
                <h1 class="fw-bold mb-1" style="font-size:1.6rem;"><?= htmlspecialchars($quiz['title']) ?></h1>
                <?php if (!empty($quiz['course_title'])): ?>
                    <span class="badge bg-white text-primary me-2">🎓 <?= htmlspecialchars($quiz['course_title']) ?></span>
                <?php endif; ?>
                <span class="badge bg-white text-secondary">❓ <?= count($questions) ?> câu hỏi</span>
                <?php if (!empty($quiz['description'])): ?>
                    <p class="mt-2 mb-0 opacity-75 small"><?= htmlspecialchars($quiz['description']) ?></p>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <?php if ($existingResult): ?>
        <!-- Đã làm rồi -->
        <div class="already-done-card mb-4">
            <div style="font-size:2.5rem;">🏆</div>
            <h4 class="fw-bold mt-2">Bạn đã hoàn thành bài này!</h4>
            <p class="text-muted">
                Điểm số: <strong class="text-success"><?= $existingResult['score'] ?>/<?= $existingResult['total'] ?></strong>
                — <?= round($existingResult['score']/$existingResult['total']*100) ?>%
            </p>
            <p class="mb-3 small text-muted">Lần làm gần nhất: <?= $existingResult['submit_time'] ?></p>
            <button class="btn btn-outline-primary me-2" onclick="document.getElementById('quiz-form').style.display='block';this.closest('.already-done-card').style.display='none'">
                🔄 Làm lại
            </button>
            <a href="?page=quiz&course_id=<?= $quiz['course_id'] ?>" class="btn btn-outline-secondary">← Quay lại</a>
        </div>
        <div id="quiz-form" style="display:none;">
    <?php else: ?>
        <div id="quiz-form">
    <?php endif; ?>

        <?php if (empty($questions)): ?>
            <div class="text-center py-5">
                <p class="text-muted fs-5">Quiz này chưa có câu hỏi nào.</p>
                <a href="?page=quiz&course_id=<?= $quiz['course_id'] ?>" class="btn btn-outline-secondary">← Quay lại</a>
            </div>
        <?php else: ?>
            <form method="POST" action="?page=quiz-submit" id="quizForm">
                <input type="hidden" name="quiz_id" value="<?= $quiz['id'] ?>">

                <!-- Progress -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between small text-muted mb-1">
                        <span>Tiến độ</span>
                        <span id="progress-text">0/<?= count($questions) ?> câu</span>
                    </div>
                    <div class="progress" style="height:6px; border-radius:3px;">
                        <div class="progress-bar-quiz progress-bar" id="progressBar" style="width:0%"></div>
                    </div>
                </div>

                <?php foreach ($questions as $index => $q): ?>
                <div class="question-card">
                    <div class="d-flex align-items-start mb-3">
                        <span class="question-number"><?= $index + 1 ?></span>
                        <p class="mb-0 fw-semibold" style="font-size:1.05rem;">
                            <?= nl2br(htmlspecialchars($q['content'])) ?>
                        </p>
                    </div>

                    <?php foreach (['A','B','C','D'] as $letter): ?>
                        <?php $optionKey = 'option_' . strtolower($letter); ?>
                        <div>
                            <input type="radio" name="answers[<?= $q['id'] ?>]"
                                   id="q<?= $q['id'] ?>_<?= $letter ?>"
                                   value="<?= $letter ?>"
                                   class="d-none quiz-radio"
                                   data-qid="<?= $q['id'] ?>">
                            <label for="q<?= $q['id'] ?>_<?= $letter ?>" class="option-label w-100">
                                <span class="option-letter"><?= $letter ?></span>
                                <?= htmlspecialchars($q[$optionKey]) ?>
                            </label>
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php endforeach; ?>

                <div class="text-center mt-4 mb-5">
                    <button type="submit" class="btn-submit-quiz btn" id="submitBtn">
                        ✅ Nộp bài
                    </button>
                </div>
            </form>
        <?php endif; ?>
    </div>

</div>

<script>
// Cập nhật progress bar khi chọn đáp án
const radios = document.querySelectorAll('.quiz-radio');
const totalQ = <?= count($questions) ?>;
const answered = new Set();

radios.forEach(r => {
    r.addEventListener('change', () => {
        answered.add(r.dataset.qid);
        const pct = Math.round(answered.size / totalQ * 100);
        document.getElementById('progressBar').style.width = pct + '%';
        document.getElementById('progress-text').textContent = answered.size + '/' + totalQ + ' câu';
    });
});

// Xác nhận nộp bài
document.getElementById('quizForm')?.addEventListener('submit', function(e) {
    if (answered.size < totalQ) {
        if (!confirm(`Bạn còn ${totalQ - answered.size} câu chưa trả lời. Vẫn nộp bài?`)) {
            e.preventDefault();
        }
    }
});
</script>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>
