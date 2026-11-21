"""Lớp AI diễn giải TỪNG gợi ý (mô hình hybrid).

Rule-based quyết định YẾU CHỖ NÀO (số liệu, chủ đề sai). Lớp này sinh cho MỖI phần
kiến thức yếu một lời giải ngắn "vì sao nên ôn + nên tập trung vào đâu", bám đúng số
liệu đưa vào, không bịa tên bài/chủ đề/con số. Kết quả gắn vào từng unit (unit['ai_reason']).

Offline (không khoá LLM) hoặc LLM lỗi -> không gắn gì; "Vì sao" vẫn hiển thị phần rule-based.
"""
from __future__ import annotations

import hashlib
import json
import logging
import re

from sqlalchemy.orm import Session

from app.ai import model_manager
from app.ai.rag import retriever
from app.core.database import q_all

logger = logging.getLogger("rag")

# Ràng buộc chống bịa: AI chỉ diễn giải, bám số liệu + đoạn TÀI LIỆU được cung cấp (RAG)
_SYSTEM = (
    "Bạn là cố vấn học tập của nền tảng StudyOnline. Với MỖI phần kiến thức yếu trong danh sách, "
    "hãy viết 1-2 câu NGẮN bằng tiếng Việt giải thích VÌ SAO học viên nên ôn phần này và NÊN TẬP TRUNG "
    "vào đâu / cách ôn để hạn chế học vẹt. "
    "Nếu mục có đoạn TÀI LIỆU, hãy bám đúng nội dung đoạn đó và chỉ cho học viên phần cần xem (có thể nhắc tên tài liệu/trang). "
    "Nếu mục có phần CÂU SAI, hãy dựa vào đáp án đúng và đáp án học viên đã chọn để chỉ ra CẶP KHÁI NIỆM học viên "
    "hay nhầm và cách phân biệt; chỉ nói về các câu được cung cấp, không suy diễn câu khác. "
    "CHỈ dùng số liệu, tên chủ đề, nội dung tài liệu và câu sai đã cho; TUYỆT ĐỐI không thêm con số, tên bài hay chủ đề "
    "không có trong dữ liệu; không hứa hẹn kết quả. "
    "Trả về DUY NHẤT một JSON array gồm đúng N chuỗi, theo đúng thứ tự danh sách, không kèm giải thích nào khác."
)

# Khoá nhận diện một đơn vị kiến thức (khớp key ở frontend: course:kind:id)
def unit_key(u: dict) -> str:
    return f"{u.get('course_id')}:{u.get('kind')}:{u.get('id')}"


# Chữ ký DỮ LIỆU của một phần yếu: đổi khi điểm / chủ đề sai / lượt quiz mới thay đổi.
# Dùng để biết lời giải AI đã lưu còn khớp dữ liệu hiện tại hay cần sinh lại.
def _signature(u: dict) -> str:
    subs = u.get("wrong_topics") or u.get("review_topics") or []
    parts = [str(u.get("correct")), str(u.get("answered")), str(u.get("latest_result_id"))]
    parts += sorted(f"{t.get('title')}:{t.get('wrong')}" for t in subs)
    return hashlib.md5("|".join(parts).encode("utf-8")).hexdigest()[:12]


# Các đơn vị sẽ hiển thị (cần chú ý): yếu đã đủ dữ liệu, hoặc chưa đủ dữ liệu nhưng có câu sai
def _units_needing_reason(rec: dict) -> list[dict]:
    units = ((rec.get("based_on") or {}).get("knowledge") or {}).get("units") or []
    picked = [u for u in units if u.get("needs_review")
              or (not u.get("sufficient_data") and (u.get("correct") or 0) < (u.get("answered") or 0))]
    picked.sort(key=lambda u: (not u.get("needs_review"), u.get("avg_score", 0)))
    return picked[:8]  # chặn số lượng để 1 lần gọi LLM đủ rẻ


# Tách JSON array chuỗi từ output LLM (chịu được ```json ... ``` và text thừa)
def _parse_list(out: str, n: int) -> list[str]:
    s = (out or "").strip()
    s = re.sub(r"^```(?:json)?|```$", "", s, flags=re.MULTILINE).strip()
    i, j = s.find("["), s.rfind("]")
    if i == -1 or j == -1 or j < i:
        return []
    try:
        arr = json.loads(s[i:j + 1])
    except ValueError:
        return []
    if not isinstance(arr, list):
        return []
    return [(x.strip() if isinstance(x, str) else "") for x in arr][:n]


# Truy hồi 1 đoạn tài liệu liên quan nhất cho một phần kiến thức yếu (RAG); None nếu khóa chưa có tài liệu
def _retrieve(db: Session, unit: dict) -> dict | None:
    subs = unit.get("wrong_topics") or unit.get("review_topics") or []
    query = " ".join([str(unit.get("title") or "")] + [str(t.get("title") or "") for t in subs[:3]]).strip()
    if not query:
        return None
    try:
        chunks = retriever.retrieve(
            db, query, course_id=unit.get("course_id"),
            lesson_id=unit.get("id") if unit.get("kind") == "lesson" else None, k=2,
        )
    except Exception as e:  # noqa: BLE001 — khóa chưa nạp tài liệu/embedding -> bỏ qua RAG
        logger.warning("study_advisor retrieve error: %s", type(e).__name__)
        return None
    return chunks[0] if chunks else None


# Lấy tối đa `limit` câu học viên làm SAI của một phần kiến thức yếu (đề + đáp án đúng + đáp án đã chọn)
# để AI chỉ ra cặp khái niệm hay nhầm. Chỉ đọc; thiếu dữ liệu/không còn nội dung -> trả [].
def _wrong_questions(db: Session, unit: dict, limit: int = 3) -> list[dict]:
    rids = [int(s["result_id"]) for s in (unit.get("sources") or []) if s.get("result_id")]
    if not rids:
        return []
    col = "knowledge_lesson_id" if unit.get("kind") == "lesson" else "knowledge_chapter_id"
    rid_list = ",".join(str(r) for r in rids)  # result_id là số nguyên nội bộ, ghép thẳng vào IN
    try:
        rows = q_all(db, f"""SELECT q.content, q.option_a, q.option_b, q.option_c, q.option_d,
                q.correct_answer, ra.chosen
            FROM result_answers ra JOIN questions q ON q.id = ra.question_id
            WHERE ra.result_id IN ({rid_list}) AND ra.is_correct = 0 AND ra.{col} = :uid
            ORDER BY ra.result_id DESC, ra.question_id""", uid=unit.get("id"))
    except Exception as e:  # noqa: BLE001 — không được làm hỏng luồng gợi ý
        logger.warning("study_advisor wrong_questions error: %s", type(e).__name__)
        return []
    out, seen = [], set()
    for r in rows:
        content = (r.get("content") or "").strip()
        if not content or content in seen:
            continue
        seen.add(content)
        opts = {"A": r.get("option_a"), "B": r.get("option_b"), "C": r.get("option_c"), "D": r.get("option_d")}
        out.append(dict(content=content, options=opts,
                        correct=(r.get("correct_answer") or "").upper(),
                        chosen=(r.get("chosen") or "").upper()))
        if len(out) >= limit:
            break
    return out


# Gắn ai_reason (+ ai_reason_source) vào từng unit yếu (tại chỗ), có RAG. Trả về số lời giải đã gắn.
# Chỉ sinh cho phần CHƯA có lời giải (phần đã gắn từ cache được bỏ qua) -> tiết kiệm token.
def annotate(db: Session, rec: dict) -> int:
    if model_manager.active_provider() == "stub":
        return 0
    units = [u for u in _units_needing_reason(rec) if not u.get("ai_reason")][:6]  # có RAG nên chặn 6 để prompt gọn
    if not units:
        return 0
    lines, sources = [], []
    for idx, u in enumerate(units, 1):
        subs = u.get("wrong_topics") or u.get("review_topics") or []
        sub_txt = "; ".join(
            f"{t['title']} (sai {t.get('wrong', (t.get('answered', 0) - t.get('correct', 0)))}/{t.get('answered')})"
            for t in subs[:4]
        ) or "chưa rõ chủ đề con"
        kind = "Chương" if u.get("kind") == "chapter" else "Bài"
        block = (
            f"{idx}. {kind} \"{u.get('title')}\" (khóa {u.get('course_title', '')}): "
            f"đúng {u.get('correct')}/{u.get('answered')} = {u.get('avg_score')}%. Phần sai: {sub_txt}"
        )
        chunk = _retrieve(db, u)
        if chunk:
            loc = f" (trang {chunk['page']})" if chunk.get("page") else ""
            block += f"\n   TÀI LIỆU [{chunk['document_title']}{loc}]: {(chunk.get('content') or '')[:300]}"
            sources.append({"document": chunk["document_title"], "page": chunk.get("page")})
        else:
            sources.append(None)
        # Đưa chính các câu học viên làm sai (đề + đáp án đúng vs đã chọn) để AI chỉ ra cặp khái niệm hay nhầm
        wrongs = _wrong_questions(db, u)
        if wrongs:
            q_lines = []
            for w in wrongs:
                ca, ch = w["correct"], w["chosen"]
                ca_txt = (w["options"].get(ca) or "").strip()
                ch_txt = (w["options"].get(ch) or "").strip() if ch else ""
                chosen_part = f"{ch}: {ch_txt[:80]}" if ch else "(bỏ trống)"
                q_lines.append(f'   - Đề: "{w["content"][:160]}" | Đáp án đúng {ca}: {ca_txt[:80]} | Học viên chọn: {chosen_part}')
            block += "\n   CÂU SAI:\n" + "\n".join(q_lines)
        lines.append(block)
    user = (
        f"DANH SÁCH {len(units)} PHẦN KIẾN THỨC YẾU (số liệu rule-based + đoạn tài liệu truy hồi):\n"
        + "\n".join(lines)
        + f"\n\nTrả về JSON array gồm đúng {len(units)} chuỗi, mỗi chuỗi là lời giải cho mục cùng số thứ tự."
    )
    try:
        out = model_manager.generate(_SYSTEM, user, max_tokens=900, timeout=20)
    except Exception as e:  # noqa: BLE001 — không được làm hỏng luồng gợi ý
        logger.warning("study_advisor annotate error: %s", type(e).__name__)
        return 0
    if not out or out.startswith("[Lỗi gọi LLM"):
        return 0
    reasons = _parse_list(out, len(units))
    count = 0
    for u, r, src in zip(units, reasons, sources):
        if r:
            u["ai_reason"] = r
            if src:
                u["ai_reason_source"] = src
            count += 1
    return count


# Dựng map {unit_key: {ai_reason, ai_reason_source, sig}} từ 1 gợi ý đã có (dùng để merge lại khi tải trang).
# sig là chữ ký dữ liệu lúc sinh lời giải -> để sau còn đối chiếu xem có còn khớp dữ liệu hiện tại không.
def reason_map(rec: dict) -> dict[str, dict]:
    units = ((rec.get("based_on") or {}).get("knowledge") or {}).get("units") or []
    return {unit_key(u): {"ai_reason": u["ai_reason"], "ai_reason_source": u.get("ai_reason_source"),
                          "sig": _signature(u)}
            for u in units if u.get("ai_reason")}


# Gắn lại lời giải AI đã lưu từ lịch sử (mới nhất thắng) lên gợi ý hiện tại — KHÔNG gọi LLM.
# Chỉ gắn khi chữ ký dữ liệu còn khớp; dữ liệu đã đổi (quiz mới) -> bỏ qua để annotate sinh lại.
def apply_cached_reasons(current: dict, history: list[dict]) -> None:
    cached: dict[str, dict] = {}
    for h in history or []:  # history sắp mới nhất trước -> cái gặp đầu (mới nhất) được giữ
        for key, value in reason_map(h).items():
            cached.setdefault(key, value)
    units = ((current.get("based_on") or {}).get("knowledge") or {}).get("units") or []
    for u in units:
        if not u.get("ai_reason"):
            hit = cached.get(unit_key(u))
            if hit and hit.get("sig") == _signature(u):
                u["ai_reason"] = hit["ai_reason"]
                if hit.get("ai_reason_source"):
                    u["ai_reason_source"] = hit["ai_reason_source"]
