import TopicPicker from './TopicPicker.jsx';
import KnowledgePicker from './KnowledgePicker.jsx';
import { DIFFICULTY_LEVELS } from '../common/DifficultyBar.jsx';
import RichText, { hasRichTokens } from '../common/RichText.jsx';
import { useLayoutEffect, useRef } from 'react';
import '../../assets/css/draft-question.css';

function GrowingTextarea({ value, ...props }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const element = ref.current;
    const resize = () => { element.style.height = 'auto'; element.style.height = `${element.scrollHeight + 2}px`; };
    resize();
    const observer = new ResizeObserver(() => { if (element.clientWidth !== observer.lastWidth) { observer.lastWidth = element.clientWidth; resize(); } });
    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);
  return <textarea {...props} value={value} ref={ref} />;
}

// Ký hiệu 4 phương án
const LETTERS = ['A', 'B', 'C', 'D'];

/**
 * Thẻ sửa 1 câu hỏi trong bản nháp (AI sinh hoặc nhập từ Word) trước khi duyệt & lưu:
 * nội dung, 4 phương án, đáp án đúng, độ khó, giải thích; nút bỏ câu.
 * q: { question, options: {A..D}, correct_answer, explanation, difficulty, objectives?, evidence?, grounded?, verify?, verified? }
 * meta: dòng thông tin phụ cạnh số câu (chương / chủ đề / nguồn đáp án...)
 * onPatch(field, value) · onPatchOption(letter, value) · onRemove()
 */
export default function DraftQuestionCard({ q, index, meta, courseId, lockedChapterId, lockedLessonId, onPatch, onPatchOption, onRemove, disabled = false }) {
  // AI tự giải lại ra đáp án khác đáp án đang đánh (và chưa bấm "Giữ") -> cần xem lại
  const needsReview = Boolean(q.verify) && q.verify.answer !== q.correct_answer && !q.verify_dismissed;

  return (
    <fieldset disabled={disabled} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <div className="tq-question-card draft-question-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="tq-question-num" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            Câu {index + 1}
            {meta ? ` · ${meta}` : ''} ·
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
              value={q.difficulty || ''}
              onChange={(e) => onPatch('difficulty', e.target.value || null)}
            >
              {/* Đề nhập từ Word có thể chưa ghi độ khó */}
              {!q.difficulty && <option value="">Chưa đặt độ khó</option>}
              {DIFFICULTY_LEVELS.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger,#DC2626)' }} onClick={onRemove}>✕ Xóa</button>
        </div>
        {q.difficulty_review?.matches_requested === false && (
          <div style={{ marginTop: '.35rem', fontSize: '.78rem', color: 'var(--danger,#DC2626)' }}>
            Cần xem lại độ khó: AI thẩm định đề xuất mức{' '}
            {DIFFICULTY_LEVELS.find((d) => d.key === q.difficulty_review.assessed)?.label}.
            {' '}{q.difficulty_review.reason}
          </div>
        )}
        {/* Các mục tiêu bài học câu hỏi này liên quan (1 hoặc vài; AI gắn khi tài liệu có phần "Mục tiêu bài học") */}
        <details className="draft-question-classification">
          <summary>Phân loại chương, bài và chủ đề</summary>
          <div>
          <KnowledgePicker courseId={courseId} chapterId={q.knowledge_chapter_id} lessonId={q.knowledge_lesson_id}
            lockedChapterId={lockedChapterId} lockedLessonId={lockedLessonId}
            onChange={(scope) => Object.entries(scope).forEach(([field, value]) => onPatch(field, value))} />
          <TopicPicker courseId={courseId} topicId={q.topic_id} topicName={q.topic || ''}
            onSelect={(id, name) => { onPatch('topic_id', id); onPatch('topic', name); }} />
          </div>
        </details>
        {q.objectives?.length > 0 && (
          <div style={{ marginTop: '.35rem', fontSize: '.78rem', color: 'var(--primary,#2563EB)' }}>
            🎯 Mục tiêu: {q.objectives.join(' · ')}
          </div>
        )}
        <label className="draft-field-label" htmlFor={`draft-question-${index}`}>Nội dung câu hỏi</label>
        <GrowingTextarea
          id={`draft-question-${index}`}
          className="form-control draft-question-text"
          rows={3}
          value={q.question}
          onChange={(e) => onPatch('question', e.target.value)}
        />
        {/* Có ảnh / công thức: hiện bản xem trước như học viên sẽ thấy */}
        {[q.question, ...Object.values(q.options || {})].some(hasRichTokens) && (
          <div
            style={{
              margin: '0 0 .6rem', padding: '.6rem .75rem', borderRadius: 8, fontSize: '.9rem',
              background: 'var(--primary-light, #eff6ff)', whiteSpace: 'pre-wrap',
            }}
          >
            <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '.25rem' }}>
              XEM TRƯỚC
            </div>
            <RichText text={q.question} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '.35rem', marginTop: '.4rem' }}>
              {LETTERS.filter((L) => q.options[L]).map((L) => (
                <div key={L} style={{ color: q.correct_answer === L ? 'var(--success,#059669)' : undefined }}>
                  <strong>{L}.</strong> <RichText text={q.options[L]} imgMaxHeight={120} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="draft-options-heading"><strong>Các phương án trả lời</strong><span>Chọn ô tròn để đặt đáp án đúng</span></div>
        <div className="draft-options-grid">
          {LETTERS.map((L) => (
            <div
              key={L}
              className={`draft-option${q.correct_answer === L ? ' draft-option-correct' : ''}`}
            >
              <div className="draft-option-heading"><label className="draft-option-choice">
              {/* Phương án trống (đề Word chỉ có 2–3 phương án) thì không chọn làm đáp án được */}
              <input
                type="radio"
                name={`correct-${index}`}
                aria-label={`Chọn ${L} làm đáp án đúng cho câu ${index + 1}`}
                checked={q.correct_answer === L}
                disabled={!q.options[L]}
                onChange={() => onPatch('correct_answer', L)}
              />
              <strong>Phương án {L}</strong></label>{q.correct_answer === L && <span className="draft-correct-label">✓ Đáp án đúng</span>}</div>
              <GrowingTextarea
                className="form-control draft-option-text"
                rows={2}
                aria-label={`Nội dung phương án ${L} câu ${index + 1}`}
                placeholder={L === 'A' || L === 'B' ? '' : '(để trống nếu không dùng)'}
                value={q.options[L] || ''}
                onChange={(e) => onPatchOption(L, e.target.value)}
              />
            </div>
          ))}
        </div>
        <p className="draft-answer-summary">Đáp án đang chọn: <strong>{q.correct_answer}</strong></p>
        <label className="draft-field-label" htmlFor={`draft-explanation-${index}`}>Giải thích đáp án</label>
        <GrowingTextarea
          id={`draft-explanation-${index}`}
          className="form-control draft-explanation"
          rows={2}
          placeholder="Giải thích (tùy chọn)"
          value={q.explanation || ''}
          onChange={(e) => onPatch('explanation', e.target.value)}
        />
        {/* AI giải lại ra đáp án khác: hiện lý do, cho đổi nhanh hoặc giữ đáp án hiện tại */}
        {needsReview && (
          <div className="alert alert-warning" style={{ marginTop: '.5rem', marginBottom: 0, fontSize: '.82rem' }}>
            ⚠️ AI tự giải lại chọn <strong>{q.verify.answer}</strong>, khác đáp án đang đánh{' '}
            <strong>{q.correct_answer}</strong>.
            {q.verify.reason && <> Lý do: {q.verify.reason}</>}
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.4rem' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => onPatch('correct_answer', q.verify.answer)}>
                Đổi sang {q.verify.answer}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onPatch('verify_dismissed', true)}>
                Giữ {q.correct_answer}
              </button>
            </div>
          </div>
        )}
        {/* Căn cứ trong tài liệu AI trích cho đáp án đúng; không khớp tài liệu gốc -> cảnh báo */}
        {q.evidence && (
          <div
            style={{
              marginTop: '.35rem', fontSize: '.75rem',
              color: q.grounded === false ? 'var(--danger,#DC2626)' : 'var(--text-muted,#64748b)',
            }}
          >
            {q.grounded === false ? '📄⚠️ Không tìm thấy căn cứ này trong tài liệu — kiểm tra lại câu hỏi: ' : '📄 Căn cứ: '}
            <em>“{q.evidence}”</em>
          </div>
        )}
        {q.grounded === false && !q.evidence && (
          <div style={{ marginTop: '.35rem', fontSize: '.75rem', color: 'var(--danger,#DC2626)' }}>
            📄⚠️ AI không trích được căn cứ trong tài liệu — kiểm tra lại câu hỏi
          </div>
        )}
        {q.verified && q.verified === q.correct_answer && (
          <div style={{ marginTop: '.35rem', fontSize: '.75rem', color: 'var(--success,#059669)' }}>✓ AI giải lại khớp đáp án</div>
        )}
      </div>
    </fieldset>
  );
}
