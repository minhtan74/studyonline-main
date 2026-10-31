## Giới thiệu và phạm vi
Khóa dành cho người đã biết Python cơ bản và muốn xây dựng một API có thể chạy, sửa và kiểm tra trên máy cá nhân. Sản phẩm xuyên suốt là Task API quản lý nhiệm vụ học tập của hai người dùng cục bộ. Nội dung được biên soạn bằng tiếng Việt, dùng FastAPI và Pydantic 2, có ví dụ TestClient thực thi độc lập. Khóa gồm 6 chương, 12 bài và khoảng 36 giờ học: 20 giờ đọc/chạy ví dụ, 10 giờ bài tập/dự án và 6 giờ ôn/test/review. Thời lượng là dự kiến, không phải số phút video.

## Điều kiện bắt đầu và thiết lập
Cần biết hàm, kiểu dữ liệu Python, exception và import. Dùng Python 3.12+ trong thư mục mới. Tạo môi trường ảo bằng `python -m venv .venv`, kích hoạt theo hệ điều hành rồi chạy `python -m pip install -r requirements.txt` của gói dự án. Bộ phiên bản đã kiểm tra cùng tài liệu: FastAPI 0.115.6, Pydantic 2.10.4, httpx 0.28.1; ví dụ sử dụng API của Pydantic 2. requirements dự án khóa phiên bản để tái hiện, việc nâng cấp cần chạy lại test trước.
Không trỏ bài thực hành vào database của StudyOnline. Ví dụ dùng bộ nhớ hoặc TemporaryDirectory; dự án dùng file SQLite mới trong thư mục dự án. Không cần tài khoản cloud, token thật hay dịch vụ trả phí. Chỉ chạy máy chủ trên 127.0.0.1 trong khóa.

## Chuẩn đầu ra có thể quan sát
- Viết bảng hợp đồng cho POST/GET/PATCH/DELETE với status và JSON cụ thể.
- Từ chối title trắng, vượt giới hạn và dữ liệu sai kiểu bằng model kiểm tra.
- Tạo dữ liệu tồn tại sau khi đóng app và khởi tạo lại trên cùng file SQLite.
- Chặn tài khoản hợp lệ đọc/sửa/xóa nhiệm vụ của tài khoản khác; owner do server xác định.
- Chứng minh rollback và trạng thái không đổi sau lỗi bằng test.
- Nộp source, test, README và tự đánh giá giới hạn mà người khác chạy lại được.

## Kế hoạch sáu tuần
1. Tuần 1 — HTTP/OpenAPI, path/query; viết bảng endpoint và test tham số biên. Hoàn thành bài 1–2, khoảng 5 giờ.
2. Tuần 2 — Pydantic 2, CRUD/response/error; hoàn thành API dùng bộ nhớ với test 201/404/409/422. Bài 3–4, khoảng 6 giờ.
3. Tuần 3 — Dependency và lifespan/sync-async; vẽ vòng đời tài nguyên, test cleanup sau lỗi. Bài 5–6, khoảng 5 giờ.
4. Tuần 4 — SQLite/transaction; chuyển dữ liệu sang file tạm, chứng minh persistence và rollback. Bài 7–8, khoảng 6 giờ.
5. Tuần 5 — Danh tính/quyền và testing; hoàn thành ma trận hai người dùng, test các đường lỗi và quyền chéo. Bài 9–10, khoảng 6 giờ.
6. Tuần 6 — Cấu hình/log và dự án; chạy nghiệm thu từ thư mục mới, review README và trình bày giới hạn. Bài 11–12, khoảng 8 giờ.

## Quy trình học mỗi bài
Đọc mục tiêu, chạy ví dụ nguyên bản, giải thích từng assertion rồi tự làm bài tập trước khi mở hướng giải. Ghi lại request, status, JSON và trạng thái dữ liệu. Làm năm câu kiểm tra sau thực hành; câu sai cần liên hệ lại đoạn code tương ứng. Làm lại câu quen thuộc có thể giúp ôn nhưng chưa chứng minh áp dụng được vào đầu vào mới. Nếu gặp lỗi, thu nhỏ ví dụ và giữ nguyên thông báo lỗi đã bỏ token.

## Đánh giá trong khóa
Mỗi bài có 5 câu trắc nghiệm kèm giải thích, tổng 60 câu gốc phân loại theo chương/bài. Bộ ôn hỗ trợ tự kiểm tra; bài kiểm tra cuối khóa dùng tổng hợp nội dung. Ngưỡng quiz đề xuất là 70%; đạt quiz không tự thay việc chấm dự án. Học viên nộp 12 minh chứng bài tập ngắn và dự án. Giảng viên có thể điều chỉnh tiến độ/lịch kiểm tra theo lớp nhưng cần giữ tiêu chí và phản hồi cụ thể.

## Đề bài dự án Task API
Xây API cho hai tài khoản local cấu hình từ ngoài app. Nhiệm vụ gồm id, owner_id, title, done. Có tạo, danh sách phân trang/lọc done, đọc một nhiệm vụ, đổi done và xóa. title trim, dài 1–120 ký tự và duy nhất trong mỗi owner. Database SQLite có UNIQUE(owner_id,title), truy vấn tham số và quản lý connection. Client không được đặt owner_id trong body. Token demo phải có chú thích phạm vi, không phải hệ thống đăng nhập Internet.
Hợp đồng: thiếu/sai token 401; truy cập nhiệm vụ người khác 403; không có ID 404; xung đột title 409; đầu vào sai 422; tạo 201; xóa 204 rỗng. Giữ owner filter trong cả danh sách và thao tác bản ghi. Nếu chọn hợp đồng khác, học viên phải giải thích và cập nhật đủ test, không được mở quyền rộng hơn.

## Rubric dự án 100 điểm
- 25 điểm CRUD và hợp đồng: mỗi thao tác thành công đúng trạng thái/JSON, đọc lại dữ liệu và 204 rỗng; thiếu thao tác nào trừ phần tương ứng.
- 20 điểm validation và lỗi: title trắng/quá dài, path/query sai, trùng title; lỗi trả rõ, không lộ SQL/token. Có test dữ liệu không đổi sau lỗi.
- 20 điểm quyền: thiếu/sai token, danh sách theo owner, GET/PATCH/DELETE chéo bị chặn, body không giả owner. Đây là tiêu chí bắt buộc.
- 15 điểm SQLite/giao dịch: placeholder, connection được đóng, dữ liệu tồn tại sau restart, quy tắc UNIQUE đúng phạm vi. Persistence là tiêu chí bắt buộc.
- 15 điểm test: môi trường tạm độc lập, test lặp lại được, bao phủ đường lỗi/quyền/biên và assertions có ý nghĩa.
- 5 điểm tài liệu: README có lệnh chạy/test, cấu hình, bảng endpoint và giới hạn demo.
Đề xuất đạt từ 70/100 đồng thời cả tiêu chí bắt buộc về quyền và persistence đều đạt. Điểm dự án cần giảng viên/reviewer chấm theo minh chứng; hệ thống LMS hiện không tự đánh giá toàn bộ rubric này.

## Hồ sơ nộp và nghiệm thu
Nộp app.py, run.py, test_app.py, requirements.txt, README.md và bảng yêu cầu→test. Không nộp token thật hoặc database chứa dữ liệu cá nhân. Từ thư mục sạch, cài dependencies, chạy `python -m pytest -q test_app.py`, cấu hình token demo và chạy Uvicorn theo README. Reviewer tự gửi chuỗi tạo/đọc/sửa/xóa với hai user, khởi động lại app trên cùng file và kiểm tra dữ liệu. Chạy lại test lần hai để tìm phụ thuộc trạng thái. Gói mẫu cung cấp điểm xuất phát và test minh họa; bài nộp cần có mở rộng và giải thích của học viên.

## Giới hạn và hướng học tiếp
Token tĩnh của lab không cấp, hết hạn hoặc thu hồi động; chưa có login/password/JWT hoàn chỉnh. SQLite phù hợp quy mô thực hành, cần đánh giá truy cập đồng thời trước workload khác. Khi triển khai mạng cần review TLS, quản lý bí mật, migration/backup/restore, hạn mức, giám sát, bảo mật và quy trình cập nhật. Có thể học tiếp OAuth2/OIDC với nhà cung cấp danh tính, PostgreSQL và chiến lược deploy sau khi nắm hợp đồng/quyền/test. Tài liệu này không tuyên bố chứng nhận học thuật hay bảo đảm ứng dụng production cho mọi hoàn cảnh.

## Nguồn chính thức
- https://fastapi.tiangolo.com/tutorial/
- https://fastapi.tiangolo.com/tutorial/testing/
- https://docs.pydantic.dev/latest/concepts/models/
- https://docs.python.org/3/library/sqlite3.html

## Mã nguồn dự án tham khảo
Tự làm dự án theo đề bài trước khi đối chiếu mã tham khảo bên dưới.


### File: app.py
```
"""Task API for a local teaching lab; fixed demo tokens are not a login service."""
import logging
from contextlib import asynccontextmanager
from pathlib import Path
import sqlite3
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Path as ApiPath, Query, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, Field

logger = logging.getLogger("task_lab")
bearer = HTTPBearer(auto_error=False)

class TaskCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    title: str = Field(min_length=1, max_length=120)

class TaskPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    done: bool = Field(strict=True)

class TaskOut(BaseModel):
    id: int
    owner_id: int
    title: str
    done: bool

class TaskPage(BaseModel):
    items: list[TaskOut]
    total: int
    offset: int
    limit: int

def create_app(database_path, tokens):
    """Create an isolated app. Token mapping is supplied only for local exercises."""
    if not str(database_path).strip() or str(database_path) == ":memory:":
        raise ValueError("Use a new SQLite file path for this lab")
    token_map = dict(tokens)
    if not token_map or any(not isinstance(key, str) or len(key) < 12 or
                            type(owner) is not int or owner < 1
                            for key, owner in token_map.items()):
        raise ValueError("Provide local demo tokens (12+ chars) mapped to positive user IDs")
    database = str(Path(database_path).resolve())

    def connect():
        conn = sqlite3.connect(database, timeout=5, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    @asynccontextmanager
    async def lifespan(app):
        Path(database).parent.mkdir(parents=True, exist_ok=True)
        conn = connect()
        try:
            with conn:
                conn.execute("""CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    owner_id INTEGER NOT NULL CHECK(owner_id > 0),
                    title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
                    done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1)),
                    UNIQUE(owner_id,title))""")
        finally:
            conn.close()
        yield

    app = FastAPI(title="Local Study Task API", version="1.0.0", lifespan=lifespan)

    @app.middleware("http")
    async def request_id(request, call_next):
        marker = uuid4().hex
        response = await call_next(request)
        response.headers["X-Request-ID"] = marker
        # Never log Authorization or request body in this example.
        logger.info("request=%s method=%s path=%s status=%s", marker,
                    request.method, request.url.path, response.status_code)
        return response

    def get_db():
        conn = connect()
        try:
            yield conn
        finally:
            conn.close()

    def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
        owner = token_map.get(credentials.credentials) if credentials is not None else None
        if credentials is None or credentials.scheme.lower() != "bearer" or owner is None:
            raise HTTPException(401, "Authentication required",
                                headers={"WWW-Authenticate": "Bearer"})
        return owner

    def owned_task(conn, task_id, owner):
        task = conn.execute("SELECT id,owner_id,title,done FROM tasks WHERE id=?", (task_id,)).fetchone()
        if task is None:
            raise HTTPException(404, "Task not found")
        if task["owner_id"] != owner:
            raise HTTPException(403, "Not allowed")
        return dict(task)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.post("/tasks", response_model=TaskOut, status_code=201)
    def create_task(payload: TaskCreate, owner: int = Depends(current_user),
                    conn: sqlite3.Connection = Depends(get_db)):
        try:
            with conn:
                cursor = conn.execute("INSERT INTO tasks(owner_id,title) VALUES (?,?)",
                                      (owner, payload.title))
                task_id = cursor.lastrowid
        except sqlite3.IntegrityError as exc:
            if getattr(exc, "sqlite_errorcode", None) == sqlite3.SQLITE_CONSTRAINT_UNIQUE:
                raise HTTPException(409, "A task with this title already exists")
            raise
        return owned_task(conn, task_id, owner)

    @app.get("/tasks", response_model=TaskPage)
    def list_tasks(done: bool | None = None, offset: int = Query(0, ge=0),
                   limit: int = Query(20, ge=1, le=50),
                   owner: int = Depends(current_user),
                   conn: sqlite3.Connection = Depends(get_db)):
        where = "owner_id=?"
        values = [owner]
        if done is not None:
            where += " AND done=?"
            values.append(int(done))
        total = conn.execute("SELECT COUNT(*) FROM tasks WHERE " + where, values).fetchone()[0]
        rows = conn.execute("SELECT id,owner_id,title,done FROM tasks WHERE " + where +
                            " ORDER BY id LIMIT ? OFFSET ?", values + [limit, offset]).fetchall()
        return {"items": [dict(row) for row in rows], "total": total, "offset": offset, "limit": limit}

    @app.get("/tasks/{task_id}", response_model=TaskOut)
    def read_task(task_id: int = ApiPath(ge=1), owner: int = Depends(current_user),
                  conn: sqlite3.Connection = Depends(get_db)):
        return owned_task(conn, task_id, owner)

    @app.patch("/tasks/{task_id}", response_model=TaskOut)
    def update_task(payload: TaskPatch, task_id: int = ApiPath(ge=1),
                    owner: int = Depends(current_user),
                    conn: sqlite3.Connection = Depends(get_db)):
        owned_task(conn, task_id, owner)
        with conn:
            conn.execute("UPDATE tasks SET done=? WHERE id=? AND owner_id=?",
                         (int(payload.done), task_id, owner))
        return owned_task(conn, task_id, owner)

    @app.delete("/tasks/{task_id}", status_code=204)
    def delete_task(task_id: int = ApiPath(ge=1), owner: int = Depends(current_user),
                    conn: sqlite3.Connection = Depends(get_db)):
        owned_task(conn, task_id, owner)
        with conn:
            conn.execute("DELETE FROM tasks WHERE id=? AND owner_id=?", (task_id, owner))
        return Response(status_code=204)

    return app

```


### File: run.py
```
"""Read local lab settings; start with python -m uvicorn run:app --host 127.0.0.1."""
import json
import os
from app import create_app

raw_tokens = os.environ.get("LAB_TOKENS_JSON")
if not raw_tokens:
    raise RuntimeError("Set LAB_TOKENS_JSON to local demo token/user pairs; see README")
try:
    tokens = json.loads(raw_tokens)
except json.JSONDecodeError as exc:
    raise RuntimeError("LAB_TOKENS_JSON must be valid JSON") from exc
if not isinstance(tokens, dict):
    raise RuntimeError("LAB_TOKENS_JSON must be an object")
app = create_app(os.environ.get("LAB_DATABASE_PATH", "lab_tasks.sqlite3"), tokens)

```


### File: test_app.py
```
"""Behavior checks against temporary local data; no external services or real tokens."""
from pathlib import Path
from contextlib import closing
import sqlite3
from tempfile import TemporaryDirectory
import pytest
from fastapi.testclient import TestClient
from app import create_app

TOKENS = {"training-alice-only": 1, "training-bob-only": 2}
ALICE = {"Authorization": "Bearer training-alice-only"}
BOB = {"Authorization": "Bearer training-bob-only"}

@pytest.fixture
def lab():
    with TemporaryDirectory() as folder:
        database = str(Path(folder) / "test.sqlite3")
        with TestClient(create_app(database, TOKENS)) as client:
            yield client, database

def add(client, title="HTTP", headers=None):
    response = client.post("/tasks", json={"title": title}, headers=headers or ALICE)
    assert response.status_code == 201
    return response.json()

def test_crud_and_response_contract(lab):
    client, _ = lab
    item = add(client, "  HTTP  ")
    assert item == {"id": item["id"], "owner_id": 1, "title": "HTTP", "done": False}
    assert client.get(f"/tasks/{item['id']}", headers=ALICE).json() == item
    changed = client.patch(f"/tasks/{item['id']}", json={"done": True}, headers=ALICE)
    assert changed.status_code == 200 and changed.json()["done"] is True
    deleted = client.delete(f"/tasks/{item['id']}", headers=ALICE)
    assert deleted.status_code == 204 and deleted.content == b""
    assert client.get(f"/tasks/{item['id']}", headers=ALICE).status_code == 404

def test_validation_and_state_after_error(lab):
    client, _ = lab
    add(client, "A" * 120)
    for title in ["", "   ", "A" * 121]:
        assert client.post("/tasks", json={"title": title}, headers=ALICE).status_code == 422
    assert client.post("/tasks", json={"title": "Spoof", "owner_id": 2}, headers=ALICE).status_code == 422
    assert client.get("/tasks?limit=51", headers=ALICE).status_code == 422
    assert client.get("/tasks/0", headers=ALICE).status_code == 422
    assert client.get("/tasks", headers=ALICE).json()["total"] == 1

def test_authentication_and_cross_owner_writes(lab):
    client, _ = lab
    task = add(client)
    path = f"/tasks/{task['id']}"
    assert client.get(path).status_code == 401
    assert client.get(path, headers={"Authorization": "Bearer invalid"}).status_code == 401
    assert client.get(path, headers=BOB).status_code == 403
    assert client.patch(path, json={"done": True}, headers=BOB).status_code == 403
    assert client.delete(path, headers=BOB).status_code == 403
    assert client.get(path, headers=ALICE).json()["done"] is False
    assert client.get("/tasks", headers=BOB).json()["items"] == []

def test_unique_titles_are_scoped_by_owner(lab):
    client, database = lab
    add(client, "Same")
    assert client.post("/tasks", json={"title": "Same"}, headers=ALICE).status_code == 409
    other = add(client, "Same", BOB)
    assert other["owner_id"] == 2
    with closing(sqlite3.connect(database)) as conn:
        assert conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0] == 2

def test_filtered_pagination_and_boolean_update(lab):
    client, _ = lab
    one = add(client, "First")
    add(client, "Second")
    add(client, "Third")
    assert client.patch(f"/tasks/{one['id']}", json={"done": "true"}, headers=ALICE).status_code == 422
    assert client.patch(f"/tasks/{one['id']}", json={"done": True}, headers=ALICE).status_code == 200
    result = client.get("/tasks?done=false&offset=1&limit=1", headers=ALICE).json()
    assert result["total"] == 2 and result["items"][0]["title"] == "Third"
    assert client.get("/tasks?done=true", headers=ALICE).json()["total"] == 1

def test_restart_keeps_committed_data(lab):
    client, database = lab
    item = add(client, "Persistence")
    with TestClient(create_app(database, TOKENS)) as another_app:
        response = another_app.get(f"/tasks/{item['id']}", headers=ALICE)
        assert response.status_code == 200 and response.json()["title"] == "Persistence"

def test_parameterized_input_remains_data(lab):
    client, database = lab
    strange = "Title'); DROP TABLE tasks; --"
    task = add(client, strange)
    assert client.get(f"/tasks/{task['id']}", headers=ALICE).json()["title"] == strange
    with closing(sqlite3.connect(database)) as conn:
        assert conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0] == 1

def test_configuration_and_request_ids(lab):
    client, _ = lab
    one, two = client.get("/health"), client.get("/health")
    assert one.json() == {"status": "ok"}
    assert len(one.headers["x-request-id"]) == 32
    assert one.headers["x-request-id"] != two.headers["x-request-id"]
    with pytest.raises(ValueError):
        create_app("uncreated-test.db", {})

```


### File: requirements.txt
```
fastapi==0.115.6
pydantic==2.10.4
httpx==0.28.1
uvicorn==0.34.0
pytest==8.3.4

```


### File: README.md
# Task API — dự án thực hành FastAPI

API quản lý nhiệm vụ cục bộ có validation, SQLite, quyền chủ sở hữu và tests. Hai token giả phục vụ học cách tách danh tính/quyền, chưa phải hệ thống đăng nhập Internet. Dùng Python 3.12+ trong thư mục riêng. Không dùng database/tài khoản thật.

## Cài và kiểm tra
Tạo môi trường ảo bằng `python -m venv .venv`, kích hoạt rồi chạy:

```text
python -m pip install -r requirements.txt
python -m pytest -q test_app.py
```

Tests dùng thư mục tạm, xóa dữ liệu sau mỗi test và không gọi mạng ngoài. Khi nâng dependencies, chạy lại toàn bộ tests. Phiên bản khóa giúp tái hiện bộ bài; đây không phải khuyến nghị duy trì phiên bản cũ vô thời hạn.

## Chạy trên máy học viên
PowerShell, từ thư mục dự án:

```powershell
$env:LAB_TOKENS_JSON = '{"training-alice-only":1,"training-bob-only":2}'
$env:LAB_DATABASE_PATH = 'lab_tasks.sqlite3'
python -m uvicorn run:app --host 127.0.0.1 --port 8000 --reload
```

Bash:

```sh
export LAB_TOKENS_JSON='{"training-alice-only":1,"training-bob-only":2}'
export LAB_DATABASE_PATH='lab_tasks.sqlite3'
python -m uvicorn run:app --host 127.0.0.1 --port 8000 --reload
```

Truy cập http://127.0.0.1:8000/docs. Nhấn Authorize và nhập một token giả, không gõ thêm chữ Bearer nếu giao diện HTTPBearer chỉ yêu cầu giá trị. Dừng bằng Ctrl+C. File SQLite giữ dữ liệu sau khi dừng; bài test dùng file khác. Không đưa .env hoặc database cá nhân vào bài nộp.

## Hợp đồng
- GET /health: 200, status ok, không công bố token/path. Chỉ là liveness cơ bản.
- POST /tasks: body title 1–120 ký tự sau trim, trả 201 với id/owner_id/title/done. Body có owner_id bị từ chối 422.
- GET /tasks: danh sách của user hiện tại, hỗ trợ done=true/false, offset>=0, limit 1–50; lọc trước phân trang, total là số dòng đã lọc.
- GET /tasks/{id}: trả một nhiệm vụ thuộc user hiện tại.
- PATCH /tasks/{id}: body {"done":true} với boolean JSON, trả trạng thái mới.
- DELETE /tasks/{id}: 204 không body.
- Thiếu/sai token: 401 với WWW-Authenticate. Nhiệm vụ không tồn tại: 404. ID của người khác: 403. Title trùng trong cùng owner: 409. Đầu vào sai: 422.
- UNIQUE(owner_id,title) cho phép hai user dùng cùng title. Tất cả giá trị client được bind trong SQL; tên cột/sắp xếp do code kiểm soát.

## Nghiệm thu và mở rộng
Xem test_app.py cho CRUD, title biên/trắng, query biên, trường owner giả, quyền GET/PATCH/DELETE chéo, title trùng, phân trang, persistence và dữ liệu giống cú pháp SQL. Request lỗi không tạo thêm bản ghi hoặc sửa nhiệm vụ trái quyền. Chạy lại tests lần hai để kiểm tra cô lập.
Mở rộng yêu cầu: đổi title có kiểm tra UNIQUE, deadline hoặc lọc nâng cao. Giữ owner filter và thêm test trước/sau lỗi; giữ tests cũ đạt. Nộp bảng yêu cầu→test và rubric tự chấm. Giảng viên đánh giá code và giải thích, không chỉ xem ảnh /docs.

## Giới hạn thiết kế
Token tĩnh chỉ dành cho loopback lab: chưa có phát hành, hết hạn, thu hồi, password hashing hay OIDC. Khi đưa lên mạng cần review danh tính thật, TLS, cấu hình bí mật, backup/restore, migration, hạn mức, log và theo dõi theo yêu cầu sản phẩm. SQLite có giới hạn khóa ghi; cần đánh giá workload trước chọn kiến trúc khác. Bộ mẫu này là nền tảng thực hành, chưa chứng nhận an toàn/khả năng vận hành cho mọi hệ thống thực tế.
