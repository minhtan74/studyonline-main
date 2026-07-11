<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>

<style>
.quiz-card {
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,.08);
    transition: transform .2s, box-shadow .2s;
    overflow: hidden;
}
.quiz-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0,0,0,.14);
}
.quiz-card .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 1.25rem 1.5rem;
    border-bottom: none;
}
.quiz-card .card-body { padding: 1.25rem 1.5rem; }
.quiz-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,.2);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: .8rem;
}
.btn-start {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none; color: #fff; border-radius: 8px;
    padding: 8px 20px; font-weight: 600;
    transition: opacity .2s;
}
.btn-start:hover { opacity: .85; color: #fff; }
.page-hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff; border-radius: 16px; padding: 2rem;
    margin-bottom: 2rem;
}
</style>

<div class="container py-4">

    <!-- Hero -->
    <div class="page-hero d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
            <h1 class="fw-bold mb-1">📝 Danh sách Quiz</h1>
            <p class="mb-0 opacity-75">
                <?= $courseId ? 'Quiz của khóa học đã chọn' : 'Tất cả bài kiểm tra trong hệ thống' ?>
            </p>
        </div>
        <a href="?page=create-quiz<?= $courseId ? '&course_id='.$courseId : '' ?>"
           class="btn btn-light fw-bold px-4 py-2 rounded-pill">
            + Tạo Quiz mới
        </a>
    </div>

    <?php if (empty($quizzes)): ?>
        <div class="text-center py-5">
            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" width="120" class="mb-3 opacity-50" alt="Chưa có quiz">
            <p class="text-muted fs-5">Chưa có quiz nào<?= $courseId ? ' cho khóa học này' : '' ?>.</p>
            <a href="?page=create-quiz<?= $courseId ? '&course_id='.$courseId : '' ?>"
               class="btn-start btn mt-2">Tạo quiz đầu tiên</a>
        </div>
    <?php else: ?>
        <div class="row g-4">
            <?php foreach ($quizzes as $quiz): ?>
            <div class="col-md-6 col-lg-4">
                <div class="card quiz-card h-100">
                    <div class="card-header">
                        <h5 class="mb-1 fw-bold"><?= htmlspecialchars($quiz['title']) ?></h5>
                        <?php if (!empty($quiz['course_title'])): ?>
                            <span class="quiz-badge">
                                🎓 <?= htmlspecialchars($quiz['course_title']) ?>
                            </span>
                        <?php endif; ?>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <p class="text-muted small flex-grow-1">
                            <?= htmlspecialchars($quiz['description'] ?? 'Không có mô tả.') ?>
                        </p>

                        <div class="d-flex align-items-center gap-2 mb-3">
                            <span class="badge bg-secondary rounded-pill">
                                ❓ <?= $quiz['question_count'] ?> câu hỏi
                            </span>
                        </div>

                        <div class="d-flex gap-2 flex-wrap">
                            <?php if ($quiz['question_count'] > 0): ?>
                                <a href="?page=quiz-show&id=<?= $quiz['id'] ?>"
                                   class="btn-start btn btn-sm flex-grow-1">
                                    ▶ Làm bài
                                </a>
                            <?php else: ?>
                                <span class="btn btn-sm btn-secondary flex-grow-1 disabled">Chưa có câu hỏi</span>
                            <?php endif; ?>
                            <a href="?page=quiz-questions&quiz_id=<?= $quiz['id'] ?>"
                               class="btn btn-sm btn-outline-secondary">
                                📋 Câu hỏi
                            </a>
                            <a href="?page=edit-quiz&id=<?= $quiz['id'] ?>"
                               class="btn btn-sm btn-outline-warning">✏️</a>
                            <a href="?page=delete-quiz&id=<?= $quiz['id'] ?><?= $courseId ? '&course_id='.$courseId : '' ?>"
                               class="btn btn-sm btn-outline-danger"
                               onclick="return confirm('Xóa quiz này sẽ xóa toàn bộ câu hỏi. Tiếp tục?')">🗑️</a>
                        </div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>