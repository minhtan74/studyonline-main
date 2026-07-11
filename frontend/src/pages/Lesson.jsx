import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { chapterService } from '../services/chapterService';
import { lessonService } from '../services/lessonService';
import { progressService } from '../services/progressService';

/** Tương đương _legacy/pages/lesson.html (logic inline trong file đó, lessons.js là dead code) */
export default function Lesson() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [course, setCourse] = useState(null);
  const [chaptersWithLessons, setChaptersWithLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [prevLesson, setPrevLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('desc');
  const [markingDone, setMarkingDone] = useState(false);

  const videoRef = useRef(null);
  const lastSavedSecRef = useRef(0);

  useEffect(() => {
    if (!lessonId) {
      navigate('/student/my-courses', { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErrorMsg(null);
    setActiveTab('desc');
    lastSavedSecRef.current = 0;

    (async () => {
      const id = Number(lessonId);

      // 1. Bài học
      const res = await lessonService.getLesson(id);
      if (!res?.ok || !res.data?.data) {
        if (!cancelled) {
          setErrorMsg('Không tìm thấy bài học hoặc có lỗi xảy ra. Vui lòng kiểm tra lại.');
          setLoading(false);
        }
        return;
      }
      const lessonData = res.data.data;

      // 2. Chương
      const chapterRes = await chapterService.getChapter(lessonData.chapter_id);
      const currentChapter = chapterRes?.data?.data;
      if (!currentChapter) {
        if (!cancelled) {
          setErrorMsg('Không tìm thấy thông tin chương học.');
          setLoading(false);
        }
        return;
      }

      // 3. Khóa học
      const courseRes = await courseService.getCourse(currentChapter.course_id);
      const courseData = courseRes?.data?.data;
      if (!courseData) {
        if (!cancelled) {
          setErrorMsg('Không tìm thấy thông tin khóa học.');
          setLoading(false);
        }
        return;
      }

      // 5. Chương + bài học
      const chaptersRes = await chapterService.getChapters(currentChapter.course_id);
      const chaptersList = chaptersRes?.data?.data || [];
      const chaptersFull = await Promise.all(
        chaptersList.map(async (chap) => {
          const lessonsRes = await lessonService.getLessons(chap.id);
          return { ...chap, lessons: lessonsRes?.data?.data || [] };
        }),
      );

      // 6. Tiến độ hiện có
      const progressRes = await progressService.getProgressByCourse(currentChapter.course_id);
      const doneSet = new Set();
      if (progressRes?.ok && Array.isArray(progressRes.data?.data)) {
        progressRes.data.data.forEach((lid) => doneSet.add(lid));
      }

      // 7. Prev / next
      const allLessons = chaptersFull.flatMap((chap) => chap.lessons);
      const currentIdx = allLessons.findIndex((l) => l.id === lessonData.id);
      const prev = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
      const next = currentIdx >= 0 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

      if (cancelled) return;

      document.title = `${lessonData.title} — StudyOnline`;
      setLesson(lessonData);
      setChapter(currentChapter);
      setCourse(courseData);
      setChaptersWithLessons(chaptersFull);
      setCompletedIds(doneSet);
      setPrevLesson(prev);
      setNextLesson(next);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [lessonId, navigate]);

  // Scroll sidebar active item vào view
  useEffect(() => {
    if (!loading && lesson) {
      const t = setTimeout(() => {
        document.querySelector('.active-sidebar-item')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [loading, lesson]);

  async function saveProgress(watchedSec, isCompleted) {
    if (!lesson) return;
    await progressService.updateProgress(lesson.id, Math.floor(watchedSec), isCompleted ? 1 : 0);
  }

  function handleTimeUpdate() {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const sec = Math.floor(videoEl.currentTime);
    if (sec - lastSavedSecRef.current >= 10) {
      lastSavedSecRef.current = sec;
      saveProgress(sec, false);
    }
  }

  async function handleEnded() {
    const videoEl = videoRef.current;
    await saveProgress(videoEl?.duration || 0, true);
    setCompletedIds((prev) => new Set(prev).add(lesson.id));
  }

  async function markDone() {
    setMarkingDone(true);
    const videoEl = videoRef.current;
    const watchedSec = videoEl ? Math.floor(videoEl.currentTime) : 0;
    await saveProgress(watchedSec, true);
    setCompletedIds((prev) => new Set(prev).add(lesson.id));
    setMarkingDone(false);
  }

  if (loading) {
    return (
      <main className="s-main">
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0' }}>
          <div className="spinner mb-4"></div>
          <p style={{ fontSize: '0.95rem', color: 'var(--s-text-muted)', fontWeight: 500 }}>
            Đang tải nội dung bài học...
          </p>
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="s-main">
        <div className="alert alert-danger" role="alert">
          ❌ {errorMsg}
        </div>
      </main>
    );
  }

  const totalCount = chaptersWithLessons.reduce((sum, c) => sum + c.lessons.length, 0);
  const doneCount = completedIds.size;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const isCompleted = completedIds.has(lesson.id);

  return (
    <main className="s-main">
      {/* Breadcrumb */}
      <nav className="q-breadcrumb" aria-label="Breadcrumb">
        <Link to="/student/dashboard">Dashboard</Link>
        <span className="q-breadcrumb-separator">›</span>
        <Link to="/student/my-courses">Khóa học của tôi</Link>
        <span className="q-breadcrumb-separator">›</span>
        <Link to={`/chapters?course_id=${course.id}`}>{course.title}</Link>
        <span className="q-breadcrumb-separator">›</span>
        <span>{chapter.chapter_name}</span>
        <span className="q-breadcrumb-separator">›</span>
        <span className="q-breadcrumb-current">{lesson.title}</span>
      </nav>

      <div id="lessonWorkspace" className="l-workspace">
        {/* Main Column */}
        <div className="l-main-col">
          {/* Video / Placeholder */}
          <div className="l-video-container">
            {lesson.video_url ? (
              <video
                id="lessonVideo"
                ref={videoRef}
                controls
                src={`/studyonline/frontend/uploads/videos/${lesson.video_url}`}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
              >
                Trình duyệt của bạn không hỗ trợ phát video.
              </video>
            ) : (
              <div className="l-video-placeholder">
                <span className="icon">📄</span>
                <p>Bài học này không có video</p>
                <span>Hãy đọc mô tả và tải tài liệu đính kèm bên dưới.</span>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="s-card s-card-body">
            <div>
              <div
                className="lesson-tags"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}
              >
                <span className={`s-badge ${lesson.video_url ? 's-badge-blue' : 's-badge-warn'}`}>
                  {lesson.video_url ? '🎬 Bài học Video' : '📎 Bài học Văn bản'}
                </span>
                <span
                  className="s-badge"
                  style={{ background: 'var(--s-surface-2)', color: 'var(--s-text-muted)', border: 'none' }}
                >
                  {chapter.chapter_name}
                </span>
                {isCompleted && (
                  <span id="completedBadge" className="s-badge s-badge-green">
                    ✅ Đã hoàn thành
                  </span>
                )}
              </div>
              <h1 className="q-title" style={{ margin: '0.5rem 0 1.5rem 0' }}>
                {lesson.title}
              </h1>
            </div>

            {/* Tabs */}
            <div className="l-tabs-bar">
              <button
                id="tabDescBtn"
                onClick={() => setActiveTab('desc')}
                className={`l-tab-btn${activeTab === 'desc' ? ' active' : ''}`}
              >
                Mô tả bài học
              </button>
              {lesson.document_url && (
                <button
                  id="tabDocBtn"
                  onClick={() => setActiveTab('doc')}
                  className={`l-tab-btn${activeTab === 'doc' ? ' active' : ''}`}
                >
                  Tài liệu đính kèm
                </button>
              )}
            </div>

            {/* Tab Panels */}
            <div style={{ marginTop: '1.25rem' }}>
              <div
                id="panelDesc"
                className={`l-tab-panel whitespace-pre-line${activeTab !== 'desc' ? ' hidden' : ''}`}
              >
                {lesson.description || <p className="text-slate-400 italic">Bài học này chưa có phần mô tả.</p>}
              </div>
              {lesson.document_url && (
                <div id="panelDoc" className={`l-tab-panel${activeTab !== 'doc' ? ' hidden' : ''}`}>
                  <div className="l-doc-download">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📎</span>
                      <div style={{ minWidth: 0 }}>
                        <p
                          className="truncate"
                          style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--s-text)', margin: 0 }}
                        >
                          {lesson.document_url}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--s-text-muted)', margin: '0.15rem 0 0 0' }}>
                          Tài liệu học tập đính kèm
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/studyonline/frontend/uploads/documents/${lesson.document_url}`}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="s-btn s-btn-primary s-btn-sm"
                    >
                      📥 Tải xuống
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Nút đánh dấu hoàn thành */}
            {!isCompleted && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--s-border)' }}>
                <button
                  id="markDoneBtn"
                  onClick={markDone}
                  disabled={markingDone}
                  className="s-btn s-btn-primary"
                  style={{ background: 'var(--s-success)', borderColor: 'var(--s-success)', color: '#fff' }}
                >
                  {markingDone ? '⏳ Đang lưu...' : '✅ Đánh dấu hoàn thành bài học'}
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="l-nav-row">
            {prevLesson ? (
              <Link to={`/lesson?id=${prevLesson.id}`} className="l-nav-btn l-nav-btn-prev">
                <span>←</span>
                <div className="truncate" style={{ textAlign: 'left' }}>
                  <p
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--s-text-muted)',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    Bài trước
                  </p>
                  <p className="truncate" style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0.15rem 0 0 0' }}>
                    {prevLesson.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div style={{ flex: 1 }}></div>
            )}

            {nextLesson ? (
              <Link to={`/lesson?id=${nextLesson.id}`} className="l-nav-btn l-nav-btn-next">
                <div className="truncate" style={{ textAlign: 'left' }}>
                  <p
                    style={{
                      fontSize: '0.65rem',
                      color: 'rgba(255,255,255,0.7)',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    Bài tiếp theo
                  </p>
                  <p
                    className="truncate"
                    style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0.15rem 0 0 0', color: '#fff' }}
                  >
                    {nextLesson.title}
                  </p>
                </div>
                <span>→</span>
              </Link>
            ) : (
              <div style={{ flex: 1 }}></div>
            )}
          </div>
        </div>

        {/* Sidebar: Curriculum */}
        <div className="l-curriculum-card">
          <div className="l-curriculum-header">
            <p>Chương trình học</p>
            <h2>{course.title}</h2>
            <div className="l-progress-info">
              <span>{totalCount} bài học</span>
              <span id="progressPct" style={{ color: 'var(--s-primary)' }}>
                {pct}% Hoàn thành
              </span>
            </div>
            <div className="l-progress-bar-wrap">
              <div className="l-progress-bar-fill" id="progressBar" style={{ width: `${pct}%` }}></div>
            </div>
          </div>

          <div className="l-chapters-list custom-scrollbar">
            {chaptersWithLessons.map((chap, chapIdx) => (
              <div key={chap.id} className="l-chapter-item">
                <div className="l-chapter-title-row">
                  <span
                    className="truncate"
                    style={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: 'var(--s-text)',
                      cursor: 'default',
                      lineHeight: 1.4,
                    }}
                  >
                    {chapIdx + 1}. {chap.chapter_name}
                  </span>
                  <span
                    className="s-badge"
                    style={{
                      background: 'var(--s-surface-2)',
                      color: 'var(--s-text-muted)',
                      border: 'none',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {chap.lessons.length} bài
                  </span>
                </div>
                <div className="l-lessons-sublist">
                  {chap.lessons.map((l) => {
                    const isActive = l.id === lesson.id;
                    const isDone = completedIds.has(l.id);
                    const icon = isDone ? '✅' : l.video_url ? '🎬' : '📎';
                    return (
                      <Link
                        key={l.id}
                        to={`/lesson?id=${l.id}`}
                        data-lesson-id={l.id}
                        className={`l-lesson-link${isActive ? ' active active-sidebar-item' : ''}${isDone ? ' lesson-done' : ''}`}
                      >
                        <span className="lesson-icon" style={{ flexShrink: 0, fontSize: '0.9rem' }}>
                          {icon}
                        </span>
                        <span className="truncate" style={{ flexGrow: 1 }}>
                          {l.title}
                        </span>
                        {isActive && (
                          <span
                            className="s-badge s-badge-blue"
                            style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', flexShrink: 0 }}
                          >
                            Đang học
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
