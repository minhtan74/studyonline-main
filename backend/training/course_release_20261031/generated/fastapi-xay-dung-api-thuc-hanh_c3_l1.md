## Mục tiêu bài học
- Đưa việc đọc cấu hình/người dùng vào dependency dùng lại được.
- Giải thích Depends tạo và truyền giá trị cho hàm xử lý.
- Thay dependency trong kiểm thử mà không sửa mã ứng dụng.

Thời gian dự kiến: 150 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Đưa việc đọc cấu hình/người dùng vào dependency dùng lại được.
- Giải thích Depends tạo và truyền giá trị cho hàm xử lý.
- Thay dependency trong kiểm thử mà không sửa mã ứng dụng.

## Kiến thức và cách suy luận
Một endpoint thường cần đọc cấu hình, xác định người dùng và lấy kết nối dữ liệu. Nếu viết lại cùng thao tác trong mọi hàm, rất dễ bỏ sót kiểm tra khi thêm route. Dependency injection cho phép khai báo thứ cần dùng thay vì tự tạo mọi thứ tại chỗ. FastAPI giải quyết dependency, kiểm tra đầu vào của nó và truyền kết quả cho handler.

`Depends(get_settings)` truyền hàm, không gọi get_settings ngay lúc khai báo. Hàm dependency có thể dùng dependency khác để tạo cây phụ thuộc. Trong request thông thường, một dependency dùng lặp được cache theo request trừ khi cấu hình khác; không suy từ đó thành cache toàn bộ ứng dụng. Dữ liệu theo user không nên vô tình biến thành singleton dùng chung mọi người.

Khi kiểm thử nghiệp vụ, ta có thể ghi vào app.dependency_overrides để thay nguồn cấu hình hoặc danh tính. Điều này giúp kiểm soát điều kiện trước, giảm phụ thuộc vào môi trường. Sau test phải xóa override; nếu không, test sau có thể tiếp tục chạy bằng người dùng hoặc dịch vụ giả. Override là công cụ test, không phải cơ chế phân quyền cho client.

Tách trách nhiệm không có nghĩa tạo thật nhiều lớp cho ví dụ nhỏ. Một endpoint nên nhận dữ liệu đã kiểm tra, gọi hành vi cần thiết và trả phản hồi. Dependency phù hợp cho tài nguyên theo request, cấu hình và danh tính; phép tính thuần như lọc danh sách vẫn có thể là hàm Python bình thường. Mục tiêu là đường đi của dữ liệu dễ hiểu và có thể thay thế khi test.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
from dataclasses import dataclass
from typing import Annotated
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

@dataclass(frozen=True)
class Settings:
    service: str

def get_settings():
    return Settings(service="study-tasks")

app = FastAPI()

@app.get("/info")
def info(settings: Annotated[Settings, Depends(get_settings)]):
    return {"service": settings.service}

with TestClient(app) as client:
    assert client.get("/info").json() == {"service": "study-tasks"}
    app.dependency_overrides[get_settings] = lambda: Settings(service="isolated-test")
    try:
        assert client.get("/info").json() == {"service": "isolated-test"}
    finally:
        app.dependency_overrides.clear()
    assert client.get("/info").json() == {"service": "study-tasks"}
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Đọc code từ khai báo info trở lên: tham số settings không phải query string do client tự đặt mà là giá trị get_settings trả về. Gửi /info?service=hacked và thấy tên dịch vụ không đổi; dependency đang quyết định nguồn tin cậy. Thay override bằng tên sandbox, chạy kiểm tra rồi xóa override trong finally. Đầu ra trước và sau đều là study-tasks, chỉ trong vùng kiểm tra mới là isolated-test.

Vẽ cây info → get_settings. Sau đó thêm hàm format_info thuần nhận Settings và trả dict. Giải thích sự khác nhau giữa gọi hàm thuần trực tiếp và để FastAPI giải quyết dependency trong request.

## Bài tập tự làm
Tạo dependency get_current_user trả dữ liệu người dùng mẫu với id và role, rồi endpoint /me công bố hai trường đó. Test override một học viên khác để chứng minh endpoint không phụ thuộc ID cố định. Chưa gọi đây là đăng nhập thật: bài hiện chỉ học cách truyền danh tính; kiểm tra token sẽ được bổ sung sau.

## Hướng giải và tiêu chí đạt
Khai báo dataclass User và dependency không nhận user_id từ query. /me dùng Annotated[User, Depends(get_current_user)]. Test lần lượt hai ID và khôi phục override. Đạt khi mọi test có điều kiện trước rõ, một user trong test không rò sang test sau, và người học giải thích được dependency chưa xác thực nếu chỉ trả user cố định. Lập danh sách route tương lai cần cùng dependency danh tính.

## Lỗi thường gặp và cách chẩn đoán
Depends(get_settings()) truyền kết quả thay vì callable và thường làm ứng dụng lỗi khởi tạo. Gọi info() như hàm Python bình thường không tự chạy cơ chế FastAPI. Không giữ mutable dict người dùng toàn cục rồi sửa nó cho từng request. Nếu override không có tác dụng, kiểm tra khóa là đúng đối tượng hàm dependency đã đăng ký, không phải một hàm khác có cùng tên.

## Câu hỏi tự kiểm tra có đáp án
- Khai báo Depends nào phù hợp? Đáp án: Depends(get_settings). FastAPI cần callable để giải quyết dependency.
- app.dependency_overrides thường dùng để làm gì? Đáp án: Thay nguồn phụ thuộc có kiểm soát trong test. Test có thể thay cấu hình hoặc dịch vụ mà không sửa handler.
- Sau khi test dùng override nên làm gì? Đáp án: Khôi phục hoặc xóa override trong finally. Dọn trạng thái giúp các test độc lập.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://fastapi.tiangolo.com/tutorial/dependencies/
- https://fastapi.tiangolo.com/advanced/testing-dependencies/