import { Link } from 'react-router-dom';

export default function StudyKnowledgeTopics({ evidence }) {
  const topics = evidence?.wrong_topics || evidence?.review_topics || [];
  const unclassified = evidence?.unclassified_wrong_answers || 0;
  const lessonId = evidence?.id;

  return (
    <div className="study-knowledge-topics">
      {evidence?.ai_reason && (
        <div className="study-ai-reason">
          <p><span className="study-ai-reason-tag" title="Lời giải AI" aria-label="Lời giải AI">🤖</span>{evidence.ai_reason}</p>
          {evidence.ai_reason_source?.document && (
            <p className="study-ai-reason-src">
              <span>📄 {evidence.ai_reason_source.document}</span>
              {evidence.ai_reason_source.page && (
                lessonId && evidence.kind === 'lesson' ? (
                  <Link
                    to={`/lesson?id=${lessonId}&page=${evidence.ai_reason_source.page}`}
                    className="study-ai-reason-jump"
                    title="Mở đúng trang tài liệu trong bài học"
                  >
                    Mở trang {evidence.ai_reason_source.page} <span aria-hidden="true">→</span>
                  </Link>
                ) : <span>· trang {evidence.ai_reason_source.page}</span>
              )}
            </p>
          )}
        </div>
      )}
      {topics.length ? (
        <>
          <strong>Bạn nên xem lại</strong>
          <ul>
            {topics.map((topic) => (
              <li key={topic.title} style={{ marginBottom: '0.45rem' }}>
                {/* Bấm vào tên chủ đề để mở thẳng bài học, nhắm đúng chủ đề đó */}
                {lessonId ? (
                  <Link
                    to={`/lesson?id=${lessonId}&topic=${encodeURIComponent(topic.title)}`}
                    className="study-practice-link"
                    title={`Mở bài học và nhắm vào chủ đề ${topic.title}`}
                  >
                    <strong>{topic.title}</strong>
                  </Link>
                ) : (
                  <strong>{topic.title}</strong>
                )}
                : sai {topic.wrong ?? topic.answered - topic.correct}/{topic.answered} câu khác nhau.
                {topic.sufficient_data
                  ? topic.needs_review
                    ? ' Nên ôn lại phần kiến thức này.'
                    : ' Xem lại các câu sai; tỷ lệ đúng của chủ đề vẫn đạt ngưỡng.'
                  : ' Cần kiểm tra thêm; chưa đủ dữ liệu để kết luận.'}
                {topic.reconstructed && ' Phân loại của dữ liệu cũ được khôi phục.'}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Chưa xác định được phần kiến thức cụ thể từ các câu trả lời sai.</p>
      )}

      {unclassified > 0 && (
        <p>
          Có {unclassified} câu trả lời sai chưa được gắn chủ đề. Hãy xem lại các câu này trong kết quả Quiz; hệ thống chưa suy ra phần kiến thức cụ thể.
        </p>
      )}
    </div>
  );
}
