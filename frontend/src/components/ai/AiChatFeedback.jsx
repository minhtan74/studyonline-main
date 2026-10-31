export default function AiChatFeedback({ sending, feedback, onRetry, onEdit }) {
  if (sending) {
    return (
      <div className="ai-typing" role="status" aria-label="Đang chờ câu trả lời">
        <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
      </div>
    );
  }
  if (!feedback) return null;
  return (
    <div className={`ai-chat-feedback${feedback.kind === 'stopped' ? '' : ' ai-chat-failed'}`}
      role={feedback.kind === 'stopped' ? 'status' : 'alert'}>
      <strong>{feedback.kind === 'stopped' ? 'Đã dừng chờ' : feedback.kind === 'timeout' ? 'AI phản hồi quá lâu' : 'Chưa nhận được câu trả lời'}</strong>
      <p>{feedback.message}</p>
      <blockquote>{feedback.question}</blockquote>
      {feedback.mayFinish && <p className="ai-chat-feedback-note">AI có thể vẫn hoàn tất và lưu câu trả lời vào lịch sử. Bạn có thể kiểm tra lịch sử trước khi gửi lại.</p>}
      <div className="ai-chat-feedback-actions">
        {feedback.retryable && <button type="button" className="s-btn s-btn-primary s-btn-sm" onClick={onRetry}>Thử lại</button>}
        <button type="button" className="s-btn s-btn-outline s-btn-sm" onClick={() => onEdit(feedback.question)}>Sửa câu hỏi</button>
      </div>
    </div>
  );
}

export function AiReplyLabel({ message }) {
  if (message.response_status === 'error') return <span className="ai-reply-error-label">Thông báo lỗi — chưa có câu trả lời</span>;
  if (message.response_status === 'fallback') return <span className="ai-clarification-label">Trích đoạn tài liệu dự phòng — AI đang gián đoạn</span>;
  if (message.needs_clarification) return <span className="ai-clarification-label">AI cần thêm thông tin</span>;
  return null;
}
