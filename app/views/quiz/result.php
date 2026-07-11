<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>

<style>
.result-hero {
    border-radius: 20px; padding: 2.5rem; text-align: center; margin-bottom: 2rem;
    color: #fff;
}
.result-hero.pass {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}
.result-hero.fail {
    background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
}
.score-circle {
    width: 120px; height: 120px; border-radius: 50%;
    background: rgba(255,255,255,.25);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    margin: 0 auto 1.5rem;
    border: 4px solid rgba(255,255,255,.5);
}
.score-circle .score-num { font-size: 2rem; font-weight: 800; line-height:1; }
.score-circle .score-total { font-size: .85rem; opacity: .85; }

.detail-item {
    border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1rem;
    border-left: 5px solid;
}
.detail-item.correct { border-color: #28a745; background: #f0fff4; }
.detail-item.wrong   { border-color: #dc3545; background: #fff5f5; }
.answer-tag {
    display: inline-block; border-radius: 6px; padding: 2px 10px;
    font-size: .8rem; font-weight: 700; margin-top: .4rem;
}
.answer-tag.correct-tag { background: #d4edda; color: #155724; }
.answer-tag.wrong-tag   { background: #f8d7da; color: #721c24; }
.answer-tag.chosen-tag  { background: #cce5ff; color: #004085; }
</style>

<?php
$percent  = $total > 0 ? round($score / $total * 100) : 0;
$pass     = $percent >= 60;
$emoji    = $percent >= 80 ? '🏆' : ($percent >= 60 ? '✅' : ($percent >= 40 ? '⚠️' : '❌'));
$message  = $percent >= 80 ? 'Xuất sắc!' : ($percent >= 60 ? 'Đạt yêu cầu!' : ($percent >= 40 ? 'Cần cố gắng thêm!' : 'Chưa đạt, hãy ôn lại nhé!'));
?>

<div class="container py-4" style="max-width: 820px;">

    <!-- Result Hero -->
    <div class="result-hero <?= $pass ? 'pass' : 'fail' ?>">
        <div class="score-circle">
            <span class="score-num"><?= $score ?></span>
            <span class="score-total">/<?= $total ?></span>
        </div>
        <h1 class="fw-bold mb-1"><?= $emoji ?> <?= $message ?></h1>
        <p class="mb-1 opacity-85" style="font-size:1.15rem;">
            Bạn trả lời đúng <strong><?= $score ?>/<?= $total ?></strong> câu — <strong><?= $percent ?>%</strong>
        </p>
        <p class="mb-0 opacity-75 small"><?= htmlspecialchars($quiz['title']) ?></p>
    </div>

    <!-- Chi tiết từng câu -->
    <h5 class="fw-bold mb-3">📋 Chi tiết kết quả</h5>

    <?php foreach ($details as $index => $d): ?>
    <div class="detail-item <?= $d['is_right'] ? 'correct' : 'wrong' ?>">
        <div class="d-flex align-items-start gap-2">
            <span style="font-size:1.2rem;"><?= $d['is_right'] ? '✅' : '❌' ?></span>
            <div class="flex-grow-1">
                <p class="mb-2 fw-semibold">
                    Câu <?= $index + 1 ?>: <?= nl2br(htmlspecialchars($d['question']['content'])) ?>
                </p>

                <?php foreach (['A','B','C','D'] as $letter): ?>
                    <?php
                        $optKey = 'option_' . strtolower($letter);
                        $isCorrect = ($letter === $d['correct']);
                        $isChosen  = ($letter === $d['chosen']);
                        $highlight = '';
                        if ($isCorrect) $highlight = 'fw-bold text-success';
                        if ($isChosen && !$isCorrect) $highlight = 'fw-bold text-danger';
                    ?>
                    <div class="<?= $highlight ?> small mb-1 d-flex align-items-center gap-1">
                        <span class="badge <?= $isCorrect ? 'bg-success' : ($isChosen && !$isCorrect ? 'bg-danger' : 'bg-secondary') ?> rounded-pill" style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
                            <?= $letter ?>
                        </span>
                        <?= htmlspecialchars($d['question'][$optKey]) ?>
                        <?php if ($isCorrect): ?> <span class="text-success">← Đáp án đúng</span><?php endif; ?>
                        <?php if ($isChosen && !$isCorrect): ?> <span class="text-danger">← Bạn chọn</span><?php endif; ?>
                    </div>
                <?php endforeach; ?>

                <?php if (empty($d['chosen'])): ?>
                    <p class="text-muted small mt-1 mb-0">⚠️ Bạn chưa trả lời câu này</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <?php endforeach; ?>

    <!-- Actions -->
    <div class="d-flex gap-3 justify-content-center mt-4 mb-5 flex-wrap">
        <a href="?page=quiz-show&id=<?= $quiz['id'] ?>" class="btn btn-outline-primary px-4 rounded-pill">
            🔄 Làm lại
        </a>
        <a href="?page=quiz&course_id=<?= $quiz['course_id'] ?>" class="btn btn-primary px-4 rounded-pill">
            ← Về danh sách Quiz
        </a>
    </div>

</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>
