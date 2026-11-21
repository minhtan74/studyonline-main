import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationService } from '../services/recommendationService';
import { progressService } from '../services/progressService';
import { useToast } from './useToast';
import { buildStudyRecommendations } from '../utils/studyRecommendations';

export function useStudyRecommendations(includeProgress = false) {
  const [state, setState] = useState({ loading: true, error: '', data: null, progress: [], progressError: false });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setState({ loading: true, error: '', data: null, progress: [], progressError: false });
    (async () => {
      try {
        const [rec, progress] = await Promise.all([
          recommendationService.get(null, { signal: controller.signal }),
          includeProgress ? progressService.getProgress({ signal: controller.signal }).catch(() => ({ ok: false })) : Promise.resolve(null),
        ]);
        if (!active) return;
        if (!rec.ok || !rec.data?.success || !rec.data?.data?.current) {
          setState({ loading: false, error: rec.data?.message || 'Không tải được gợi ý học tập. Vui lòng thử lại.', data: null, progress: [] }); return;
        }
        setState({ loading: false, error: '', data: buildStudyRecommendations(rec.data.data.current),
          progress: progress?.ok ? progress.data?.data?.courses || [] : [], progressError: includeProgress && !progress?.ok });
      } catch {
        if (active) setState({ loading: false, error: 'Không thể kết nối để tải gợi ý học tập.', data: null, progress: [] });
      }
    })();
    return () => { active = false; controller.abort(); };
  }, [includeProgress, version]);
  // Lời giải AI giờ tự sinh & cache ở GET (server) -> không còn nút "Cập nhật"; chỉ cần tải lại danh sách
  return { ...state, reload: () => setVersion(n => n + 1) };
}

export function useStudyAction() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(null);
  const active = useRef(true);
  const pending = useRef(null);
  useEffect(() => { active.current = true; return () => { active.current = false; pending.current?.abort(); }; }, []);
  const openStudy = useCallback(async (event, row) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (pending.current) return;
    const controller = new AbortController(); pending.current = controller; setBusy(row.key);
    try {
      const res = await recommendationService.startKnowledgeStudy(row.evidence, { signal: controller.signal, timeout: 10000 });
      if (!active.current) return;
      if (!res.ok) showToast('Chưa ghi được mốc ôn tập. Bạn vẫn có thể mở bài học.', 'info');
      navigate(row.url);
    } catch {
      if (active.current) navigate(row.url);
    } finally {
      pending.current = null;
      if (active.current) setBusy(null);
    }
  }, [navigate, showToast]);
  return { busy, openStudy };
}
