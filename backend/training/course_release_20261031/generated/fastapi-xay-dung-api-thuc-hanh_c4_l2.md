## Mục tiêu bài học
- Dùng ràng buộc database cho quy tắc duy nhất.
- Rollback khi một phần của thao tác nhiều bước thất bại.
- Chuyển lỗi xung đột đã biết thành 409 và giữ lỗi bất ngờ để chẩn đoán.

Thời gian dự kiến: 150 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Dùng ràng buộc database cho quy tắc duy nhất.
- Rollback khi một phần của thao tác nhiều bước thất bại.
- Chuyển lỗi xung đột đã biết thành 409 và giữ lỗi bất ngờ để chẩn đoán.

## Kiến thức và cách suy luận
Một thao tác nghiệp vụ có thể ghi nhiều bảng. Nếu tạo nhiệm vụ thành công nhưng ghi bản ghi lịch sử thất bại, ứng dụng có thể ở trạng thái dở dang. Transaction gom các thay đổi phải cùng thành công hoặc cùng hủy. Trong ví dụ, thêm hai tiêu đề vào bảng có ràng buộc UNIQUE; khi một tiêu đề trùng, cả lần thêm bị rollback. Người học phải kiểm tra dữ liệu sau lỗi, không chỉ mã phản hồi.

Kiểm tra trùng bằng SELECT trước INSERT giúp thông báo sớm nhưng không đủ khi hai request cùng nhìn thấy 'chưa có' rồi cùng ghi. Database constraint là lớp thực thi quy tắc tại điểm ghi. Định nghĩa UNIQUE(owner_id,title) trong dự án nghĩa là hai người có thể có title giống nhau, cùng một người thì không. Đây là quyết định nghiệp vụ cụ thể, không phải quy tắc chung cho mọi hệ thống nhiệm vụ.

`sqlite3.IntegrityError` có thể đến từ nhiều ràng buộc. Chỉ map các trường hợp đã biết sang lỗi xung đột phù hợp; đừng mặc định mọi exception là title trùng. Với schema đơn giản trong ví dụ, UNIQUE là lỗi ràng buộc được chủ đích tạo ra. Trong ứng dụng lớn hơn cần phân biệt NOT NULL, FOREIGN KEY và UNIQUE, đồng thời ghi thông tin chẩn đoán nội bộ mà không trả nguyên lỗi SQL cho client.

Transaction chỉ bảo vệ những thay đổi thực hiện qua cùng phạm vi quản lý database. Nó không tự rollback email đã gửi hoặc API bên ngoài đã gọi. Bài học giữ tất cả thao tác trong SQLite để quan sát tính nguyên tử rõ ràng. Nếu có tác động ngoài database, cần thiết kế thứ tự và cơ chế phục hồi phù hợp; không mở một transaction rất lâu trong khi chờ người dùng hoặc mạng ngoài.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
import sqlite3
import tempfile
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel

class Batch(BaseModel):
    titles: list[str]

with tempfile.TemporaryDirectory() as folder:
    database = str(Path(folder) / "transaction.db")
    with closing(sqlite3.connect(database)) as conn, conn:
        conn.execute("CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)")
        conn.execute("INSERT INTO tasks(title) VALUES (?)", ("Existing",))
    app = FastAPI()

    @app.post("/batch", status_code=201)
    def create_batch(payload: Batch):
        conn = sqlite3.connect(database)
        try:
            with conn:
                for title in payload.titles:
                    conn.execute("INSERT INTO tasks(title) VALUES (?)", (title,))
        except sqlite3.IntegrityError:
            raise HTTPException(409, "A title conflicts with existing data")
        finally:
            conn.close()
        return {"created": len(payload.titles)}

    with TestClient(app) as client:
        assert client.post("/batch", json={"titles": ["Fresh", "Existing"]}).status_code == 409
        with closing(sqlite3.connect(database)) as verify:
            assert verify.execute("SELECT title FROM tasks").fetchall() == [("Existing",)]
        assert client.post("/batch", json={"titles": ["One", "Two"]}).json() == {"created": 2}
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Trước request lỗi, bảng có đúng Existing. Trong request, Fresh được thêm trước rồi Existing gây lỗi UNIQUE; sau phản hồi 409, Fresh cũng phải không tồn tại. Đây là quan sát phân biệt transaction đúng với cách chỉ bỏ qua lỗi ở câu thứ hai. Sau request hợp lệ, có thêm One và Two. Ghi số bản ghi trước/sau mỗi lần để bằng chứng không phụ thuộc thông báo created.

Thử đảo thứ tự hai title trong request lỗi và xác nhận kết quả vẫn không thay đổi database. Sau đó mô tả một tình huống hai request cùng tạo title mới: SELECT kiểm tra trước có thể cùng trả rỗng, còn UNIQUE sẽ giải quyết xung đột khi ghi.

## Bài tập tự làm
Bổ sung bảng audit chỉ chứa task_id và hành động created. Mỗi batch hợp lệ phải tạo số audit tương ứng số task; batch thất bại không tạo task hoặc audit mới. Đặt cả hai loại INSERT trong cùng transaction. Viết test kiểm tra số dòng ở cả hai bảng, với trường hợp lỗi xảy ra sau ít nhất một lần ghi.

## Hướng giải và tiêu chí đạt
Tạo bảng audit trước khi chạy request; trong vòng lặp lấy cursor.lastrowid rồi insert audit. Context manager conn commit khi khối hoàn thành và rollback khi exception. Đạt khi không có lịch sử mồ côi, không có Fresh sau batch lỗi, và tài nguyên luôn đóng trong finally. Viết rõ rằng context manager transaction và close connection là hai trách nhiệm riêng.

## Lỗi thường gặp và cách chẩn đoán
Không commit sau từng INSERT nếu yêu cầu batch phải nguyên tử, vì các thay đổi trước lỗi đã thành bền vững. Không bắt exception rồi tiếp tục return created toàn bộ. Không trả toàn bộ câu SQL trong detail cho client. Nếu test chỉ gửi dữ liệu trùng ở phần tử đầu, nó chưa chứng minh rollback các thay đổi đã xảy ra; luôn có ca thất bại sau một lần ghi.

## Câu hỏi tự kiểm tra có đáp án
- Transaction nguyên tử bảo đảm điều gì cho batch trong bài? Đáp án: Các thay đổi cùng thành công hoặc cùng rollback. Tính nguyên tử tránh trạng thái ghi dở dang.
- Vì sao SELECT kiểm tra trùng trước INSERT chưa đủ? Đáp án: Hai request có thể cùng thấy chưa tồn tại. Ràng buộc tại database xử lý tranh chấp ở điểm ghi.
- Commit sau từng dòng có phù hợp batch phải cùng thành công không? Đáp án: Không, lỗi sau không hủy được dòng đã commit. Phạm vi commit phải khớp đơn vị nghiệp vụ.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://docs.python.org/3/library/sqlite3.html#how-to-use-the-connection-context-manager
- https://www.sqlite.org/lang_createtable.html