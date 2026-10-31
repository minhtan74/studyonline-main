"""Original Vietnamese FastAPI course; course content is data, never seed on import."""
from __future__ import annotations

from textwrap import dedent


def question(prompt, correct, wrong1, wrong2, wrong3, explanation, difficulty="medium"):
    options = [correct, wrong1, wrong2, wrong3]
    offset = len(prompt) % 4
    options = options[offset:] + options[:offset]
    return dict(prompt=prompt, options=options, correct=(-offset) % 4,
                explanation=explanation, difficulty=difficulty)


def lesson(title, objectives, theory, code, walkthrough, exercise, solution, errors, questions, sources, minutes=150):
    code = "from contextlib import closing\n" + dedent(code).strip() + "\n"
    selfcheck = "\n".join(f"- {q['prompt']} Đáp án: {q['options'][q['correct']]}. {q['explanation']}" for q in questions[:3])
    body = f"""## Mục tiêu học tập
""" + "\n".join("- " + x for x in objectives) + f"""

## Kiến thức và cách suy luận
{dedent(theory).strip()}

## Ví dụ chạy độc lập
Lưu đoạn mã sau thành `example.py` trong thư mục thực hành riêng, dùng Python 3.12+ với FastAPI, Pydantic 2 và httpx đã cài. Chạy `python example.py`. Các câu lệnh `assert` kiểm tra kết quả; chương trình kết thúc không có traceback khi đạt. TestClient gửi yêu cầu ngay trong tiến trình, không khởi động máy chủ và không gọi Internet. Đây là ví dụ nhỏ để kiểm tra từng quyết định thiết kế; dự án cuối khóa ghép các quyết định thành một ứng dụng.

```python
{code}```

## Thực hành có hướng dẫn và đầu ra mong đợi
{dedent(walkthrough).strip()}

## Bài tập tự làm
{dedent(exercise).strip()}

## Hướng giải và tiêu chí đạt
{dedent(solution).strip()}

## Lỗi thường gặp và cách chẩn đoán
{dedent(errors).strip()}

## Câu hỏi tự kiểm tra có đáp án
{selfcheck}

## Minh chứng cần nộp
- Tệp mã nguồn của ví dụ đã điều chỉnh và dữ liệu kiểm tra hợp lệ/không hợp lệ.
- Một bản ghi ngắn gồm yêu cầu gửi vào, trạng thái HTTP, JSON thực tế và kết quả mong đợi của bài tập.
- Giải thích một quyết định của bài bằng tình huống cụ thể: điều gì xảy ra nếu bỏ kiểm tra đó, ai bị ảnh hưởng và test nào phát hiện được.
Hãy chạy lại bài trong tiến trình mới để phát hiện việc vô tình phụ thuộc trạng thái từ lần thử trước. Nếu kết quả khác dự kiến, thu nhỏ về một request và một assertion trước khi sửa nhiều chỗ. Khi hỏi trợ giảng, gửi đoạn mã tối thiểu và lỗi đã lược bỏ token hoặc dữ liệu cá nhân.

## Tài liệu chính thức để đối chiếu
""" + "\n".join("- " + u for u in sources)
    return dict(title=title, objectives=objectives, duration_minutes=minutes, body=body,
                questions=questions, checks=[dict(name=title, code=code)])


L1 = lesson(
    "HTTP, hợp đồng API và ứng dụng đầu tiên",
    ["Mô tả request/response bằng phương thức, đường dẫn và trạng thái.",
     "Tạo endpoint có thể kiểm tra và đọc hợp đồng OpenAPI.",
     "Tách việc ứng dụng hoạt động với việc máy chủ đang nghe cổng."],
    """Một API là hợp đồng để chương trình khác gửi yêu cầu và hiểu phản hồi. Trong khóa này, tài nguyên là nhiệm vụ học tập: mỗi nhiệm vụ có mã, tiêu đề, chủ sở hữu và trạng thái hoàn thành. Trước khi viết mã, ghi ba điều: client gửi gì, server bảo đảm gì và lỗi nào client cần xử lý. Ví dụ GET /health trả trạng thái sống của ứng dụng; nó chưa khẳng định database, quyền người dùng hay toàn bộ nghiệp vụ đều tốt.

Request có phương thức, đường dẫn, header và có thể có body. Response có trạng thái, header và có thể có body. GET dùng để đọc; thao tác tạo thường dùng POST và trả 201. HTTP không tự áp đặt cấu trúc nghiệp vụ cho tên đường dẫn, nên đội phát triển phải thống nhất JSON và các tình huống lỗi. Không trả 200 cho mọi kết quả rồi buộc client đoán từ câu thông báo.

FastAPI đăng ký hàm xử lý bằng decorator. Python type hints hỗ trợ tạo lược đồ và kiểm tra dữ liệu ở ranh giới API. Tài liệu OpenAPI được tạo từ khai báo; phần mô tả vẫn cần người viết giải thích ý nghĩa và giới hạn. Một lược đồ hợp lệ không chứng minh endpoint thực hiện đúng phân quyền. Ta kiểm tra cả cấu trúc lẫn hành vi quan sát được.

Trong giai đoạn đầu, TestClient tạo đường gọi ngay trong tiến trình để tập trung vào HTTP. Khi chạy thật cục bộ, lưu ứng dụng thành main.py và dùng `python -m uvicorn main:app --reload --host 127.0.0.1`. Chế độ reload phù hợp phát triển. Phần trước dấu hai chấm là tên module, phần sau là biến ứng dụng. Lỗi import khác lỗi cổng đang bị chiếm; đọc đúng giai đoạn thất bại giúp sửa nhanh hơn.""",
    '''from fastapi import FastAPI
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
''',
    """Chạy ví dụ nguyên bản rồi thay giá trị status thành ready; sửa assertion tương ứng và giải thích vì sao test cũ thất bại. Mở /openapi.json bằng TestClient, tìm đường dẫn /health và phương thức get. Sau đó chạy bằng Uvicorn trên loopback, truy cập /docs để so sánh giao diện tài liệu với JSON hợp đồng. Ghi riêng một request thành công và một đường dẫn không tồn tại. Đầu ra mong đợi là 200 và 404; không có bản ghi dữ liệu nào được tạo.

Viết bảng hợp đồng cho ba thao tác của dự án: xem một nhiệm vụ, tạo nhiệm vụ, đánh dấu hoàn thành. Chưa cần triển khai cả ba; mục tiêu là nhận biết mỗi request cần dữ liệu nào. Ghi thêm trường hợp nhiệm vụ không tồn tại để tài liệu bao phủ đường lỗi.""",
    """Thêm GET /about trả tên khóa và phiên bản ứng dụng, có một test kiểm tra JSON chính xác. Thêm mô tả endpoint bằng docstring. Thử POST /about và ghi kết quả, phân biệt đường dẫn không tồn tại với phương thức không được hỗ trợ. Không thêm token hay dữ liệu người học thật vào bài. Nộp bảng bốn cột: phương thức, đường dẫn, mục đích, trạng thái dự kiến.""",
    """Hàm about trả một dict với hai khóa cố định; khai báo @app.get('/about') và kiểm tra 200. POST tới cùng đường dẫn thường trả 405 vì chỉ đăng ký GET; /khong-co trả 404. Đạt khi mỗi test khẳng định cả mã trạng thái và ý nghĩa dữ liệu, không chỉ kiểm tra request không gây exception. Đọc /openapi.json để xác nhận mô tả và phương thức đúng với hợp đồng đã viết.""",
    """Nếu chạy trực tiếp main.py mà không có lệnh khởi động máy chủ, Python chỉ tạo đối tượng ứng dụng rồi kết thúc. Nếu client chờ JSON nhưng nhận HTML, kiểm tra đúng cổng và route trước khi sửa parser. Đổi tên tệp thành fastapi.py có thể che khuất gói đã cài. Không xem giao diện /docs là bằng chứng duy nhất: test hành vi mới phát hiện được JSON sai hoặc mã trạng thái không đúng.""",
    [question("Thông tin nào thuộc hợp đồng của GET /health?", "Trạng thái và cấu trúc phản hồi", "Mật khẩu máy chủ", "Màu trình soạn thảo", "Số dòng mã bắt buộc", "Client cần biết cách diễn giải phản hồi.", "easy"),
     question("TestClient trong bài dùng để làm gì?", "Gửi request tới ứng dụng trong tiến trình kiểm thử", "Tự xuất bản lên Internet", "Thay thế mọi kiểm thử tải", "Tạo tài khoản GitHub", "Có thể kiểm tra HTTP mà không mở cổng mạng.", "easy"),
     question("Đường dẫn tài liệu OpenAPI mặc định là gì?", "/openapi.json", "/database.sql", "/all-passwords", "/python.exe", "FastAPI sinh lược đồ JSON theo khai báo ứng dụng.", "easy"),
     question("GET tới đường dẫn chưa đăng ký thường trả mã nào?", "404", "201", "204", "301 bắt buộc", "404 diễn tả không tìm thấy route/tài nguyên theo hợp đồng.", "easy"),
     question("API health trả 200 có chứng minh mọi quyền truy cập đều đúng không?", "Không, cần kiểm tra các chức năng và quyền riêng", "Có, mọi người đều là admin", "Có, không cần test nữa", "Chỉ khi tên app dài", "Một probe chỉ chứng minh những gì nó thực sự kiểm tra.")],
    ["https://fastapi.tiangolo.com/tutorial/first-steps/"])


L2 = lesson(
    "Tham số đường dẫn, truy vấn và phân trang",
    ["Phân biệt định danh tài nguyên với tùy chọn lọc danh sách.", "Giới hạn đầu vào và kích thước trang bằng Annotated.", "Kiểm tra route tĩnh, dữ liệu sai kiểu và các biên số."],
    """Đường dẫn nên thể hiện tài nguyên: /tasks/12 chọn một nhiệm vụ cụ thể. Query string thay đổi cách xem danh sách: /tasks?offset=0&limit=20. Không xem số trang là ID nhiệm vụ. Quy ước này giúp client đọc hợp đồng, còn tính đúng đắn vẫn cần kiểm tra ở server. Khi tham số có type int, giá trị không chuyển đổi được sẽ gây phản hồi kiểm tra dữ liệu thay vì âm thầm thành số 0.

`Annotated` cho phép kết hợp kiểu Python với metadata của FastAPI. Path(ge=1) quy định ID dương; Query(ge=1, le=50) khống chế kích thước trang. Giới hạn không chỉ để form đẹp: một client có thể tự gửi request, bỏ qua giao diện. Phân trang có giới hạn tránh việc một lần gọi vô tình đọc toàn bộ bảng. Về sau truy vấn SQL còn phải có ORDER BY ổn định để offset có ý nghĩa.

Route /tasks/stats nên đăng ký trước /tasks/{task_id}; nếu route động được xét trước, chuỗi stats có thể bị coi là task_id rồi thất bại kiểm tra số. Thứ tự đăng ký là một chi tiết cần test khi route tĩnh và động dùng cùng tiền tố. Không giải quyết bằng cách nới task_id thành str nếu nghiệp vụ thật sự yêu cầu ID số.

Phân trang offset dễ học nhưng có giới hạn: dữ liệu thêm/xóa giữa hai request có thể làm item chuyển trang. Trong bài ta dùng danh sách ổn định để hiểu hợp đồng trước. Với tập dữ liệu thay đổi nhanh có thể cần cursor và mốc sắp xếp. Dù dùng cách nào, client cần biết một trang trống nghĩa là không còn phần tử phù hợp, không phải lúc nào cũng là lỗi. Tách tổng số kết quả và số item trang hiện tại nếu hợp đồng cần cả hai.""",
    '''from typing import Annotated
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
''',
    """Vẽ các miền đầu vào cho limit: nhỏ hơn 1, từ 1 đến 50 và lớn hơn 50. Chạy 0, 1, 50, 51 để quan sát biên. Đổi offset sang 1, limit sang 1 và kiểm tra nhiệm vụ Validation xuất hiện. Giữ offset=2 để quan sát trang rỗng hợp lệ. Thử /tasks/stats trước rồi sau khi đảo thứ tự đăng ký hai route; ghi vì sao bản đảo có thể trả 422. Khôi phục thứ tự đúng khi nộp bài.

Phân biệt hai kết quả 422 của /tasks/nope và /tasks/0: một bên không parse được int, bên kia là số nguyên nhưng ngoài miền cho phép. Khi viết giao diện, cả hai đều cần phản hồi nhập liệu rõ; khi chẩn đoán, chi tiết lỗi cho biết vị trí và loại ràng buộc.""",
    """Bổ sung bộ lọc done: bool | None với ba trạng thái: không gửi lấy tất cả, true lấy hoàn thành, false lấy chưa hoàn thành. Thêm trường done cho hai phần tử mẫu. Lọc trước rồi mới cắt trang; total phải là số phần tử sau lọc nhưng trước phân trang. Viết test mà lọc và offset cùng xuất hiện để phát hiện việc cắt trang sai thứ tự.""",
    """Tạo biến filtered từ data theo điều kiện done is None hoặc item['done'] == done. Tính total=len(filtered), items=filtered[offset:offset+limit]. Đạt khi done=false không bị hiểu nhầm là 'không gửi', vì False là giá trị có ý nghĩa. Giữ kiểm tra limit và offset trên mọi tổ hợp bộ lọc. Bài giải phải giải thích total khác len(items) trong trường hợp có nhiều trang.""",
    """Không viết if done để quyết định có lọc hay không, vì nhánh false sẽ bị bỏ qua. Không dùng tham số limit không giới hạn rồi chờ frontend tự khống chế. Không khẳng định /tasks/999 tồn tại chỉ vì ID hợp lệ: kiểm tra định dạng là một bước, tìm tài nguyên là bước khác. Ở các bài sau, ID hợp lệ nhưng không có bản ghi sẽ trả 404.""",
    [question("Thông tin nào phù hợp làm query parameter của danh sách?", "Giới hạn số phần tử mỗi trang", "Định nghĩa mọi phương thức Python", "Mật khẩu trong URL", "Toàn bộ file database", "limit thay đổi cách lấy một trang danh sách.", "easy"),
     question("Query(ge=1, le=50) chấp nhận giá trị nào?", "50", "0", "51", "-1", "Hai đầu 1 và 50 đều được phép.", "easy"),
     question("Cách nào phân biệt done=false với không gửi done?", "Kiểm tra done is None", "Chỉ viết if done", "Luôn đổi thành True", "Bỏ mọi giá trị false", "None biểu diễn không cung cấp bộ lọc."),
     question("Nên lọc và phân trang theo thứ tự nào?", "Lọc trước, phân trang sau", "Phân trang rồi bỏ mọi bản ghi", "Không bao giờ lọc", "Chỉ lọc trên frontend", "Cắt trang trước có thể làm thiếu kết quả phù hợp."),
     question("ID parse được thành int có bảo đảm tài nguyên tồn tại không?", "Không, còn phải tra cứu dữ liệu", "Có trong mọi API", "Có nếu ID lớn", "Chỉ cần status 200", "Kiểm tra kiểu và kiểm tra tồn tại là hai việc khác nhau.")],
    ["https://fastapi.tiangolo.com/tutorial/path-params/", "https://fastapi.tiangolo.com/tutorial/query-params-str-validations/"])


L3 = lesson(
    "Dữ liệu đầu vào với Pydantic 2",
    ["Khai báo model tạo nhiệm vụ có ràng buộc cụ thể.", "Phân biệt dữ liệu sau kiểm tra với JSON thô.", "Dùng model_dump và model_validate theo API Pydantic 2."],
    """JSON chỉ mô tả các giá trị; nghiệp vụ cần quy tắc như tiêu đề không rỗng và số phút trong phạm vi. Pydantic BaseModel là lớp mô tả dữ liệu ở ranh giới. Field(min_length=1, max_length=120) giới hạn chuỗi; ge và le giới hạn số. Cấu hình str_strip_whitespace giúp loại khoảng trắng thừa trước khi áp ràng buộc chuỗi. Một tiêu đề chỉ chứa dấu cách sẽ thành rỗng rồi bị từ chối, thay vì lọt vào database.

Mặc định Pydantic có thể chuyển đổi một số giá trị tương thích. Khi hợp đồng cần loại bỏ chuyển đổi, dùng kiểu strict hoặc Field(strict=True) ở đúng trường. Không có một lựa chọn strict phù hợp mọi API: query string vốn là văn bản, còn JSON boolean và số có thể cần phân biệt rõ. Trong bài ta chọn minutes là int strict để khách phải gửi JSON số nguyên; tài liệu phải nêu điều này.

Model đầu vào không nên có owner_id do client tự chọn. Danh tính sẽ lấy từ bước xác thực trong các bài sau. Tương tự, ID tự tăng do server quản lý. Đầu vào chỉ chứa trường học viên được quyền đề nghị. `extra='forbid'` phát hiện trường lạ và lỗi chính tả, nhưng cũng là thay đổi hợp đồng cần cân nhắc khi mở rộng phiên bản API.

Trong Pydantic 2, `model_validate` kiểm tra một cấu trúc Python và `model_dump` tạo dict biểu diễn giá trị đã kiểm tra. `model_dump(mode='json')` giúp biểu diễn các kiểu như datetime theo dạng tương thích JSON. Các hàm này khác việc tự lấy __dict__, vốn có thể làm lẫn trạng thái nội bộ. Validation hỗ trợ định dạng và các quy tắc được khai báo; các điều kiện cần tra database, như tiêu đề trùng trong cùng tài khoản, vẫn thuộc luồng dịch vụ/giao dịch.""",
    '''from fastapi import FastAPI
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
''',
    """Lập bảng dữ liệu gồm tiêu đề hợp lệ, chuỗi rỗng, chuỗi chỉ có khoảng trắng, 120 ký tự và 121 ký tự. Với minutes, thử 4, 5, 240, 241 và chuỗi '30'. Quan sát vị trí lỗi trong detail thay vì chỉ đếm status. Đầu ra thành công giữ title đã trim và số minutes dạng int. Một trường ngoài model bị từ chối do extra='forbid'.

Tạm bỏ strict=True rồi chạy lại test chuỗi '30'; giải thích sự thay đổi trước khi khôi phục hợp đồng. Bài này không yêu cầu coi mọi chuyển đổi là lỗi, mà yêu cầu chọn hành vi có chủ đích và kiểm tra lựa chọn đó. Viết thêm assertion cho dữ liệu thiếu minutes.""",
    """Thêm difficulty có tập giá trị cố định bằng Literal['easy','medium','hard'], mặc định medium. Thử giá trị khác như urgent; API phải từ chối. Gửi body thiếu title phải có lỗi kiểm tra dữ liệu. Nộp model và ít nhất sáu trường hợp, trong đó có một trường hợp kiểm tra khoảng trắng và một trường hợp kiểm tra trường lạ.""",
    """Import Literal từ typing, khai báo difficulty: Literal[...] = 'medium'. Khi không gửi trường này, model_dump phải chứa medium. Đạt khi cả tập hợp giá trị và default được kiểm tra, title trắng không tạo nhiệm vụ, và owner_id không do client quyết định. Trình bày rõ sự khác nhau giữa lỗi cấu trúc 422 và xung đột nghiệp vụ 409 sẽ học tiếp.""",
    """Không gọi .dict() chỉ vì ví dụ cũ trên mạng dùng Pydantic 1; khóa này dùng model_dump. Không strip title sau khi đã ghi database vì lúc đó bản ghi sai đã tồn tại. Không viết ràng buộc chỉ trong mô tả mà thiếu code và test. Nếu model không cập nhật trong /docs, kiểm tra đang chạy đúng module và đúng tiến trình, thay vì xóa cache dữ liệu một cách tùy ý.""",
    [question("Hàm nào tạo dict từ model trong Pydantic 2?", "model_dump()", "to_database_secret()", "delete_fields()", "compile_python()", "model_dump là API xuất dữ liệu của model.", "easy"),
     question("str_strip_whitespace=True có ích cho title vì sao?", "Loại khoảng trắng đầu cuối trước khi kiểm tra chuỗi", "Tự tạo owner hợp lệ", "Mã hóa database", "Bỏ mọi chữ tiếng Việt", "Chuỗi chỉ có khoảng trắng sẽ không thỏa min_length=1."),
     question("Field(strict=True) cho minutes:int nhằm làm gì?", "Yêu cầu đúng kiểu theo hợp đồng thay vì nhận chuỗi số", "Cho phép mọi chuỗi", "Đổi mọi số thành bool", "Tăng tốc Internet", "Strict kiểm soát chuyển đổi kiểu ở trường được chọn."),
     question("owner_id của nhiệm vụ nên lấy từ đâu?", "Danh tính đã xác thực phía server", "Body tùy ý của mọi client", "Tên trình duyệt", "Số trang PDF", "Client không được tự chọn người sở hữu thay cho bước kiểm tra quyền."),
     question("Tính duy nhất cần tra dữ liệu hiện có có được giải quyết chỉ bằng Field không?", "Không, cần kiểm tra/ràng buộc ở tầng dữ liệu", "Có với mọi database", "Chỉ cần max_length", "Dùng title in hoa là đủ", "Ràng buộc dữ liệu và giao dịch xử lý xung đột đồng thời.")],
    ["https://docs.pydantic.dev/latest/concepts/models/", "https://fastapi.tiangolo.com/tutorial/body-fields/"])


L4 = lesson(
    "CRUD, mô hình phản hồi và lỗi nghiệp vụ",
    ["Thiết kế mã trạng thái cho tạo, đọc, cập nhật và xóa.", "Tách model đầu vào và model phản hồi để hạn chế lộ dữ liệu.", "Phân biệt 404, 409 và lỗi kiểm tra cấu trúc."],
    """CRUD là nhóm thao tác tạo, đọc, cập nhật và xóa tài nguyên. Tên gọi này không thay thế thiết kế hợp đồng. Ta cần quyết định ID do ai tạo, xóa trả body hay không, cập nhật cho phép trường nào và phản hồi khi nhiệm vụ không tồn tại. Trong bài, tạo trả 201; đọc không có ID trả 404; tiêu đề trùng trả 409; xóa thành công trả 204 không kèm body.

Một bản ghi nội bộ có thể chứa trường chỉ phục vụ hệ thống. Model phản hồi mô tả các trường được phép công bố và đồng thời giúp FastAPI kiểm tra kết quả của hàm. Nếu trả dữ liệu thiếu trường bắt buộc của response_model, đó là lỗi phía triển khai server, không nên đổ cho người dùng. Vì vậy test cần kiểm tra nội dung phản hồi và trường không được công bố.

HTTPException dừng luồng xử lý bằng phản hồi lỗi có chủ đích. Dùng detail cụ thể nhưng không lộ câu SQL, đường dẫn file hoặc token. 404 phù hợp khi không tìm thấy tài nguyên; 409 phù hợp khi yêu cầu có cấu trúc đúng nhưng xung đột trạng thái, như title đã có theo quy tắc của bài. Không bắt mọi Exception rồi đổi thành 200 vì như vậy client không thể dùng mã trạng thái để xử lý.

Dữ liệu lưu trong dict chỉ dùng để quan sát hợp đồng trong một tiến trình. Nó mất khi khởi động lại và không đồng bộ giữa các worker; cũng chưa bảo đảm giao dịch khi có nhiều request cùng lúc. Ta vẫn bắt đầu bằng ví dụ nhỏ để phân biệt lỗi HTTP trước khi thêm SQLite. Khi đổi tầng lưu trữ, các test hợp đồng nên tiếp tục có ý nghĩa; đây là dấu hiệu ranh giới API được giữ ổn định.""",
    '''from fastapi import FastAPI, HTTPException, Response
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
''',
    """Tạo một nhiệm vụ rồi lấy lại theo ID từ phản hồi, tránh giả định luôn là 1. Kiểm tra internal_note không có trong JSON dù tồn tại trong store. Gửi lại cùng tiêu đề và đối chiếu 409 với 422 của body thiếu title. Xóa nhiệm vụ, sau đó đọc lại để thấy 404. Ghi rõ trạng thái trước và sau mỗi bước; nếu test dùng chung state mà không đặt điều kiện trước, thứ tự chạy có thể gây hiểu nhầm.

Quan sát rằng 204 có content rỗng, không phải JSON {}. Đây là khác biệt quan trọng cho client: gọi response.json() một cách vô điều kiện sẽ lỗi khi body hợp lệ nhưng rỗng.""",
    """Thêm PATCH /tasks/{task_id} để đổi title bằng model riêng. Giữ ID và internal_note do server quản lý. Nếu title mới trùng nhiệm vụ khác thì 409; nếu trùng chính nhiệm vụ đang sửa thì hợp lệ. Viết chuỗi kiểm tra tạo hai nhiệm vụ, đổi tên thành công, đổi thành title đang dùng thất bại và đọc lại xác nhận trạng thái không đổi sau lỗi.""",
    """Tra cứu item trước để phân biệt 404. Khi kiểm tra trùng, bỏ qua task có cùng task_id. Chỉ ghi title sau khi tất cả điều kiện nghiệp vụ đạt. Đạt khi response_model chỉ có id/title, một lỗi cập nhật không sửa nửa chừng dữ liệu, và test không dựa vào việc client bỏ qua thông báo lỗi. Nêu vì sao kiểu kiểm tra trùng bằng vòng lặp sẽ cần ràng buộc database trong ứng dụng có nhiều request.""",
    """Không trả {'error': ...} với 200 cho xung đột nếu hợp đồng đã quy định 409. Không dùng dict nội bộ làm model phản hồi mặc định khi chứa thông tin quản trị. Không phát sinh ID bằng len(store)+1 vì sau xóa có thể đụng ID cũ. Ví dụ max+1 cũng chỉ là cách minh họa; database sẽ quản lý ID và giao dịch ở bước sau.""",
    [question("Mã nào được chọn cho tạo tài nguyên thành công trong bài?", "201", "404", "409", "500", "201 biểu diễn tài nguyên vừa được tạo.", "easy"),
     question("Tiêu đề hợp lệ nhưng đã tồn tại theo ràng buộc bài trả gì?", "409", "200 kèm lỗi", "204 bắt buộc", "301", "Yêu cầu xung đột với trạng thái tài nguyên hiện có."),
     question("response_model giúp gì khi dict nội bộ có internal_note?", "Chỉ công bố các trường thuộc hợp đồng phản hồi", "Mã hóa mọi token", "Tạo backup database", "Tự tạo giao diện quản trị", "Model giới hạn dữ liệu API trả ra và kiểm tra kết quả."),
     question("Đặc điểm của phản hồi 204 là gì?", "Không có body", "Luôn là một mảng JSON", "Phải chứa SQL", "Chỉ dùng cho exception", "Client cần xử lý trạng thái không có nội dung."),
     question("Lưu bằng dict toàn cục có đặc điểm nào?", "Mất dữ liệu khi tiến trình khởi động lại", "Tự đồng bộ mọi worker", "Luôn có transaction", "Bảo đảm không có race condition", "Bộ nhớ tiến trình không thay thế lưu trữ bền vững.")],
    ["https://fastapi.tiangolo.com/tutorial/response-model/", "https://fastapi.tiangolo.com/tutorial/handling-errors/"])


L5 = lesson(
    "Dependency injection và tách trách nhiệm",
    ["Đưa việc đọc cấu hình/người dùng vào dependency dùng lại được.", "Giải thích Depends tạo và truyền giá trị cho hàm xử lý.", "Thay dependency trong kiểm thử mà không sửa mã ứng dụng."],
    """Một endpoint thường cần đọc cấu hình, xác định người dùng và lấy kết nối dữ liệu. Nếu viết lại cùng thao tác trong mọi hàm, rất dễ bỏ sót kiểm tra khi thêm route. Dependency injection cho phép khai báo thứ cần dùng thay vì tự tạo mọi thứ tại chỗ. FastAPI giải quyết dependency, kiểm tra đầu vào của nó và truyền kết quả cho handler.

`Depends(get_settings)` truyền hàm, không gọi get_settings ngay lúc khai báo. Hàm dependency có thể dùng dependency khác để tạo cây phụ thuộc. Trong request thông thường, một dependency dùng lặp được cache theo request trừ khi cấu hình khác; không suy từ đó thành cache toàn bộ ứng dụng. Dữ liệu theo user không nên vô tình biến thành singleton dùng chung mọi người.

Khi kiểm thử nghiệp vụ, ta có thể ghi vào app.dependency_overrides để thay nguồn cấu hình hoặc danh tính. Điều này giúp kiểm soát điều kiện trước, giảm phụ thuộc vào môi trường. Sau test phải xóa override; nếu không, test sau có thể tiếp tục chạy bằng người dùng hoặc dịch vụ giả. Override là công cụ test, không phải cơ chế phân quyền cho client.

Tách trách nhiệm không có nghĩa tạo thật nhiều lớp cho ví dụ nhỏ. Một endpoint nên nhận dữ liệu đã kiểm tra, gọi hành vi cần thiết và trả phản hồi. Dependency phù hợp cho tài nguyên theo request, cấu hình và danh tính; phép tính thuần như lọc danh sách vẫn có thể là hàm Python bình thường. Mục tiêu là đường đi của dữ liệu dễ hiểu và có thể thay thế khi test.""",
    '''from dataclasses import dataclass
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
''',
    """Đọc code từ khai báo info trở lên: tham số settings không phải query string do client tự đặt mà là giá trị get_settings trả về. Gửi /info?service=hacked và thấy tên dịch vụ không đổi; dependency đang quyết định nguồn tin cậy. Thay override bằng tên sandbox, chạy kiểm tra rồi xóa override trong finally. Đầu ra trước và sau đều là study-tasks, chỉ trong vùng kiểm tra mới là isolated-test.

Vẽ cây info → get_settings. Sau đó thêm hàm format_info thuần nhận Settings và trả dict. Giải thích sự khác nhau giữa gọi hàm thuần trực tiếp và để FastAPI giải quyết dependency trong request.""",
    """Tạo dependency get_current_user trả dữ liệu người dùng mẫu với id và role, rồi endpoint /me công bố hai trường đó. Test override một học viên khác để chứng minh endpoint không phụ thuộc ID cố định. Chưa gọi đây là đăng nhập thật: bài hiện chỉ học cách truyền danh tính; kiểm tra token sẽ được bổ sung sau.""",
    """Khai báo dataclass User và dependency không nhận user_id từ query. /me dùng Annotated[User, Depends(get_current_user)]. Test lần lượt hai ID và khôi phục override. Đạt khi mọi test có điều kiện trước rõ, một user trong test không rò sang test sau, và người học giải thích được dependency chưa xác thực nếu chỉ trả user cố định. Lập danh sách route tương lai cần cùng dependency danh tính.""",
    """Depends(get_settings()) truyền kết quả thay vì callable và thường làm ứng dụng lỗi khởi tạo. Gọi info() như hàm Python bình thường không tự chạy cơ chế FastAPI. Không giữ mutable dict người dùng toàn cục rồi sửa nó cho từng request. Nếu override không có tác dụng, kiểm tra khóa là đúng đối tượng hàm dependency đã đăng ký, không phải một hàm khác có cùng tên.""",
    [question("Khai báo Depends nào phù hợp?", "Depends(get_settings)", "Depends(get_settings()) cho mọi trường hợp", "Depends('tên bất kỳ')", "Depends(42)", "FastAPI cần callable để giải quyết dependency."),
     question("app.dependency_overrides thường dùng để làm gì?", "Thay nguồn phụ thuộc có kiểm soát trong test", "Cho client tự trở thành admin", "Xóa mọi route", "Tạo schema SQL tự động", "Test có thể thay cấu hình hoặc dịch vụ mà không sửa handler."),
     question("Sau khi test dùng override nên làm gì?", "Khôi phục hoặc xóa override trong finally", "Giữ user giả cho mọi test", "Đổi tên database thật", "Bỏ chạy test sau", "Dọn trạng thái giúp các test độc lập."),
     question("Dependency cache theo request có nghĩa gì?", "Có thể dùng lại kết quả dependency trong cùng request", "Dữ liệu mọi user dùng chung vĩnh viễn", "Mọi response được lưu vô hạn", "Không cần kiểm tra token nữa", "Phạm vi request khác phạm vi toàn tiến trình."),
     question("Dependency trả user cố định đã là đăng nhập thật chưa?", "Chưa, vẫn cần xác minh bằng chứng danh tính", "Rồi với mọi website", "Rồi nếu ID bằng 1", "Rồi khi có type hint", "Cách truyền dữ liệu không tự tạo xác thực.")],
    ["https://fastapi.tiangolo.com/tutorial/dependencies/", "https://fastapi.tiangolo.com/advanced/testing-dependencies/"])


L6 = lesson(
    "Vòng đời tài nguyên và lựa chọn sync hoặc async",
    ["Khởi tạo và thu hồi tài nguyên bằng lifespan.", "Đóng tài nguyên theo request trong dependency có yield.", "Chọn def/async def theo đặc tính thư viện I/O đang dùng."],
    """Tài nguyên có các vòng đời khác nhau. Một cấu hình bất biến có thể sống cùng ứng dụng, còn kết nối hoặc transaction có thể chỉ sống trong một request. Lifespan là async context manager: phần trước yield chạy khi ứng dụng khởi động, phần sau yield chạy khi dừng. Dùng nó để chuẩn bị tài nguyên chung; khi viết test, đặt TestClient trong with để các bước khởi động và dọn dẹp được thực hiện.

Dependency có yield có dạng mở tài nguyên, yield cho handler và finally đóng lại. Finally quan trọng cả khi handler ném exception. Không return trước khi đóng tài nguyên nếu thiết kế cần kiểm soát vòng đời. Thời điểm dọn dependency có các chi tiết theo phiên bản và kiểu response; không dùng một tài nguyên đã đóng cho công việc chạy về sau. Ví dụ trong khóa dùng request/response ngắn và không stream để giữ phạm vi rõ.

`async def` hữu ích khi dùng thư viện hỗ trợ await cho thao tác chờ. Nó không tự biến sqlite3 hoặc một hàm chặn thành bất đồng bộ. Chặn event loop bằng sleep hay I/O đồng bộ trong async handler có thể làm các request khác phải chờ. Với sqlite3 chuẩn trong khóa, handler và dependency truy vấn dùng def để FastAPI thực thi phần sync theo cơ chế phù hợp. Đây không phải cam kết mọi workload sẽ nhanh hơn; vẫn phải đo trong môi trường cụ thể.

Đồng thời và song song là hai ý khác nhau. Một chương trình có thể quản lý nhiều việc chờ I/O mà không thực thi tính toán CPU trên nhiều lõi. Nếu endpoint xử lý CPU nặng như dựng video, thêm async không giải quyết bài toán tài nguyên. Cần tách công việc và thiết kế hàng đợi/worker khi thực sự có nhu cầu. Trong khóa ta đo và hiểu vòng đời trước, chưa triển khai hệ thống xử lý nền phân tán.""",
    '''from contextlib import asynccontextmanager
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
''',
    """Chạy test rồi in events nếu cần quan sát. Mỗi request phải có cặp open/close, kể cả request thất bại; startup và shutdown chỉ xuất hiện cho vòng đời client. Đổi HTTPException thành một giá trị trả về bình thường để thấy cleanup vẫn diễn ra. Viết sơ đồ phân biệt app lifetime và request lifetime, sau đó ghi tài nguyên nào trong dự án Task API thuộc mỗi phạm vi.

Đọc một đoạn code có `async def` và lời gọi sqlite3.execute, chỉ ra chỗ còn chặn. Không sửa bằng cách thêm await trước sqlite3 vì thư viện đó không cung cấp awaitable ở API này. Chọn lại handler def hoặc dùng thư viện async đúng cách trong một thiết kế khác.""",
    """Thêm một dependency có bộ đếm số tài nguyên đang mở. Gửi ba request, trong đó một request phát sinh lỗi; sau tất cả bộ đếm phải bằng 0. Test thêm rằng startup chỉ chạy một lần khi dùng cùng with TestClient. Trình bày vì sao gọi client ngoài with có thể bỏ qua phần lifespan mà bài đang muốn kiểm chứng.""",
    """Tăng bộ đếm ngay trước yield, giảm trong finally. Handler lỗi không bỏ qua finally. Dùng assertions sau mỗi request để tránh chỉ thấy kết quả tổng mà không biết request nào làm rò. Đạt khi chuỗi events và số tài nguyên phù hợp với từng phạm vi, và phần giải thích sync/async nhắc loại thư viện chứ không chỉ đếm từ khóa async.""",
    """Không lưu một connection SQLite mở toàn cục rồi dùng tùy ý qua mọi request và thread. Không dùng time.sleep trong async handler để mô phỏng chờ I/O nếu đang đánh giá concurrency. Không mở lại tài nguyên đắt tiền trên mỗi request khi nó được thiết kế sống cùng app. Các quyết định về lifespan phải có test khởi động/dừng; chạy một endpoint thành công chưa chứng minh cleanup đúng.""",
    [question("with TestClient(app) giúp kiểm tra điều gì?", "Chạy vòng đời khởi động và dừng của ứng dụng", "Mở ứng dụng cho mọi máy Internet", "Tự tạo chứng chỉ TLS", "Bỏ toàn bộ dependency", "Context manager thực hiện lifespan khi vào và ra."),
     question("Nơi phù hợp để đóng tài nguyên quanh yield là đâu?", "Khối finally", "Chỉ nhánh thành công của handler", "Bình luận cuối tệp", "Trong response JSON", "Finally vẫn chạy khi có exception."),
     question("async def có tự biến sqlite3.execute thành I/O không chặn không?", "Không", "Có với mọi hàm Python", "Có nếu tên route ngắn", "Chỉ cần thêm chữ await bất kỳ", "Phải xét thư viện có hỗ trợ await hay không."),
     question("Với sqlite3 đồng bộ trong khóa nên chọn handler nào?", "def cho thao tác chặn được minh họa", "async def rồi gọi chặn tùy ý", "Không cần handler", "Chỉ dùng lambda", "Lựa chọn sync phù hợp thư viện đồng bộ của bài."),
     question("Thêm async có tự giải quyết tính toán CPU nặng không?", "Không, cần thiết kế tài nguyên phù hợp", "Có, luôn tăng số lõi", "Có, không cần đo", "Có, không còn giới hạn RAM", "Concurrency I/O và song song CPU là các vấn đề khác nhau.")],
    ["https://fastapi.tiangolo.com/advanced/events/", "https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/", "https://fastapi.tiangolo.com/async/"])


L7 = lesson(
    "SQLite, truy vấn tham số và dữ liệu bền vững",
    ["Tạo bảng và lưu nhiệm vụ qua kết nối SQLite theo request.", "Truyền dữ liệu bằng placeholder thay vì ghép chuỗi SQL.", "Kiểm tra dữ liệu còn sau khi mở kết nối mới."],
    """Database lưu trạng thái ngoài bộ nhớ của hàm xử lý. SQLite phù hợp cho bài thực hành vì có trong thư viện chuẩn Python và dùng file cục bộ; ta không cần dựng dịch vụ database riêng. Nó vẫn có quy tắc transaction và khóa ghi. Bài thực hành không dùng file của ứng dụng StudyOnline: mọi dữ liệu ví dụ nằm trong TemporaryDirectory và tự dọn sau khi kết thúc.

Câu SQL có hai phần cần phân biệt: cấu trúc truy vấn do người viết code kiểm soát và giá trị do client cung cấp. `WHERE title = ?` cùng tuple tham số giữ giá trị ở đúng vị trí dữ liệu. Không dùng f-string ghép title vào câu SQL. Placeholder không dùng thay tên bảng hay tên cột; nếu cần sắp xếp theo lựa chọn client, map lựa chọn đó vào danh sách cột cho phép.

Mỗi request mở kết nối, đặt row_factory nếu muốn đọc theo tên cột, yield cho handler rồi đóng trong finally. Với FastAPI sync có thể thực thi các bước ở thread khác, ví dụ dùng check_same_thread=False có chủ đích và không chia sẻ connection đó giữa các request. Tùy chọn này không tự bảo đảm an toàn khi nhiều thread cùng ghi; phạm vi sở hữu connection vẫn phải rõ.

Sau INSERT/UPDATE, commit để lưu thay đổi theo cách quản lý transaction của bài. Đóng connection không phải là thay thế tùy ý cho commit. Khi trả bản ghi, chuyển kiểu integer done về boolean theo model phản hồi. Kiểm thử bằng cách mở một connection mới đọc file: nếu chỉ kiểm tra cùng dict hoặc cùng biến trong handler, ta có thể bỏ sót lỗi không ghi bền vững.""",
    '''import sqlite3
import tempfile
from pathlib import Path
from typing import Annotated
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

class TaskIn(BaseModel):
    title: str

with tempfile.TemporaryDirectory() as folder:
    database = str(Path(folder) / "lesson.db")
    with closing(sqlite3.connect(database)) as conn, conn:
        conn.execute("CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL)")

    def get_db():
        conn = sqlite3.connect(database, check_same_thread=False)
        try:
            yield conn
        finally:
            conn.close()

    app = FastAPI()

    @app.post("/tasks", status_code=201)
    def create_task(payload: TaskIn, conn: Annotated[sqlite3.Connection, Depends(get_db)]):
        cursor = conn.execute("INSERT INTO tasks(title) VALUES (?)", (payload.title,))
        conn.commit()
        return {"id": cursor.lastrowid, "title": payload.title}

    dangerous_looking = "HTTP'); DROP TABLE tasks; --"
    with TestClient(app) as client:
        response = client.post("/tasks", json={"title": dangerous_looking})
        assert response.status_code == 201
    with closing(sqlite3.connect(database)) as verify:
        rows = verify.execute("SELECT title FROM tasks").fetchall()
        assert rows == [(dangerous_looking,)]
''',
    """Chạy ví dụ và quan sát rằng chuỗi giống SQL nguy hiểm được lưu như title bình thường; bảng tasks vẫn tồn tại. Bài không yêu cầu gửi chuỗi này tới bất kỳ server khác. Đọc lại qua connection mới là bằng chứng nội dung đã commit. Thử title có dấu nháy đơn bình thường như 'Lan’s notes' để hiểu đây cũng là vấn đề tính đúng dữ liệu, không chỉ an ninh.

Thêm SELECT WHERE id=? để lấy chính bản ghi vừa tạo. Ghi id lấy từ lastrowid và tránh tính bằng COUNT(*)+1. Sau đó giải thích vì sao placeholder bảo vệ phần giá trị nhưng không cho phép client chọn tên bảng tùy ý.""",
    """Viết GET /tasks có ORDER BY id và phân trang offset/limit từ bài 2. Query phải tham số hóa LIMIT và OFFSET. Test tạo ba nhiệm vụ, lấy trang thứ hai đúng một item; mở lại ứng dụng với cùng đường dẫn file để xác nhận dữ liệu còn. Giới hạn kích thước trang phải có kiểm tra ở API.""",
    """Truy vấn SELECT id,title FROM tasks ORDER BY id LIMIT ? OFFSET ? với tuple (limit,offset). Dùng file tạm riêng cho mỗi bài test; hai app có thể cùng đọc file đã commit nhưng không dùng chung connection mở sẵn. Đạt khi kết quả ổn định theo ID, dữ liệu có dấu nháy không làm hỏng truy vấn và test kiểm tra độc lập chuyện lưu bền với chuyện phân trang.""",
    """Một database ':memory:' tạo theo từng connection sẽ là các database khác nhau; đóng connection khởi tạo rồi mở connection mới không giữ bảng như file. Không sửa lỗi thiếu bảng bằng cách đổi sang file dữ liệu thật. Không dùng conn.execute(f'...{title}...'). Nếu gặp database is locked, kiểm tra transaction/connection còn mở; tăng timeout chỉ che triệu chứng nếu tài nguyên không được đóng.""",
    [question("Cách nào truyền title vào sqlite3 an toàn hơn?", "Placeholder ? cùng tuple tham số", "Ghép title bằng f-string", "Xóa mọi dấu cách", "Đổi mọi title thành tên bảng", "Giá trị được driver bind thay vì trở thành cú pháp SQL."),
     question("Placeholder ? có dùng thay tên bảng tùy ý không?", "Không, nó dành cho giá trị", "Có cho mọi thành phần SQL", "Chỉ khi title dài", "Có nếu bỏ dấu nháy", "Cấu trúc truy vấn cần được kiểm soát bằng code."),
     question("Kiểm tra nào chứng minh dữ liệu được lưu ngoài biến Python?", "Mở connection mới và đọc bản ghi đã commit", "In biến payload", "Đổi màu terminal", "Xem tên hàm", "Đọc qua connection mới kiểm tra lưu trữ bền vững."),
     question("SQLite ':memory:' theo hai connection độc lập thường có đặc điểm gì?", "Hai database bộ nhớ riêng", "Tự dùng chung mọi bảng", "Tự sao chép ra MySQL", "Lưu vĩnh viễn trên đĩa", "File và database bộ nhớ có vòng đời khác nhau."),
     question("check_same_thread=False có tự làm mọi thao tác đồng thời an toàn không?", "Không, vẫn phải quản lý phạm vi connection và transaction", "Có, bỏ được commit", "Có, hết mọi khóa ghi", "Có, không cần test", "Tùy chọn thread không thay thế thiết kế truy cập dữ liệu.")],
    ["https://docs.python.org/3/library/sqlite3.html", "https://fastapi.tiangolo.com/tutorial/sql-databases/"])


L8 = lesson(
    "Giao dịch, ràng buộc và xử lý xung đột",
    ["Dùng ràng buộc database cho quy tắc duy nhất.", "Rollback khi một phần của thao tác nhiều bước thất bại.", "Chuyển lỗi xung đột đã biết thành 409 và giữ lỗi bất ngờ để chẩn đoán."],
    """Một thao tác nghiệp vụ có thể ghi nhiều bảng. Nếu tạo nhiệm vụ thành công nhưng ghi bản ghi lịch sử thất bại, ứng dụng có thể ở trạng thái dở dang. Transaction gom các thay đổi phải cùng thành công hoặc cùng hủy. Trong ví dụ, thêm hai tiêu đề vào bảng có ràng buộc UNIQUE; khi một tiêu đề trùng, cả lần thêm bị rollback. Người học phải kiểm tra dữ liệu sau lỗi, không chỉ mã phản hồi.

Kiểm tra trùng bằng SELECT trước INSERT giúp thông báo sớm nhưng không đủ khi hai request cùng nhìn thấy 'chưa có' rồi cùng ghi. Database constraint là lớp thực thi quy tắc tại điểm ghi. Định nghĩa UNIQUE(owner_id,title) trong dự án nghĩa là hai người có thể có title giống nhau, cùng một người thì không. Đây là quyết định nghiệp vụ cụ thể, không phải quy tắc chung cho mọi hệ thống nhiệm vụ.

`sqlite3.IntegrityError` có thể đến từ nhiều ràng buộc. Chỉ map các trường hợp đã biết sang lỗi xung đột phù hợp; đừng mặc định mọi exception là title trùng. Với schema đơn giản trong ví dụ, UNIQUE là lỗi ràng buộc được chủ đích tạo ra. Trong ứng dụng lớn hơn cần phân biệt NOT NULL, FOREIGN KEY và UNIQUE, đồng thời ghi thông tin chẩn đoán nội bộ mà không trả nguyên lỗi SQL cho client.

Transaction chỉ bảo vệ những thay đổi thực hiện qua cùng phạm vi quản lý database. Nó không tự rollback email đã gửi hoặc API bên ngoài đã gọi. Bài học giữ tất cả thao tác trong SQLite để quan sát tính nguyên tử rõ ràng. Nếu có tác động ngoài database, cần thiết kế thứ tự và cơ chế phục hồi phù hợp; không mở một transaction rất lâu trong khi chờ người dùng hoặc mạng ngoài.""",
    '''import sqlite3
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
''',
    """Trước request lỗi, bảng có đúng Existing. Trong request, Fresh được thêm trước rồi Existing gây lỗi UNIQUE; sau phản hồi 409, Fresh cũng phải không tồn tại. Đây là quan sát phân biệt transaction đúng với cách chỉ bỏ qua lỗi ở câu thứ hai. Sau request hợp lệ, có thêm One và Two. Ghi số bản ghi trước/sau mỗi lần để bằng chứng không phụ thuộc thông báo created.

Thử đảo thứ tự hai title trong request lỗi và xác nhận kết quả vẫn không thay đổi database. Sau đó mô tả một tình huống hai request cùng tạo title mới: SELECT kiểm tra trước có thể cùng trả rỗng, còn UNIQUE sẽ giải quyết xung đột khi ghi.""",
    """Bổ sung bảng audit chỉ chứa task_id và hành động created. Mỗi batch hợp lệ phải tạo số audit tương ứng số task; batch thất bại không tạo task hoặc audit mới. Đặt cả hai loại INSERT trong cùng transaction. Viết test kiểm tra số dòng ở cả hai bảng, với trường hợp lỗi xảy ra sau ít nhất một lần ghi.""",
    """Tạo bảng audit trước khi chạy request; trong vòng lặp lấy cursor.lastrowid rồi insert audit. Context manager conn commit khi khối hoàn thành và rollback khi exception. Đạt khi không có lịch sử mồ côi, không có Fresh sau batch lỗi, và tài nguyên luôn đóng trong finally. Viết rõ rằng context manager transaction và close connection là hai trách nhiệm riêng.""",
    """Không commit sau từng INSERT nếu yêu cầu batch phải nguyên tử, vì các thay đổi trước lỗi đã thành bền vững. Không bắt exception rồi tiếp tục return created toàn bộ. Không trả toàn bộ câu SQL trong detail cho client. Nếu test chỉ gửi dữ liệu trùng ở phần tử đầu, nó chưa chứng minh rollback các thay đổi đã xảy ra; luôn có ca thất bại sau một lần ghi.""",
    [question("Transaction nguyên tử bảo đảm điều gì cho batch trong bài?", "Các thay đổi cùng thành công hoặc cùng rollback", "Mọi request luôn thành công", "Tự gửi email xác nhận", "Không cần UNIQUE", "Tính nguyên tử tránh trạng thái ghi dở dang."),
     question("Vì sao SELECT kiểm tra trùng trước INSERT chưa đủ?", "Hai request có thể cùng thấy chưa tồn tại", "SELECT tự mã hóa title", "INSERT không bao giờ lỗi", "UNIQUE chỉ để trang trí", "Ràng buộc tại database xử lý tranh chấp ở điểm ghi."),
     question("Commit sau từng dòng có phù hợp batch phải cùng thành công không?", "Không, lỗi sau không hủy được dòng đã commit", "Có trong mọi trường hợp", "Có nếu dùng title ngắn", "Chỉ cần return 409", "Phạm vi commit phải khớp đơn vị nghiệp vụ."),
     question("Context manager connection SQLite có tự thay thế close không?", "Không, cần quản lý đóng connection riêng", "Có cho mọi trường hợp", "Chỉ cần bỏ finally", "Close làm mất bảng vĩnh viễn", "Quản lý giao dịch và vòng đời kết nối là hai việc khác nhau."),
     question("Test rollback mạnh nên gây lỗi ở đâu?", "Sau ít nhất một thay đổi đã thực hiện trong transaction", "Trước mọi thao tác ghi", "Chỉ trong comment", "Không cần kiểm tra dữ liệu", "Như vậy mới chứng minh thay đổi trước lỗi được hủy.")],
    ["https://docs.python.org/3/library/sqlite3.html#how-to-use-the-connection-context-manager", "https://www.sqlite.org/lang_createtable.html"])


L9 = lesson(
    "Xác thực Bearer và quyền sở hữu tài nguyên",
    ["Phân biệt bằng chứng danh tính với quyền trên một bản ghi.", "Kiểm tra Bearer token qua dependency dùng chung.", "Viết test truy cập chéo tài khoản và phản hồi 401/403."],
    """Xác thực trả lời 'đây là ai', phân quyền trả lời 'người đó được làm gì'. Có token hợp lệ không có nghĩa được xem nhiệm vụ của mọi người. Trong dự án, token ánh xạ tới user_id; mỗi nhiệm vụ lưu owner_id. Endpoint tạo lấy owner từ dependency, còn endpoint đọc/sửa/xóa phải kiểm tra bản ghi thuộc người hiện tại.

Bearer nghĩa là bên giữ token có thể trình token làm bằng chứng. Không đặt token vào URL vì URL dễ xuất hiện trong lịch sử hoặc log. HTTPS cần thiết khi truyền bí mật qua mạng; ví dụ của khóa chỉ chạy cục bộ. `HTTPBearer(auto_error=False)` giúp dependency tự xử lý rõ trường hợp không có hoặc sai header, tránh dựa vào khác biệt mã mặc định giữa các phiên bản thư viện.

Bài dùng hai token giả trong bộ nhớ để học luồng kiểm tra quyền và test. Đây không phải dịch vụ cấp token, không phải triển khai OAuth2/JWT hoàn chỉnh. Hệ thống thật cần cách đăng nhập, lưu mật khẩu đã băm, thời hạn, thu hồi, quản lý khóa và kiểm soát vận hành thích hợp. Ta không thêm thư viện bảo mật tùy tiện rồi gọi mọi thứ đã an toàn; hợp đồng demo phải ghi rõ phạm vi.

Trong hợp đồng của bài, thiếu/sai token trả 401 và WWW-Authenticate: Bearer; user hợp lệ nhưng truy cập nhiệm vụ của người khác trả 403; ID không tồn tại trả 404. Một sản phẩm có thể chọn 404 cho tài nguyên không thuộc quyền để giảm tiết lộ sự tồn tại, nhưng phải nhất quán và có test. Không dùng việc ẩn nút giao diện làm kiểm tra quyền: client có thể gọi HTTP trực tiếp.""",
    '''from typing import Annotated
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
''',
    """Lập ma trận token thiếu, token sai, Alice đúng chủ sở hữu, Bob đúng danh tính nhưng sai chủ sở hữu. Gửi cả bốn request trực tiếp bằng TestClient và ghi trạng thái. Giữ nguyên dữ liệu tasks để thấy sự khác nhau do quyền chứ không do nội dung endpoint. Thêm ID không tồn tại với token Alice để có ca 404.

Thử gửi owner_id=1 trong query khi dùng token Bob. Request vẫn phải 403 vì owner được quyết định bằng bản ghi và dependency, không phải query. Khi ghi bằng chứng, dùng nhãn Alice/Bob thay giá trị token; các token trong bài là giả và chỉ phục vụ máy cục bộ.""",
    """Thêm POST /tasks lấy owner_id từ current_user và model body chỉ chứa title. Hai người có thể tạo nhiệm vụ riêng; GET danh sách chỉ lấy nhiệm vụ của người hiện tại. Test người khác không đọc, sửa hoặc xóa được bản ghi vừa tạo. Chọn một quy ước 403 hoặc 404 cho truy cập chéo và giải thích quyết định trong README.""",
    """Handler tạo gán owner_id=user_id sau khi dependency xác nhận token. Handler danh sách lọc theo owner; handler thao tác một ID kiểm tra quyền ở server trước khi ghi. Đạt khi cả GET, PATCH và DELETE đều có test truy cập chéo, request lỗi không làm thay đổi bản ghi và owner_id trong body không được dùng để giả danh. Ghi phạm vi demo của token cố định thay vì gọi nó là đăng nhập dùng thật.""",
    """Không nhầm decode dữ liệu token với xác minh token. Không lưu token thật vào repo, ảnh chụp hoặc log. Không tạo dependency trả user từ query parameter rồi đặt tên là current_user để tưởng đã xác thực. Khi một route mới được thêm, review ma trận quyền; việc route khác có Depends không tự bảo vệ route mới.""",
    [question("Xác thực và phân quyền khác nhau thế nào?", "Xác thực xác định danh tính, phân quyền quyết định thao tác được phép", "Hai từ luôn giống nhau", "Phân quyền chỉ là màu nút", "Xác thực chỉ cần ID trong query", "Danh tính hợp lệ vẫn có giới hạn quyền.", "easy"),
     question("Token nên truyền ở đâu trong ví dụ?", "Header Authorization: Bearer ...", "Query chứa mật khẩu", "Tên bảng SQLite", "Tên file log công khai", "Header giúp theo hợp đồng Bearer và tránh token trong URL."),
     question("Bob có token hợp lệ nhưng mở nhiệm vụ Alice theo hợp đồng bài nhận gì?", "403", "201", "204", "200 bắt buộc", "Danh tính hợp lệ nhưng không có quyền trên tài nguyên."),
     question("owner_id khi tạo nhiệm vụ phải do đâu quyết định?", "Dependency danh tính phía server", "Client tự gửi tùy ý", "Số phần tử trang", "Tên endpoint", "Gán từ user đã xác thực tránh tạo thay người khác."),
     question("Hai token cố định của ví dụ đã đủ cho dịch vụ đăng nhập dùng thật chưa?", "Chưa, đó chỉ là mô hình cục bộ để học quyền", "Đủ cho ngân hàng", "Đủ nếu không có test", "Đủ khi token chứa demo", "Cấp/thu hồi/hết hạn và quản lý bí mật là phạm vi bổ sung.")],
    ["https://fastapi.tiangolo.com/tutorial/security/", "https://fastapi.tiangolo.com/reference/security/"])


L10 = lesson(
    "Kiểm thử hợp đồng, quyền và cô lập dữ liệu",
    ["Thiết kế test theo hành vi quan sát được thay vì cấu trúc hàm.", "Tách trạng thái giữa các lần kiểm thử bằng app factory.", "Kiểm tra cả mã trạng thái, dữ liệu và tác động sau lỗi."],
    """Một test tốt mô tả một lý do hành vi phải đúng. Với API nhiệm vụ, các nhóm quan trọng là đầu vào, hợp đồng JSON, quyền và tính bền vững. Test chỉ kiểm tra 200 có thể bỏ sót trường dữ liệu nhạy cảm hoặc bản ghi bị sửa sai. Ta thường khẳng định status, JSON liên quan và trạng thái tài nguyên sau request, đặc biệt sau một lỗi ghi.

App factory là hàm tạo ứng dụng với cấu hình và nguồn dữ liệu rõ ràng. Mỗi test có thể nhận một app và database riêng, tránh phụ thuộc thứ tự chạy. Một biến store dùng chung qua mọi bài test dễ làm ID và số item thay đổi. Thay vì viết test chấp nhận bất kỳ trạng thái, hãy kiểm soát điều kiện trước và làm rõ cái gì cần tồn tại.

TestClient phù hợp kiểm tra request đồng bộ tới app ASGI trong tiến trình. Sử dụng context manager khi muốn chạy lifespan. Đây là kiểm thử tích hợp nhẹ của route và dependency; nó không thay thế đo tải, kiểm thử qua proxy/TLS hoặc đánh giá bảo mật độc lập. Đặt tên test theo hành vi như rejects_foreign_owner thay vì test_function_3.

Chọn ca biên theo quy tắc, không chỉ nhân bản đường thành công. Với title 1..120 ký tự, cần rỗng, trắng, đúng giới hạn và vượt giới hạn. Với danh tính, cần thiếu, sai, hợp lệ đúng chủ và hợp lệ khác chủ. Với transaction, cần lỗi sau ít nhất một lần ghi. Nếu có thay đổi hợp đồng, test cũ thất bại là tín hiệu cần đánh giá; không sửa assertion chỉ để mọi thứ xanh mà chưa hiểu tác động.""",
    '''from fastapi import FastAPI, HTTPException
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
''',
    """Vòng lặp tạo app hai lần để chứng minh lần hai không thấy state lần một. Trong mỗi lần, request trùng và request title rỗng không làm tăng danh sách. Ghi từng assertion cùng lỗi mà nó có thể phát hiện; nếu không giải thích được vì sao assertion tồn tại, cân nhắc thay bằng quan sát có ý nghĩa hơn.

Đổi code ứng dụng có chủ đích trong bản sao bài: bỏ kiểm tra trùng, rồi chạy test để thấy assertion 409 thất bại. Khôi phục code. Đây là thao tác giúp hiểu test có thật sự bảo vệ quy tắc hay chỉ luôn đúng; không cần đưa lỗi chủ đích vào bản nộp.""",
    """Chuyển các kiểm tra thành hàm pytest có tên rõ ràng và fixture tạo client mới. Thêm test title dài 120 và 121 ký tự. Với dự án cuối khóa, bổ sung test quyền của Alice/Bob và test restart database file. Viết bảng yêu cầu → test để chỉ ra ít nhất một yêu cầu chưa có kiểm thử tự động và đề xuất cách đánh giá thủ công.""",
    """Fixture yield client bên trong with TestClient(create_app()), mỗi test nhận app mới. Test biên kiểm tra 201 cho 120 và 422 cho 121. Test quyền khẳng định cả trạng thái phản hồi và bản ghi vẫn nguyên sau thao tác bị chặn. Đạt khi chạy hai lần liên tiếp không phụ thuộc database cũ, không gọi mạng ngoài và tên test thể hiện hành vi hợp đồng.""",
    """Không dùng sleep để chờ dữ liệu nếu luồng request đã đồng bộ và có phản hồi rõ. Không đọc thuộc tính store riêng để xác nhận mọi hành vi nếu có thể quan sát qua API; như vậy test sẽ vỡ khi đổi tầng lưu trữ dù hợp đồng giữ nguyên. Ngược lại, với transaction cần kiểm tra dữ liệu bền vững thật trong test tích hợp, không chỉ tin response created.""",
    [question("Test tạo nhiệm vụ nên kiểm tra thêm gì ngoài status 201?", "Nội dung phản hồi và khả năng đọc lại dữ liệu", "Màu cửa sổ terminal", "Tên ổ đĩa của giảng viên", "Chỉ số dòng code", "Cần quan sát tài nguyên thực sự được tạo theo hợp đồng."),
     question("App factory giúp gì trong test?", "Tạo ứng dụng có state độc lập và cấu hình kiểm soát được", "Tự giải quyết mọi lỗi logic", "Bỏ được kiểm tra quyền", "Tự triển khai server công khai", "Cô lập điều kiện trước làm test ít phụ thuộc thứ tự."),
     question("Test request lỗi ghi dữ liệu nên xác nhận gì?", "Trạng thái dữ liệu không đổi ngoài ý muốn", "Chỉ thông báo lỗi dài", "Mọi lỗi đều 200", "Không cần đọc lại", "Phản hồi lỗi chưa tự chứng minh không có tác động phụ."),
     question("TestClient có thay thế kiểm thử qua proxy và tải thật không?", "Không", "Có tuyệt đối", "Chỉ cần chạy một lần", "Có nếu app title đúng", "Các tầng triển khai ngoài tiến trình cần kiểm tra phù hợp."),
     question("Khi assertion thất bại sau đổi code nên làm gì trước?", "Xem thay đổi hành vi có phù hợp yêu cầu không", "Đổi test để luôn pass", "Bỏ cả suite", "Bắt mọi exception", "Test thất bại là bằng chứng cần phân tích, không phải thứ phải che.")],
    ["https://fastapi.tiangolo.com/tutorial/testing/", "https://docs.pytest.org/en/stable/how-to/fixtures.html"])


L11 = lesson(
    "Cấu hình, nhật ký và chuẩn bị chạy cục bộ",
    ["Đưa giá trị theo môi trường ra khỏi mã nghiệp vụ.", "Ghi nhật ký đủ chẩn đoán mà tránh lộ token và body riêng tư.", "Phân biệt cấu hình phát triển với điều kiện đưa dịch vụ ra mạng."],
    """Ứng dụng cần thay đổi đường dẫn database, tên dịch vụ và danh tính demo theo môi trường. Các giá trị này không nên rải khắp handler. Ta có thể đọc environment một lần khi tạo app, kiểm tra dữ liệu cấu hình rồi truyền cho các thành phần. Trong dự án, đường dẫn file và bảng token được cung cấp rõ vào create_app; run.py từ chối khởi động nếu thiếu token demo, tránh một mật khẩu mặc định vô tình được dùng chung.

Nhật ký giúp nối một request với diễn biến xử lý. Một request ID do server tạo và trả ở header giúp người kiểm tra báo lỗi mà không cần gửi body nhạy cảm. Chỉ ghi phương thức, đường dẫn đã chọn và status trong ví dụ. Không ghi nguyên Authorization, toàn bộ query chứa bí mật hoặc body tùy ý. Mã request không thay thế xác thực; nó chỉ hỗ trợ chẩn đoán.

Tách liveness khỏi readiness khi cần: liveness nói tiến trình còn phản hồi, readiness có thể kiểm tra tài nguyên bắt buộc như database. Một probe truy cập dữ liệu quá nặng hoặc để lộ cấu hình sẽ tạo vấn đề mới. Trong bài health chỉ trả tên trạng thái cố định, còn kiểm tra lưu trữ được thực hiện qua test và startup. Nếu thay đổi probe, ghi rõ điều nó chứng minh.

Chạy local bằng host 127.0.0.1 giữ phạm vi bài trong máy học viên. --reload dành cho phát triển và không thay thế quản lý tiến trình. Trước khi đưa dịch vụ ra mạng cần đánh giá TLS, cấp/thu hồi token, backup/restore, giới hạn request, migration và giám sát theo ngữ cảnh. Khóa cung cấp ứng dụng học tập chạy được và quy trình kiểm tra, không tuyên bố cấu hình demo đáp ứng mọi yêu cầu triển khai thật.""",
    '''from dataclasses import dataclass
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
''',
    """Chạy hai request để thấy X-Request-ID khác nhau nhưng JSON nghiệp vụ ổn định. Tạo hai app với service khác nhau và kiểm tra tên theo đúng cấu hình của từng app. Không đặt biến cấu hình của app thứ hai vào biến toàn cục mà app thứ nhất cùng đọc. Thêm log thử chỉ chứa method, path và status; xem token có vô tình xuất hiện trong chuỗi log không.

Viết bản ghi sự cố mẫu: thời điểm, request ID, thao tác, trạng thái và kết quả mong đợi. Bản ghi không chứa mật khẩu, token hoặc dữ liệu người khác. Điều này đủ cho người hỗ trợ bắt đầu tra log theo mã yêu cầu.""",
    """Viết hàm đọc environment riêng có tham số mapping để test không sửa environment toàn tiến trình. Yêu cầu DATABASE_PATH không rỗng; nếu thiếu phải lỗi cấu hình trước khi nhận request. Thêm README chạy local, dừng bằng Ctrl+C, vị trí file database và cách chạy lại test trên file tạm riêng.""",
    """Hàm load_config(values) kiểm tra chuỗi đường dẫn rồi trả Config bất biến; test dùng dict nên không cần ghi .env hay in giá trị bí mật. Đạt khi thiếu cấu hình báo lỗi rõ, health không lộ đường dẫn database hoặc token, và các bước README thực hiện được từ thư mục dự án mới. Viết riêng hạng mục còn cần đánh giá trước triển khai mạng thay vì gọi reload là cơ chế vận hành.""",
    """Không log repr(request.headers) hoặc toàn bộ payload để tìm lỗi nhanh vì có thể giữ bí mật lâu dài. Không dùng request ID do client tùy ý gửi làm dữ liệu tin cậy nếu chưa giới hạn/kiểm tra. Không đưa .env chứa token vào bài nộp. Khi ứng dụng không khởi động, kiểm tra cấu hình và traceback trước; không tắt mọi kiểm tra cấu hình chỉ để server nghe được cổng.""",
    [question("Giá trị nào phù hợp đưa ra cấu hình?", "Đường dẫn database theo môi trường", "Mọi câu lệnh Python", "Tất cả dữ liệu học viên vào tên biến", "Mã trạng thái đổi ngẫu nhiên", "Môi trường có thể dùng đường dẫn lưu trữ khác nhau."),
     question("Log nào nên tránh?", "Toàn bộ header Authorization", "Phương thức HTTP", "Mã trạng thái", "Request ID do server tạo", "Token là bằng chứng danh tính cần hạn chế xuất hiện trong log."),
     question("X-Request-ID trong bài dùng cho mục đích gì?", "Liên hệ phản hồi với thông tin chẩn đoán", "Thay quyền admin", "Mã hóa body", "Tự cấp chứng chỉ", "Mã theo dõi hỗ trợ tìm request, không cấp quyền."),
     question("--reload trong khóa phù hợp với tình huống nào?", "Phát triển cục bộ", "Thay mọi cơ chế quản lý tiến trình thật", "Bảo đảm backup", "Tự quản lý hết hạn token", "Reload thuận tiện khi sửa code nhưng không hoàn thiện vận hành."),
     question("README cấu hình nên làm gì với token thật?", "Hướng dẫn đặt ở môi trường và không ghi vào repo", "In toàn bộ token lên trang health", "Lưu trong ảnh công khai", "Đưa vào URL ví dụ thật", "Tài liệu dùng placeholder hoặc token giả dành riêng cho lab.")],
    ["https://fastapi.tiangolo.com/advanced/settings/", "https://docs.python.org/3/library/logging.html"])


L12 = lesson(
    "Dự án tổng hợp Task API và nghiệm thu",
    ["Ghép validation, quyền, database và test thành sản phẩm chạy lại được.", "Đánh giá theo ma trận yêu cầu và rubric thay vì chỉ xem /docs.", "Nêu rõ phạm vi demo, minh chứng đạt và công việc mở rộng."],
    """Dự án cuối khóa là API quản lý nhiệm vụ học tập cho hai người dùng cục bộ. Mỗi nhiệm vụ có title, owner_id và done. Client tạo, liệt kê, đọc, đổi trạng thái hoàn thành và xóa nhiệm vụ của chính mình. Tiêu đề duy nhất trong phạm vi từng chủ sở hữu; hai người có thể dùng cùng tiêu đề. SQLite lưu bền vững giữa các lần khởi động, còn danh tính demo được cấu hình từ ngoài mã nghiệp vụ.

Ứng dụng hoàn thành bài học phải có hợp đồng có thể kiểm tra: POST trả 201; title trắng hoặc dài quá giới hạn trả 422; thiếu/sai token 401; người khác thao tác bản ghi 403; ID không tồn tại 404; title trùng trong cùng user 409; DELETE thành công 204 rỗng. Các lựa chọn này là hợp đồng của dự án, không phải mọi API đều bắt buộc cùng một cách.

Nghiệm thu bắt đầu từ thư mục mới, môi trường đã cài đúng dependencies, database tạm riêng và lệnh test được ghi rõ. Người chấm cần tái tạo được kết quả bằng mã đã nộp. Không dùng ảnh /docs thành công để thay bằng chứng quyền hoặc transaction. Một thay đổi bị chặn phải giữ nguyên dữ liệu; một lần restart app phải còn nhiệm vụ đã commit. Bài nộp chứa source, test, README, bảng hợp đồng và tự đánh giá giới hạn.

Rubric ưu tiên dữ liệu đúng và quyền: 25 điểm CRUD/hợp đồng, 20 validation/lỗi, 20 quyền, 15 SQLite/giao dịch, 15 test có ý nghĩa và 5 hướng dẫn tái hiện. Cần tổng từ 70/100 theo giảng viên, đồng thời các ca truy cập chéo và persistence bắt buộc đạt. Điểm quiz đo phần nhận biết/áp dụng trong câu hỏi; dự án cần minh chứng thực hành riêng. Khóa không tự biến việc bấm hoàn thành bài thành xác nhận đã đạt dự án.""",
    '''import sqlite3
import tempfile
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, ConfigDict, Field

class TaskIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: str = Field(min_length=1, max_length=120)

def create_app(database):
    with closing(sqlite3.connect(database)) as conn, conn:
        conn.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)")
    app = FastAPI()

    @app.post("/tasks", status_code=201)
    def create_task(payload: TaskIn):
        conn = sqlite3.connect(database)
        try:
            with conn:
                cursor = conn.execute("INSERT INTO tasks(title) VALUES (?)", (payload.title,))
                task_id = cursor.lastrowid
        except sqlite3.IntegrityError:
            raise HTTPException(409, "Duplicate title")
        finally:
            conn.close()
        return {"id": task_id, "title": payload.title}

    @app.get("/tasks")
    def list_tasks():
        conn = sqlite3.connect(database)
        try:
            return {"items": [{"id": r[0], "title": r[1]} for r in conn.execute("SELECT id,title FROM tasks ORDER BY id")]}
        finally:
            conn.close()
    return app

with tempfile.TemporaryDirectory() as folder:
    database = str(Path(folder) / "capstone-check.db")
    with TestClient(create_app(database)) as first:
        assert first.post("/tasks", json={"title": " Evidence "}).status_code == 201
    with TestClient(create_app(database)) as restarted:
        assert restarted.get("/tasks").json()["items"][0]["title"] == "Evidence"
        assert restarted.post("/tasks", json={"title": "Evidence"}).status_code == 409
        assert restarted.post("/tasks", json={"title": "  "}).status_code == 422
''',
    """Ví dụ nhỏ chỉ xác minh lát cắt persistence, validation và xung đột của dự án; nó chưa phải toàn bộ sản phẩm nghiệm thu. Chạy hai app nối tiếp cùng file tạm để kiểm tra dữ liệu sống qua restart. Ghi rằng title được trim thành Evidence. Request trùng sau restart phải 409, còn title trắng 422. Sau đó mở gói project_files của khóa để học cấu trúc ứng dụng đầy đủ có quyền và CRUD.

Chạy bộ test dự án rồi đọc từng test theo bảng hợp đồng. Với mỗi yêu cầu, chỉ ra test và quan sát tương ứng. Chọn một lỗi có chủ đích trong bản sao, ví dụ bỏ owner filter của danh sách, và chứng minh test quyền bắt được lỗi đó trước khi khôi phục code.""",
    """Hoàn thiện một tính năng mở rộng: bộ lọc done, phân trang ổn định hoặc đổi title có kiểm tra trùng. Giữ toàn bộ test cũ, thêm test cho feature và ít nhất một trường hợp lỗi. Nộp README ghi các bước chạy, cấu hình, hợp đồng endpoint, giới hạn token demo và kế hoạch bổ sung nếu đưa dịch vụ ra mạng. Trình bày cách kiểm tra dự án mà không dùng dữ liệu thật.""",
    """Tính năng mở rộng phải giữ owner filter ở mọi truy vấn. Nếu thêm đổi title, đặt UNIQUE(owner_id,title) và map xung đột đã biết sang 409; không nhận owner_id từ body. Đạt khi một người khác có thể chạy test từ thư mục mới, ca bắt buộc truy cập chéo và persistence đều xanh, README phân biệt kết quả tự động với rubric giảng viên chấm. Đính kèm bảng tự chấm có dẫn tới test hoặc tệp minh chứng cho từng điểm.""",
    """Không coi 60 câu quiz là đủ thay dự án, vì nhận biết API khác khả năng thiết kế dữ liệu và test quyền. Không nộp database đang chứa dữ liệu cá nhân. Không tự gắn nhãn 'đạt chuẩn production' cho app token demo. Nếu chỉ chạy được trên một IDE, rà lại đường dẫn tuyệt đối và cấu hình bị hardcode; artifact học tập phải tái hiện được trong một thư mục khác.""",
    [question("Hai người dùng có được dùng cùng title theo dự án không?", "Có, tính duy nhất áp dụng trong từng chủ sở hữu", "Không, title là mật khẩu toàn hệ thống", "Chỉ admin có title", "Mọi title đều được bỏ qua", "UNIQUE(owner_id,title) giữ đúng phạm vi nghiệp vụ."),
     question("Minh chứng nào kiểm tra persistence?", "Khởi tạo app mới trên cùng file và đọc dữ liệu đã commit", "Chỉ chụp ảnh /docs", "Đếm số decorator", "Đổi tên biến app", "Đọc sau restart kiểm tra dữ liệu ngoài bộ nhớ tiến trình."),
     question("Điều kiện nào bắt buộc ngoài tổng điểm rubric?", "Các ca quyền chéo và lưu bền vững phải đạt", "Có nhiều màu trong README", "Title app phải tiếng Anh", "Luôn trả 200", "Hai nhóm này bảo vệ chức năng cốt lõi của dự án."),
     question("Tính năng mở rộng danh sách phải giữ điều gì?", "Lọc đúng owner của người hiện tại", "Lấy mọi nhiệm vụ để dễ xem", "Cho client đổi owner tùy ý", "Bỏ kiểm tra token khi có done", "Bộ lọc mới không được phá ràng buộc quyền cũ."),
     question("Kết quả quiz và rubric dự án có quan hệ gì?", "Bổ sung nhau, dự án cần minh chứng thực hành riêng", "Quiz đúng thay mọi kiểm tra quyền", "Bấm hoàn thành bài là đạt dự án", "Không cần giảng viên xem code", "Hai hình thức đánh giá đo các loại bằng chứng khác nhau.")],
    ["https://fastapi.tiangolo.com/tutorial/bigger-applications/", "https://fastapi.tiangolo.com/deployment/concepts/"], minutes=240)


COURSE = dict(
    title="Xây dựng API thực hành với FastAPI",
    slug="fastapi-xay-dung-api-thuc-hanh",
    level="intermediate",
    description="Khóa thực hành 6 chương, 12 bài về HTTP, Pydantic 2, CRUD, dependency, SQLite, quyền truy cập và kiểm thử. Xây dựng Task API chạy cục bộ với tài liệu bài học, ví dụ thực thi, 60 câu kiểm tra và dự án cuối khóa có rubric.",
    prerequisites=["Viết được hàm Python, hiểu list/dict, exception và import.", "Biết dùng terminal, môi trường ảo và cài dependencies từ requirements.", "Có Python 3.12+ và máy cho phép tạo thư mục thực hành riêng; kiến thức SQL cơ bản hữu ích."],
    outcomes=["Thiết kế hợp đồng API có validation và mã lỗi rõ ràng.", "Lưu dữ liệu bằng SQLite với truy vấn tham số và giao dịch.", "Tách danh tính và quyền sở hữu qua dependency.", "Viết test API cô lập dữ liệu, kiểm tra lỗi và quyền chéo.", "Nộp dự án tái hiện được cùng tài liệu vận hành cục bộ và giới hạn thiết kế."],
    duration_hours=36,
    handbook=dedent('''
        ## Giới thiệu và phạm vi
        Khóa dành cho người đã biết Python cơ bản và muốn xây dựng một API có thể chạy, sửa và kiểm tra trên máy cá nhân. Sản phẩm xuyên suốt là Task API quản lý nhiệm vụ học tập của hai người dùng cục bộ. Nội dung được biên soạn bằng tiếng Việt, dùng FastAPI và Pydantic 2, có ví dụ TestClient thực thi độc lập. Khóa gồm 6 chương, 12 bài và khoảng 36 giờ học: 20 giờ đọc/chạy ví dụ, 10 giờ bài tập/dự án và 6 giờ ôn/test/review. Thời lượng là dự kiến, không phải số phút video.

        ## Điều kiện bắt đầu và thiết lập
        Cần biết hàm, kiểu dữ liệu Python, exception và import. Dùng Python 3.12+ trong thư mục mới. Tạo môi trường ảo bằng `python -m venv .venv`, kích hoạt theo hệ điều hành rồi chạy `python -m pip install -r requirements.txt` của gói dự án. Bộ phiên bản đã kiểm tra cùng tài liệu: FastAPI 0.115.6, Pydantic 2.10.4, httpx 0.28.1; ví dụ sử dụng API của Pydantic 2. requirements dự án khóa phiên bản để tái hiện, việc nâng cấp cần chạy lại test trước.
        Không trỏ bài thực hành vào database của StudyOnline. Ví dụ dùng bộ nhớ hoặc TemporaryDirectory; dự án dùng file SQLite mới trong thư mục dự án. Không cần tài khoản cloud, token thật hay dịch vụ trả phí. Chỉ chạy máy chủ trên 127.0.0.1 trong khóa.

        ## Chuẩn đầu ra có thể quan sát
        - Viết bảng hợp đồng cho POST/GET/PATCH/DELETE với status và JSON cụ thể.
        - Từ chối title trắng, vượt giới hạn và dữ liệu sai kiểu bằng model kiểm tra.
        - Tạo dữ liệu tồn tại sau khi đóng app và khởi tạo lại trên cùng file SQLite.
        - Chặn tài khoản hợp lệ đọc/sửa/xóa nhiệm vụ của tài khoản khác; owner do server xác định.
        - Chứng minh rollback và trạng thái không đổi sau lỗi bằng test.
        - Nộp source, test, README và tự đánh giá giới hạn mà người khác chạy lại được.

        ## Kế hoạch sáu tuần
        1. Tuần 1 — HTTP/OpenAPI, path/query; viết bảng endpoint và test tham số biên. Hoàn thành bài 1–2, khoảng 5 giờ.
        2. Tuần 2 — Pydantic 2, CRUD/response/error; hoàn thành API dùng bộ nhớ với test 201/404/409/422. Bài 3–4, khoảng 6 giờ.
        3. Tuần 3 — Dependency và lifespan/sync-async; vẽ vòng đời tài nguyên, test cleanup sau lỗi. Bài 5–6, khoảng 5 giờ.
        4. Tuần 4 — SQLite/transaction; chuyển dữ liệu sang file tạm, chứng minh persistence và rollback. Bài 7–8, khoảng 6 giờ.
        5. Tuần 5 — Danh tính/quyền và testing; hoàn thành ma trận hai người dùng, test các đường lỗi và quyền chéo. Bài 9–10, khoảng 6 giờ.
        6. Tuần 6 — Cấu hình/log và dự án; chạy nghiệm thu từ thư mục mới, review README và trình bày giới hạn. Bài 11–12, khoảng 8 giờ.

        ## Quy trình học mỗi bài
        Đọc mục tiêu, chạy ví dụ nguyên bản, giải thích từng assertion rồi tự làm bài tập trước khi mở hướng giải. Ghi lại request, status, JSON và trạng thái dữ liệu. Làm năm câu kiểm tra sau thực hành; câu sai cần liên hệ lại đoạn code tương ứng. Làm lại câu quen thuộc có thể giúp ôn nhưng chưa chứng minh áp dụng được vào đầu vào mới. Nếu gặp lỗi, thu nhỏ ví dụ và giữ nguyên thông báo lỗi đã bỏ token.

        ## Đánh giá trong khóa
        Mỗi bài có 5 câu trắc nghiệm kèm giải thích, tổng 60 câu gốc phân loại theo chương/bài. Bộ ôn hỗ trợ tự kiểm tra; bài kiểm tra cuối khóa dùng tổng hợp nội dung. Ngưỡng quiz đề xuất là 70%; đạt quiz không tự thay việc chấm dự án. Học viên nộp 12 minh chứng bài tập ngắn và dự án. Giảng viên có thể điều chỉnh tiến độ/lịch kiểm tra theo lớp nhưng cần giữ tiêu chí và phản hồi cụ thể.

        ## Đề bài dự án Task API
        Xây API cho hai tài khoản local cấu hình từ ngoài app. Nhiệm vụ gồm id, owner_id, title, done. Có tạo, danh sách phân trang/lọc done, đọc một nhiệm vụ, đổi done và xóa. title trim, dài 1–120 ký tự và duy nhất trong mỗi owner. Database SQLite có UNIQUE(owner_id,title), truy vấn tham số và quản lý connection. Client không được đặt owner_id trong body. Token demo phải có chú thích phạm vi, không phải hệ thống đăng nhập Internet.
        Hợp đồng: thiếu/sai token 401; truy cập nhiệm vụ người khác 403; không có ID 404; xung đột title 409; đầu vào sai 422; tạo 201; xóa 204 rỗng. Giữ owner filter trong cả danh sách và thao tác bản ghi. Nếu chọn hợp đồng khác, học viên phải giải thích và cập nhật đủ test, không được mở quyền rộng hơn.

        ## Rubric dự án 100 điểm
        - 25 điểm CRUD và hợp đồng: mỗi thao tác thành công đúng trạng thái/JSON, đọc lại dữ liệu và 204 rỗng; thiếu thao tác nào trừ phần tương ứng.
        - 20 điểm validation và lỗi: title trắng/quá dài, path/query sai, trùng title; lỗi trả rõ, không lộ SQL/token. Có test dữ liệu không đổi sau lỗi.
        - 20 điểm quyền: thiếu/sai token, danh sách theo owner, GET/PATCH/DELETE chéo bị chặn, body không giả owner. Đây là tiêu chí bắt buộc.
        - 15 điểm SQLite/giao dịch: placeholder, connection được đóng, dữ liệu tồn tại sau restart, quy tắc UNIQUE đúng phạm vi. Persistence là tiêu chí bắt buộc.
        - 15 điểm test: môi trường tạm độc lập, test lặp lại được, bao phủ đường lỗi/quyền/biên và assertions có ý nghĩa.
        - 5 điểm tài liệu: README có lệnh chạy/test, cấu hình, bảng endpoint và giới hạn demo.
        Đề xuất đạt từ 70/100 đồng thời cả tiêu chí bắt buộc về quyền và persistence đều đạt. Điểm dự án cần giảng viên/reviewer chấm theo minh chứng; hệ thống LMS hiện không tự đánh giá toàn bộ rubric này.

        ## Hồ sơ nộp và nghiệm thu
        Nộp app.py, run.py, test_app.py, requirements.txt, README.md và bảng yêu cầu→test. Không nộp token thật hoặc database chứa dữ liệu cá nhân. Từ thư mục sạch, cài dependencies, chạy `python -m pytest -q test_app.py`, cấu hình token demo và chạy Uvicorn theo README. Reviewer tự gửi chuỗi tạo/đọc/sửa/xóa với hai user, khởi động lại app trên cùng file và kiểm tra dữ liệu. Chạy lại test lần hai để tìm phụ thuộc trạng thái. Gói mẫu cung cấp điểm xuất phát và test minh họa; bài nộp cần có mở rộng và giải thích của học viên.

        ## Giới hạn và hướng học tiếp
        Token tĩnh của lab không cấp, hết hạn hoặc thu hồi động; chưa có login/password/JWT hoàn chỉnh. SQLite phù hợp quy mô thực hành, cần đánh giá truy cập đồng thời trước workload khác. Khi triển khai mạng cần review TLS, quản lý bí mật, migration/backup/restore, hạn mức, giám sát, bảo mật và quy trình cập nhật. Có thể học tiếp OAuth2/OIDC với nhà cung cấp danh tính, PostgreSQL và chiến lược deploy sau khi nắm hợp đồng/quyền/test. Tài liệu này không tuyên bố chứng nhận học thuật hay bảo đảm ứng dụng production cho mọi hoàn cảnh.

        ## Nguồn chính thức
        - https://fastapi.tiangolo.com/tutorial/
        - https://fastapi.tiangolo.com/tutorial/testing/
        - https://docs.pydantic.dev/latest/concepts/models/
        - https://docs.python.org/3/library/sqlite3.html
    ''').strip(),
    project_files={},
    chapters=[
        dict(title="Hợp đồng HTTP và dữ liệu yêu cầu", lessons=[L1, L2]),
        dict(title="Kiểm tra dữ liệu và thao tác tài nguyên", lessons=[L3, L4]),
        dict(title="Dependency và vòng đời ứng dụng", lessons=[L5, L6]),
        dict(title="Lưu trữ SQLite và tính toàn vẹn", lessons=[L7, L8]),
        dict(title="Danh tính, quyền và kiểm thử", lessons=[L9, L10]),
        dict(title="Cấu hình và dự án tổng hợp", lessons=[L11, L12]),
    ],
)


COURSE["project_files"] = {
    "app.py": dedent('''
        """Task API for a local teaching lab; fixed demo tokens are not a login service."""
        import logging
        from contextlib import asynccontextmanager
        from pathlib import Path
        import sqlite3
        from uuid import uuid4

        from fastapi import Depends, FastAPI, HTTPException, Path as ApiPath, Query, Response
        from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
        from pydantic import BaseModel, ConfigDict, Field

        logger = logging.getLogger("task_lab")
        bearer = HTTPBearer(auto_error=False)

        class TaskCreate(BaseModel):
            model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
            title: str = Field(min_length=1, max_length=120)

        class TaskPatch(BaseModel):
            model_config = ConfigDict(extra="forbid")
            done: bool = Field(strict=True)

        class TaskOut(BaseModel):
            id: int
            owner_id: int
            title: str
            done: bool

        class TaskPage(BaseModel):
            items: list[TaskOut]
            total: int
            offset: int
            limit: int

        def create_app(database_path, tokens):
            """Create an isolated app. Token mapping is supplied only for local exercises."""
            if not str(database_path).strip() or str(database_path) == ":memory:":
                raise ValueError("Use a new SQLite file path for this lab")
            token_map = dict(tokens)
            if not token_map or any(not isinstance(key, str) or len(key) < 12 or
                                    type(owner) is not int or owner < 1
                                    for key, owner in token_map.items()):
                raise ValueError("Provide local demo tokens (12+ chars) mapped to positive user IDs")
            database = str(Path(database_path).resolve())

            def connect():
                conn = sqlite3.connect(database, timeout=5, check_same_thread=False)
                conn.row_factory = sqlite3.Row
                return conn

            @asynccontextmanager
            async def lifespan(app):
                Path(database).parent.mkdir(parents=True, exist_ok=True)
                conn = connect()
                try:
                    with conn:
                        conn.execute("""CREATE TABLE IF NOT EXISTS tasks (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            owner_id INTEGER NOT NULL CHECK(owner_id > 0),
                            title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
                            done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1)),
                            UNIQUE(owner_id,title))""")
                finally:
                    conn.close()
                yield

            app = FastAPI(title="Local Study Task API", version="1.0.0", lifespan=lifespan)

            @app.middleware("http")
            async def request_id(request, call_next):
                marker = uuid4().hex
                response = await call_next(request)
                response.headers["X-Request-ID"] = marker
                # Never log Authorization or request body in this example.
                logger.info("request=%s method=%s path=%s status=%s", marker,
                            request.method, request.url.path, response.status_code)
                return response

            def get_db():
                conn = connect()
                try:
                    yield conn
                finally:
                    conn.close()

            def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
                owner = token_map.get(credentials.credentials) if credentials is not None else None
                if credentials is None or credentials.scheme.lower() != "bearer" or owner is None:
                    raise HTTPException(401, "Authentication required",
                                        headers={"WWW-Authenticate": "Bearer"})
                return owner

            def owned_task(conn, task_id, owner):
                task = conn.execute("SELECT id,owner_id,title,done FROM tasks WHERE id=?", (task_id,)).fetchone()
                if task is None:
                    raise HTTPException(404, "Task not found")
                if task["owner_id"] != owner:
                    raise HTTPException(403, "Not allowed")
                return dict(task)

            @app.get("/health")
            def health():
                return {"status": "ok"}

            @app.post("/tasks", response_model=TaskOut, status_code=201)
            def create_task(payload: TaskCreate, owner: int = Depends(current_user),
                            conn: sqlite3.Connection = Depends(get_db)):
                try:
                    with conn:
                        cursor = conn.execute("INSERT INTO tasks(owner_id,title) VALUES (?,?)",
                                              (owner, payload.title))
                        task_id = cursor.lastrowid
                except sqlite3.IntegrityError as exc:
                    if getattr(exc, "sqlite_errorcode", None) == sqlite3.SQLITE_CONSTRAINT_UNIQUE:
                        raise HTTPException(409, "A task with this title already exists")
                    raise
                return owned_task(conn, task_id, owner)

            @app.get("/tasks", response_model=TaskPage)
            def list_tasks(done: bool | None = None, offset: int = Query(0, ge=0),
                           limit: int = Query(20, ge=1, le=50),
                           owner: int = Depends(current_user),
                           conn: sqlite3.Connection = Depends(get_db)):
                where = "owner_id=?"
                values = [owner]
                if done is not None:
                    where += " AND done=?"
                    values.append(int(done))
                total = conn.execute("SELECT COUNT(*) FROM tasks WHERE " + where, values).fetchone()[0]
                rows = conn.execute("SELECT id,owner_id,title,done FROM tasks WHERE " + where +
                                    " ORDER BY id LIMIT ? OFFSET ?", values + [limit, offset]).fetchall()
                return {"items": [dict(row) for row in rows], "total": total, "offset": offset, "limit": limit}

            @app.get("/tasks/{task_id}", response_model=TaskOut)
            def read_task(task_id: int = ApiPath(ge=1), owner: int = Depends(current_user),
                          conn: sqlite3.Connection = Depends(get_db)):
                return owned_task(conn, task_id, owner)

            @app.patch("/tasks/{task_id}", response_model=TaskOut)
            def update_task(payload: TaskPatch, task_id: int = ApiPath(ge=1),
                            owner: int = Depends(current_user),
                            conn: sqlite3.Connection = Depends(get_db)):
                owned_task(conn, task_id, owner)
                with conn:
                    conn.execute("UPDATE tasks SET done=? WHERE id=? AND owner_id=?",
                                 (int(payload.done), task_id, owner))
                return owned_task(conn, task_id, owner)

            @app.delete("/tasks/{task_id}", status_code=204)
            def delete_task(task_id: int = ApiPath(ge=1), owner: int = Depends(current_user),
                            conn: sqlite3.Connection = Depends(get_db)):
                owned_task(conn, task_id, owner)
                with conn:
                    conn.execute("DELETE FROM tasks WHERE id=? AND owner_id=?", (task_id, owner))
                return Response(status_code=204)

            return app
    ''').strip() + "\n",
    "run.py": dedent('''
        """Read local lab settings; start with python -m uvicorn run:app --host 127.0.0.1."""
        import json
        import os
        from app import create_app

        raw_tokens = os.environ.get("LAB_TOKENS_JSON")
        if not raw_tokens:
            raise RuntimeError("Set LAB_TOKENS_JSON to local demo token/user pairs; see README")
        try:
            tokens = json.loads(raw_tokens)
        except json.JSONDecodeError as exc:
            raise RuntimeError("LAB_TOKENS_JSON must be valid JSON") from exc
        if not isinstance(tokens, dict):
            raise RuntimeError("LAB_TOKENS_JSON must be an object")
        app = create_app(os.environ.get("LAB_DATABASE_PATH", "lab_tasks.sqlite3"), tokens)
    ''').strip() + "\n",
    "test_app.py": dedent('''
        """Behavior checks against temporary local data; no external services or real tokens."""
        from pathlib import Path
        from contextlib import closing
        import sqlite3
        from tempfile import TemporaryDirectory
        import pytest
        from fastapi.testclient import TestClient
        from app import create_app

        TOKENS = {"training-alice-only": 1, "training-bob-only": 2}
        ALICE = {"Authorization": "Bearer training-alice-only"}
        BOB = {"Authorization": "Bearer training-bob-only"}

        @pytest.fixture
        def lab():
            with TemporaryDirectory() as folder:
                database = str(Path(folder) / "test.sqlite3")
                with TestClient(create_app(database, TOKENS)) as client:
                    yield client, database

        def add(client, title="HTTP", headers=None):
            response = client.post("/tasks", json={"title": title}, headers=headers or ALICE)
            assert response.status_code == 201
            return response.json()

        def test_crud_and_response_contract(lab):
            client, _ = lab
            item = add(client, "  HTTP  ")
            assert item == {"id": item["id"], "owner_id": 1, "title": "HTTP", "done": False}
            assert client.get(f"/tasks/{item['id']}", headers=ALICE).json() == item
            changed = client.patch(f"/tasks/{item['id']}", json={"done": True}, headers=ALICE)
            assert changed.status_code == 200 and changed.json()["done"] is True
            deleted = client.delete(f"/tasks/{item['id']}", headers=ALICE)
            assert deleted.status_code == 204 and deleted.content == b""
            assert client.get(f"/tasks/{item['id']}", headers=ALICE).status_code == 404

        def test_validation_and_state_after_error(lab):
            client, _ = lab
            add(client, "A" * 120)
            for title in ["", "   ", "A" * 121]:
                assert client.post("/tasks", json={"title": title}, headers=ALICE).status_code == 422
            assert client.post("/tasks", json={"title": "Spoof", "owner_id": 2}, headers=ALICE).status_code == 422
            assert client.get("/tasks?limit=51", headers=ALICE).status_code == 422
            assert client.get("/tasks/0", headers=ALICE).status_code == 422
            assert client.get("/tasks", headers=ALICE).json()["total"] == 1

        def test_authentication_and_cross_owner_writes(lab):
            client, _ = lab
            task = add(client)
            path = f"/tasks/{task['id']}"
            assert client.get(path).status_code == 401
            assert client.get(path, headers={"Authorization": "Bearer invalid"}).status_code == 401
            assert client.get(path, headers=BOB).status_code == 403
            assert client.patch(path, json={"done": True}, headers=BOB).status_code == 403
            assert client.delete(path, headers=BOB).status_code == 403
            assert client.get(path, headers=ALICE).json()["done"] is False
            assert client.get("/tasks", headers=BOB).json()["items"] == []

        def test_unique_titles_are_scoped_by_owner(lab):
            client, database = lab
            add(client, "Same")
            assert client.post("/tasks", json={"title": "Same"}, headers=ALICE).status_code == 409
            other = add(client, "Same", BOB)
            assert other["owner_id"] == 2
            with closing(sqlite3.connect(database)) as conn:
                assert conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0] == 2

        def test_filtered_pagination_and_boolean_update(lab):
            client, _ = lab
            one = add(client, "First")
            add(client, "Second")
            add(client, "Third")
            assert client.patch(f"/tasks/{one['id']}", json={"done": "true"}, headers=ALICE).status_code == 422
            assert client.patch(f"/tasks/{one['id']}", json={"done": True}, headers=ALICE).status_code == 200
            result = client.get("/tasks?done=false&offset=1&limit=1", headers=ALICE).json()
            assert result["total"] == 2 and result["items"][0]["title"] == "Third"
            assert client.get("/tasks?done=true", headers=ALICE).json()["total"] == 1

        def test_restart_keeps_committed_data(lab):
            client, database = lab
            item = add(client, "Persistence")
            with TestClient(create_app(database, TOKENS)) as another_app:
                response = another_app.get(f"/tasks/{item['id']}", headers=ALICE)
                assert response.status_code == 200 and response.json()["title"] == "Persistence"

        def test_parameterized_input_remains_data(lab):
            client, database = lab
            strange = "Title'); DROP TABLE tasks; --"
            task = add(client, strange)
            assert client.get(f"/tasks/{task['id']}", headers=ALICE).json()["title"] == strange
            with closing(sqlite3.connect(database)) as conn:
                assert conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0] == 1

        def test_configuration_and_request_ids(lab):
            client, _ = lab
            one, two = client.get("/health"), client.get("/health")
            assert one.json() == {"status": "ok"}
            assert len(one.headers["x-request-id"]) == 32
            assert one.headers["x-request-id"] != two.headers["x-request-id"]
            with pytest.raises(ValueError):
                create_app("uncreated-test.db", {})
    ''').strip() + "\n",
    "requirements.txt": "fastapi==0.115.6\npydantic==2.10.4\nhttpx==0.28.1\nuvicorn==0.34.0\npytest==8.3.4\n",
    "README.md": dedent('''
        # Task API — dự án thực hành FastAPI

        API quản lý nhiệm vụ cục bộ có validation, SQLite, quyền chủ sở hữu và tests. Hai token giả phục vụ học cách tách danh tính/quyền, chưa phải hệ thống đăng nhập Internet. Dùng Python 3.12+ trong thư mục riêng. Không dùng database/tài khoản thật.

        ## Cài và kiểm tra
        Tạo môi trường ảo bằng `python -m venv .venv`, kích hoạt rồi chạy:

        ```text
        python -m pip install -r requirements.txt
        python -m pytest -q test_app.py
        ```

        Tests dùng thư mục tạm, xóa dữ liệu sau mỗi test và không gọi mạng ngoài. Khi nâng dependencies, chạy lại toàn bộ tests. Phiên bản khóa giúp tái hiện bộ bài; đây không phải khuyến nghị duy trì phiên bản cũ vô thời hạn.

        ## Chạy trên máy học viên
        PowerShell, từ thư mục dự án:

        ```powershell
        $env:LAB_TOKENS_JSON = '{"training-alice-only":1,"training-bob-only":2}'
        $env:LAB_DATABASE_PATH = 'lab_tasks.sqlite3'
        python -m uvicorn run:app --host 127.0.0.1 --port 8000 --reload
        ```

        Bash:

        ```sh
        export LAB_TOKENS_JSON='{"training-alice-only":1,"training-bob-only":2}'
        export LAB_DATABASE_PATH='lab_tasks.sqlite3'
        python -m uvicorn run:app --host 127.0.0.1 --port 8000 --reload
        ```

        Truy cập http://127.0.0.1:8000/docs. Nhấn Authorize và nhập một token giả, không gõ thêm chữ Bearer nếu giao diện HTTPBearer chỉ yêu cầu giá trị. Dừng bằng Ctrl+C. File SQLite giữ dữ liệu sau khi dừng; bài test dùng file khác. Không đưa .env hoặc database cá nhân vào bài nộp.

        ## Hợp đồng
        - GET /health: 200, status ok, không công bố token/path. Chỉ là liveness cơ bản.
        - POST /tasks: body title 1–120 ký tự sau trim, trả 201 với id/owner_id/title/done. Body có owner_id bị từ chối 422.
        - GET /tasks: danh sách của user hiện tại, hỗ trợ done=true/false, offset>=0, limit 1–50; lọc trước phân trang, total là số dòng đã lọc.
        - GET /tasks/{id}: trả một nhiệm vụ thuộc user hiện tại.
        - PATCH /tasks/{id}: body {"done":true} với boolean JSON, trả trạng thái mới.
        - DELETE /tasks/{id}: 204 không body.
        - Thiếu/sai token: 401 với WWW-Authenticate. Nhiệm vụ không tồn tại: 404. ID của người khác: 403. Title trùng trong cùng owner: 409. Đầu vào sai: 422.
        - UNIQUE(owner_id,title) cho phép hai user dùng cùng title. Tất cả giá trị client được bind trong SQL; tên cột/sắp xếp do code kiểm soát.

        ## Nghiệm thu và mở rộng
        Xem test_app.py cho CRUD, title biên/trắng, query biên, trường owner giả, quyền GET/PATCH/DELETE chéo, title trùng, phân trang, persistence và dữ liệu giống cú pháp SQL. Request lỗi không tạo thêm bản ghi hoặc sửa nhiệm vụ trái quyền. Chạy lại tests lần hai để kiểm tra cô lập.
        Mở rộng yêu cầu: đổi title có kiểm tra UNIQUE, deadline hoặc lọc nâng cao. Giữ owner filter và thêm test trước/sau lỗi; giữ tests cũ đạt. Nộp bảng yêu cầu→test và rubric tự chấm. Giảng viên đánh giá code và giải thích, không chỉ xem ảnh /docs.

        ## Giới hạn thiết kế
        Token tĩnh chỉ dành cho loopback lab: chưa có phát hành, hết hạn, thu hồi, password hashing hay OIDC. Khi đưa lên mạng cần review danh tính thật, TLS, cấu hình bí mật, backup/restore, migration, hạn mức, log và theo dõi theo yêu cầu sản phẩm. SQLite có giới hạn khóa ghi; cần đánh giá workload trước chọn kiến trúc khác. Bộ mẫu này là nền tảng thực hành, chưa chứng nhận an toàn/khả năng vận hành cho mọi hệ thống thực tế.
    ''').strip() + "\n",
}
