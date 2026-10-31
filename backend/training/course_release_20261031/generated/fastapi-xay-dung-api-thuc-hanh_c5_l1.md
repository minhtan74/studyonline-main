## Mục tiêu bài học
- Phân biệt bằng chứng danh tính với quyền trên một bản ghi.
- Kiểm tra Bearer token qua dependency dùng chung.
- Viết test truy cập chéo tài khoản và phản hồi 401/403.

Thời gian dự kiến: 150 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Phân biệt bằng chứng danh tính với quyền trên một bản ghi.
- Kiểm tra Bearer token qua dependency dùng chung.
- Viết test truy cập chéo tài khoản và phản hồi 401/403.

## Kiến thức và cách suy luận
Xác thực trả lời 'đây là ai', phân quyền trả lời 'người đó được làm gì'. Có token hợp lệ không có nghĩa được xem nhiệm vụ của mọi người. Trong dự án, token ánh xạ tới user_id; mỗi nhiệm vụ lưu owner_id. Endpoint tạo lấy owner từ dependency, còn endpoint đọc/sửa/xóa phải kiểm tra bản ghi thuộc người hiện tại.

Bearer nghĩa là bên giữ token có thể trình token làm bằng chứng. Không đặt token vào URL vì URL dễ xuất hiện trong lịch sử hoặc log. HTTPS cần thiết khi truyền bí mật qua mạng; ví dụ của khóa chỉ chạy cục bộ. `HTTPBearer(auto_error=False)` giúp dependency tự xử lý rõ trường hợp không có hoặc sai header, tránh dựa vào khác biệt mã mặc định giữa các phiên bản thư viện.

Bài dùng hai token giả trong bộ nhớ để học luồng kiểm tra quyền và test. Đây không phải dịch vụ cấp token, không phải triển khai OAuth2/JWT hoàn chỉnh. Hệ thống thật cần cách đăng nhập, lưu mật khẩu đã băm, thời hạn, thu hồi, quản lý khóa và kiểm soát vận hành thích hợp. Ta không thêm thư viện bảo mật tùy tiện rồi gọi mọi thứ đã an toàn; hợp đồng demo phải ghi rõ phạm vi.

Trong hợp đồng của bài, thiếu/sai token trả 401 và WWW-Authenticate: Bearer; user hợp lệ nhưng truy cập nhiệm vụ của người khác trả 403; ID không tồn tại trả 404. Một sản phẩm có thể chọn 404 cho tài nguyên không thuộc quyền để giảm tiết lộ sự tồn tại, nhưng phải nhất quán và có test. Không dùng việc ẩn nút giao diện làm kiểm tra quyền: client có thể gọi HTTP trực tiếp.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.testclient import TestClient

bearer = HTTPBearer(auto_error=False)
tokens = {"local-alice-demo": 1, "local-bob-demo": 2}
tasks = {10: {"id": 10, "owner_id": 1, "title": "Private exercise"}}
app = FastAPI()

def current_user(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]):
    if credentials is None or credentials.scheme.lower() != "bearer" or credentials.credentials not in tokens:
        raise HTTPException(401, "Authentication required", headers={"WWW-Authenticate": "Bearer"})
    return tokens[credentials.credentials]

@app.get("/tasks/{task_id}")
def read_task(task_id: int, user_id: Annotated[int, Depends(current_user)]):
    task = tasks.get(task_id)
    if task is None:
        raise HTTPException(404, "Task not found")
    if task["owner_id"] != user_id:
        raise HTTPException(403, "Not allowed")
    return task

with TestClient(app) as client:
    assert client.get("/tasks/10").status_code == 401
    assert client.get("/tasks/10", headers={"Authorization": "Bearer unknown"}).status_code == 401
    assert client.get("/tasks/10", headers={"Authorization": "Bearer local-bob-demo"}).status_code == 403
    assert client.get("/tasks/10", headers={"Authorization": "Bearer local-alice-demo"}).status_code == 200
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Lập ma trận token thiếu, token sai, Alice đúng chủ sở hữu, Bob đúng danh tính nhưng sai chủ sở hữu. Gửi cả bốn request trực tiếp bằng TestClient và ghi trạng thái. Giữ nguyên dữ liệu tasks để thấy sự khác nhau do quyền chứ không do nội dung endpoint. Thêm ID không tồn tại với token Alice để có ca 404.

Thử gửi owner_id=1 trong query khi dùng token Bob. Request vẫn phải 403 vì owner được quyết định bằng bản ghi và dependency, không phải query. Khi ghi bằng chứng, dùng nhãn Alice/Bob thay giá trị token; các token trong bài là giả và chỉ phục vụ máy cục bộ.

## Bài tập tự làm
Thêm POST /tasks lấy owner_id từ current_user và model body chỉ chứa title. Hai người có thể tạo nhiệm vụ riêng; GET danh sách chỉ lấy nhiệm vụ của người hiện tại. Test người khác không đọc, sửa hoặc xóa được bản ghi vừa tạo. Chọn một quy ước 403 hoặc 404 cho truy cập chéo và giải thích quyết định trong README.

## Hướng giải và tiêu chí đạt
Handler tạo gán owner_id=user_id sau khi dependency xác nhận token. Handler danh sách lọc theo owner; handler thao tác một ID kiểm tra quyền ở server trước khi ghi. Đạt khi cả GET, PATCH và DELETE đều có test truy cập chéo, request lỗi không làm thay đổi bản ghi và owner_id trong body không được dùng để giả danh. Ghi phạm vi demo của token cố định thay vì gọi nó là đăng nhập dùng thật.

## Lỗi thường gặp và cách chẩn đoán
Không nhầm decode dữ liệu token với xác minh token. Không lưu token thật vào repo, ảnh chụp hoặc log. Không tạo dependency trả user từ query parameter rồi đặt tên là current_user để tưởng đã xác thực. Khi một route mới được thêm, review ma trận quyền; việc route khác có Depends không tự bảo vệ route mới.

## Câu hỏi tự kiểm tra có đáp án
- Xác thực và phân quyền khác nhau thế nào? Đáp án: Xác thực xác định danh tính, phân quyền quyết định thao tác được phép. Danh tính hợp lệ vẫn có giới hạn quyền.
- Token nên truyền ở đâu trong ví dụ? Đáp án: Header Authorization: Bearer .... Header giúp theo hợp đồng Bearer và tránh token trong URL.
- Bob có token hợp lệ nhưng mở nhiệm vụ Alice theo hợp đồng bài nhận gì? Đáp án: 403. Danh tính hợp lệ nhưng không có quyền trên tài nguyên.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://fastapi.tiangolo.com/tutorial/security/
- https://fastapi.tiangolo.com/reference/security/