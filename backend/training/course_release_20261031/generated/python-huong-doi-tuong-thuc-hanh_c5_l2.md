## Mục tiêu bài học
- Viết unittest cho hành vi thành công và từ chối.
- Tạo dữ liệu độc lập cho từng test bằng setUp.
- Chứng minh test phát hiện một lỗi chuyển trạng thái.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Viết unittest cho hành vi thành công và từ chối.
- Tạo dữ liệu độc lập cho từng test bằng setUp.
- Chứng minh test phát hiện một lỗi chuyển trạng thái.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Test là một ví dụ có kết quả mong đợi được máy kiểm tra, không chỉ một lần chạy bằng tay rồi nhìn màn hình. Với Book, ta kiểm tra số bản khi tạo, sau mượn, sau trả và khi từ chối. Tên test nên nói hành vi: test_borrow_empty_keeps_zero rõ hơn test_3. Kết quả cần quan sát trực tiếp từ hợp đồng, tránh sao chép nguyên cách triển khai vào test vì cả hai có thể cùng sai.

Mỗi test cần dữ liệu độc lập. setUp tạo một Book mới cho từng method của unittest.TestCase, nên kết quả không phụ thuộc thứ tự chạy. Test đầu mượn sách không được làm test sau “tự nhiên hết sách”. Nếu cần một chuỗi nghiệp vụ, viết các bước trong cùng một test kịch bản và nêu lý do liên quan. Test nhỏ giúp khoanh vùng nguyên nhân, còn một số kịch bản tổng hợp giúp phát hiện tương tác.

Thiết kế đầu vào theo biên: tổng bằng 0 và 1, mượn lần cuối, mượn thêm sau hết, trả tới tổng, trả dư. Với constructor nhận số nguyên không âm, thêm -1, bool và chuỗi vào nhóm không hợp lệ. Kiểm tra ngoại lệ bằng assertRaises và kiểm tra trạng thái ngay sau khối đó. Một test chỉ đếm có lỗi hay không chưa chứng minh bất biến còn nguyên.

Để đánh giá sức mạnh test, cố tình đưa một lỗi nhỏ vào bản sao bài tập, ví dụ xóa kiểm tra available == 0 hoặc đặt >= thành > ở điều kiện trả. Chạy test và xác nhận ít nhất một test thất bại, rồi khôi phục mã đúng. Không chỉnh dữ liệu đang dùng của lớp học để làm thử nghiệm này. “Tất cả test xanh” chỉ có nghĩa các tình huống đã mã hóa đi qua, không bảo đảm không còn lỗi ở yêu cầu khác.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import unittest

class Book:
    def __init__(self, total):
        if type(total) is not int or total < 0:
            raise ValueError("Tổng không hợp lệ")
        self.total = total
        self.available = total

    def borrow(self):
        if self.available == 0:
            raise ValueError("Hết sách")
        self.available -= 1

class BookTests(unittest.TestCase):
    def setUp(self):
        self.book = Book(1)

    def test_borrow_last_copy(self):
        self.book.borrow()
        self.assertEqual(self.book.available, 0)

    def test_borrow_empty_keeps_zero(self):
        self.book.borrow()
        with self.assertRaises(ValueError):
            self.book.borrow()
        self.assertEqual(self.book.available, 0)

    def test_constructor_rejects_bad_counts(self):
        for value in (-1, True, "2"):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    Book(value)

suite = unittest.defaultTestLoader.loadTestsFromTestCase(BookTests)
result = unittest.TextTestRunner(verbosity=1).run(suite)
assert result.wasSuccessful() and result.testsRun == 3
print("3 tests passed")
```

## Kết quả mong đợi và cách kiểm tra
Runner báo chạy 3 test và `OK`, sau đó in `3 tests passed`. Output tiến độ của unittest có thể đi qua stderr nên thứ tự hiển thị với print phụ thuộc môi trường; kết luận dựa trên mã thoát và wasSuccessful, không so nguyên chuỗi thời gian chạy. Ví dụ không cần cài pytest.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn: bổ sung return_copy cho Book và hai test trả hợp lệ/trả dư. Tự tạo bảng ca kiểm thử có ít nhất tám dòng, mỗi dòng gắn với một yêu cầu cụ thể. Chuyển năm dòng quan trọng nhất thành test có tên rõ, bao gồm ít nhất một test giữ trạng thái sau lỗi.

Nâng mức: trên một bản sao file, làm borrow giảm 2 thay vì 1 và chạy lại. Ghi test nào bắt được lỗi, giá trị mong đợi và giá trị thực tế; phục hồi code đúng trước khi nộp. Không sửa assert thành giá trị sai chỉ để runner xanh.

## Hướng giải và tiêu chí hoàn thành
Test trả dư có thể tạo Book(1), gọi return_copy rồi mong ValueError và available vẫn 1. Test dữ liệu sai nên tách trường hợp để lỗi báo đủ ngữ cảnh; subTest giúp nhiều giá trị chạy tiếp thay vì dừng ở lỗi đầu. Đạt khi chạy lặp lại cho cùng kết quả, test độc lập với thứ tự và có bằng chứng test bắt được lỗi đã cài có chủ ý. Bài nộp kèm lệnh python -m unittest khi tách test sang file test_book.py.

## Sai sót thường gặp và cách phát hiện
Dùng một Book chung ở cấp module làm các test ảnh hưởng nhau. Test chỉ assertTrue(True) không kiểm tra hợp đồng. Bắt lỗi rồi không assert gì sẽ cho test xanh cả khi không có lỗi. So kết quả in chứa thời gian cụ thể khiến test thất bại vì môi trường thay vì vì hành vi nghiệp vụ.

## Câu hỏi tự kiểm tra và đáp án
1. setUp chạy một lần cho cả lớp test không? Đáp án: Không; unittest gọi trước từng test method.
2. Vì sao kiểm tra sau assertRaises? Đáp án: Để xác nhận trạng thái không bị đổi sai trong thao tác thất bại.
3. Test xanh chứng minh hết mọi lỗi không? Đáp án: Không, nó chỉ xác nhận các tình huống được kiểm tra.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/library/unittest.html#organizing-test-code
- https://docs.python.org/3.12/library/unittest.html#unittest.TestCase.assertRaises

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
