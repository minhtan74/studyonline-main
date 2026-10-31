## Mục tiêu bài học
- Lập checklist review dựa trên yêu cầu.
- Chạy một test tự động đơn giản cho dự án.
- Ghi nhận giới hạn thay vì khẳng định quá mức.

Thời gian dự kiến: 100 phút, gồm đọc và thực hành.

## Mục tiêu và môi trường
Sử dụng repository Study Notes. Cần Python 3 hiện hành có thư viện chuẩn; bài không yêu cầu cài package mạng. Mục tiêu là kiểm tra một quy tắc nội dung cụ thể: ghi chú phải có tiêu đề Markdown. Sau bài, repo có một test chạy được trên clone sạch và một hồ sơ review ghi rõ test kiểm tra được gì. Tên file hoặc trạng thái sạch không đủ chứng minh mọi liên kết hay kiến thức đều đúng.

## Review bắt đầu bằng hợp đồng
Trước khi đọc diff, ghi yêu cầu: tất cả file Markdown trong notes phải bắt đầu bằng tiêu đề cấp 1 và không còn placeholder bắt buộc. Người review đối chiếu kết quả với hợp đồng này, kiểm tra đường dẫn, đầu vào rỗng và thông báo lỗi. Kiểm thử tự động giúp lặp một phép kiểm đã định nghĩa; nó không tự biết mọi yêu cầu chưa được mã hóa. Do đó cần cả bài tập thành công và tình huống bị từ chối, cùng lời giải thích giới hạn.

## Ví dụ thực thi độc lập
Lưu đoạn dưới thành `test_heading.py` trong repository bài tập rồi chạy `python test_heading.py`. Đây là ví dụ thuần Python, không truy cập mạng và chưa quét file trên máy.
```python
import unittest

def has_heading(text):
    return text.lstrip('\ufeff').startswith('# ')

class HeadingTests(unittest.TestCase):
    def test_valid_note(self):
        self.assertTrue(has_heading('# Tuan mot\nNoi dung'))

    def test_missing_heading(self):
        self.assertFalse(has_heading('Noi dung chua co tieu de'))

    def test_bom_from_editor(self):
        self.assertTrue(has_heading('\ufeff# Tuan mot'))

if __name__ == '__main__':
    unittest.main()
```
Đầu ra mong đợi là ba test đạt. Test BOM nhắc rằng editor có thể tạo ký tự đánh dấu mã hóa trước chữ đầu; hợp đồng đã chọn cho phép ký tự đó. Đây là một quyết định phải nói rõ, không phải mọi ứng dụng đều có cùng quy tắc xử lý khoảng trắng. Nếu dùng dự án mẫu kèm khóa, kiểm tra thực tế bằng `python -m unittest discover -s tests -v` từ thư mục gốc.

## Đưa kiểm tra vào quy trình nhánh
Tạo nhánh `feature/heading-check`, thêm test và hướng dẫn chạy vào README. Đọc diff cached trước commit, chạy test rồi ghi kết quả vào hồ sơ review. Thử thay dữ liệu test thành văn bản thiếu tiêu đề để kiểm chứng test có thể phát hiện lỗi; khôi phục nội dung mong muốn bằng editor sau khi đã ghi bằng chứng, rồi chạy lại. Không thêm test chỉ khẳng định `True` để có màu xanh; một test hữu ích cần phân biệt được ít nhất hai tình huống có ý nghĩa.

## Mẫu ghi bằng chứng
```text
Yeu cau: ghi chu can tieu de cap 1.
Lenh: python test_heading.py
Ket qua: 3 test dat.
Tinh huong am: doi du lieu thanh van ban thieu tieu de, test hop le that bai.
Gioi han: chua kiem tra tinh dung kien thuc trong ghi chu.
```
Thời điểm, phiên bản Python và commit được kiểm tra giúp tái hiện. Chỉ ghi dữ liệu cần thiết, không chụp toàn bộ terminal chứa thông tin khác của máy. Nếu test chạy trước lần sửa cuối, cần chạy lại hoặc ghi rõ kết quả chưa áp dụng cho trạng thái cuối.

## Bài tập độc lập và hướng giải
Thêm quy tắc không chứa `TODO_REQUIRED`. Viết một trường hợp có placeholder và một trường hợp bình thường. Giải thích vì sao không cấm toàn bộ chuỗi “TODO” nếu người học đang viết bài dạy về TODO như một khái niệm. Hướng giải nên nhận đầu vào rõ ràng, có kết quả mong đợi và mô tả phạm vi; đạt khi test phát hiện đúng vi phạm được thống nhất và README cho người khác chạy lại.

## Lỗi thường gặp
Chỉ chạy test trên file không được commit khiến clone sạch thiếu công cụ. Tạo test phụ thuộc đường dẫn cá nhân làm người khác không chạy được. Nhầm số test lớn với độ bao phủ đầy đủ; ba test có ý nghĩa vẫn chỉ kiểm tra ba góc nhìn. Review chỉ xem format mà bỏ yêu cầu có thể bỏ sót một công cụ luôn trả thành công.

## Tự kiểm tra và đáp án
1. Test tiêu đề đạt có chứng minh nội dung ghi chú đúng học thuật không? Không; chỉ quy tắc tiêu đề được kiểm.
2. Vì sao cần test tình huống sai? Để chứng minh phép kiểm có thể phân biệt một vi phạm đã định nghĩa.
3. Sửa code sau khi test đạt cần làm gì? Chạy lại kiểm tra liên quan cho trạng thái mới rồi cập nhật bằng chứng.

## Nguồn đọc tiếp
- https://docs.python.org/3/library/unittest.html
- https://docs.github.com/en/pull-requests/reference/pull-request-reviews
- https://git-scm.com/docs/git-diff