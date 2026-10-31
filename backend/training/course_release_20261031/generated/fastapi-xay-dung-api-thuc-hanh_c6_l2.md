## Mục tiêu bài học
- Ghép validation, quyền, database và test thành sản phẩm chạy lại được.
- Đánh giá theo ma trận yêu cầu và rubric thay vì chỉ xem /docs.
- Nêu rõ phạm vi demo, minh chứng đạt và công việc mở rộng.

Thời gian dự kiến: 240 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Ghép validation, quyền, database và test thành sản phẩm chạy lại được.
- Đánh giá theo ma trận yêu cầu và rubric thay vì chỉ xem /docs.
- Nêu rõ phạm vi demo, minh chứng đạt và công việc mở rộng.

## Kiến thức và cách suy luận
Dự án cuối khóa là API quản lý nhiệm vụ học tập cho hai người dùng cục bộ. Mỗi nhiệm vụ có title, owner_id và done. Client tạo, liệt kê, đọc, đổi trạng thái hoàn thành và xóa nhiệm vụ của chính mình. Tiêu đề duy nhất trong phạm vi từng chủ sở hữu; hai người có thể dùng cùng tiêu đề. SQLite lưu bền vững giữa các lần khởi động, còn danh tính demo được cấu hình từ ngoài mã nghiệp vụ.

Ứng dụng hoàn thành bài học phải có hợp đồng có thể kiểm tra: POST trả 201; title trắng hoặc dài quá giới hạn trả 422; thiếu/sai token 401; người khác thao tác bản ghi 403; ID không tồn tại 404; title trùng trong cùng user 409; DELETE thành công 204 rỗng. Các lựa chọn này là hợp đồng của dự án, không phải mọi API đều bắt buộc cùng một cách.

Nghiệm thu bắt đầu từ thư mục mới, môi trường đã cài đúng dependencies, database tạm riêng và lệnh test được ghi rõ. Người chấm cần tái tạo được kết quả bằng mã đã nộp. Không dùng ảnh /docs thành công để thay bằng chứng quyền hoặc transaction. Một thay đổi bị chặn phải giữ nguyên dữ liệu; một lần restart app phải còn nhiệm vụ đã commit. Bài nộp chứa source, test, README, bảng hợp đồng và tự đánh giá giới hạn.

Rubric ưu tiên dữ liệu đúng và quyền: 25 điểm CRUD/hợp đồng, 20 validation/lỗi, 20 quyền, 15 SQLite/giao dịch, 15 test có ý nghĩa và 5 hướng dẫn tái hiện. Cần tổng từ 70/100 theo giảng viên, đồng thời các ca truy cập chéo và persistence bắt buộc đạt. Điểm quiz đo phần nhận biết/áp dụng trong câu hỏi; dự án cần minh chứng thực hành riêng. Khóa không tự biến việc bấm hoàn thành bài thành xác nhận đã đạt dự án.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
import sqlite3
import tempfile
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, ConfigDict, Field

class TaskIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: str = Field(min_length=1, max_length=120)

def create_app(database):
    with closing(sqlite3.connect(database)) as conn, conn:
        conn.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)")
    app = FastAPI()

    @app.post("/tasks", status_code=201)
    def create_task(payload: TaskIn):
        conn = sqlite3.connect(database)
        try:
            with conn:
                cursor = conn.execute("INSERT INTO tasks(title) VALUES (?)", (payload.title,))
                task_id = cursor.lastrowid
        except sqlite3.IntegrityError:
            raise HTTPException(409, "Duplicate title")
        finally:
            conn.close()
        return {"id": task_id, "title": payload.title}

    @app.get("/tasks")
    def list_tasks():
        conn = sqlite3.connect(database)
        try:
            return {"items": [{"id": r[0], "title": r[1]} for r in conn.execute("SELECT id,title FROM tasks ORDER BY id")]}
        finally:
            conn.close()
    return app

with tempfile.TemporaryDirectory() as folder:
    database = str(Path(folder) / "capstone-check.db")
    with TestClient(create_app(database)) as first:
        assert first.post("/tasks", json={"title": " Evidence "}).status_code == 201
    with TestClient(create_app(database)) as restarted:
        assert restarted.get("/tasks").json()["items"][0]["title"] == "Evidence"
        assert restarted.post("/tasks", json={"title": "Evidence"}).status_code == 409
        assert restarted.post("/tasks", json={"title": "  "}).status_code == 422
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Ví dụ nhỏ chỉ xác minh lát cắt persistence, validation và xung đột của dự án; nó chưa phải toàn bộ sản phẩm nghiệm thu. Chạy hai app nối tiếp cùng file tạm để kiểm tra dữ liệu sống qua restart. Ghi rằng title được trim thành Evidence. Request trùng sau restart phải 409, còn title trắng 422. Sau đó mở gói project_files của khóa để học cấu trúc ứng dụng đầy đủ có quyền và CRUD.

Chạy bộ test dự án rồi đọc từng test theo bảng hợp đồng. Với mỗi yêu cầu, chỉ ra test và quan sát tương ứng. Chọn một lỗi có chủ đích trong bản sao, ví dụ bỏ owner filter của danh sách, và chứng minh test quyền bắt được lỗi đó trước khi khôi phục code.

## Bài tập tự làm
Hoàn thiện một tính năng mở rộng: bộ lọc done, phân trang ổn định hoặc đổi title có kiểm tra trùng. Giữ toàn bộ test cũ, thêm test cho feature và ít nhất một trường hợp lỗi. Nộp README ghi các bước chạy, cấu hình, hợp đồng endpoint, giới hạn token demo và kế hoạch bổ sung nếu đưa dịch vụ ra mạng. Trình bày cách kiểm tra dự án mà không dùng dữ liệu thật.

## Hướng giải và tiêu chí đạt
Tính năng mở rộng phải giữ owner filter ở mọi truy vấn. Nếu thêm đổi title, đặt UNIQUE(owner_id,title) và map xung đột đã biết sang 409; không nhận owner_id từ body. Đạt khi một người khác có thể chạy test từ thư mục mới, ca bắt buộc truy cập chéo và persistence đều xanh, README phân biệt kết quả tự động với rubric giảng viên chấm. Đính kèm bảng tự chấm có dẫn tới test hoặc tệp minh chứng cho từng điểm.

## Lỗi thường gặp và cách chẩn đoán
Không coi 60 câu quiz là đủ thay dự án, vì nhận biết API khác khả năng thiết kế dữ liệu và test quyền. Không nộp database đang chứa dữ liệu cá nhân. Không tự gắn nhãn 'đạt chuẩn production' cho app token demo. Nếu chỉ chạy được trên một IDE, rà lại đường dẫn tuyệt đối và cấu hình bị hardcode; artifact học tập phải tái hiện được trong một thư mục khác.

## Câu hỏi tự kiểm tra có đáp án
- Hai người dùng có được dùng cùng title theo dự án không? Đáp án: Có, tính duy nhất áp dụng trong từng chủ sở hữu. UNIQUE(owner_id,title) giữ đúng phạm vi nghiệp vụ.
- Minh chứng nào kiểm tra persistence? Đáp án: Khởi tạo app mới trên cùng file và đọc dữ liệu đã commit. Đọc sau restart kiểm tra dữ liệu ngoài bộ nhớ tiến trình.
- Điều kiện nào bắt buộc ngoài tổng điểm rubric? Đáp án: Các ca quyền chéo và lưu bền vững phải đạt. Hai nhóm này bảo vệ chức năng cốt lõi của dự án.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://fastapi.tiangolo.com/tutorial/bigger-applications/
- https://fastapi.tiangolo.com/deployment/concepts/