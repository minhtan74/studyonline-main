## Mục tiêu bài học
- Khai báo model tạo nhiệm vụ có ràng buộc cụ thể.
- Phân biệt dữ liệu sau kiểm tra với JSON thô.
- Dùng model_dump và model_validate theo API Pydantic 2.

Thời gian dự kiến: 150 phút, gồm đọc và thực hành.

## Mục tiêu học tập
- Khai báo model tạo nhiệm vụ có ràng buộc cụ thể.
- Phân biệt dữ liệu sau kiểm tra với JSON thô.
- Dùng model_dump và model_validate theo API Pydantic 2.

## Kiến thức và cách suy luận
JSON chỉ mô tả các giá trị; nghiệp vụ cần quy tắc như tiêu đề không rỗng và số phút trong phạm vi. Pydantic BaseModel là lớp mô tả dữ liệu ở ranh giới. Field(min_length=1, max_length=120) giới hạn chuỗi; ge và le giới hạn số. Cấu hình str_strip_whitespace giúp loại khoảng trắng thừa trước khi áp ràng buộc chuỗi. Một tiêu đề chỉ chứa dấu cách sẽ thành rỗng rồi bị từ chối, thay vì lọt vào database.

Mặc định Pydantic có thể chuyển đổi một số giá trị tương thích. Khi hợp đồng cần loại bỏ chuyển đổi, dùng kiểu strict hoặc Field(strict=True) ở đúng trường. Không có một lựa chọn strict phù hợp mọi API: query string vốn là văn bản, còn JSON boolean và số có thể cần phân biệt rõ. Trong bài ta chọn minutes là int strict để khách phải gửi JSON số nguyên; tài liệu phải nêu điều này.

Model đầu vào không nên có owner_id do client tự chọn. Danh tính sẽ lấy từ bước xác thực trong các bài sau. Tương tự, ID tự tăng do server quản lý. Đầu vào chỉ chứa trường học viên được quyền đề nghị. `extra='forbid'` phát hiện trường lạ và lỗi chính tả, nhưng cũng là thay đổi hợp đồng cần cân nhắc khi mở rộng phiên bản API.

Trong Pydantic 2, `model_validate` kiểm tra một cấu trúc Python và `model_dump` tạo dict biểu diễn giá trị đã kiểm tra. `model_dump(mode='json')` giúp biểu diễn các kiểu như datetime theo dạng tương thích JSON. Các hàm này khác việc tự lấy __dict__, vốn có thể làm lẫn trạng thái nội bộ. Validation hỗ trợ định dạng và các quy tắc được khai báo; các điều kiện cần tra database, như tiêu đề trùng trong cùng tài khoản, vẫn thuộc luồng dịch vụ/giao dịch.

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
from contextlib import closing
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, ConfigDict, Field

class TaskCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    title: str = Field(min_length=1, max_length=120)
    minutes: int = Field(ge=5, le=240, strict=True)

app = FastAPI()

@app.post("/tasks", status_code=201)
def create_task(payload: TaskCreate):
    return payload.model_dump()

with TestClient(app) as client:
    good = client.post("/tasks", json={"title": "  HTTP  ", "minutes": 30})
    assert good.status_code == 201
    assert good.json() == {"title": "HTTP", "minutes": 30}
    assert client.post("/tasks", json={"title": "   ", "minutes": 30}).status_code == 422
    assert client.post("/tasks", json={"title": "HTTP", "minutes": "30"}).status_code == 422
    assert client.post("/tasks", json={"title": "HTTP", "minutes": 30, "owner_id": 99}).status_code == 422
    checked = TaskCreate.model_validate({"title": "SQL", "minutes": 45})
    assert checked.model_dump()["minutes"] == 45
```

## Thực hành có hướng dẫn và đầu ra mong đợi
Lập bảng dữ liệu gồm tiêu đề hợp lệ, chuỗi rỗng, chuỗi chỉ có khoảng trắng, 120 ký tự và 121 ký tự. Với minutes, thử 4, 5, 240, 241 và chuỗi '30'. Quan sát vị trí lỗi trong detail thay vì chỉ đếm status. Đầu ra thành công giữ title đã trim và số minutes dạng int. Một trường ngoài model bị từ chối do extra='forbid'.

Tạm bỏ strict=True rồi chạy lại test chuỗi '30'; giải thích sự thay đổi trước khi khôi phục hợp đồng. Bài này không yêu cầu coi mọi chuyển đổi là lỗi, mà yêu cầu chọn hành vi có chủ đích và kiểm tra lựa chọn đó. Viết thêm assertion cho dữ liệu thiếu minutes.

## Bài tập tự làm
Thêm difficulty có tập giá trị cố định bằng Literal['easy','medium','hard'], mặc định medium. Thử giá trị khác như urgent; API phải từ chối. Gửi body thiếu title phải có lỗi kiểm tra dữ liệu. Nộp model và ít nhất sáu trường hợp, trong đó có một trường hợp kiểm tra khoảng trắng và một trường hợp kiểm tra trường lạ.

## Hướng giải và tiêu chí đạt
Import Literal từ typing, khai báo difficulty: Literal[...] = 'medium'. Khi không gửi trường này, model_dump phải chứa medium. Đạt khi cả tập hợp giá trị và default được kiểm tra, title trắng không tạo nhiệm vụ, và owner_id không do client quyết định. Trình bày rõ sự khác nhau giữa lỗi cấu trúc 422 và xung đột nghiệp vụ 409 sẽ học tiếp.

## Lỗi thường gặp và cách chẩn đoán
Không gọi .dict() chỉ vì ví dụ cũ trên mạng dùng Pydantic 1; khóa này dùng model_dump. Không strip title sau khi đã ghi database vì lúc đó bản ghi sai đã tồn tại. Không viết ràng buộc chỉ trong mô tả mà thiếu code và test. Nếu model không cập nhật trong /docs, kiểm tra đang chạy đúng module và đúng tiến trình, thay vì xóa cache dữ liệu một cách tùy ý.

## Câu hỏi tự kiểm tra có đáp án
- Hàm nào tạo dict từ model trong Pydantic 2? Đáp án: model_dump(). model_dump là API xuất dữ liệu của model.
- str_strip_whitespace=True có ích cho title vì sao? Đáp án: Loại khoảng trắng đầu cuối trước khi kiểm tra chuỗi. Chuỗi chỉ có khoảng trắng sẽ không thỏa min_length=1.
- Field(strict=True) cho minutes:int nhằm làm gì? Đáp án: Yêu cầu đúng kiểu theo hợp đồng thay vì nhận chuỗi số. Strict kiểm soát chuyển đổi kiểu ở trường được chọn.

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
- https://docs.pydantic.dev/latest/concepts/models/
- https://fastapi.tiangolo.com/tutorial/body-fields/