## Mục tiêu bài học
- Đưa giá trị theo môi trường ra khỏi mã nghiệp vụ.
- Ghi nhật ký đủ chẩn đoán mà tránh lộ token và body riêng tư.
- Phân biệt cấu hình phát triển với điều kiện đưa dịch vụ ra mạng.

Thời gian dự kiến: 150 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Đưa giá trị theo môi trường ra khỏi mã nghiệp vụ.
- Ghi nhật ký đủ chẩn đoán mà tránh lộ token và body riêng tư.
- Phân biệt cấu hình phát triển với điều kiện đưa dịch vụ ra mạng.

## Kiến thức và cách suy luận
Ứng dụng cần thay đổi đường dẫn database, tên dịch vụ và danh tính demo theo môi trường. Các giá trị này không nên rải khắp handler. Ta có thể đọc environment một lần khi tạo app, kiểm tra dữ liệu cấu hình rồi truyền cho các thành phần. Trong dự án, đường dẫn file và bảng token được cung cấp rõ vào create_app; run.py từ chối khởi động nếu thiếu token demo, tránh một mật khẩu mặc định vô tình được dùng chung.

Nhật ký giúp nối một request với diễn biến xử lý. Một request ID do server tạo và trả ở header giúp người kiểm tra báo lỗi mà không cần gửi body nhạy cảm. Chỉ ghi phương thức, đường dẫn đã chọn và status trong ví dụ. Không ghi nguyên Authorization, toàn bộ query chứa bí mật hoặc body tùy ý. Mã request không thay thế xác thực; nó chỉ hỗ trợ chẩn đoán.

Tách liveness khỏi readiness khi cần: liveness nói tiến trình còn phản hồi, readiness có thể kiểm tra tài nguyên bắt buộc như database. Một probe truy cập dữ liệu quá nặng hoặc để lộ cấu hình sẽ tạo vấn đề mới. Trong bài health chỉ trả tên trạng thái cố định, còn kiểm tra lưu trữ được thực hiện qua test và startup. Nếu thay đổi probe, ghi rõ điều nó chứng minh.

Chạy local bằng host 127.0.0.1 giữ phạm vi bài trong máy học viên. --reload dành cho phát triển và không thay thế quản lý tiến trình. Trước khi đưa dịch vụ ra mạng cần đánh giá TLS, cấp/thu hồi token, backup/restore, giới hạn request, migration và giám sát theo ngữ cảnh. Khóa cung cấp ứng dụng học tập chạy được và quy trình kiểm tra, không tuyên bố cấu hình demo đáp ứng mọi yêu cầu triển khai thật.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
from dataclasses import dataclass
from uuid import uuid4
from fastapi import FastAPI
from fastapi.testclient import TestClient

@dataclass(frozen=True)
class Config:
    service: str

def create_app(config):
    app = FastAPI(title=config.service)

    @app.middleware("http")
    async def add_request_id(request, call_next):
        request_id = uuid4().hex
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    @app.get("/health")
    def health():
        return {"status": "ok", "service": config.service}
    return app

with TestClient(create_app(Config(service="isolated-lab"))) as client:
    first = client.get("/health")
    second = client.get("/health")
    assert first.json() == {"status": "ok", "service": "isolated-lab"}
    assert len(first.headers["X-Request-ID"]) == 32
    assert first.headers["X-Request-ID"] != second.headers["X-Request-ID"]
    assert "Authorization" not in first.json()
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Chạy hai request để thấy X-Request-ID khác nhau nhưng JSON nghiệp vụ ổn định. Tạo hai app với service khác nhau và kiểm tra tên theo đúng cấu hình của từng app. Không đặt biến cấu hình của app thứ hai vào biến toàn cục mà app thứ nhất cùng đọc. Thêm log thử chỉ chứa method, path và status; xem token có vô tình xuất hiện trong chuỗi log không.

Viết bản ghi sự cố mẫu: thời điểm, request ID, thao tác, trạng thái và kết quả mong đợi. Bản ghi không chứa mật khẩu, token hoặc dữ liệu người khác. Điều này đủ cho người hỗ trợ bắt đầu tra log theo mã yêu cầu.

## Bài tập tự làm
Viết hàm đọc environment riêng có tham số mapping để test không sửa environment toàn tiến trình. Yêu cầu DATABASE_PATH không rỗng; nếu thiếu phải lỗi cấu hình trước khi nhận request. Thêm README chạy local, dừng bằng Ctrl+C, vị trí file database và cách chạy lại test trên file tạm riêng.

## Hướng giải và tiêu chí đạt
Hàm load_config(values) kiểm tra chuỗi đường dẫn rồi trả Config bất biến; test dùng dict nên không cần ghi .env hay in giá trị bí mật. Đạt khi thiếu cấu hình báo lỗi rõ, health không lộ đường dẫn database hoặc token, và các bước README thực hiện được từ thư mục dự án mới. Viết riêng hạng mục còn cần đánh giá trước triển khai mạng thay vì gọi reload là cơ chế vận hành.

## Lỗi thường gặp và cách chẩn đoán
Không log repr(request.headers) hoặc toàn bộ payload để tìm lỗi nhanh vì có thể giữ bí mật lâu dài. Không dùng request ID do client tùy ý gửi làm dữ liệu tin cậy nếu chưa giới hạn/kiểm tra. Không đưa .env chứa token vào bài nộp. Khi ứng dụng không khởi động, kiểm tra cấu hình và traceback trước; không tắt mọi kiểm tra cấu hình chỉ để server nghe được cổng.

## Câu hỏi tự kiểm tra có đáp án
- Giá trị nào phù hợp đưa ra cấu hình? Đáp án: Đường dẫn database theo môi trường. Môi trường có thể dùng đường dẫn lưu trữ khác nhau.
- Log nào nên tránh? Đáp án: Toàn bộ header Authorization. Token là bằng chứng danh tính cần hạn chế xuất hiện trong log.
- X-Request-ID trong bài dùng cho mục đích gì? Đáp án: Liên hệ phản hồi với thông tin chẩn đoán. Mã theo dõi hỗ trợ tìm request, không cấp quyền.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://fastapi.tiangolo.com/advanced/settings/
- https://docs.python.org/3/library/logging.html