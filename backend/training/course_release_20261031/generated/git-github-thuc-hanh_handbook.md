## Giới thiệu và kết quả đầu ra
Đây là khóa nền tảng tự học có hướng dẫn, thời lượng dự kiến 30 giờ gồm khoảng 20 giờ đọc và thực hành từng bài, 6 giờ dự án, 4 giờ ôn tập và đánh giá. Thời lượng là ước lượng học tập, không phải số giờ video. Sau khóa, người học bàn giao một repository quản lý tài liệu và quy trình thay đổi; người chấm có thể clone vào thư mục mới và kiểm tra lại bằng lệnh được ghi trong README.

## Chuẩn bị môi trường
Cài Git từ https://git-scm.com/downloads hoặc trình quản lý phần mềm được máy cho phép. Mở PowerShell mới, chạy `git --version`. Các bài dùng PowerShell để tạo file; trên Linux/macOS có thể tạo cùng file bằng trình soạn thảo và chạy các lệnh Git tương ứng. Bài tập không cần dịch vụ mạng, token hoặc quyền quản trị hệ thống. Tài khoản GitHub chỉ dùng cho phần thực hành web tùy chọn.
Tạo thư mục mới `git-lab-2026`; trước mỗi bài đọc dòng “Điều kiện đầu” để biết dùng repository trước hay tạo repository độc lập. Luôn kiểm tra `git status` và `git rev-parse --show-toplevel` trước khi thao tác. Cấu hình tên/email trong repository thực hành; địa chỉ `learner@example.invalid` là địa chỉ minh họa, không dùng để nhận thư.

## Kế hoạch sáu tuần
- Tuần 1, khoảng 4 giờ: chương 1; tạo repository, commit đầu, nhật ký học tập và hình vẽ ba vùng dữ liệu.
- Tuần 2, khoảng 4 giờ: chương 2; phân tích diff, tra lịch sử và thiết lập quy tắc loại file sinh tự động.
- Tuần 3, khoảng 5 giờ: chương 3; hai nhánh tính năng, merge sạch và một xung đột được giải thích bằng hai yêu cầu.
- Tuần 4, khoảng 4 giờ: chương 4; remote bare local, hai bản clone mô phỏng hai người, nhật ký fetch/merge và kế hoạch xác thực GitHub.
- Tuần 5, khoảng 5 giờ: chương 5; phiếu đề xuất thay đổi, review, test, sửa lỗi bằng commit bổ sung và hoàn tác bằng revert.
- Tuần 6, khoảng 8 giờ: chương 6, hoàn thiện capstone, đóng gói bản phát hành, làm Quiz cuối khóa và tự đánh giá.
Có thể học nhanh hơn nhưng vẫn cần nộp đủ bằng chứng, không bỏ bài xung đột chỉ vì câu lệnh khó nhớ. Một buổi học nên gồm đọc khái niệm, dự đoán đầu ra, chạy lệnh rồi giải thích chênh lệch.

## Cấu trúc mỗi bài và cách luyện
Mỗi bài có mục tiêu, giải thích, lệnh chạy trong môi trường riêng, đầu ra mong đợi theo tính chất, bài tập có hướng dẫn, nhiệm vụ độc lập, lỗi thường gặp và câu tự kiểm tra có đáp án. Không học thuộc mã hash vì hash và thời gian commit thay đổi. Ghi tên file, trạng thái, số commit và nội dung diff làm bằng chứng ổn định. Quiz đo hiểu biết với ít nhất 5 câu mỗi bài; đọc đáp án xong cần tự dựng lại tình huống khác để tránh chỉ nhớ lựa chọn.

## Đánh giá
Gợi ý điều kiện hoàn thành khóa: Quiz tổng hợp đạt ít nhất 70% và dự án đạt ít nhất 70/100, đồng thời không phạm lỗi bắt buộc về bí mật hoặc khả năng tái tạo. Điểm dự án do người học/giảng viên đối chiếu rubric và bằng chứng; hệ thống Quiz không tự chấm chất lượng GitHub review hoặc dự án thực hành.
- Lịch sử có ý nghĩa: 15 điểm. Có ít nhất 8 commit nhỏ, thông điệp nêu hành vi, không gộp tất cả vào một commit cuối.
- Nhánh và hợp nhất: 20 điểm. Có hai nhánh tính năng, chứng minh merge và giải thích một xung đột; sản phẩm sau merge đáp ứng cả hai yêu cầu.
- Cộng tác và review: 15 điểm. Có remote local, hai bản clone, phiếu đề xuất thay đổi và một lượt review dựa trên diff.
- Kiểm tra và sửa lỗi: 20 điểm. Có test tự động, ghi kết quả mong đợi, một commit sửa lỗi cùng test và một revert được giải thích.
- Tài liệu bàn giao: 15 điểm. README ghi mục tiêu, yêu cầu, cách chạy, sơ đồ file và giới hạn; CHANGELOG nêu thay đổi bản phát hành.
- Phát hành tái tạo: 15 điểm. Tag chú thích, archive ZIP, clone sạch kiểm tra được đúng phiên bản, ghi kết quả hash hoặc nội dung.
Không đạt điều kiện bắt buộc nếu đưa token/mật khẩu thật vào lịch sử hoặc giao bản clone sạch không chạy theo README. Cần sửa tình huống và nộp lại bằng chứng; xóa dòng khỏi bản hiện tại không tự xóa bí mật khỏi lịch sử.

## Dự án xuyên khóa: Study Notes
Xây repository gồm `README.md`, `notes/week1.md`, `notes/week2.md`, `CHANGELOG.md`, `.gitignore`, `tools/check_notes.py` và `tests/test_notes.py`. Công cụ kiểm tra chỉ đọc thư mục notes, yêu cầu mỗi Markdown có tiêu đề và không chứa placeholder `TODO_REQUIRED`. Có thể viết bằng Python chuẩn để tránh phụ thuộc mạng. Tạo nhánh `feature/notes` và `feature/checker`; mô phỏng hai người bằng hai clone của một remote bare local. Thêm `reviews/change-01.md` mô tả yêu cầu, diff, test, nhận xét và quyết định.
Hồ sơ nộp gồm repository hoặc Git bundle, ZIP của tag `v1.0.0`, báo cáo `evidence.md` ghi lệnh cùng kết quả, phiếu review và bảng tự chấm. Tag chỉ đánh dấu phiên bản; không phải chứng nhận bảo mật. Lưu thư mục `.git` khi bàn giao repository, còn archive phát hành thường không chứa lịch sử. Dùng GitHub tùy chọn nếu cần trải nghiệm pull request thực; giữ cùng tiêu chí cho bản mô phỏng local.

## Tài liệu gốc và phạm vi
Nội dung diễn giải và bài tập do dự án biên soạn, đối chiếu tài liệu chính thức ngày 31/10/2026. GitHub có thể thay đổi vị trí nút và chính sách; dựa vào mục đích thao tác cùng tài liệu hiện hành thay vì một ảnh giao diện cố định.
- https://git-scm.com/docs/gittutorial
- https://git-scm.com/docs/git
- https://docs.github.com/en/pull-requests/reference/pull-requests
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github
Phạm vi là quy trình nền tảng cho một nhóm nhỏ. Quản trị GitHub tổ chức, chính sách doanh nghiệp, submodule phức tạp và ứng cứu rò rỉ bí mật trên hệ thống thực cần học phần chuyên biệt và người phụ trách tương ứng.

## Mã nguồn dự án tham khảo
Tự làm dự án theo đề bài trước khi đối chiếu mã tham khảo bên dưới.


### File: README.md
# Study Notes

Ghi chú học tập có kiểm tra tự động.

Chạy kiểm tra: python -m unittest discover -s tests -v


### File: notes/week1.md
# Tuần 1

Giải thích working tree, index và commit bằng ví dụ của bạn.


### File: tools/check_notes.py
```
from pathlib import Path

def check_notes(root):
    problems = []
    for path in sorted(Path(root).glob('*.md')):
        text = path.read_text(encoding='utf-8')
        if not text.startswith('# '):
            problems.append(path.name + ': missing heading')
        if 'TODO_REQUIRED' in text:
            problems.append(path.name + ': unfinished note')
    return problems

```


### File: tests/test_notes.py
```
import unittest
from pathlib import Path
from tools.check_notes import check_notes

class NotesTest(unittest.TestCase):
    def test_notes_have_required_content(self):
        self.assertTrue(list(Path('notes').glob('*.md')), 'Need at least one note')
        self.assertEqual(check_notes('notes'), [])

if __name__ == '__main__':
    unittest.main()

```


### File: .gitignore
```
__pycache__/
*.pyc
.env
.local/
artifacts/

```


### File: CHANGELOG.md
# Lịch sử thay đổi

## Chưa phát hành

- Kho ghi chú và bộ kiểm tra nền tảng.


### File: reviews/change-01.md
# Đề xuất thay đổi

## Yêu cầu
Mô tả hành vi cần thay đổi.

## Bằng chứng
Ghi diff, lệnh test và đầu ra.

## Review
Ghi nhận xét và cách xử lý.
