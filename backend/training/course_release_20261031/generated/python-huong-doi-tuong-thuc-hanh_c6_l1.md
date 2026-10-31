## Mục tiêu bài học
- Tách định dạng lưu trữ khỏi cấu trúc đối tượng trong bộ nhớ.
- Xác thực schema và dữ liệu khi tải JSON.
- Lưu bằng file tạm và hiểu giới hạn một tiến trình.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Tách định dạng lưu trữ khỏi cấu trúc đối tượng trong bộ nhớ.
- Xác thực schema và dữ liệu khi tải JSON.
- Lưu bằng file tạm và hiểu giới hạn một tiến trình.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Dữ liệu trong đối tượng mất khi tiến trình kết thúc. Ta cần một định dạng có thể đọc lại, kiểm tra được và đủ rõ để nâng cấp. JSON phù hợp bài nhỏ vì biểu diễn được dict, list, chuỗi và số. Ta chọn cấu trúc {schema_version: 1, books: [...]} và mapping tường minh cho từng trường; không lưu thẳng __dict__ vì thêm thuộc tính nội bộ có thể làm định dạng đổi ngoài ý muốn.

Tải file là một ranh giới đầu vào khác. File có thể bị sửa tay, hỏng cú pháp hoặc chứa giá trị sai dù JSON hợp lệ. Kiểm tra root là dict, version đúng, books là list, từng bản ghi có trường bắt buộc và mọi mã duy nhất. Khởi tạo Book qua cùng quy tắc bất biến của ứng dụng để available âm bị từ chối. Cần phân biệt file chưa tồn tại lần đầu với file có tồn tại nhưng sai: không âm thầm biến file hỏng thành thư viện rỗng rồi ghi đè mất dữ liệu.

Ghi file tạm ở cùng thư mục rồi thay file đích giúp tránh để lại file đích bị cắt nửa trong một số lỗi ghi. Nó không tự tạo giao dịch nhiều tiến trình, không khóa hai phiên CLI cùng sửa và không bảo đảm tồn tại sau mọi sự cố phần cứng. Bài này giới hạn một người chạy một lệnh tại một thời điểm, dữ liệu nhỏ và có bản sao lưu thủ công trước khi thử file hỏng. Yêu cầu nhiều người dùng nên chuyển sang cơ chế lưu có giao dịch và kiểm soát đồng thời.

Mã ví dụ dùng TemporaryDirectory để mọi file thử nằm trong một vùng tạm được dọn sau khi kết thúc. Trong dự án hoàn chỉnh, đường dẫn dữ liệu do người dùng chỉ định và lỗi đọc/ghi cần được trình bày rõ. Không kiểm tra tải JSON từ nguồn không tin cậy không giới hạn; ví dụ dự án đặt giới hạn kích thước file để tránh vô tình đọc dữ liệu quá lớn cho bài tự học.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import json
from pathlib import Path
from tempfile import TemporaryDirectory

def save(path, books):
    payload = {"schema_version": 1, "books": books}
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    temporary.replace(path)

def load(path):
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or payload.get("schema_version") != 1:
        raise ValueError("Sai phiên bản dữ liệu")
    books = payload.get("books")
    if not isinstance(books, list):
        raise ValueError("books phải là danh sách")
    codes = set()
    for row in books:
        if not isinstance(row, dict) or set(row) != {"code", "total"}:
            raise ValueError("Sai trường của sách")
        if not isinstance(row["code"], str) or not row["code"].strip():
            raise ValueError("Mã không hợp lệ")
        if type(row["total"]) is not int or row["total"] < 0:
            raise ValueError("Số lượng không hợp lệ")
        if row["code"] in codes:
            raise ValueError("Mã trùng")
        codes.add(row["code"])
    return books

with TemporaryDirectory() as folder:
    path = Path(folder) / "books.json"
    save(path, [{"code": "PY01", "total": 2}])
    assert load(path) == [{"code": "PY01", "total": 2}]
    assert not path.with_name("books.json.tmp").exists()
print("JSON round-trip: OK")
```

## Kết quả mong đợi và cách kiểm tra
In `JSON round-trip: OK`. File đích chứa tiếng Việt được giữ bằng ensure_ascii=False khi có tên sách; UTF-8 được chỉ rõ lúc đọc và ghi. Test này chứng minh round-trip cho schema đơn giản đang dùng, chưa bao phủ lỗi ghi đĩa hay hai tiến trình cạnh tranh. Thử JSON sai version trong thư mục tạm và xác nhận ValueError.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn: thêm title và available vào schema, kiểm tra 0 <= available <= total. Tự viết bốn file dữ liệu: đúng, sai cú pháp, trùng mã, số lượng âm; chạy load và ghi kết quả mong đợi. Chỉ tạo các file này trong thư mục học riêng hoặc thư mục tạm.

Nâng mức: thêm schema_version = 2 trong một bản sao dữ liệu và thiết kế thông báo từ chối rõ thay vì đoán cấu trúc. Viết kế hoạch chuyển đổi dữ liệu cũ thành mới trên bản sao, có bước xác nhận số bản ghi trước và sau.

## Hướng giải và tiêu chí hoàn thành
Với schema mở rộng, luôn dựng đối tượng bằng constructor đã xác thực và kiểm tra mã trùng ở Library.add. Đạt khi tải sai không ghi lại file nguồn, các giá trị biên được kiểm tra, và round-trip giữ nguyên cả tổng lẫn số có sẵn. Ghi rõ một tiến trình là giới hạn triển khai; atomic replace giúp một loại lỗi ghi, không thay khóa đồng thời hay backup. Bài nộp có ít nhất một test xác nhận bytes file hỏng không bị tự thay bằng dữ liệu rỗng.

## Sai sót thường gặp và cách phát hiện
Chỉ json.loads thành công rồi tin mọi trường là bỏ qua xác thực miền. Dùng int(True) làm total hợp lệ trái quy tắc bài. Luôn bắt OSError rồi trả [] có thể làm mất dữ liệu ở lần save kế tiếp. Tạm file khác ổ đĩa rồi coi replace luôn có cùng bảo đảm là suy luận vượt điều kiện bài.

## Câu hỏi tự kiểm tra và đáp án
1. JSON đúng cú pháp có bảo đảm số lượng hợp lệ không? Đáp án: Không, cần xác thực schema và miền giá trị.
2. File chưa có và file hỏng có nên cùng trả kho rỗng không? Đáp án: Không; file hỏng cần được báo rõ.
3. Ghi tạm rồi replace có giải quyết mọi xung đột nhiều tiến trình không? Đáp án: Không, bài giới hạn một tiến trình tại một thời điểm.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/library/json.html
- https://docs.python.org/3.12/library/pathlib.html#pathlib.Path.replace
- https://docs.python.org/3.12/library/tempfile.html

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
