## Mục tiêu bài học
- Tạo bảng và lưu nhiệm vụ qua kết nối SQLite theo request.
- Truyền dữ liệu bằng placeholder thay vì ghép chuỗi SQL.
- Kiểm tra dữ liệu còn sau khi mở kết nối mới.

Thời gian dự kiến: 150 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Tạo bảng và lưu nhiệm vụ qua kết nối SQLite theo request.
- Truyền dữ liệu bằng placeholder thay vì ghép chuỗi SQL.
- Kiểm tra dữ liệu còn sau khi mở kết nối mới.

## Kiến thức và cách suy luận
Database lưu trạng thái ngoài bộ nhớ của hàm xử lý. SQLite phù hợp cho bài thực hành vì có trong thư viện chuẩn Python và dùng file cục bộ; ta không cần dựng dịch vụ database riêng. Nó vẫn có quy tắc transaction và khóa ghi. Bài thực hành không dùng file của ứng dụng StudyOnline: mọi dữ liệu ví dụ nằm trong TemporaryDirectory và tự dọn sau khi kết thúc.

Câu SQL có hai phần cần phân biệt: cấu trúc truy vấn do người viết code kiểm soát và giá trị do client cung cấp. `WHERE title = ?` cùng tuple tham số giữ giá trị ở đúng vị trí dữ liệu. Không dùng f-string ghép title vào câu SQL. Placeholder không dùng thay tên bảng hay tên cột; nếu cần sắp xếp theo lựa chọn client, map lựa chọn đó vào danh sách cột cho phép.

Mỗi request mở kết nối, đặt row_factory nếu muốn đọc theo tên cột, yield cho handler rồi đóng trong finally. Với FastAPI sync có thể thực thi các bước ở thread khác, ví dụ dùng check_same_thread=False có chủ đích và không chia sẻ connection đó giữa các request. Tùy chọn này không tự bảo đảm an toàn khi nhiều thread cùng ghi; phạm vi sở hữu connection vẫn phải rõ.

Sau INSERT/UPDATE, commit để lưu thay đổi theo cách quản lý transaction của bài. Đóng connection không phải là thay thế tùy ý cho commit. Khi trả bản ghi, chuyển kiểu integer done về boolean theo model phản hồi. Kiểm thử bằng cách mở một connection mới đọc file: nếu chỉ kiểm tra cùng dict hoặc cùng biến trong handler, ta có thể bỏ sót lỗi không ghi bền vững.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
import sqlite3
import tempfile
from pathlib import Path
from typing import Annotated
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

class TaskIn(BaseModel):
    title: str

with tempfile.TemporaryDirectory() as folder:
    database = str(Path(folder) / "lesson.db")
    with closing(sqlite3.connect(database)) as conn, conn:
        conn.execute("CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL)")

    def get_db():
        conn = sqlite3.connect(database, check_same_thread=False)
        try:
            yield conn
        finally:
            conn.close()

    app = FastAPI()

    @app.post("/tasks", status_code=201)
    def create_task(payload: TaskIn, conn: Annotated[sqlite3.Connection, Depends(get_db)]):
        cursor = conn.execute("INSERT INTO tasks(title) VALUES (?)", (payload.title,))
        conn.commit()
        return {"id": cursor.lastrowid, "title": payload.title}

    dangerous_looking = "HTTP'); DROP TABLE tasks; --"
    with TestClient(app) as client:
        response = client.post("/tasks", json={"title": dangerous_looking})
        assert response.status_code == 201
    with closing(sqlite3.connect(database)) as verify:
        rows = verify.execute("SELECT title FROM tasks").fetchall()
        assert rows == [(dangerous_looking,)]
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Chạy ví dụ và quan sát rằng chuỗi giống SQL nguy hiểm được lưu như title bình thường; bảng tasks vẫn tồn tại. Bài không yêu cầu gửi chuỗi này tới bất kỳ server khác. Đọc lại qua connection mới là bằng chứng nội dung đã commit. Thử title có dấu nháy đơn bình thường như 'Lan’s notes' để hiểu đây cũng là vấn đề tính đúng dữ liệu, không chỉ an ninh.

Thêm SELECT WHERE id=? để lấy chính bản ghi vừa tạo. Ghi id lấy từ lastrowid và tránh tính bằng COUNT(*)+1. Sau đó giải thích vì sao placeholder bảo vệ phần giá trị nhưng không cho phép client chọn tên bảng tùy ý.

## Bài tập tự làm
Viết GET /tasks có ORDER BY id và phân trang offset/limit từ bài 2. Query phải tham số hóa LIMIT và OFFSET. Test tạo ba nhiệm vụ, lấy trang thứ hai đúng một item; mở lại ứng dụng với cùng đường dẫn file để xác nhận dữ liệu còn. Giới hạn kích thước trang phải có kiểm tra ở API.

## Hướng giải và tiêu chí đạt
Truy vấn SELECT id,title FROM tasks ORDER BY id LIMIT ? OFFSET ? với tuple (limit,offset). Dùng file tạm riêng cho mỗi bài test; hai app có thể cùng đọc file đã commit nhưng không dùng chung connection mở sẵn. Đạt khi kết quả ổn định theo ID, dữ liệu có dấu nháy không làm hỏng truy vấn và test kiểm tra độc lập chuyện lưu bền với chuyện phân trang.

## Lỗi thường gặp và cách chẩn đoán
Một database ':memory:' tạo theo từng connection sẽ là các database khác nhau; đóng connection khởi tạo rồi mở connection mới không giữ bảng như file. Không sửa lỗi thiếu bảng bằng cách đổi sang file dữ liệu thật. Không dùng conn.execute(f'...{title}...'). Nếu gặp database is locked, kiểm tra transaction/connection còn mở; tăng timeout chỉ che triệu chứng nếu tài nguyên không được đóng.

## Câu hỏi tự kiểm tra có đáp án
- Cách nào truyền title vào sqlite3 an toàn hơn? Đáp án: Placeholder ? cùng tuple tham số. Giá trị được driver bind thay vì trở thành cú pháp SQL.
- Placeholder ? có dùng thay tên bảng tùy ý không? Đáp án: Không, nó dành cho giá trị. Cấu trúc truy vấn cần được kiểm soát bằng code.
- Kiểm tra nào chứng minh dữ liệu được lưu ngoài biến Python? Đáp án: Mở connection mới và đọc bản ghi đã commit. Đọc qua connection mới kiểm tra lưu trữ bền vững.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://docs.python.org/3/library/sqlite3.html
- https://fastapi.tiangolo.com/tutorial/sql-databases/