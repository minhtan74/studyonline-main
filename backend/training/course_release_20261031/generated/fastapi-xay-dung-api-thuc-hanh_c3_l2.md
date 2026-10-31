## Mục tiêu bài học
- Khởi tạo và thu hồi tài nguyên bằng lifespan.
- Đóng tài nguyên theo request trong dependency có yield.
- Chọn def/async def theo đặc tính thư viện I/O đang dùng.

Thời gian dự kiến: 150 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Khởi tạo và thu hồi tài nguyên bằng lifespan.
- Đóng tài nguyên theo request trong dependency có yield.
- Chọn def/async def theo đặc tính thư viện I/O đang dùng.

## Kiến thức và cách suy luận
Tài nguyên có các vòng đời khác nhau. Một cấu hình bất biến có thể sống cùng ứng dụng, còn kết nối hoặc transaction có thể chỉ sống trong một request. Lifespan là async context manager: phần trước yield chạy khi ứng dụng khởi động, phần sau yield chạy khi dừng. Dùng nó để chuẩn bị tài nguyên chung; khi viết test, đặt TestClient trong with để các bước khởi động và dọn dẹp được thực hiện.

Dependency có yield có dạng mở tài nguyên, yield cho handler và finally đóng lại. Finally quan trọng cả khi handler ném exception. Không return trước khi đóng tài nguyên nếu thiết kế cần kiểm soát vòng đời. Thời điểm dọn dependency có các chi tiết theo phiên bản và kiểu response; không dùng một tài nguyên đã đóng cho công việc chạy về sau. Ví dụ trong khóa dùng request/response ngắn và không stream để giữ phạm vi rõ.

`async def` hữu ích khi dùng thư viện hỗ trợ await cho thao tác chờ. Nó không tự biến sqlite3 hoặc một hàm chặn thành bất đồng bộ. Chặn event loop bằng sleep hay I/O đồng bộ trong async handler có thể làm các request khác phải chờ. Với sqlite3 chuẩn trong khóa, handler và dependency truy vấn dùng def để FastAPI thực thi phần sync theo cơ chế phù hợp. Đây không phải cam kết mọi workload sẽ nhanh hơn; vẫn phải đo trong môi trường cụ thể.

Đồng thời và song song là hai ý khác nhau. Một chương trình có thể quản lý nhiều việc chờ I/O mà không thực thi tính toán CPU trên nhiều lõi. Nếu endpoint xử lý CPU nặng như dựng video, thêm async không giải quyết bài toán tài nguyên. Cần tách công việc và thiết kế hàng đợi/worker khi thực sự có nhu cầu. Trong khóa ta đo và hiểu vòng đời trước, chưa triển khai hệ thống xử lý nền phân tán.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
from contextlib import asynccontextmanager
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException
from fastapi.testclient import TestClient

events = []

@asynccontextmanager
async def lifespan(app):
    events.append("startup")
    app.state.ready = True
    yield
    events.append("shutdown")

def resource():
    events.append("open")
    try:
        yield "handle"
    finally:
        events.append("close")

app = FastAPI(lifespan=lifespan)

@app.get("/work")
def work(handle: Annotated[str, Depends(resource)], fail: bool = False):
    if fail:
        raise HTTPException(409, "Simulated conflict")
    return {"handle": handle, "ready": app.state.ready}

with TestClient(app) as client:
    assert client.get("/work").json()["ready"] is True
    assert client.get("/work?fail=true").status_code == 409
assert events == ["startup", "open", "close", "open", "close", "shutdown"]
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Chạy test rồi in events nếu cần quan sát. Mỗi request phải có cặp open/close, kể cả request thất bại; startup và shutdown chỉ xuất hiện cho vòng đời client. Đổi HTTPException thành một giá trị trả về bình thường để thấy cleanup vẫn diễn ra. Viết sơ đồ phân biệt app lifetime và request lifetime, sau đó ghi tài nguyên nào trong dự án Task API thuộc mỗi phạm vi.

Đọc một đoạn code có `async def` và lời gọi sqlite3.execute, chỉ ra chỗ còn chặn. Không sửa bằng cách thêm await trước sqlite3 vì thư viện đó không cung cấp awaitable ở API này. Chọn lại handler def hoặc dùng thư viện async đúng cách trong một thiết kế khác.

## Bài tập tự làm
Thêm một dependency có bộ đếm số tài nguyên đang mở. Gửi ba request, trong đó một request phát sinh lỗi; sau tất cả bộ đếm phải bằng 0. Test thêm rằng startup chỉ chạy một lần khi dùng cùng with TestClient. Trình bày vì sao gọi client ngoài with có thể bỏ qua phần lifespan mà bài đang muốn kiểm chứng.

## Hướng giải và tiêu chí đạt
Tăng bộ đếm ngay trước yield, giảm trong finally. Handler lỗi không bỏ qua finally. Dùng assertions sau mỗi request để tránh chỉ thấy kết quả tổng mà không biết request nào làm rò. Đạt khi chuỗi events và số tài nguyên phù hợp với từng phạm vi, và phần giải thích sync/async nhắc loại thư viện chứ không chỉ đếm từ khóa async.

## Lỗi thường gặp và cách chẩn đoán
Không lưu một connection SQLite mở toàn cục rồi dùng tùy ý qua mọi request và thread. Không dùng time.sleep trong async handler để mô phỏng chờ I/O nếu đang đánh giá concurrency. Không mở lại tài nguyên đắt tiền trên mỗi request khi nó được thiết kế sống cùng app. Các quyết định về lifespan phải có test khởi động/dừng; chạy một endpoint thành công chưa chứng minh cleanup đúng.

## Câu hỏi tự kiểm tra có đáp án
- with TestClient(app) giúp kiểm tra điều gì? Đáp án: Chạy vòng đời khởi động và dừng của ứng dụng. Context manager thực hiện lifespan khi vào và ra.
- Nơi phù hợp để đóng tài nguyên quanh yield là đâu? Đáp án: Khối finally. Finally vẫn chạy khi có exception.
- async def có tự biến sqlite3.execute thành I/O không chặn không? Đáp án: Không. Phải xét thư viện có hỗ trợ await hay không.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://fastapi.tiangolo.com/advanced/events/
- https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/
- https://fastapi.tiangolo.com/async/