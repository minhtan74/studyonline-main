## Mục tiêu bài học
- Mô tả request/response bằng phương thức, đường dẫn và trạng thái.
- Tạo endpoint có thể kiểm tra và đọc hợp đồng OpenAPI.
- Tách việc ứng dụng hoạt động với việc máy chủ đang nghe cổng.

Thời gian dự kiến: 150 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Mô tả request/response bằng phương thức, đường dẫn và trạng thái.
- Tạo endpoint có thể kiểm tra và đọc hợp đồng OpenAPI.
- Tách việc ứng dụng hoạt động với việc máy chủ đang nghe cổng.

## Kiến thức và cách suy luận
Một API là hợp đồng để chương trình khác gửi yêu cầu và hiểu phản hồi. Trong khóa này, tài nguyên là nhiệm vụ học tập: mỗi nhiệm vụ có mã, tiêu đề, chủ sở hữu và trạng thái hoàn thành. Trước khi viết mã, ghi ba điều: client gửi gì, server bảo đảm gì và lỗi nào client cần xử lý. Ví dụ GET /health trả trạng thái sống của ứng dụng; nó chưa khẳng định database, quyền người dùng hay toàn bộ nghiệp vụ đều tốt.

Request có phương thức, đường dẫn, header và có thể có body. Response có trạng thái, header và có thể có body. GET dùng để đọc; thao tác tạo thường dùng POST và trả 201. HTTP không tự áp đặt cấu trúc nghiệp vụ cho tên đường dẫn, nên đội phát triển phải thống nhất JSON và các tình huống lỗi. Không trả 200 cho mọi kết quả rồi buộc client đoán từ câu thông báo.

FastAPI đăng ký hàm xử lý bằng decorator. Python type hints hỗ trợ tạo lược đồ và kiểm tra dữ liệu ở ranh giới API. Tài liệu OpenAPI được tạo từ khai báo; phần mô tả vẫn cần người viết giải thích ý nghĩa và giới hạn. Một lược đồ hợp lệ không chứng minh endpoint thực hiện đúng phân quyền. Ta kiểm tra cả cấu trúc lẫn hành vi quan sát được.

Trong giai đoạn đầu, TestClient tạo đường gọi ngay trong tiến trình để tập trung vào HTTP. Khi chạy thật cục bộ, lưu ứng dụng thành main.py và dùng `python -m uvicorn main:app --reload --host 127.0.0.1`. Chế độ reload phù hợp phát triển. Phần trước dấu hai chấm là tên module, phần sau là biến ứng dụng. Lỗi import khác lỗi cổng đang bị chiếm; đọc đúng giai đoạn thất bại giúp sửa nhanh hơn.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI(title="Study Tasks", version="1.0.0")

@app.get("/health")
def health():
    return {"status": "ok"}

with TestClient(app) as client:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["content-type"].startswith("application/json")
    contract = client.get("/openapi.json").json()
    assert "get" in contract["paths"]["/health"]
    assert client.get("/missing").status_code == 404
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Chạy ví dụ nguyên bản rồi thay giá trị status thành ready; sửa assertion tương ứng và giải thích vì sao test cũ thất bại. Mở /openapi.json bằng TestClient, tìm đường dẫn /health và phương thức get. Sau đó chạy bằng Uvicorn trên loopback, truy cập /docs để so sánh giao diện tài liệu với JSON hợp đồng. Ghi riêng một request thành công và một đường dẫn không tồn tại. Đầu ra mong đợi là 200 và 404; không có bản ghi dữ liệu nào được tạo.

Viết bảng hợp đồng cho ba thao tác của dự án: xem một nhiệm vụ, tạo nhiệm vụ, đánh dấu hoàn thành. Chưa cần triển khai cả ba; mục tiêu là nhận biết mỗi request cần dữ liệu nào. Ghi thêm trường hợp nhiệm vụ không tồn tại để tài liệu bao phủ đường lỗi.

## Bài tập tự làm
Thêm GET /about trả tên khóa và phiên bản ứng dụng, có một test kiểm tra JSON chính xác. Thêm mô tả endpoint bằng docstring. Thử POST /about và ghi kết quả, phân biệt đường dẫn không tồn tại với phương thức không được hỗ trợ. Không thêm token hay dữ liệu người học thật vào bài. Nộp bảng bốn cột: phương thức, đường dẫn, mục đích, trạng thái dự kiến.

## Hướng giải và tiêu chí đạt
Hàm about trả một dict với hai khóa cố định; khai báo @app.get('/about') và kiểm tra 200. POST tới cùng đường dẫn thường trả 405 vì chỉ đăng ký GET; /khong-co trả 404. Đạt khi mỗi test khẳng định cả mã trạng thái và ý nghĩa dữ liệu, không chỉ kiểm tra request không gây exception. Đọc /openapi.json để xác nhận mô tả và phương thức đúng với hợp đồng đã viết.

## Lỗi thường gặp và cách chẩn đoán
Nếu chạy trực tiếp main.py mà không có lệnh khởi động máy chủ, Python chỉ tạo đối tượng ứng dụng rồi kết thúc. Nếu client chờ JSON nhưng nhận HTML, kiểm tra đúng cổng và route trước khi sửa parser. Đổi tên tệp thành fastapi.py có thể che khuất gói đã cài. Không xem giao diện /docs là bằng chứng duy nhất: test hành vi mới phát hiện được JSON sai hoặc mã trạng thái không đúng.

## Câu hỏi tự kiểm tra có đáp án
- Thông tin nào thuộc hợp đồng của GET /health? Đáp án: Trạng thái và cấu trúc phản hồi. Client cần biết cách diễn giải phản hồi.
- TestClient trong bài dùng để làm gì? Đáp án: Gửi request tới ứng dụng trong tiến trình kiểm thử. Có thể kiểm tra HTTP mà không mở cổng mạng.
- Đường dẫn tài liệu OpenAPI mặc định là gì? Đáp án: /openapi.json. FastAPI sinh lược đồ JSON theo khai báo ứng dụng.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://fastapi.tiangolo.com/tutorial/first-steps/