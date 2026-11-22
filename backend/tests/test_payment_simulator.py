"""Chế độ thanh toán giả lập (PAYMENT_SIMULATOR): chỉ demo, không gọi VNPay, không có tiền thật."""
import sys
from pathlib import Path
from unittest.mock import Mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.database import SessionLocal, execute, q_one
from app.main import app
from app.services import vnpay
from test_api import course, tokens  # noqa: F401  (fixture)

client = TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def paid_course(course, tokens, monkeypatch):  # noqa: F811
    """Khóa có phí đã xuất bản; VNPay bị chặn hẳn để chứng minh giả lập không gọi tới VNPay."""
    db = SessionLocal()
    execute(db, "UPDATE courses SET price=100000, status='published' WHERE id=:c", c=course)
    uid = q_one(db, "SELECT id FROM users WHERE email='em.hoang@gmail.com'")["id"]
    forbidden = Mock(side_effect=AssertionError("Không được gọi VNPay trong chế độ giả lập"))
    monkeypatch.setattr(vnpay, "build_payment_url", forbidden)
    monkeypatch.setattr(vnpay, "query_transaction", forbidden)
    monkeypatch.setattr(vnpay, "refund_transaction", forbidden)
    monkeypatch.setattr(settings, "vnpay_tmn_code", "")
    monkeypatch.setattr(settings, "vnpay_hash_secret", "")
    headers = {role: {"Authorization": "Bearer " + token} for role, token in tokens.items()}
    try:
        yield {"course": course, "uid": uid, "db": db, "h": headers}
    finally:
        db.rollback()
        execute(db, "DELETE FROM payments WHERE course_id=:c", c=course)
        execute(db, "DELETE FROM enrollments WHERE course_id=:c", c=course)
        db.close()


def _row(ctx, sql, **params):
    """Đọc dữ liệu mới nhất: kết thúc giao dịch cũ để không bị ảnh chụp REPEATABLE READ che mất bản ghi API vừa ghi."""
    ctx["db"].rollback()
    return q_one(ctx["db"], sql, **params)


def _create(ctx):
    r = client.post("/api/payments/vnpay/create", headers=ctx["h"]["student"], json={"course_id": ctx["course"]})
    return r, r.json()


def _enrolled(ctx):
    return _row(ctx, "SELECT id FROM enrollments WHERE user_id=:u AND course_id=:c", u=ctx["uid"], c=ctx["course"]) is not None


def test_create_goes_to_simulator_page_without_vnpay_keys(paid_course, monkeypatch):
    monkeypatch.setattr(settings, "payment_simulator", True)
    r, body = _create(paid_course)
    assert r.status_code == 200 and body["success"] and body["simulated"] is True
    assert body["transaction_ref"].startswith("SIM")
    assert "/student/payment-simulator" in body["payment_url"] and body["transaction_ref"] in body["payment_url"]
    row = _row(paid_course, "SELECT status, method FROM payments WHERE transaction_ref=:r", r=body["transaction_ref"])
    assert row["status"] == "pending" and row["method"] == "vnpay"
    assert not _enrolled(paid_course)


def test_confirm_success_enrolls_once_and_marks_simulated(paid_course, monkeypatch):
    monkeypatch.setattr(settings, "payment_simulator", True)
    ref = _create(paid_course)[1]["transaction_ref"]
    ok_ = client.post("/api/payments/simulator/confirm", headers=paid_course["h"]["student"], json={"ref": ref, "result": "success"})
    assert ok_.status_code == 200 and ok_.json()["status"] == "completed"
    row = _row(paid_course, "SELECT status, gateway_txn_no, bank_code FROM payments WHERE transaction_ref=:r", r=ref)
    assert row["status"] == "completed" and row["gateway_txn_no"] is None and row["bank_code"] == "SIMULATOR"
    assert _enrolled(paid_course)
    again = client.post("/api/payments/simulator/confirm", headers=paid_course["h"]["student"], json={"ref": ref, "result": "failed"})
    assert again.status_code == 409
    state = client.get(f"/api/payments/status?ref={ref}", headers=paid_course["h"]["student"]).json()["data"]
    assert state["status"] == "completed" and state["enrolled"] is True


def test_confirm_failed_does_not_enroll(paid_course, monkeypatch):
    monkeypatch.setattr(settings, "payment_simulator", True)
    ref = _create(paid_course)[1]["transaction_ref"]
    r = client.post("/api/payments/simulator/confirm", headers=paid_course["h"]["student"], json={"ref": ref, "result": "failed"})
    assert r.status_code == 200 and r.json()["status"] == "failed"
    assert _row(paid_course, "SELECT status FROM payments WHERE transaction_ref=:r", r=ref)["status"] == "failed"
    assert not _enrolled(paid_course)


def test_invalid_result_and_other_users_are_rejected(paid_course, monkeypatch):
    monkeypatch.setattr(settings, "payment_simulator", True)
    ref = _create(paid_course)[1]["transaction_ref"]
    bad = client.post("/api/payments/simulator/confirm", headers=paid_course["h"]["student"], json={"ref": ref, "result": "refund"})
    assert bad.status_code == 400
    other = client.post("/api/payments/simulator/confirm", headers=paid_course["h"]["teacher"], json={"ref": ref, "result": "success"})
    assert other.status_code == 404
    assert _row(paid_course, "SELECT status FROM payments WHERE transaction_ref=:r", r=ref)["status"] == "pending"
    assert not _enrolled(paid_course)


def test_real_vnpay_order_cannot_be_confirmed_by_simulator(paid_course, monkeypatch):
    monkeypatch.setattr(settings, "payment_simulator", True)
    execute(paid_course["db"], "INSERT INTO payments (user_id,course_id,method,status,amount,transaction_ref) "
            "VALUES (:u,:c,'vnpay','pending',100000,'SO-REAL-ORDER-1')", u=paid_course["uid"], c=paid_course["course"])
    r = client.post("/api/payments/simulator/confirm", headers=paid_course["h"]["student"], json={"ref": "SO-REAL-ORDER-1", "result": "success"})
    assert r.status_code == 404 and not _enrolled(paid_course)


def test_simulator_off_by_default(paid_course, monkeypatch):
    monkeypatch.setattr(settings, "payment_simulator", False)
    r, body = _create(paid_course)
    assert r.status_code == 503 and not body["success"]
    conf = client.post("/api/payments/simulator/confirm", headers=paid_course["h"]["student"], json={"ref": "SIM1", "result": "success"})
    assert conf.status_code == 403


def test_simulated_order_is_never_refunded_through_vnpay(paid_course, monkeypatch):
    monkeypatch.setattr(settings, "payment_simulator", True)
    ref = _create(paid_course)[1]["transaction_ref"]
    client.post("/api/payments/simulator/confirm", headers=paid_course["h"]["student"], json={"ref": ref, "result": "success"})
    pid = _row(paid_course, "SELECT id FROM payments WHERE transaction_ref=:r", r=ref)["id"]
    r = client.post("/api/payments/refund", headers=paid_course["h"]["admin"], json={"id": pid, "reason": "test", "revoke_access": True})
    assert r.status_code >= 400  # refund_transaction đã bị chặn: nếu bị gọi, test sẽ lỗi
    assert _row(paid_course, "SELECT status FROM payments WHERE id=:i", i=pid)["status"] == "completed"
