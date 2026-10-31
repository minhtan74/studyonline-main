## Mục tiêu bài học
- Thiết kế test theo hành vi quan sát được thay vì cấu trúc hàm.
- Tách trạng thái giữa các lần kiểm thử bằng app factory.
- Kiểm tra cả mã trạng thái, dữ liệu và tác động sau lỗi.

Thời gian dự kiến: 150 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Thiết kế test theo hành vi quan sát được thay vì cấu trúc hàm.
- Tách trạng thái giữa các lần kiểm thử bằng app factory.
- Kiểm tra cả mã trạng thái, dữ liệu và tác động sau lỗi.

## Kiến thức và cách suy luận
Một test tốt mô tả một lý do hành vi phải đúng. Với API nhiệm vụ, các nhóm quan trọng là đầu vào, hợp đồng JSON, quyền và tính bền vững. Test chỉ kiểm tra 200 có thể bỏ sót trường dữ liệu nhạy cảm hoặc bản ghi bị sửa sai. Ta thường khẳng định status, JSON liên quan và trạng thái tài nguyên sau request, đặc biệt sau một lỗi ghi.

App factory là hàm tạo ứng dụng với cấu hình và nguồn dữ liệu rõ ràng. Mỗi test có thể nhận một app và database riêng, tránh phụ thuộc thứ tự chạy. Một biến store dùng chung qua mọi bài test dễ làm ID và số item thay đổi. Thay vì viết test chấp nhận bất kỳ trạng thái, hãy kiểm soát điều kiện trước và làm rõ cái gì cần tồn tại.

TestClient phù hợp kiểm tra request đồng bộ tới app ASGI trong tiến trình. Sử dụng context manager khi muốn chạy lifespan. Đây là kiểm thử tích hợp nhẹ của route và dependency; nó không thay thế đo tải, kiểm thử qua proxy/TLS hoặc đánh giá bảo mật độc lập. Đặt tên test theo hành vi như rejects_foreign_owner thay vì test_function_3.

Chọn ca biên theo quy tắc, không chỉ nhân bản đường thành công. Với title 1..120 ký tự, cần rỗng, trắng, đúng giới hạn và vượt giới hạn. Với danh tính, cần thiếu, sai, hợp lệ đúng chủ và hợp lệ khác chủ. Với transaction, cần lỗi sau ít nhất một lần ghi. Nếu có thay đổi hợp đồng, test cũ thất bại là tín hiệu cần đánh giá; không sửa assertion chỉ để mọi thứ xanh mà chưa hiểu tác động.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)

def create_app():
    app = FastAPI()
    store = {}

    @app.post("/tasks", status_code=201)
    def create_task(payload: TaskIn):
        if payload.title in store.values():
            raise HTTPException(409, "Duplicate title")
        key = max(store, default=0) + 1
        store[key] = payload.title
        return {"id": key, "title": payload.title}

    @app.get("/tasks")
    def list_tasks():
        return {"items": list(store.values())}
    return app

for _ in range(2):
    with TestClient(create_app()) as client:
        assert client.get("/tasks").json() == {"items": []}
        assert client.post("/tasks", json={"title": "HTTP"}).status_code == 201
        assert client.post("/tasks", json={"title": "HTTP"}).status_code == 409
        assert client.post("/tasks", json={"title": ""}).status_code == 422
        assert client.get("/tasks").json() == {"items": ["HTTP"]}
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Vòng lặp tạo app hai lần để chứng minh lần hai không thấy state lần một. Trong mỗi lần, request trùng và request title rỗng không làm tăng danh sách. Ghi từng assertion cùng lỗi mà nó có thể phát hiện; nếu không giải thích được vì sao assertion tồn tại, cân nhắc thay bằng quan sát có ý nghĩa hơn.

Đổi code ứng dụng có chủ đích trong bản sao bài: bỏ kiểm tra trùng, rồi chạy test để thấy assertion 409 thất bại. Khôi phục code. Đây là thao tác giúp hiểu test có thật sự bảo vệ quy tắc hay chỉ luôn đúng; không cần đưa lỗi chủ đích vào bản nộp.

## Bài tập tự làm
Chuyển các kiểm tra thành hàm pytest có tên rõ ràng và fixture tạo client mới. Thêm test title dài 120 và 121 ký tự. Với dự án cuối khóa, bổ sung test quyền của Alice/Bob và test restart database file. Viết bảng yêu cầu → test để chỉ ra ít nhất một yêu cầu chưa có kiểm thử tự động và đề xuất cách đánh giá thủ công.

## Hướng giải và tiêu chí đạt
Fixture yield client bên trong with TestClient(create_app()), mỗi test nhận app mới. Test biên kiểm tra 201 cho 120 và 422 cho 121. Test quyền khẳng định cả trạng thái phản hồi và bản ghi vẫn nguyên sau thao tác bị chặn. Đạt khi chạy hai lần liên tiếp không phụ thuộc database cũ, không gọi mạng ngoài và tên test thể hiện hành vi hợp đồng.

## Lỗi thường gặp và cách chẩn đoán
Không dùng sleep để chờ dữ liệu nếu luồng request đã đồng bộ và có phản hồi rõ. Không đọc thuộc tính store riêng để xác nhận mọi hành vi nếu có thể quan sát qua API; như vậy test sẽ vỡ khi đổi tầng lưu trữ dù hợp đồng giữ nguyên. Ngược lại, với transaction cần kiểm tra dữ liệu bền vững thật trong test tích hợp, không chỉ tin response created.

## Câu hỏi tự kiểm tra có đáp án
- Test tạo nhiệm vụ nên kiểm tra thêm gì ngoài status 201? Đáp án: Nội dung phản hồi và khả năng đọc lại dữ liệu. Cần quan sát tài nguyên thực sự được tạo theo hợp đồng.
- App factory giúp gì trong test? Đáp án: Tạo ứng dụng có state độc lập và cấu hình kiểm soát được. Cô lập điều kiện trước làm test ít phụ thuộc thứ tự.
- Test request lỗi ghi dữ liệu nên xác nhận gì? Đáp án: Trạng thái dữ liệu không đổi ngoài ý muốn. Phản hồi lỗi chưa tự chứng minh không có tác động phụ.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://fastapi.tiangolo.com/tutorial/testing/
- https://docs.pytest.org/en/stable/how-to/fixtures.html