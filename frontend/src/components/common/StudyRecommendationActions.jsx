import { Link } from 'react-router-dom';
import { studyPracticeAction } from '../../utils/studyRecommendations';

export default function StudyRecommendationActions({ row, busy, onStudy, compact = false }) {
  const uncertain = row.priority === 'check';
  const practice = studyPracticeAction(row);
  const review = <Link className={`study-action-btn ${uncertain ? 'study-action-secondary' : 'study-action-primary'}${compact ? ' study-compact-action' : ''}`}
    to={row.url} aria-label={`Ôn tập: ${row.title}`} aria-disabled={!!busy} onClick={event => onStudy(event, row)}>
    {!compact && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v15M3 4.5c3-1 6-.5 9 1.5 3-2 6-2.5 9-1.5v14c-3-1-6-.5-9 1.5-3-2-6-2.5-9-1.5z" /></svg>}
    <span>{busy === row.key ? 'Đang mở…' : 'Ôn tập'}</span>
  </Link>;
  const quiz = <Link className={`study-action-btn study-action-primary${compact ? ' study-compact-action' : ''}`} to={practice.url} aria-label={practice.ariaLabel}>
    {!compact && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 3h6v4H9zM9 12h6M9 16h4" /></svg>}
    <span>{practice.label}</span>
  </Link>;
  if (compact) return uncertain ? quiz : review;
  return <div className="study-suggestion-actions">{uncertain && quiz}{review}</div>;
}
