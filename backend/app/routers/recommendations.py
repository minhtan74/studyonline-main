"""/api/recommendations — PHASE 5 Rule-based Personalized Recommendation."""
from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy.orm import Session

from app.ai import recommendation as rec
from app.ai import study_advisor
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.responses import ok, ApiError
from ._common import can_access_course
from app.services import study_progress

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.post('/study')
def start_study(body:dict=Body(...),user=Depends(get_current_user),db=Depends(get_db)):
    if body.get('knowledge_kind'):
        try:
            course_id, unit_id = int(body.get('course_id') or 0), int(body.get('unit_id') or 0)
        except (ValueError, TypeError):
            raise ApiError('Phần kiến thức không hợp lệ.')
        return ok('Đã ghi nhận mốc trước khi ôn.', data=study_progress.start_knowledge(db, user['id'], course_id, body['knowledge_kind'], unit_id))
    try:
        topic_id=int(body.get('topic_id') or 0)
    except (ValueError,TypeError):
        raise ApiError('Chủ đề không hợp lệ.')
    return ok('Đã ghi nhận mốc trước khi ôn.',data=study_progress.start(db,user['id'],topic_id))


@router.get('/progress')
def progress(course_id: int | None = Query(default=None), user=Depends(get_current_user),db=Depends(get_db)):
    if course_id and not can_access_course(db, user, course_id):
        raise ApiError('Bạn cần đăng ký khóa học để xem lịch sử ôn tập của khóa này.', 403)
    return ok(data=study_progress.history(db,user['id'],course_id))


# GET /api/recommendations — gợi ý học tập hiện tại + 10 lần gợi ý đã lưu gần nhất
@router.get("")
def get_recommendations(
    course_id: int | None = Query(default=None),
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Gợi ý hiện tại (tính trực tiếp từ dữ liệu mới nhất) + lịch sử đã lưu."""
    if course_id and not can_access_course(db, user, course_id):
        raise ApiError('Bạn cần đăng ký khóa học để xem gợi ý của khóa này.', 403)
    current = rec.build(db, user["id"], course_id)
    history = rec.history(db, user["id"], 10)
    # Gắn lại lời giải AI đã lưu (chỉ khi dữ liệu còn khớp); phần nào mới/đổi điểm -> tự sinh 1 lần rồi lưu
    # để các lần tải trang sau dùng lại, không cần bấm nút thủ công. Dữ liệu không đổi -> không gọi LLM.
    study_advisor.apply_cached_reasons(current, history)
    if study_advisor.annotate(db, current):
        rec.save(db, user["id"], course_id, current)
    return ok(data={"current": current, "history": history})


# POST /api/recommendations/refresh — người học bấm "Cập nhật gợi ý"
@router.post("/refresh")
def refresh(
    body: dict = Body(default={}),
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Tính lại từ dữ liệu học tập mới nhất và LƯU lại (1 dòng lịch sử mới)."""
    course_id = body.get("course_id")
    # Tính lại gợi ý từ dữ liệu mới nhất rồi lưu vào lịch sử
    try:
        course_id = int(course_id) if course_id else None
    except (ValueError, TypeError):
        raise ApiError('Khóa học không hợp lệ.')
    if course_id and not can_access_course(db, user, course_id):
        raise ApiError('Bạn cần đăng ký khóa học để xem gợi ý của khóa này.', 403)
    current = rec.build(db, user["id"], course_id)
    # Lớp AI diễn giải TỪNG gợi ý (có RAG trỏ tài liệu): chỉ sinh khi bấm "Cập nhật"; offline/lỗi -> giữ phần rule-based
    study_advisor.annotate(db, current)
    saved = rec.save(db, user["id"], course_id, current)
    return ok("Đã cập nhật gợi ý học tập.", data=saved)
