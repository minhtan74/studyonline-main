## Mục tiêu bài học
- Phân biệt định danh tài nguyên với tùy chọn lọc danh sách.
- Giới hạn đầu vào và kích thước trang bằng Annotated.
- Kiểm tra route tĩnh, dữ liệu sai kiểu và các biên số.

Thời gian dự kiến: 150 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Phân biệt định danh tài nguyên với tùy chọn lọc danh sách.
- Giới hạn đầu vào và kích thước trang bằng Annotated.
- Kiểm tra route tĩnh, dữ liệu sai kiểu và các biên số.

## Kiến thức và cách suy luận
Đường dẫn nên thể hiện tài nguyên: /tasks/12 chọn một nhiệm vụ cụ thể. Query string thay đổi cách xem danh sách: /tasks?offset=0&limit=20. Không xem số trang là ID nhiệm vụ. Quy ước này giúp client đọc hợp đồng, còn tính đúng đắn vẫn cần kiểm tra ở server. Khi tham số có type int, giá trị không chuyển đổi được sẽ gây phản hồi kiểm tra dữ liệu thay vì âm thầm thành số 0.

`Annotated` cho phép kết hợp kiểu Python với metadata của FastAPI. Path(ge=1) quy định ID dương; Query(ge=1, le=50) khống chế kích thước trang. Giới hạn không chỉ để form đẹp: một client có thể tự gửi request, bỏ qua giao diện. Phân trang có giới hạn tránh việc một lần gọi vô tình đọc toàn bộ bảng. Về sau truy vấn SQL còn phải có ORDER BY ổn định để offset có ý nghĩa.

Route /tasks/stats nên đăng ký trước /tasks/{task_id}; nếu route động được xét trước, chuỗi stats có thể bị coi là task_id rồi thất bại kiểm tra số. Thứ tự đăng ký là một chi tiết cần test khi route tĩnh và động dùng cùng tiền tố. Không giải quyết bằng cách nới task_id thành str nếu nghiệp vụ thật sự yêu cầu ID số.

Phân trang offset dễ học nhưng có giới hạn: dữ liệu thêm/xóa giữa hai request có thể làm item chuyển trang. Trong bài ta dùng danh sách ổn định để hiểu hợp đồng trước. Với tập dữ liệu thay đổi nhanh có thể cần cursor và mốc sắp xếp. Dù dùng cách nào, client cần biết một trang trống nghĩa là không còn phần tử phù hợp, không phải lúc nào cũng là lỗi. Tách tổng số kết quả và số item trang hiện tại nếu hợp đồng cần cả hai.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
from typing import Annotated
from fastapi import FastAPI, Path, Query
from fastapi.testclient import TestClient

app = FastAPI()
data = [{"id": 1, "title": "HTTP"}, {"id": 2, "title": "Validation"}]

@app.get("/tasks/stats")
def stats():
    return {"count": len(data)}

@app.get("/tasks/{task_id}")
def read_task(task_id: Annotated[int, Path(ge=1)]):
    return {"requested_id": task_id}

@app.get("/tasks")
def list_tasks(offset: Annotated[int, Query(ge=0)] = 0,
               limit: Annotated[int, Query(ge=1, le=50)] = 10):
    return {"items": data[offset:offset + limit], "total": len(data)}

with TestClient(app) as client:
    assert client.get("/tasks?limit=1").json()["items"] == data[:1]
    assert client.get("/tasks?offset=2").json()["items"] == []
    assert client.get("/tasks?limit=51").status_code == 422
    assert client.get("/tasks/0").status_code == 422
    assert client.get("/tasks/nope").status_code == 422
    assert client.get("/tasks/stats").json() == {"count": 2}
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Vẽ các miền đầu vào cho limit: nhỏ hơn 1, từ 1 đến 50 và lớn hơn 50. Chạy 0, 1, 50, 51 để quan sát biên. Đổi offset sang 1, limit sang 1 và kiểm tra nhiệm vụ Validation xuất hiện. Giữ offset=2 để quan sát trang rỗng hợp lệ. Thử /tasks/stats trước rồi sau khi đảo thứ tự đăng ký hai route; ghi vì sao bản đảo có thể trả 422. Khôi phục thứ tự đúng khi nộp bài.

Phân biệt hai kết quả 422 của /tasks/nope và /tasks/0: một bên không parse được int, bên kia là số nguyên nhưng ngoài miền cho phép. Khi viết giao diện, cả hai đều cần phản hồi nhập liệu rõ; khi chẩn đoán, chi tiết lỗi cho biết vị trí và loại ràng buộc.

## Bài tập tự làm
Bổ sung bộ lọc done: bool | None với ba trạng thái: không gửi lấy tất cả, true lấy hoàn thành, false lấy chưa hoàn thành. Thêm trường done cho hai phần tử mẫu. Lọc trước rồi mới cắt trang; total phải là số phần tử sau lọc nhưng trước phân trang. Viết test mà lọc và offset cùng xuất hiện để phát hiện việc cắt trang sai thứ tự.

## Hướng giải và tiêu chí đạt
Tạo biến filtered từ data theo điều kiện done is None hoặc item['done'] == done. Tính total=len(filtered), items=filtered[offset:offset+limit]. Đạt khi done=false không bị hiểu nhầm là 'không gửi', vì False là giá trị có ý nghĩa. Giữ kiểm tra limit và offset trên mọi tổ hợp bộ lọc. Bài giải phải giải thích total khác len(items) trong trường hợp có nhiều trang.

## Lỗi thường gặp và cách chẩn đoán
Không viết if done để quyết định có lọc hay không, vì nhánh false sẽ bị bỏ qua. Không dùng tham số limit không giới hạn rồi chờ frontend tự khống chế. Không khẳng định /tasks/999 tồn tại chỉ vì ID hợp lệ: kiểm tra định dạng là một bước, tìm tài nguyên là bước khác. Ở các bài sau, ID hợp lệ nhưng không có bản ghi sẽ trả 404.

## Câu hỏi tự kiểm tra có đáp án
- Thông tin nào phù hợp làm query parameter của danh sách? Đáp án: Giới hạn số phần tử mỗi trang. limit thay đổi cách lấy một trang danh sách.
- Query(ge=1, le=50) chấp nhận giá trị nào? Đáp án: 50. Hai đầu 1 và 50 đều được phép.
- Cách nào phân biệt done=false với không gửi done? Đáp án: Kiểm tra done is None. None biểu diễn không cung cấp bộ lọc.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://fastapi.tiangolo.com/tutorial/path-params/
- https://fastapi.tiangolo.com/tutorial/query-params-str-validations/