## Mục tiêu bài học
- Thiết kế mã trạng thái cho tạo, đọc, cập nhật và xóa.
- Tách model đầu vào và model phản hồi để hạn chế lộ dữ liệu.
- Phân biệt 404, 409 và lỗi kiểm tra cấu trúc.

Thời gian dự kiến: 150 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Thiết kế mã trạng thái cho tạo, đọc, cập nhật và xóa.
- Tách model đầu vào và model phản hồi để hạn chế lộ dữ liệu.
- Phân biệt 404, 409 và lỗi kiểm tra cấu trúc.

## Kiến thức và cách suy luận
CRUD là nhóm thao tác tạo, đọc, cập nhật và xóa tài nguyên. Tên gọi này không thay thế thiết kế hợp đồng. Ta cần quyết định ID do ai tạo, xóa trả body hay không, cập nhật cho phép trường nào và phản hồi khi nhiệm vụ không tồn tại. Trong bài, tạo trả 201; đọc không có ID trả 404; tiêu đề trùng trả 409; xóa thành công trả 204 không kèm body.

Một bản ghi nội bộ có thể chứa trường chỉ phục vụ hệ thống. Model phản hồi mô tả các trường được phép công bố và đồng thời giúp FastAPI kiểm tra kết quả của hàm. Nếu trả dữ liệu thiếu trường bắt buộc của response_model, đó là lỗi phía triển khai server, không nên đổ cho người dùng. Vì vậy test cần kiểm tra nội dung phản hồi và trường không được công bố.

HTTPException dừng luồng xử lý bằng phản hồi lỗi có chủ đích. Dùng detail cụ thể nhưng không lộ câu SQL, đường dẫn file hoặc token. 404 phù hợp khi không tìm thấy tài nguyên; 409 phù hợp khi yêu cầu có cấu trúc đúng nhưng xung đột trạng thái, như title đã có theo quy tắc của bài. Không bắt mọi Exception rồi đổi thành 200 vì như vậy client không thể dùng mã trạng thái để xử lý.

Dữ liệu lưu trong dict chỉ dùng để quan sát hợp đồng trong một tiến trình. Nó mất khi khởi động lại và không đồng bộ giữa các worker; cũng chưa bảo đảm giao dịch khi có nhiều request cùng lúc. Ta vẫn bắt đầu bằng ví dụ nhỏ để phân biệt lỗi HTTP trước khi thêm SQLite. Khi đổi tầng lưu trữ, các test hợp đồng nên tiếp tục có ý nghĩa; đây là dấu hiệu ranh giới API được giữ ổn định.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
from fastapi import FastAPI, HTTPException, Response
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

class TaskIn(BaseModel):
    title: str = Field(min_length=1)

class TaskOut(BaseModel):
    id: int
    title: str

app = FastAPI()
store = {}

@app.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(payload: TaskIn):
    if any(x["title"] == payload.title for x in store.values()):
        raise HTTPException(409, "Title already exists")
    task_id = max(store, default=0) + 1
    item = {"id": task_id, "title": payload.title, "internal_note": "not public"}
    store[task_id] = item
    return item

@app.get("/tasks/{task_id}", response_model=TaskOut)
def read_task(task_id: int):
    if task_id not in store:
        raise HTTPException(404, "Task not found")
    return store[task_id]

@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    if task_id not in store:
        raise HTTPException(404, "Task not found")
    del store[task_id]
    return Response(status_code=204)

with TestClient(app) as client:
    result = client.post("/tasks", json={"title": "Read HTTP"})
    assert result.status_code == 201
    assert result.json() == {"id": 1, "title": "Read HTTP"}
    assert client.post("/tasks", json={"title": "Read HTTP"}).status_code == 409
    assert client.get("/tasks/99").status_code == 404
    deleted = client.delete("/tasks/1")
    assert deleted.status_code == 204 and deleted.content == b""
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Tạo một nhiệm vụ rồi lấy lại theo ID từ phản hồi, tránh giả định luôn là 1. Kiểm tra internal_note không có trong JSON dù tồn tại trong store. Gửi lại cùng tiêu đề và đối chiếu 409 với 422 của body thiếu title. Xóa nhiệm vụ, sau đó đọc lại để thấy 404. Ghi rõ trạng thái trước và sau mỗi bước; nếu test dùng chung state mà không đặt điều kiện trước, thứ tự chạy có thể gây hiểu nhầm.

Quan sát rằng 204 có content rỗng, không phải JSON {}. Đây là khác biệt quan trọng cho client: gọi response.json() một cách vô điều kiện sẽ lỗi khi body hợp lệ nhưng rỗng.

## Bài tập tự làm
Thêm PATCH /tasks/{task_id} để đổi title bằng model riêng. Giữ ID và internal_note do server quản lý. Nếu title mới trùng nhiệm vụ khác thì 409; nếu trùng chính nhiệm vụ đang sửa thì hợp lệ. Viết chuỗi kiểm tra tạo hai nhiệm vụ, đổi tên thành công, đổi thành title đang dùng thất bại và đọc lại xác nhận trạng thái không đổi sau lỗi.

## Hướng giải và tiêu chí đạt
Tra cứu item trước để phân biệt 404. Khi kiểm tra trùng, bỏ qua task có cùng task_id. Chỉ ghi title sau khi tất cả điều kiện nghiệp vụ đạt. Đạt khi response_model chỉ có id/title, một lỗi cập nhật không sửa nửa chừng dữ liệu, và test không dựa vào việc client bỏ qua thông báo lỗi. Nêu vì sao kiểu kiểm tra trùng bằng vòng lặp sẽ cần ràng buộc database trong ứng dụng có nhiều request.

## Lỗi thường gặp và cách chẩn đoán
Không trả {'error': ...} với 200 cho xung đột nếu hợp đồng đã quy định 409. Không dùng dict nội bộ làm model phản hồi mặc định khi chứa thông tin quản trị. Không phát sinh ID bằng len(store)+1 vì sau xóa có thể đụng ID cũ. Ví dụ max+1 cũng chỉ là cách minh họa; database sẽ quản lý ID và giao dịch ở bước sau.

## Câu hỏi tự kiểm tra có đáp án
- Mã nào được chọn cho tạo tài nguyên thành công trong bài? Đáp án: 201. 201 biểu diễn tài nguyên vừa được tạo.
- Tiêu đề hợp lệ nhưng đã tồn tại theo ràng buộc bài trả gì? Đáp án: 409. Yêu cầu xung đột với trạng thái tài nguyên hiện có.
- response_model giúp gì khi dict nội bộ có internal_note? Đáp án: Chỉ công bố các trường thuộc hợp đồng phản hồi. Model giới hạn dữ liệu API trả ra và kiểm tra kết quả.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://fastapi.tiangolo.com/tutorial/response-model/
- https://fastapi.tiangolo.com/tutorial/handling-errors/