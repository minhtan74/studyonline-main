<?php if (!isset($lesson) || !$lesson): ?>
    <p class="text-danger">Không tìm thấy bài học.</p>
<?php else: ?>

<h2><?= htmlspecialchars($lesson['title']) ?></h2>

<p><?= nl2br(htmlspecialchars($lesson['description'] ?? '')) ?></p>

<?php if (!empty($lesson['video_url'])): ?>
    <video width="100%" controls class="mb-3">
        <source src="/studyonline/public/uploads/videos/<?= htmlspecialchars($lesson['video_url']) ?>">
        Trình duyệt không hỗ trợ video.
    </video>
<?php endif; ?>

<?php if (!empty($lesson['document_url'])): ?>
    <a href="/studyonline/public/uploads/documents/<?= htmlspecialchars($lesson['document_url']) ?>"
       target="_blank" class="btn btn-outline-primary">
        📄 Tải PDF
    </a>
<?php endif; ?>

<div class="mt-3">
    <a href="?page=lessons&chapter_id=<?= $lesson['chapter_id'] ?>" class="btn btn-secondary">
        ← Quay lại
    </a>
    <a href="?page=edit-lesson&id=<?= $lesson['id'] ?>" class="btn btn-warning">
        Sửa bài học
    </a>
</div>

<?php endif; ?>