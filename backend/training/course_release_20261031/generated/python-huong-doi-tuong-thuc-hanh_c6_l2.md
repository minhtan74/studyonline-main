## Mục tiêu bài học
- Kết nối miền nghiệp vụ, kho JSON và giao diện argparse.
- Chạy kiểm tra tự động và kịch bản người dùng qua CLI.
- Nộp bằng chứng theo rubric và mô tả giới hạn sử dụng.

Thời gian dự kiến: 120 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện học
- Kết nối miền nghiệp vụ, kho JSON và giao diện argparse.
- Chạy kiểm tra tự động và kịch bản người dùng qua CLI.
- Nộp bằng chứng theo rubric và mô tả giới hạn sử dụng.

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
Dự án cuối khóa là một thư viện nhỏ chạy dòng lệnh: thêm đầu sách, xem danh mục, mượn và trả theo mã. Dữ liệu chỉ có mã, tên, tổng và số có sẵn, không lưu thông tin người mượn. Mô hình cố ý hẹp để nghiệm thu được ràng buộc đã học. Không ghép thêm đăng nhập, thanh toán hay mạng khi các bất biến cơ bản chưa được kiểm tra.

Ranh giới thiết kế gồm Book bảo vệ dữ liệu, Library quản lý tập hợp, JsonRepository chuyển dữ liệu sang file và main đọc đối số. Chuỗi thực thi một lệnh ghi là: parse đối số, tải dữ liệu hợp lệ, thực hiện nghiệp vụ, lưu kết quả, báo thành công. Khi tải dữ liệu sai hoặc nghiệp vụ thất bại, không ghi file. Khi ghi lỗi, CLI phải báo thất bại; trạng thái trong bộ nhớ không phải bằng chứng đã lưu bền.

Bộ mã đi kèm giáo trình cung cấp library_cli.py, test_library_cli.py và README.md. Tạo một thư mục dự án riêng, chép đúng các file rồi chạy python -m unittest -v trước khi thao tác. Sau đó dùng python library_cli.py --data ./sandbox-library.json add PY01 "Học Python" 2, list, borrow PY01 và return PY01. Mỗi lần chạy là một tiến trình mới nên kết quả list sau borrow chứng minh dữ liệu đã được đọc lại từ file.

Nghiệm thu cần bằng chứng phù hợp từng yêu cầu: unit test cho bất biến, test JSON cho round-trip và file hỏng, test CLI cho mã thoát và không tạo dữ liệu khi lệnh sai. Không chấm chất lượng bằng số lớp hoặc số dòng mã. Một chương trình nhỏ rõ ràng với test tốt hơn nhiều tầng không có hợp đồng. Dự án giới hạn một người thao tác tại một thời điểm; muốn phục vụ đồng thời phải có thiết kế lưu trữ và quyền truy cập khác, nằm ngoài bản này.

## Ví dụ hoàn chỉnh để chạy
```python
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import argparse

class Counter:
    def __init__(self):
        self.value = 0

    def increment(self, amount):
        if type(amount) is not int or amount <= 0:
            raise ValueError("amount phải dương")
        self.value += amount

def main(argv=None):
    parser = argparse.ArgumentParser(description="Ví dụ ranh giới CLI")
    parser.add_argument("amount", type=int)
    args = parser.parse_args(argv)
    counter = Counter()
    try:
        counter.increment(args.amount)
    except ValueError:
        return 2
    return counter.value

assert main(["3"]) == 3
assert main(["-1"]) == 2
print("CLI boundary: OK")
```

## Kết quả mong đợi và cách kiểm tra
Ví dụ độc lập in `CLI boundary: OK`, minh họa parse và tách miền trước khi đọc mã dự án đầy đủ. Trong library_cli.py đi kèm, main trả 0 khi thành công, 2 khi lỗi đầu vào/nghiệp vụ; phần if __name__ == '__main__' gọi sys.exit. Không dùng số lượng kết quả làm mã thoát trong sản phẩm vì 0 có ý nghĩa thành công theo quy ước dòng lệnh.

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
Hướng dẫn nghiệm thu: dùng file tạm mới, thêm PY01 với 2 bản, mượn hai lần, mượn lần ba phải thất bại và file không thay đổi. Trả một lần rồi list phải có 1 bản sẵn. Thử mã trùng, mã không tồn tại, số âm và tên rỗng. Đối chiếu cả dòng báo, mã thoát và nội dung file sau thao tác.

Tự làm phần mở rộng: thêm lệnh search từ khóa tên sách, không phân biệt hoa thường, trả kết quả theo code. Viết ba test cho có kết quả, không có kết quả và từ khóa có khoảng trắng. Không thay tên mã đã lưu và không làm thay đổi dữ liệu khi chỉ tìm kiếm.

## Hướng giải và tiêu chí hoàn thành
Nộp mã nguồn, README hướng dẫn môi trường/lệnh, log unittest, bảng các kịch bản CLI và một đoạn giải thích quyết định composition. Rubric trong sổ tay chấm 100 điểm với điểm riêng cho đúng nghiệp vụ, thiết kế, dữ liệu, test, khả năng chạy và giải thích. Hoàn thành khi đạt ít nhất 70/100, các yêu cầu không âm/không vượt tổng/không ghi đè file hỏng đều đạt và người khác tái hiện được từ một thư mục mới.

Tự kiểm tra mở rộng search: áp dụng strip và casefold cho từ khóa theo hợp đồng, lọc trên title, sắp xếp theo code và chỉ trả kết quả đọc. Ghi giới hạn tìm kiếm chuỗi đơn giản, chưa hỗ trợ xếp hạng hay tiếng Việt không dấu. Không tuyên bố triển khai nhỏ đã sẵn sàng nhiều người dùng.

## Sai sót thường gặp và cách phát hiện
Chạy test trên file dữ liệu đang dùng làm thử nghiệm có thể làm thay đổi kết quả học; mọi test file dùng vùng tạm. Chỉ kiểm tra print “thành công” mà không list lại sau tiến trình mới bỏ sót lỗi lưu. Sao chép nguyên mã dự án rồi không giải thích được quyền sở hữu dữ liệu chưa đạt mục tiêu; phần bảo vệ yêu cầu thay đổi một quy tắc nhỏ và cập nhật test tương ứng.

## Câu hỏi tự kiểm tra và đáp án
1. Lệnh sai có được ghi lại dữ liệu không? Đáp án: Không; dự án chỉ save sau khi thao tác hợp lệ.
2. Vì sao list trong tiến trình mới hữu ích? Đáp án: Nó kiểm tra đường đọc dữ liệu đã lưu thay vì chỉ trạng thái bộ nhớ.
3. Điều kiện hoàn thành dự án là gì? Đáp án: Đạt rubric và các yêu cầu trọng yếu, kèm bằng chứng tái hiện được.

## Đọc thêm từ tài liệu chính thức
- https://docs.python.org/3.12/library/argparse.html
- https://docs.python.org/3.12/library/unittest.html

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
