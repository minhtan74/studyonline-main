"""Original Vietnamese OOP curriculum, runnable examples and a library CLI project.

Authoring target: Python 3.12 or later, standard library only. Course material is
deliberately independent of this LMS's private database and user information.
"""
from textwrap import dedent


PY = "https://docs.python.org/3.12/"


def q(prompt, correct, a, b, c, explanation, difficulty="medium"):
    return dict(prompt=prompt, options=[correct, a, b, c], correct=0,
                explanation=explanation, difficulty=difficulty)


def lesson(title, objectives, theory, code, expected, exercise, solution, pitfalls,
           checks, questions, references):
    code = ("import sys\n"
            "if hasattr(sys.stdout, 'reconfigure'):\n"
            "    sys.stdout.reconfigure(encoding='utf-8')\n\n"
            + dedent(code).strip())
    body = f"""## Mục tiêu và điều kiện học
{chr(10).join('- ' + item for item in objectives)}

Mỗi bài dành khoảng 100–150 phút gồm đọc, chạy mã, sửa ví dụ và tự luyện. Dùng Python 3.12 trở lên trong một thư mục học riêng; các ví dụ chỉ dùng thư viện chuẩn. Tạo file `example.py`, chép nguyên khối mã rồi chạy `python example.py`. Trên Windows có thể dùng `py -3.12 example.py` khi lệnh `python` trỏ tới bản khác. Không ghép các lớp cùng tên của nhiều bài vào một file: mỗi ví dụ là một chương trình độc lập.

## Giải thích và lập luận thiết kế
{dedent(theory).strip()}

## Ví dụ hoàn chỉnh để chạy
```python
{dedent(code).strip()}
```

## Kết quả mong đợi và cách kiểm tra
{dedent(expected).strip()}

Đọc từng dòng thực thi và dự đoán trạng thái trước khi chạy. Sau lần chạy đầu, đổi dữ liệu theo bài tập rồi đối chiếu cả kết quả lẫn trạng thái đối tượng; một dòng in đúng chưa chứng minh các trường hợp lỗi đã đúng. Các lệnh `assert` trong ví dụ dùng kiểm tra khi học, không thay thế việc kiểm tra đầu vào của ứng dụng vì Python có thể bỏ assert khi chạy chế độ tối ưu.

## Bài tập có hướng dẫn và bài tự làm
{dedent(exercise).strip()}

## Hướng giải và tiêu chí hoàn thành
{dedent(solution).strip()}

## Sai sót thường gặp và cách phát hiện
{dedent(pitfalls).strip()}

## Câu hỏi tự kiểm tra và đáp án
{chr(10).join(f'{i}. {item[0]} Đáp án: {item[1]}' for i, item in enumerate(checks, 1))}

## Đọc thêm từ tài liệu chính thức
{chr(10).join('- ' + url for url in references)}

Ghi lại phiên bản Python, lệnh đã chạy, dữ liệu thử và một quyết định thiết kế vào nhật ký học tập. Khi nhờ hỗ trợ, gửi ví dụ nhỏ tái hiện được cùng thông báo lỗi đầy đủ; không gửi dữ liệu cá nhân hoặc đường dẫn chứa thông tin bí mật.
"""
    return dict(title=title, objectives=objectives, duration_minutes=120, body=body,
                questions=questions,
                checks=[dict(name=title, code=dedent(code).strip())])


L1 = lesson(
    "Từ yêu cầu nghiệp vụ đến lớp và đối tượng",
    ["Tách dữ liệu và hành vi từ một tình huống quản lý sách.",
     "Phân biệt lớp, đối tượng và biến tham chiếu đối tượng.",
     "Viết một phương thức làm thay đổi trạng thái có thể kiểm tra."],
    """
    Một thư viện có nhiều đầu sách, mỗi đầu sách có mã, tên và số bản còn sẵn. Yêu cầu “mượn một bản” chứa cả dữ liệu phải đọc lẫn quy tắc chuyển trạng thái. Nếu chỉ lưu số lượng trong nhiều danh sách rời, lập trình viên dễ cập nhật nhầm vị trí. Ta bắt đầu bằng một lớp Book gom trạng thái một đầu sách với thao tác mượn; không biến mọi danh từ của đề thành một lớp ngay lập tức.

    Lớp là mô tả cách tạo và sử dụng một kiểu đối tượng. Gọi Book(...) tạo một thực thể có dữ liệu riêng. Hai sách có thể cùng tên nhưng vẫn là hai thực thể nếu nghiệp vụ gán mã khác. Trong bài này đối tượng có định danh thông qua code; tên hiển thị không đủ làm khóa vì người dùng có thể sửa tên. Chọn định danh là quyết định nghiệp vụ trước khi chọn cú pháp Python.

    Khi gọi book.borrow(), Python truyền đối tượng qua tham số đầu tiên của phương thức; tên self là quy ước thông dụng để chỉ thực thể đó. Một phương thức nên diễn tả hành động có nghĩa: borrow rõ hơn change(-1) vì có thể bổ sung kiểm tra hết sách. Trả về số còn lại giúp ví dụ dễ quan sát, nhưng ứng dụng lớn có thể chọn trả kết quả riêng nếu hợp đồng cần thông tin khác.

    Biến không chứa một bản sao tự động của toàn bộ đối tượng. Gán alias = book làm hai tên cùng chỉ tới một đối tượng; gọi borrow qua alias sẽ ảnh hưởng book. Đây là điều cần hiểu khi truyền đối tượng qua hàm. Hãy vẽ ô Book và hai mũi tên biến trước khi dùng công cụ sao chép. Đối tượng hỗ trợ tổ chức mã, còn chất lượng thiết kế phụ thuộc ranh giới trách nhiệm và phép kiểm tra cụ thể.
    """,
    """
    class Book:
        def __init__(self, code, title, available):
            self.code = code
            self.title = title
            self.available = available

        def borrow(self):
            if self.available <= 0:
                raise ValueError("Hết sách")
            self.available -= 1
            return self.available

    book = Book("PY01", "Học Python", 2)
    other = Book("PY02", "Học Python", 5)
    alias = book
    assert alias is book and other is not book
    assert alias.borrow() == 1
    assert book.available == 1 and other.available == 5
    print(book.code, book.available, other.available)
    """,
    """Chương trình in `PY01 1 5`. Lời gọi qua alias đã thay đổi book nhưng không thay đổi other. Đặt breakpoint tại borrow và xem giá trị self.code để xác định đúng đối tượng đang được xử lý. Nếu nhìn thấy số lượng của cả hai sách giảm, hãy tìm một thuộc tính dùng chung không chủ ý.""",
    """
    Hướng dẫn: thêm phương thức return_copy() tăng available một đơn vị; tạo hai sách và chứng minh trả một sách không ảnh hưởng sách còn lại. Sau đó tự viết lớp Counter có name, value, phương thức increment() và reset(). Tạo hai bộ đếm cho số lượt tìm sách và số lượt mượn; gán một bí danh cho bộ đếm tìm kiếm rồi thay đổi qua bí danh.

    Nộp sơ đồ nhỏ thể hiện biến và đối tượng, mã chạy được, cùng ba assert cho đối tượng đầu, đối tượng thứ hai và bí danh. Đặt câu hỏi nghiệp vụ cho trường hợp trả nhiều sách hơn số đã mượn; chưa cần tự quyết định quy tắc ngoài đề.
    """,
    """
    return_copy có thể dùng self.available += 1 trong phạm vi bài này. Counter.increment tăng self.value, còn reset gán self.value = 0. Tiêu chí đạt là bộ đếm độc lập khi tạo hai thực thể, và hai tên alias cùng thấy thay đổi khi chỉ tạo một thực thể. Giải thích được vì sao chỉ thêm từ khóa class mà vẫn dùng một biến toàn cục cho mọi sách không giải quyết vấn đề quản lý trạng thái.

    Kết thúc bài, viết một câu mô tả trách nhiệm của Book và một câu mô tả điều Book chưa quản lý, như tài khoản độc giả. Ranh giới này sẽ được điều chỉnh khi học composition thay vì thêm mọi chức năng vào Book.
    """,
    """Quên self ở phần khai báo gây sai số lượng đối số khi gọi qua thực thể. Tạo Book mà không gán vào biến rồi tìm lại một đối tượng khác có thể khiến học viên tưởng dữ liệu bị mất. So sánh tên sách để kết luận cùng đối tượng cũng sai: dùng is để minh họa đồng nhất đối tượng, dùng code để so định danh nghiệp vụ theo quy tắc đã nêu.""",
    [("Lớp Book có phải một quyển sách cụ thể không?", "Không; book = Book(...) mới tạo thực thể cụ thể."),
     ("alias = book có tạo sách mới không?", "Không, hai tên cùng tham chiếu một đối tượng."),
     ("Vì sao dùng phương thức borrow?", "Để gom việc chuyển trạng thái và quy tắc mượn tại một nơi rõ nghĩa.")],
    [q("Khi x = book, điều gì xảy ra với đối tượng book?", "x cùng tham chiếu đối tượng đó", "Tự tạo một bản sao sâu", "Xóa book khỏi bộ nhớ ngay", "Chuyển Book thành chuỗi", "Phép gán liên kết tên với đối tượng, không tự sao chép.", "easy"),
     q("self trong phương thức thực thể thường biểu thị gì?", "Đối tượng nhận lời gọi phương thức", "Tên bắt buộc của lớp cha", "Một biến toàn cục", "Một bản sao tự động", "self là tên quy ước cho đối số thực thể.", "easy"),
     q("Hai sách cùng tên nhưng có mã khác nhau nên được xử lý thế nào trong mô hình bài?", "Là hai đầu sách có định danh khác", "Luôn gộp thành một", "Cấm tạo đối tượng thứ hai", "Dùng tên làm khóa duy nhất", "Quy tắc bài dùng mã làm định danh, không dùng tên."),
     q("Thao tác nào phù hợp với trách nhiệm Book ở ví dụ?", "Giảm số bản khi mượn hợp lệ", "Gửi email toàn bộ người dùng", "Cấu hình mạng máy chủ", "Lưu mật khẩu độc giả", "Book chỉ quản lý dữ liệu và hành vi của đầu sách."),
     q("Sau khi alias.borrow(), book.available thay đổi vì sao?", "alias và book chỉ tới cùng thực thể", "Mọi Book luôn dùng chung available", "Python sao chép khi gọi", "Tên lớp bị đổi", "Thay đổi qua một tham chiếu thấy được qua tham chiếu còn lại.")],
    [PY + "tutorial/classes.html#class-and-instance-objects"])


L2 = lesson(
    "Khởi tạo đối tượng hợp lệ và bảo vệ bất biến",
    ["Mô tả bất biến số lượng sách bằng điều kiện rõ ràng.",
     "Kiểm tra đầu vào trước khi gán trạng thái trong __init__.",
     "Phân biệt kiểm tra hợp lệ với ép kiểu tùy tiện."],
    """
    Ở bài trước ta có thể tạo Book với available = -3. Đối tượng đã tồn tại nhưng mang trạng thái không có ý nghĩa trong mô hình. Bất biến là điều kiện mà các thao tác công khai phải duy trì: mã không rỗng, tổng số bản là số nguyên không âm, số có sẵn nằm từ 0 đến tổng. Viết các điều kiện này trước khi viết constructor giúp nhận ra lỗi thiết kế và thống nhất kết quả mong đợi.

    __init__ thực hiện khởi tạo sau khi thực thể đã được tạo. Trong khóa này constructor hợp lệ sẽ đưa thực thể vào trạng thái sử dụng được, hoặc ném một ngoại lệ có ý nghĩa. Ta kiểm tra tất cả dữ liệu trước các phép gán quan trọng. Một hàm chuyển dữ liệu chuỗi đầu vào CLI thành số là bước khác; tự int("2.9") hoặc ép int(True) có thể làm ứng dụng nhận dữ liệu ngoài ý định.

    Python xem bool là một kiểu con của int. Vì nghiệp vụ đếm bản sách không nhận True/False, ví dụ dùng type(total) is int. Đây là lựa chọn có chủ ý cho bài toán nhỏ; một thư viện số học tổng quát có thể cho phép các kiểu nguyên khác. Type hint chỉ giúp người đọc và công cụ kiểm tra, không tự xác thực giá trị khi chương trình chạy.

    Ta còn phải giữ bất biến sau khởi tạo. borrow giảm available chỉ khi còn sách; return_copy chỉ tăng khi available nhỏ hơn total. Kiểm tra lỗi phải xảy ra trước thay đổi trạng thái. Ví dụ lỗi trả dư phải giữ nguyên số lượng ban đầu, chứ không tăng rồi mới phát hiện vượt giới hạn. Đây là cách suy nghĩ “trước điều kiện, sau điều kiện” mà các bài kiểm thử sau sẽ diễn đạt thành bằng chứng.
    """,
    """
    class Book:
        def __init__(self, code, total):
            if not isinstance(code, str) or not code.strip():
                raise ValueError("Mã sách không được rỗng")
            if type(total) is not int or total < 0:
                raise ValueError("Tổng số bản phải là số nguyên không âm")
            self.code = code.strip()
            self.total = total
            self.available = total

        def borrow(self):
            if self.available == 0:
                raise ValueError("Hết sách")
            self.available -= 1

        def return_copy(self):
            if self.available == self.total:
                raise ValueError("Không có bản đang được mượn")
            self.available += 1

    book = Book(" PY01 ", 1)
    book.borrow()
    assert book.available == 0
    book.return_copy()
    assert book.available == book.total == 1
    for bad in (-1, True, "2"):
        try:
            Book("X", bad)
        except ValueError:
            pass
        else:
            raise AssertionError("Đã nhận dữ liệu không hợp lệ")
    print(book.code, book.available)
    """,
    """In `PY01 1`; ba dữ liệu sai đều bị từ chối. Thêm một lần return_copy nữa phải nhận ValueError và available vẫn là 1. Không đánh dấu bài hoàn tất chỉ vì dữ liệu 1 chạy được: giá trị 0 và dữ liệu sai là phần bắt buộc của hợp đồng.""",
    """
    Hướng dẫn: viết hàm validate_count(value) trả lại value khi hợp lệ và ném ValueError khi sai; dùng cho constructor của một lớp Shelf. Tự làm lớp SeatPool(total) với reserve và release, áp dụng cùng bất biến 0 <= available <= total. Chuẩn bị bảng đầu vào gồm -1, 0, 1, True, 1.5 và "1"; ghi rõ kết quả mong đợi trước khi chạy.

    Nâng mức: thêm amount cho reserve. Mỗi lời gọi phải hoặc thực hiện toàn bộ số lượng yêu cầu hoặc giữ nguyên trạng thái nếu không đủ; không cho phép thực hiện một phần âm thầm. Giới hạn amount là số nguyên dương.
    """,
    """
    Kiểm tra type, miền giá trị và nguồn dữ liệu là ba câu hỏi khác nhau. Trong SeatPool, reserve(amount) kiểm tra amount rồi so với available, chỉ sau đó mới trừ. Đạt yêu cầu khi reserve(2) trên pool còn 1 bị từ chối và available vẫn bằng 1. release(amount) cũng so với số đã giữ chỗ. Lời giải cần chỉ ra các phép kiểm tra bảo vệ bất biến chứ không chỉ sao chép mã Book đổi tên.
    """,
    """Dùng assert cho dữ liệu người dùng khiến điều kiện có thể biến mất ở chế độ tối ưu. Bắt mọi ngoại lệ rồi đặt số lượng về 0 che giấu lỗi đầu vào. Gán self.available trước khi xác nhận total làm khó suy luận trạng thái. Chưa cần thêm destructor để “hủy đối tượng lỗi”; hãy để ngoại lệ constructor thông báo việc tạo đối tượng không thành công.""",
    [("Bất biến của available là gì?", "Luôn nằm từ 0 đến total trong mô hình này."),
     ("True có được coi là số bản hợp lệ trong bài không?", "Không; bài loại bool dù bool là kiểu con của int."),
     ("Thao tác thất bại có được để trạng thái thay đổi một nửa không?", "Không; kiểm tra trước rồi mới cập nhật.")],
    [q("Mục đích chính của constructor trong bài là gì?", "Thiết lập trạng thái hợp lệ hoặc báo lỗi", "Chỉ in tên lớp", "Tự lưu vào mọi cơ sở dữ liệu", "Bỏ qua dữ liệu không hợp lệ", "Đối tượng phải sử dụng được sau khởi tạo.", "easy"),
     q("Bất biến hợp lệ của đầu sách là gì?", "0 <= available <= total", "available luôn lớn hơn total", "total luôn âm", "available phải bằng 1", "Số có sẵn không âm và không vượt tổng."),
     q("Vì sao ví dụ dùng type(total) is int?", "Để loại cả bool theo quy tắc đếm của bài", "Vì isinstance không tồn tại", "Vì int không nhận 0", "Để tự biến chuỗi thành số", "bool là kiểu con của int nhưng không được nhận trong nghiệp vụ này."),
     q("Nếu mượn vượt số có sẵn thì trạng thái nên thế nào?", "Giữ nguyên và báo lỗi", "Giảm tới số âm", "Tự tăng total", "Coi là đã mượn thành công", "Thao tác bị từ chối không thực hiện cập nhật một phần."),
     q("Type hint total: int có tự chặn chuỗi lúc chạy không?", "Không, cần kiểm tra khi cần bảo vệ đầu vào", "Có trong mọi chương trình", "Chỉ chặn khi là chuỗi rỗng", "Tự chuyển mọi chuỗi sang int", "Chú thích kiểu không phải cơ chế xác thực runtime.")],
    [PY + "reference/datamodel.html#object.__init__", PY + "library/functions.html#isinstance"])


L3 = lesson(
    "Thuộc tính thực thể, thuộc tính lớp và dữ liệu dùng chung",
    ["Dự đoán phạm vi dữ liệu khi tạo nhiều thực thể.",
     "Loại bỏ lỗi danh sách mutable bị dùng chung ngoài ý muốn.",
     "Chọn biến lớp cho cấu hình chung phù hợp."],
    """
    Một lớp ReadingList quản lý danh sách sách muốn đọc cho từng học viên. Nếu khai báo items = [] ngay trong thân lớp và chỉ gọi self.items.append, mọi thực thể có thể truy cập cùng danh sách đó qua lớp. Lỗi thường bị bỏ sót khi chỉ kiểm tra một học viên. Dữ liệu riêng như items phải được tạo trong __init__ để mỗi thực thể nhận một danh sách mới.

    Thuộc tính lớp thích hợp cho một giá trị cấu hình hoặc tên loại chung được chủ ý chia sẻ, ví dụ category = "reading-list". Thao tác đọc qua thực thể tìm thuộc tính của nó rồi mới tìm trên lớp theo cơ chế tra cứu thuộc tính. Gán list_a.category = "private" tạo hoặc thay thuộc tính trên list_a, không tự sửa giá trị của ReadingList.category và các thực thể còn lại.

    Phân biệt gán và thay đổi đối tượng mutable là chìa khóa. self.items = [] gán một danh sách mới cho thực thể. self.items.append(...) sửa danh sách đang được tham chiếu. Nếu danh sách đó nằm trên lớp hoặc được truyền dùng chung từ ngoài, nhiều đối tượng sẽ quan sát thay đổi. Hỏi “ai sở hữu đối tượng mutable này?” hữu ích hơn ghi nhớ rằng mọi biến trong class đều riêng hay đều chung.

    Một quy tắc nhỏ giúp code dễ kiểm tra: dữ liệu mô tả một thực thể được khởi tạo trên self; dữ liệu chung phải được ghi rõ mục đích và hạn chế thay đổi tùy tiện. Khi nhận một list từ ngoài, quyết định có giữ tham chiếu hay sao chép nông. list(values) tách danh sách ngoài nhưng các phần tử bên trong vẫn có thể chung. Bài sau sẽ dùng composition để định nghĩa rõ quan hệ giữa các đối tượng thay vì dựa vào vô tình chia sẻ dữ liệu.
    """,
    """
    class ReadingList:
        category = "reading-list"

        def __init__(self, owner, items=None):
            self.owner = owner
            self.items = list(items) if items is not None else []

        def add(self, title):
            self.items.append(title)

    original = ["Python"]
    lan = ReadingList("Lan", original)
    minh = ReadingList("Minh")
    lan.add("OOP")
    assert original == ["Python"]
    assert minh.items == []
    assert lan.items == ["Python", "OOP"]
    lan.category = "personal"
    assert minh.category == ReadingList.category == "reading-list"
    print(lan.owner, len(lan.items), len(minh.items))
    """,
    """In `Lan 2 0`. original chỉ có Python, chứng minh constructor đã tách danh sách bên ngoài ở mức nông. Gán category cho lan không làm minh đổi loại. Dùng thêm assert lan.items is not minh.items để xác nhận hai danh sách có định danh khác nhau.""",
    """
    Hướng dẫn: tạo phiên bản sai có items = [] trong lớp, khởi tạo hai người rồi thêm sách qua người thứ nhất. Ghi kết quả thực tế khác mong đợi trước khi sửa. Không dùng phiên bản sai trong sản phẩm học viên khác. Tự làm lớp ShoppingCart với items riêng và currency chung; thêm hàng ở hai giỏ và kiểm tra độc lập.

    Thử thêm một danh sách lồng nhau vào constructor rồi sửa phần tử bên trong. Viết nhận xét về giới hạn sao chép nông; chỉ dùng dữ liệu đơn giản trong API giỏ hàng nếu chưa thiết kế quyền sở hữu đối tượng lồng nhau.
    """,
    """
    Giỏ hàng đạt khi mỗi lần tạo đều có danh sách riêng, không dùng đối số mặc định items=[] và không sửa danh sách đầu vào sau khi đã lựa chọn sao chép. Bài nộp phải có ít nhất hai thực thể; kiểm tra một giỏ duy nhất không tái hiện được lỗi dùng chung. Với dữ liệu lồng nhau, bản sao nông vẫn tham chiếu phần tử con; ghi rõ đây là hành vi theo hợp đồng hoặc thay cấu trúc đầu vào để tránh nhầm lẫn.
    """,
    """Đổi items ở một chỗ nhưng vẫn để lịch sử mutable trong biến lớp chỉ chuyển lỗi sang trường khác. Dùng copy.deepcopy cho mọi thứ có thể sao chép cả dữ liệu không nên nhân bản; hãy hiểu cấu trúc trước. Khi debug, in id của danh sách cần kiểm tra cùng dữ liệu, không suy luận từ việc hai danh sách tình cờ có cùng nội dung.""",
    [("Danh sách items riêng nên tạo ở đâu?", "Trong __init__ cho từng thực thể."),
     ("list(values) có sao chép sâu phần tử lồng nhau không?", "Không, đây là bản sao nông."),
     ("Gán lan.category có luôn đổi ReadingList.category không?", "Không; phép gán đó tạo hoặc thay thuộc tính của lan.")],
    [q("Lỗi chính khi đặt items=[] trên lớp giỏ hàng rồi append qua thực thể là gì?", "Các giỏ có thể dùng chung danh sách", "Python cấm list trong class", "Mỗi append luôn sao chép sâu", "Mỗi giỏ tự có danh sách mới", "Danh sách trên lớp được chia sẻ khi không có thuộc tính thực thể thay thế."),
     q("Cách tạo danh sách riêng phù hợp trong bài?", "self.items = [] trong __init__", "items = [] trên lớp duy nhất", "Dùng một list toàn cục", "Chỉ tạo list trong print", "Constructor tạo một list mới cho mỗi lần khởi tạo.", "easy"),
     q("Sau self.items = list(values), các đối tượng phần tử mutable có thể còn chung không?", "Có vì đây là sao chép nông", "Không vì luôn sao chép sâu", "Không vì mutable bị cấm", "Chỉ chung số nguyên", "Danh sách mới vẫn giữ tham chiếu tới các phần tử."),
     q("Thuộc tính lớp phù hợp nhất cho dữ liệu nào trong ví dụ?", "Nhãn loại chung có chủ ý", "Danh sách sách riêng của từng người", "Mật khẩu từng người", "Trạng thái mượn của từng sách", "Dữ liệu chung cần được chọn có chủ ý."),
     q("Muốn tái hiện lỗi chia sẻ dữ liệu giữa giỏ hàng cần tối thiểu điều gì?", "Tạo hai giỏ và sửa một giỏ", "Chỉ in tên lớp", "Chỉ thử một giỏ rỗng", "Xóa toàn bộ assert", "Hai thực thể giúp phát hiện ảnh hưởng ngoài mong đợi.")],
    [PY + "tutorial/classes.html#class-and-instance-variables", PY + "library/copy.html"])


L4 = lesson(
    "Đóng gói bằng thuộc tính và property",
    ["Thiết kế điểm cập nhật để bảo vệ bất biến.",
     "Dùng property cho dữ liệu đọc có phép tính hoặc xác thực.",
     "Giải thích giới hạn của quy ước dấu gạch dưới trong Python."],
    """
    Đóng gói giúp người sử dụng đối tượng biết những thao tác được hỗ trợ và những chi tiết không nên dựa vào. Với tài khoản điểm học tập, ta muốn cộng số điểm hợp lệ nhưng không cho người gọi tùy ý gán tổng âm. Ta giữ _points và cung cấp add_points cùng một property points chỉ đọc. Quy tắc _name biểu thị chi tiết nội bộ theo quy ước, không tạo vùng bảo mật chống truy cập.

    Property cho phép truy cập theo cú pháp thuộc tính nhưng thực hiện hàm getter hoặc setter. Chọn property khi thao tác giống đọc một giá trị, ví dụ borrowed = total - available. Không giấu một lời gọi mạng chậm hoặc hành động gửi email trong property mà người dùng tưởng là đọc dữ liệu. Phương thức có tên động từ phù hợp hơn khi hành động có hiệu ứng đáng kể.

    Không có setter cho points khiến phép gán thông thường wallet.points = -1 nhận AttributeError. Điều đó giúp bắt lỗi sử dụng API, còn người gọi có chủ ý vẫn có thể truy cập _points. Vì vậy dữ liệu đầu vào từ CLI hoặc file phải được kiểm tra và ứng dụng không được coi dấu gạch dưới là cơ chế phân quyền. Double underscore có name mangling nhằm tránh một số xung đột tên, không biến giá trị thành bí mật.

    Trong ví dụ, add_points kiểm tra trước khi cộng và không làm tròn số thập phân sang số nguyên. Getter trả số nguyên bất biến, tránh lộ một list mutable mà người gọi có thể sửa bỏ qua phương thức. Nếu cần công khai danh sách, có thể trả tuple hoặc bản sao theo hợp đồng rõ. Mục tiêu là giảm số nơi có quyền phá bất biến, nhờ đó các test tập trung vào một API nhỏ và ổn định.
    """,
    """
    class StudyPoints:
        def __init__(self):
            self._points = 0

        @property
        def points(self):
            return self._points

        def add_points(self, amount):
            if type(amount) is not int or amount <= 0:
                raise ValueError("Điểm thêm phải là số nguyên dương")
            self._points += amount

    account = StudyPoints()
    account.add_points(10)
    assert account.points == 10
    try:
        account.points = -1
    except AttributeError:
        pass
    else:
        raise AssertionError("Property chỉ đọc phải chặn phép gán")
    try:
        account.add_points(-2)
    except ValueError:
        pass
    assert account.points == 10
    print(account.points)
    """,
    """In `10`. Phép gán points bị từ chối; lần cộng âm cũng bị từ chối và không thay đổi tổng. Đặt assert sau lời gọi sai để chứng minh trạng thái được giữ nguyên. Một test chỉ kiểm tra có ngoại lệ mà quên xem dữ liệu sau lỗi còn có thể bỏ sót cập nhật một phần.""",
    """
    Hướng dẫn: thêm property level trả "beginner" khi points dưới 100 và "active" khi từ 100. Tự làm lớp Temperature với celsius được xác thực là số trong miền vật lý của bài: không nhỏ hơn -273.15. Cung cấp fahrenheit chỉ đọc, công thức celsius * 9 / 5 + 32. Nêu rõ cách xử lý bool và chuỗi để hai người giải có cùng hợp đồng.

    Thử ba giá trị ngay quanh ngưỡng điểm 99, 100, 101 và ngưỡng nhiệt độ. Tách các trường hợp lỗi sai kiểu khỏi lỗi vượt miền giá trị trong bảng thử, dù ứng dụng nhỏ có thể thống nhất dùng ValueError cho cả hai.
    """,
    """
    Getter level chỉ đọc _points, không sửa trạng thái hoặc tự ghi file. Với Temperature, setter kiểm tra kiểu và miền rồi mới gán _celsius; getter fahrenheit tính từ trạng thái đó. Đạt khi 0 Celsius cho 32 Fahrenheit và setter thất bại giữ nhiệt độ cũ. Bài nộp giải thích vì sao `_celsius` vẫn có thể truy cập trong Python và vì sao API chỉ là thỏa thuận sử dụng, không phải hàng rào xác thực người dùng.
    """,
    """Đặt self.points = value ngay trong setter points gây gọi đệ quy vô hạn; trường lưu trữ cần một tên khác. Getter tự tăng điểm làm việc đọc nhiều lần cho kết quả không ổn định. Dùng property để tránh viết phương thức bất kể hành vi khiến API khó đoán; hãy ưu tiên tên cho biết tác dụng và chi phí.""",
    [("_points có bảo vệ dữ liệu khỏi mọi người gọi không?", "Không; nó là quy ước nội bộ."),
     ("Vì sao getter không nên tự cộng điểm?", "Đọc dữ liệu cần hành vi dễ dự đoán, không gây thay đổi ngầm."),
     ("Setter cần kiểm tra trước hay sau khi gán?", "Trước khi gán để giữ trạng thái cũ khi dữ liệu sai.")],
    [q("Vai trò property chỉ đọc trong StudyPoints là gì?", "Cho đọc tổng qua API và chặn phép gán thông thường", "Mã hóa tổng điểm", "Cấp quyền admin", "Tự ghi dữ liệu vào đĩa", "Property không có setter chặn cách gán thông thường."),
     q("Dấu _ ở đầu _points biểu thị gì?", "Quy ước chi tiết nội bộ", "Bảo mật tuyệt đối", "Biến không tồn tại", "Thuộc tính được mã hóa", "Python vẫn cho truy cập nếu người gọi cố ý.", "easy"),
     q("Trong setter points, gán self.points trực tiếp thường gây gì?", "Gọi lại setter và có thể đệ quy vô hạn", "Tự tạo biến toàn cục", "Bỏ qua setter", "Tự kiểm tra kiểu", "Cần dùng trường lưu trữ như _points."),
     q("Hành vi nào phù hợp cho getter borrowed?", "Tính total - available mà không sửa dữ liệu", "Gửi email mỗi lần đọc", "Trừ available mỗi lần đọc", "Xóa sách khỏi kho", "Getter nên thể hiện thao tác đọc dễ dự đoán."),
     q("Một lần add_points bị từ chối nên được kiểm tra thêm điều gì?", "Tổng điểm vẫn giữ nguyên", "Tên biến đã dài hơn", "CPU phải đạt 100%", "Số phương thức tăng lên", "Kiểm tra cả ngoại lệ và trạng thái sau lỗi.")],
    [PY + "library/functions.html#property", PY + "tutorial/classes.html#private-variables"])


L5 = lesson(
    "Composition và phân chia trách nhiệm dịch vụ",
    ["Mô hình hóa Library chứa nhiều Book bằng composition.",
     "Phân biệt quản lý tập hợp với hành vi của từng phần tử.",
     "Thiết kế thao tác tra cứu mã và từ chối mã trùng."],
    """
    Library không phải một loại Book: nó chứa các Book. Quan hệ chứa này gọi là composition trong phạm vi mô hình bài học. Book bảo vệ số bản của một đầu sách, Library quản lý danh mục và chọn đúng Book theo mã. Nếu Library kế thừa Book chỉ để dùng lại vài thuộc tính, tên và hành vi sẽ trở nên khó hiểu: thư viện có tự được mượn như một quyển sách hay không?

    Tách trách nhiệm có ích khi ta mô tả được câu hỏi mà mỗi đối tượng trả lời. Book biết còn bản để mượn không. Library biết mã nào đã có và trả một sách theo mã. CLI biết cách đọc đối số, hiển thị thông báo. Một lớp không cần có nhiều phương thức mới hữu ích; nó cần một vai trò có ranh giới. Tách riêng lớp cho mỗi dòng dữ liệu cũng có thể gây phức tạp thừa nếu không có hành vi hoặc bất biến cần bảo vệ.

    Danh mục dùng dict vì thao tác chính là tra theo mã duy nhất. Khi add, kiểm tra code đã tồn tại rồi mới thêm. Ghi đè âm thầm sẽ làm biến mất dữ liệu đầu sách cũ. Trong bài này Library giữ tham chiếu Book được truyền vào; quyết định đó được ghi rõ, nên người tạo Book vẫn có thể quan sát cùng trạng thái. Nếu ứng dụng đòi cô lập mạnh hơn, cần một API hoặc kiểu bản sao phù hợp.

    Phương thức borrow(code) làm cầu nối tra cứu và hành động. Nó không giảm trực tiếp mọi trường dữ liệu mà gọi book.borrow(), giữ quy tắc số lượng ở một chỗ. Khi lỗi không tìm thấy mã, ngoại lệ KeyError của dict có thể được chuyển thành ValueError hoặc ngoại lệ nghiệp vụ ở bài sau. Điều cần tránh là bắt lỗi rồi tự tạo đầu sách rỗng vì người dùng sẽ nhận thông báo thành công trên dữ liệu sai.
    """,
    """
    class Book:
        def __init__(self, code, available):
            self.code = code
            self.available = available

        def borrow(self):
            if self.available <= 0:
                raise ValueError("Hết sách")
            self.available -= 1

    class Library:
        def __init__(self):
            self._books = {}

        def add(self, book):
            if book.code in self._books:
                raise ValueError("Mã đã tồn tại")
            self._books[book.code] = book

        def borrow(self, code):
            self._books[code].borrow()

        def codes(self):
            return tuple(sorted(self._books))

    library = Library()
    book = Book("PY01", 2)
    library.add(book)
    library.borrow("PY01")
    assert book.available == 1
    assert library.codes() == ("PY01",)
    try:
        library.add(Book("PY01", 9))
    except ValueError:
        pass
    assert book.available == 1
    print(library.codes(), book.available)
    """,
    """In `('PY01',) 1`. Library giữ cùng đối tượng Book nên tham chiếu book thấy số lượng mới. codes trả tuple đã sắp xếp, giúp kết quả lặp lại được và không cho người dùng sửa trực tiếp dict nội bộ. Ví dụ rút gọn tập trung composition; khi đưa vào dự án phải tái sử dụng kiểm tra hợp lệ ở bài khởi tạo.""",
    """
    Hướng dẫn: thêm return_book(code), dùng phương thức trả sách của Book thay vì thay đổi trực tiếp. Tự làm Order chứa các OrderLine. OrderLine biết subtotal bằng unit_price * quantity; Order biết tổng của các dòng. Dùng số nguyên đồng hoặc một quy ước Decimal rõ ràng; không dùng float rồi khẳng định chính xác tuyệt đối về tiền.

    Nộp sơ đồ ba lớp Book, Library, CLI và viết bên cạnh nơi xử lý từng tình huống: mã trùng, hết sách, đối số lệnh thiếu. Thử hai mã có cùng tên để xác nhận hệ thống dựa trên mã, không vô tình dựa trên tên.
    """,
    """
    Library.return_book chọn sách theo code và gọi return_copy. Order.total có thể cộng subtotal của từng dòng và nên có test đơn rỗng, một dòng, nhiều dòng. Đạt khi quy tắc số lượng ở một chỗ và thao tác danh mục không phá dữ liệu đã có nếu add thất bại. Giải thích vì sao không truyền toàn bộ đối số CLI vào constructor Book: xử lý giao diện và bảo vệ miền nghiệp vụ phục vụ hai mục đích khác nhau.
    """,
    """Kế thừa Book cho Library chỉ để có code là dấu hiệu quan hệ sai. Trả trực tiếp self._books cho phép người gọi xóa hoặc ghi đè bỏ qua add. Dùng một danh sách toàn cục trong mọi Library làm hai kho bị lẫn dữ liệu. Test hai thư viện độc lập trước khi mở rộng lưu file.""",
    [("Library có phải một loại Book không?", "Không, Library chứa và quản lý Book."),
     ("Quy tắc hết sách nên ở đâu?", "Trong hành vi mượn của Book hoặc miền nghiệp vụ tương ứng, dùng thống nhất."),
     ("Vì sao từ chối mã trùng?", "Để không ghi đè mất đầu sách hiện có một cách âm thầm.")],
    [q("Quan hệ phù hợp giữa Library và Book trong bài là gì?", "Library chứa các Book", "Library luôn kế thừa Book", "Book là biến toàn cục duy nhất", "Hai lớp phải giống mọi phương thức", "Composition diễn tả quan hệ chứa.", "easy"),
     q("Khi add một mã đã có, Library nên làm gì theo hợp đồng?", "Từ chối và giữ dữ liệu cũ", "Ghi đè âm thầm", "Xóa mọi sách", "Đổi mã cũ ngẫu nhiên", "Mã duy nhất là ràng buộc của danh mục."),
     q("Vì sao borrow(code) gọi Book.borrow thay vì tự giảm trường?", "Giữ quy tắc số lượng ở một nơi", "Để tránh mọi kiểm tra", "Để bắt buộc dùng mạng", "Vì dict không hỗ trợ tra cứu", "Ủy quyền hành vi tránh lặp quy tắc."),
     q("Dữ liệu trả về nào giúp người gọi không sửa trực tiếp danh mục nội bộ?", "Tuple mã sách đã sắp xếp", "Chính dict _books có thể sửa", "Một biến toàn cục", "Mật khẩu của người tạo", "Tuple mã là kết quả đọc giới hạn theo API."),
     q("Thiếu đối số dòng lệnh nên xử lý ở lớp nào trong thiết kế?", "Lớp giao diện CLI", "Book tự đọc sys.argv", "Mỗi Book tự gọi input", "Dict danh mục", "CLI chịu trách nhiệm chuyển đầu vào thành lời gọi nghiệp vụ.")],
    [PY + "tutorial/classes.html", PY + "tutorial/datastructures.html#dictionaries"])


L6 = lesson(
    "Dataclass, đối tượng giá trị và biểu diễn dữ liệu",
    ["Dùng dataclass để diễn tả bản ghi nhỏ có hợp đồng rõ.",
     "Phân biệt bằng nhau theo giá trị với đồng nhất đối tượng.",
     "Sử dụng frozen và default_factory đúng phạm vi."],
    """
    Khi mô tả một mã sách hoặc kết quả mượn, ta thường cần khởi tạo, biểu diễn để debug và so sánh giá trị. dataclass giúp sinh một số phương thức lặp lại từ các trường đã khai báo. Nó không quyết định mô hình thay người thiết kế và không tự kiểm tra kiểu chỉ vì trường có type hint. Ta vẫn phải viết __post_init__ cho các điều kiện dữ liệu cần bảo vệ.

    Một đối tượng giá trị được nhận biết qua nội dung thay vì danh tính riêng. Hai LoanReceipt có cùng code và borrower có thể so sánh bằng nhau dù là hai thực thể khác nhau. Ngược lại, Book trong danh mục thường có định danh code và trạng thái thay đổi; không nên tùy tiện dùng mọi trường mutable làm khóa dict. Chọn semantics trước khi dựa vào phương thức __eq__ được sinh tự động.

    frozen=True chặn phép gán trường thông thường, phù hợp biên nhận chỉ đọc sau tạo. Tính bất biến này không tự đóng băng sâu một list nằm trong trường. Muốn biên nhận có danh sách ổn định, có thể chọn tuple các giá trị bất biến. Với dữ liệu mutable riêng cho mỗi bản ghi, dùng field(default_factory=list) để tạo list mới, không dùng một list chia sẻ làm mặc định.

    asdict có thể tạo cấu trúc dữ liệu thuận tiện nhưng không nên mặc định đó là định dạng lưu trữ vĩnh viễn. Đổi tên trường lớp có thể vô tình đổi hợp đồng file. Trong bài lưu JSON, ta viết mapping rõ và thêm schema_version. Ở đây mục tiêu là một biên nhận nhỏ, in ra dễ hiểu, so sánh được và được kiểm tra hợp lệ, từ đó thấy dataclass giảm công việc cơ học chứ không thay trách nhiệm nghiệp vụ.
    """,
    """
    from dataclasses import dataclass, field, FrozenInstanceError

    @dataclass(frozen=True)
    class LoanReceipt:
        code: str
        borrower: str

        def __post_init__(self):
            if not self.code.strip() or not self.borrower.strip():
                raise ValueError("Mã và độc giả không được rỗng")

    @dataclass
    class ReadingLog:
        entries: list[str] = field(default_factory=list)

    a = LoanReceipt("PY01", "Lan")
    b = LoanReceipt("PY01", "Lan")
    assert a == b and a is not b
    first, second = ReadingLog(), ReadingLog()
    first.entries.append("Đọc chương 1")
    assert second.entries == []
    try:
        a.code = "NEW"
    except FrozenInstanceError:
        pass
    else:
        raise AssertionError("Biên nhận phải chặn phép gán")
    print(a.code, a.borrower, len(first.entries))
    """,
    """In `PY01 Lan 1`. a == b đúng theo các trường nhưng a is b sai vì tạo hai đối tượng. first và second có list riêng. FrozenInstanceError khi gán code chứng minh API thông thường chặn thay đổi trường; bài không tuyên bố đối tượng đã được bảo mật trước mã có chủ ý can thiệp.""",
    """
    Hướng dẫn: thêm trường days cho LoanReceipt, yêu cầu số nguyên dương và test 0 bị từ chối. Tự làm dataclass frozen BookCode có value được kiểm tra không rỗng. Viết ví dụ hai BookCode cùng giá trị so sánh bằng nhau, sau đó dùng chúng làm khóa dict để giải thích yêu cầu trường hashable.

    Nâng mức: tạo dataclass Report với tags là tuple[str, ...] và nhận xét vì sao tuple chứa list vẫn không phải cấu trúc bất biến sâu. Bài nộp cần hai test liên quan đến giá trị và hai test liên quan đến dữ liệu không hợp lệ.
    """,
    """
    __post_init__ kiểm tra days trước khi người gọi sử dụng biên nhận. BookCode(value) có thể lưu chuỗi đã chuẩn hóa ngay từ bước nhập hoặc từ chối chuỗi có khoảng trắng ngoài; phải ghi rõ lựa chọn. Khi dùng frozen, đừng cố gán trường trực tiếp trong __post_init__ rồi bỏ lỗi; nếu cần chuẩn hóa, hiểu rõ cơ chế object.__setattr__ hoặc đơn giản nhận dữ liệu đã chuẩn hóa và kiểm tra chặt. Đạt khi giải thích được cả lợi ích lẫn giới hạn của mã được sinh tự động.
    """,
    """Cho rằng type hint tự từ chối số nguyên thay cho code sẽ gây lỗi .strip ở nơi khó hiểu; kiểm tra kiểu nếu dữ liệu ngoài có thể sai. Dùng unsafe_hash chỉ để hết lỗi không làm cấu trúc mutable trở nên an toàn làm khóa. Lạm dụng asdict cho mọi file lâu dài làm thay lớp phá tương thích dữ liệu mà không có migration.""",
    [("dataclass tự kiểm tra mọi giá trị theo type hint không?", "Không; cần xác thực dữ liệu khi có yêu cầu."),
     ("frozen có đóng băng sâu một list con không?", "Không."),
     ("default_factory=list phục vụ điều gì?", "Tạo list mặc định riêng cho từng thực thể.")],
    [q("Khi a và b là hai dataclass có cùng trường, a == b có thể đúng còn a is b sai không?", "Có", "Không, hai phép luôn giống nhau", "Chỉ khi không có field", "Chỉ với biến toàn cục", "Bằng nhau theo giá trị khác đồng nhất đối tượng."),
     q("field(default_factory=list) giúp gì?", "Tạo list mặc định mới cho từng thực thể", "Chia sẻ một list toàn cục", "Cấm sửa mọi list", "Tự chuyển list thành JSON", "Factory được gọi khi cần giá trị mặc định.", "easy"),
     q("frozen=True bảo đảm điều gì trong cách dùng thông thường?", "Chặn phép gán trường thông thường", "Mã hóa toàn bộ dữ liệu", "Đóng băng sâu mọi đối tượng con", "Chặn mọi truy cập bên ngoài", "frozen không phải cơ chế bảo mật hay deep immutability."),
     q("Đâu là nơi phù hợp xác thực thêm dữ liệu dataclass sau khởi tạo sinh tự động?", "__post_init__", "Tên module", "__file__", "Lệnh print ở test", "Hook được gọi sau __init__ sinh tự động."),
     q("Vì sao không dùng asdict làm hợp đồng file một cách vô thức?", "Đổi trường lớp có thể làm đổi định dạng lưu", "asdict luôn trả bytes", "JSON không nhận dict", "Mọi dataclass không có field", "Định dạng lưu cần được thiết kế và kiểm soát phiên bản.")],
    [PY + "library/dataclasses.html", PY + "reference/datamodel.html#object.__eq__"])


L7 = lesson(
    "Kế thừa, ghi đè và hợp đồng thay thế",
    ["Chọn kế thừa khi tồn tại quan hệ một loại của hợp lệ.",
     "Ghi đè hành vi và dùng super để phối hợp khởi tạo.",
     "Đánh giá lớp con bằng cùng một bộ kiểm tra hợp đồng."],
    """
    Ta có hai chính sách thời hạn mượn: người đọc thông thường 14 ngày và hội viên hỗ trợ học tập 21 ngày. Một BorrowingPolicy cung cấp phương thức allowed_days; lớp con có thể thay cách tính nhưng vẫn phải trả số nguyên dương. Đó là một hợp đồng mà nơi gọi dựa vào. Nếu lớp con trả chuỗi hoặc từ chối lời gọi hợp lệ của lớp cha, việc thay thế sẽ làm vỡ ứng dụng dù mã có dùng từ khóa kế thừa đúng cú pháp.

    Chỉ dùng kế thừa vì muốn chia sẻ một vài dòng mã có thể tạo một cây lớp sai nghĩa. Trước khi viết class Child(Parent), hỏi liệu mọi thao tác được hứa bởi Parent có hợp lý trên Child không. Library chứa Book đã học là quan hệ chứa, không phải một loại sách. Với chính sách mượn, inheritance có thể hữu ích vì các chính sách thực hiện cùng một loại phép tính và kết quả có cùng ý nghĩa.

    Ghi đè tạo một phương thức cùng tên ở lớp con. super() hỗ trợ gọi tiếp theo thứ tự phân giải phương thức; trong cây đơn giản của bài, nó gọi triển khai ở lớp cha. Không cần dạy nhiều kế thừa cùng lúc để sử dụng hiệu quả cơ chế này. Khi constructor lớp con có thêm cấu hình, gọi super().__init__ để giữ phần kiểm tra chung trước khi thiết lập phần riêng.

    Hợp đồng nên kiểm tra bằng hành vi quan sát được. Một hàm test_policy(policy) nhận bất kỳ chính sách nào và kiểm tra kết quả cho dữ liệu bình thường, biên và sai. Bài không khẳng định một vài test chứng minh toàn bộ tính thay thế; nó cho ta cách phát hiện vi phạm thường gặp. Các nhánh điều kiện kiểm tra tên lớp khắp chương trình là dấu hiệu nơi gọi đang phụ thuộc chi tiết lớp con quá nhiều.
    """,
    """
    class BorrowingPolicy:
        def __init__(self, days=14):
            if type(days) is not int or days <= 0:
                raise ValueError("Số ngày phải là số nguyên dương")
            self._days = days

        def allowed_days(self):
            return self._days

    class SupportedPolicy(BorrowingPolicy):
        def __init__(self):
            super().__init__(days=21)

        def allowed_days(self):
            return super().allowed_days()

    def test_policy(policy):
        result = policy.allowed_days()
        assert type(result) is int and result > 0

    normal, supported = BorrowingPolicy(), SupportedPolicy()
    for policy in (normal, supported):
        test_policy(policy)
    assert normal.allowed_days() == 14
    assert supported.allowed_days() == 21
    print(normal.allowed_days(), supported.allowed_days())
    """,
    """In `14 21`. Hàm test_policy không biết tên lớp cụ thể nhưng dùng chung API. Việc SupportedPolicy ghi đè rồi gọi super là minh họa cơ chế; trong mã thật có thể kế thừa trực tiếp allowed_days vì không đổi hành vi. Biết bỏ một override thừa cũng là một quyết định thiết kế tốt.""",
    """
    Hướng dẫn: tạo ShortLoanPolicy dùng 7 ngày và chạy lại bộ kiểm tra hợp đồng. Tự làm ReportFormatter với format_row(code, title) trả chuỗi; một lớp con tạo dòng CSV đơn giản bằng csv.writer, một lớp tạo văn bản. Không dùng nối dấu phẩy thủ công nếu dữ liệu có thể chứa dấu phẩy hoặc dấu ngoặc kép.

    Viết phiên bản lỗi của policy trả "21" rồi chứng minh test_policy bắt được. Bài nộp giải thích lỗi về hợp đồng giá trị trả về, không chỉ nói “sai kiểu vì test yêu cầu”. Nêu lợi ích khi nơi gọi không phải sửa mỗi lần có thêm một chính sách phù hợp.
    """,
    """
    ShortLoanPolicy có thể chỉ gọi constructor cha với days=7 và dùng phương thức kế thừa. Với formatter, hợp đồng là trả chuỗi biểu diễn một bản ghi theo quy ước ghi rõ; không được bất ngờ ghi file bên trong một triển khai nếu nơi gọi chỉ yêu cầu chuỗi. Đạt khi cùng hàm gọi làm việc được với cả các lớp con, và test chỉ ra điều kiện mà một triển khai vi phạm. Chọn composition nếu nhu cầu thực là thay chiến lược cho một đối tượng tồn tại.
    """,
    """Bỏ super trong constructor lớp con có thể làm trường cha không được khởi tạo. Gọi trực tiếp tên lớp cha ở nhiều chỗ làm khó thay cấu trúc hơn. Kiểm tra isinstance rồi rẽ nhánh cho từng lớp con ở mọi nơi triệt tiêu lợi ích thay thế; tập trung vào hợp đồng cần có thay vì tên lớp cụ thể.""",
    [("Kế thừa phù hợp khi nào?", "Khi quan hệ một loại của và hợp đồng hành vi phù hợp."),
     ("Một lớp con trả chuỗi thay số ngày nguyên có đúng hợp đồng bài không?", "Không."),
     ("Override gọi lại y nguyên super có luôn cần không?", "Không; có thể dùng trực tiếp phương thức kế thừa.")],
    [q("Lớp con thay thế được lớp cha khi nào theo bài?", "Khi giữ hợp đồng mà nơi gọi dựa vào", "Khi tên lớp dài hơn", "Khi có nhiều thuộc tính hơn", "Khi không có test", "Tính thay thế là yêu cầu hành vi, không chỉ cú pháp kế thừa."),
     q("super().__init__ trong lớp con dùng để làm gì ở ví dụ?", "Phối hợp phần khởi tạo theo lớp cha", "Tự tạo hai đối tượng độc lập", "Xóa thuộc tính lớp con", "Tự chuyển mọi giá trị sang chuỗi", "Khởi tạo và xác thực chung được giữ lại.", "easy"),
     q("Quan hệ nào không phù hợp dùng kế thừa trong mô hình đã học?", "Library kế thừa Book chỉ vì chứa sách", "ShortLoanPolicy là BorrowingPolicy", "SupportedPolicy là BorrowingPolicy", "Formatter cụ thể thực hiện hợp đồng formatter", "Quan hệ chứa không tự là quan hệ một loại của."),
     q("Policy trả chuỗi '21' thay số nguyên vi phạm điều gì?", "Hợp đồng giá trị trả về", "Tên file", "Quy tắc indent duy nhất", "Cơ chế import", "Nơi gọi cần số nguyên để tính toán."),
     q("Override không thêm hành vi và chỉ gọi super có thể xử lý thế nào?", "Bỏ override và dùng phương thức kế thừa", "Bắt buộc nhân đôi code", "Đổi mọi caller thành if tên lớp", "Tắt kiểm thử", "Không cần viết lại phương thức nếu hành vi cha đã phù hợp.")],
    [PY + "tutorial/classes.html#inheritance", PY + "library/functions.html#super"])


L8 = lesson(
    "Đa hình, duck typing và lớp trừu tượng",
    ["Dùng một giao diện hành vi với các triển khai khác nhau.",
     "Phân biệt duck typing với kế thừa bắt buộc.",
     "Khai báo hợp đồng repository bằng ABC và abstractmethod."],
    """
    Một dịch vụ danh mục cần lưu và tải Book, nhưng không nên biết đang dùng bộ nhớ hay file JSON. Ta mô tả hành vi cần có bằng load và save. Đa hình giúp cùng một đoạn mã gọi những hành vi đó trên các triển khai khác nhau. Thiết kế kiểm thử cũng dễ hơn: test dùng bản lưu trong bộ nhớ để tránh file, ứng dụng CLI dùng kho JSON khi cần giữ dữ liệu giữa các lần chạy.

    Duck typing chú trọng đối tượng có hành vi phù hợp, không nhất thiết kế thừa một lớp cụ thể. Một hàm nhận object có save(payload) có thể dùng được mà không kiểm tra isinstance. Cách này gọn và linh hoạt, nhưng lỗi thiếu phương thức có thể chỉ xuất hiện khi gọi. Tài liệu hợp đồng, type hints hoặc Protocol trong chương trình lớn có thể bổ sung kiểm tra; bài này dùng ABC để thấy một cách công khai hợp đồng ở runtime.

    Kế thừa ABC và đánh dấu abstractmethod làm lớp chưa cài đầy đủ các phương thức trừu tượng không được khởi tạo thông thường. ABC không tự chứng minh phương thức thực hiện đúng nghiệp vụ: save mà bỏ dữ liệu vẫn có thể thỏa yêu cầu tên phương thức. Vì vậy ta cần bộ kiểm tra hợp đồng: sau save của dữ liệu hợp lệ, load phải trả biểu diễn tương đương theo quy tắc đã nêu.

    Quyền sở hữu dữ liệu vẫn quan trọng. MemoryRepository trong bài sao chép các dict một mức vì cấu trúc payload đã giới hạn thành danh sách dict chứa giá trị nguyên, chuỗi. Nếu sau này đưa list lồng nhau vào, hợp đồng phải thay đổi hoặc dùng cơ chế sao chép phù hợp. Không dùng một bản repository test quá đơn giản để kết luận file JSON hay cơ sở dữ liệu thật chắc chắn đúng; từng triển khai còn cần kiểm tra riêng.
    """,
    """
    from abc import ABC, abstractmethod

    class Repository(ABC):
        @abstractmethod
        def load(self):
            raise NotImplementedError

        @abstractmethod
        def save(self, rows):
            raise NotImplementedError

    class MemoryRepository(Repository):
        def __init__(self):
            self._rows = []

        def load(self):
            return [dict(row) for row in self._rows]

        def save(self, rows):
            self._rows = [dict(row) for row in rows]

    def round_trip(repository):
        payload = [{"code": "PY01", "total": 2}]
        repository.save(payload)
        payload[0]["total"] = 999
        result = repository.load()
        assert result == [{"code": "PY01", "total": 2}]
        result[0]["total"] = 7
        assert repository.load()[0]["total"] == 2

    round_trip(MemoryRepository())
    try:
        Repository()
    except TypeError:
        pass
    else:
        raise AssertionError("Không được tạo repository trừu tượng")
    print("repository contract: OK")
    """,
    """In `repository contract: OK`. Sửa payload hoặc kết quả load không đổi dữ liệu đã lưu trong miền dữ liệu phẳng đã chọn. Repository() bị chặn vì thiếu triển khai. Tạo một lớp có đủ tên phương thức nhưng load luôn trả [] sẽ qua kiểm tra trừu tượng mà không qua round_trip; đây là hai mức kiểm tra khác nhau.""",
    """
    Hướng dẫn: viết BrokenRepository hoàn thành hai phương thức nhưng không giữ dữ liệu, chạy round_trip và ghi assert thất bại nào. Tự làm Exporter có export(rows) trả chuỗi; hai triển khai JSON và CSV đều phải giữ tên trường theo hợp đồng. So sánh cách dùng lớp kế thừa ABC với một đối tượng duck typing cung cấp đủ phương thức mà không kế thừa.

    Nâng mức: ghi bảng tiêu chí load/save gồm tình huống chưa có dữ liệu, lưu rỗng, lưu một bản ghi và người gọi sửa kết quả load. Không tự thêm yêu cầu lưu an toàn khi nhiều tiến trình nếu triển khai chưa có khóa hoặc giao dịch.
    """,
    """
    Bộ test hành vi sẽ thất bại trên BrokenRepository ở phép so sánh payload sau save. JSON exporter dùng json.dumps, CSV exporter dùng csv.DictWriter; đừng tự nối chuỗi rồi bỏ qua ký tự escape. Đạt khi hàm sử dụng chỉ phụ thuộc các phương thức đã thỏa thuận và mỗi triển khai có kiểm tra round-trip riêng. Bài nộp cần giải thích ABC giúp gì và còn thiếu gì, tránh khẳng định kế thừa ABC đã bảo đảm dữ liệu an toàn.
    """,
    """Kiểm tra tên phương thức tồn tại không bảo đảm ý nghĩa phương thức đúng. Trả list _rows trực tiếp làm caller sửa repository ngoài save. Bắt TypeError của việc gọi sai API rồi coi là “không có dữ liệu” che giấu lỗi lập trình; lỗi hợp đồng nên được phát hiện khi kiểm thử, không chuyển thành thành công giả.""",
    [("Duck typing có bắt buộc cùng lớp cha không?", "Không, cần hành vi phù hợp với nơi gọi."),
     ("ABC kiểm tra chính xác dữ liệu save chưa?", "Không, vẫn cần kiểm thử hành vi."),
     ("Vì sao test sửa kết quả load?", "Để kiểm tra caller không vô tình sửa trạng thái lưu qua tham chiếu bị lộ.")],
    [q("Duck typing tập trung vào điều gì?", "Hành vi mà đối tượng cung cấp", "Tên file cài đặt", "Độ dài tên lớp", "Chỉ loại CPU", "Nơi gọi dựa vào API cần có thay vì danh tính lớp.", "easy"),
     q("ABC có abstractmethod chưa triển khai thường ngăn điều gì?", "Khởi tạo lớp chưa hoàn chỉnh", "Mọi lỗi logic", "Mọi lỗi ghi đĩa", "Mọi dữ liệu sai kiểu", "ABC hỗ trợ hợp đồng cấu trúc, không thay kiểm thử nghiệp vụ."),
     q("Một repository có đủ method nhưng save bỏ dữ liệu cần test nào để phát hiện?", "Save rồi load và đối chiếu dữ liệu", "Chỉ kiểm tra isinstance", "Chỉ đếm method", "Chỉ in tên class", "Kiểm tra round-trip đánh giá hành vi lưu trữ."),
     q("Vì sao MemoryRepository trả bản sao dữ liệu phẳng?", "Tránh caller sửa trực tiếp kho qua tham chiếu", "Để luôn đổi nội dung", "Để xóa schema", "Vì dict không thể được trả về", "Quyền sở hữu dữ liệu là một phần hợp đồng."),
     q("Có thể kết luận kho JSON an toàn nhiều tiến trình từ test kho bộ nhớ không?", "Không, cần cơ chế và kiểm tra riêng", "Có vô điều kiện", "Có nếu tên lớp giống nhau", "Có nếu ABC có hai method", "Concurrency là yêu cầu bổ sung cần được thiết kế.")],
    [PY + "library/abc.html", PY + "glossary.html#term-duck-typing"])


L9 = lesson(
    "Ngoại lệ nghiệp vụ và ranh giới xử lý lỗi",
    ["Diễn đạt các lỗi dự kiến bằng ngoại lệ có ý nghĩa.",
     "Bắt lỗi ở ranh giới CLI và giữ nguyên bất biến miền.",
     "Phân biệt thông báo người dùng với lỗi lập trình cần sửa."],
    """
    Người dùng mượn một mã không có trong thư viện là tình huống dự kiến; NameError do viết sai tên biến là lỗi lập trình. Nếu bắt Exception quanh mọi thứ rồi in “không tìm thấy sách”, hai tình huống sẽ bị trộn và lỗi thật khó truy tìm. Ta tạo LibraryError cho các lỗi nghiệp vụ có thể trình bày ngắn ở CLI, với NotFound và NoCopies để phân biệt nguyên nhân khi cần.

    Ngoại lệ cho phép một thao tác báo không hoàn tất mà không phải trả nhiều kiểu kết quả mơ hồ như -1, None hoặc chuỗi “error”. Nơi gọi phải biết trường hợp nào có thể thất bại và bắt đúng loại cần xử lý. Không lạm dụng ngoại lệ cho mọi nhánh bình thường: list danh mục rỗng có thể trả danh sách rỗng, còn yêu cầu mượn mã không có phải báo không thực hiện được theo hợp đồng.

    Miền nghiệp vụ không đọc input và không tự gọi sys.exit. Nó kiểm tra dữ liệu và ném lỗi. CLI chuyển lỗi dự kiến thành thông báo và mã thoát, nhờ vậy test dịch vụ không phải chạy tiến trình mới. Lỗi không dự kiến nên còn traceback khi phát triển để tìm nguyên nhân. Ghi log trong ứng dụng thật cần cân nhắc dữ liệu nhạy cảm; ví dụ khóa học chỉ dùng mã sách giả và không lưu danh tính người mượn.

    Khi bọc một lỗi thấp hơn, dùng raise ... from exc để giữ nguyên chuỗi nguyên nhân. Ví dụ lỗi đọc JSON không hợp lệ có thể được báo là “Tệp thư viện không hợp lệ” nhưng người phát triển vẫn tìm thấy JSONDecodeError phía sau. Kiểm tra lỗi phải đi kèm kiểm tra trạng thái: mượn sách hết không làm available âm; lỗi đọc file không nên dẫn tới ghi đè file lỗi bằng kho rỗng mà không cho người dùng biết.
    """,
    """
    class LibraryError(Exception):
        pass

    class NotFound(LibraryError):
        pass

    class NoCopies(LibraryError):
        pass

    class Library:
        def __init__(self):
            self._available = {"PY01": 1}

        def borrow(self, code):
            if code not in self._available:
                raise NotFound("Không có mã sách")
            if self._available[code] == 0:
                raise NoCopies("Sách đã được mượn hết")
            self._available[code] -= 1

    def borrow_message(library, code):
        try:
            library.borrow(code)
        except LibraryError as exc:
            return f"Không thể mượn: {exc}"
        return "Đã mượn"

    lib = Library()
    assert borrow_message(lib, "PY01") == "Đã mượn"
    assert "mượn hết" in borrow_message(lib, "PY01")
    assert "Không có mã" in borrow_message(lib, "NONE")
    assert lib._available["PY01"] == 0
    print(borrow_message(lib, "NONE"))
    """,
    """In `Không thể mượn: Không có mã sách`. Lần mượn thứ hai không làm số lượng âm. borrow_message là một ranh giới trình bày nhỏ để minh họa; lớp Library không tự in hay thoát tiến trình. Khi học viên cố tình viết sai tên biến trong borrow, lỗi đó cần được lộ ra trong môi trường kiểm thử.""",
    """
    Hướng dẫn: thêm DuplicateCode(LibraryError) cho thao tác add. Tự làm chức năng reserve của SeatPool với SoldOutError và InvalidAmountError. Viết bảng ba cột: loại lỗi, nơi phát hiện, nơi trình bày. Mỗi nhánh từ chối cần assert trạng thái sau lỗi.

    Nâng mức: thử bọc ValueError khi chuyển số lượng chuỗi sang số nguyên bằng một ngoại lệ giao diện, giữ from exc. Chỉ chuyển lỗi ở đúng ranh giới đầu vào; không bắt mọi ValueError phát sinh sâu trong chương trình mà không hiểu nguồn gốc.
    """,
    """
    DuplicateCode được ném trước khi thêm vào dict. CLI có thể bắt LibraryError để trả mã thoát 2 và một thông báo cụ thể, còn test miền bắt đúng lớp con để phân biệt các quy tắc. Đạt khi chức năng thất bại không thực hiện một phần và lỗi không dự kiến vẫn có thể truy tìm. Một lớp cha ngoại lệ chung có ích để ranh giới bắt nhóm lỗi dự kiến, trong khi các lớp con giúp test và giao diện xử lý từng trường hợp khi cần.
    """,
    """except Exception: pass làm người dùng tưởng đã mượn dù thao tác thất bại. Gọi sys.exit trong Book khiến test khó dùng lại và thư viện không thể nhúng vào giao diện khác. Trả về chuỗi lỗi từ phương thức vốn trả số lượng khiến caller dễ tính toán sai; chọn một hợp đồng kết quả rõ và sử dụng thống nhất.""",
    [("NotFound và NameError có cùng ý nghĩa không?", "Không; một lỗi nghiệp vụ dự kiến, một lỗi tên trong chương trình."),
     ("Nơi nào nên chuyển lỗi thành thông báo CLI?", "Tại ranh giới giao diện."),
     ("raise NewError(...) from exc giúp gì?", "Giữ chuỗi nguyên nhân khi bọc lỗi.")],
    [q("Tình huống nào là lỗi nghiệp vụ dự kiến của chức năng mượn?", "Mã sách không tồn tại", "Viết sai tên biến", "Thiếu dấu hai chấm trong mã", "Import nhầm module", "Mã không tồn tại là đầu vào có thể xảy ra khi sử dụng."),
     q("Vì sao không dùng except Exception: pass cho mọi thao tác?", "Nó có thể che giấu lỗi và tạo thành công giả", "Vì Python cấm Exception", "Vì nó tự mã hóa lỗi", "Vì nó làm file chỉ đọc", "Lỗi không dự kiến cần được quan sát và sửa."),
     q("Lớp Book nên tự gọi sys.exit khi hết sách không?", "Không, nên báo lỗi cho ranh giới xử lý", "Có trong mọi thư viện", "Có để bỏ test", "Chỉ cần in rồi coi thành công", "Miền nghiệp vụ cần dùng lại được ngoài CLI."),
     q("Khi bọc lỗi, raise NewError(...) from exc có tác dụng gì?", "Giữ thông tin nguyên nhân", "Xóa nguyên nhân khỏi mọi nơi", "Tự sửa file bị hỏng", "Bỏ qua kiểm tra trạng thái", "Chuỗi nguyên nhân hỗ trợ chẩn đoán."),
     q("Sau lần mượn bị từ chối do hết sách cần xác nhận gì?", "Số lượng vẫn không âm và không thay đổi", "Tên sách tự đổi", "Mọi mã bị xóa", "Tự thêm một bản mới", "Lỗi phải giữ bất biến của trạng thái.", "easy")],
    [PY + "tutorial/errors.html#user-defined-exceptions", PY + "tutorial/errors.html#exception-chaining"])


L10 = lesson(
    "Kiểm thử đơn vị và thiết kế tình huống biên",
    ["Viết unittest cho hành vi thành công và từ chối.",
     "Tạo dữ liệu độc lập cho từng test bằng setUp.",
     "Chứng minh test phát hiện một lỗi chuyển trạng thái."],
    """
    Test là một ví dụ có kết quả mong đợi được máy kiểm tra, không chỉ một lần chạy bằng tay rồi nhìn màn hình. Với Book, ta kiểm tra số bản khi tạo, sau mượn, sau trả và khi từ chối. Tên test nên nói hành vi: test_borrow_empty_keeps_zero rõ hơn test_3. Kết quả cần quan sát trực tiếp từ hợp đồng, tránh sao chép nguyên cách triển khai vào test vì cả hai có thể cùng sai.

    Mỗi test cần dữ liệu độc lập. setUp tạo một Book mới cho từng method của unittest.TestCase, nên kết quả không phụ thuộc thứ tự chạy. Test đầu mượn sách không được làm test sau “tự nhiên hết sách”. Nếu cần một chuỗi nghiệp vụ, viết các bước trong cùng một test kịch bản và nêu lý do liên quan. Test nhỏ giúp khoanh vùng nguyên nhân, còn một số kịch bản tổng hợp giúp phát hiện tương tác.

    Thiết kế đầu vào theo biên: tổng bằng 0 và 1, mượn lần cuối, mượn thêm sau hết, trả tới tổng, trả dư. Với constructor nhận số nguyên không âm, thêm -1, bool và chuỗi vào nhóm không hợp lệ. Kiểm tra ngoại lệ bằng assertRaises và kiểm tra trạng thái ngay sau khối đó. Một test chỉ đếm có lỗi hay không chưa chứng minh bất biến còn nguyên.

    Để đánh giá sức mạnh test, cố tình đưa một lỗi nhỏ vào bản sao bài tập, ví dụ xóa kiểm tra available == 0 hoặc đặt >= thành > ở điều kiện trả. Chạy test và xác nhận ít nhất một test thất bại, rồi khôi phục mã đúng. Không chỉnh dữ liệu đang dùng của lớp học để làm thử nghiệm này. “Tất cả test xanh” chỉ có nghĩa các tình huống đã mã hóa đi qua, không bảo đảm không còn lỗi ở yêu cầu khác.
    """,
    """
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
    """,
    """Runner báo chạy 3 test và `OK`, sau đó in `3 tests passed`. Output tiến độ của unittest có thể đi qua stderr nên thứ tự hiển thị với print phụ thuộc môi trường; kết luận dựa trên mã thoát và wasSuccessful, không so nguyên chuỗi thời gian chạy. Ví dụ không cần cài pytest.""",
    """
    Hướng dẫn: bổ sung return_copy cho Book và hai test trả hợp lệ/trả dư. Tự tạo bảng ca kiểm thử có ít nhất tám dòng, mỗi dòng gắn với một yêu cầu cụ thể. Chuyển năm dòng quan trọng nhất thành test có tên rõ, bao gồm ít nhất một test giữ trạng thái sau lỗi.

    Nâng mức: trên một bản sao file, làm borrow giảm 2 thay vì 1 và chạy lại. Ghi test nào bắt được lỗi, giá trị mong đợi và giá trị thực tế; phục hồi code đúng trước khi nộp. Không sửa assert thành giá trị sai chỉ để runner xanh.
    """,
    """
    Test trả dư có thể tạo Book(1), gọi return_copy rồi mong ValueError và available vẫn 1. Test dữ liệu sai nên tách trường hợp để lỗi báo đủ ngữ cảnh; subTest giúp nhiều giá trị chạy tiếp thay vì dừng ở lỗi đầu. Đạt khi chạy lặp lại cho cùng kết quả, test độc lập với thứ tự và có bằng chứng test bắt được lỗi đã cài có chủ ý. Bài nộp kèm lệnh python -m unittest khi tách test sang file test_book.py.
    """,
    """Dùng một Book chung ở cấp module làm các test ảnh hưởng nhau. Test chỉ assertTrue(True) không kiểm tra hợp đồng. Bắt lỗi rồi không assert gì sẽ cho test xanh cả khi không có lỗi. So kết quả in chứa thời gian cụ thể khiến test thất bại vì môi trường thay vì vì hành vi nghiệp vụ.""",
    [("setUp chạy một lần cho cả lớp test không?", "Không; unittest gọi trước từng test method."),
     ("Vì sao kiểm tra sau assertRaises?", "Để xác nhận trạng thái không bị đổi sai trong thao tác thất bại."),
     ("Test xanh chứng minh hết mọi lỗi không?", "Không, nó chỉ xác nhận các tình huống được kiểm tra.")],
    [q("setUp trong unittest.TestCase thường dùng để làm gì?", "Tạo dữ liệu độc lập trước mỗi test", "Dùng một dữ liệu mutable cho mọi khóa", "Tự sinh mọi test còn thiếu", "Tắt các assert", "Dữ liệu test riêng tránh phụ thuộc thứ tự.", "easy"),
     q("Test nào có căn cứ mạnh hơn cho lần mượn bị từ chối?", "Kiểm tra ngoại lệ và available giữ nguyên", "Chỉ assertTrue(True)", "Chỉ đếm số dòng mã", "Chỉ xem tên file", "Cần xác nhận cả báo lỗi và bất biến."),
     q("Thử cố tình xóa kiểm tra hết sách trên bản sao nhằm mục đích gì?", "Xem test có phát hiện lỗi liên quan không", "Làm sai dữ liệu thật", "Bỏ yêu cầu của bài", "Tăng điểm tự động", "Một thay đổi lỗi có kiểm soát giúp đánh giá test."),
     q("Chọn dữ liệu 0,1 và mượn thêm sau hết là cách tiếp cận gì?", "Kiểm tra biên và chuyển trạng thái", "Chỉ kiểm tra cú pháp", "Chỉ đo tốc độ máy", "Không liên quan hợp đồng", "Các biên dễ bộc lộ lỗi điều kiện và lệch một."),
     q("Khi test thất bại vì borrow giảm 2, cách xử lý phù hợp là gì?", "Sửa triển khai theo yêu cầu đã xác nhận", "Đổi assert thành -1 để xanh", "Xóa mọi test thất bại", "Bỏ kiểm tra trạng thái", "Không sửa kỳ vọng đúng để che lỗi triển khai.")],
    [PY + "library/unittest.html#organizing-test-code", PY + "library/unittest.html#unittest.TestCase.assertRaises"])


L11 = lesson(
    "Lưu JSON có phiên bản và tải lại dữ liệu hợp lệ",
    ["Tách định dạng lưu trữ khỏi cấu trúc đối tượng trong bộ nhớ.",
     "Xác thực schema và dữ liệu khi tải JSON.",
     "Lưu bằng file tạm và hiểu giới hạn một tiến trình."],
    """
    Dữ liệu trong đối tượng mất khi tiến trình kết thúc. Ta cần một định dạng có thể đọc lại, kiểm tra được và đủ rõ để nâng cấp. JSON phù hợp bài nhỏ vì biểu diễn được dict, list, chuỗi và số. Ta chọn cấu trúc {schema_version: 1, books: [...]} và mapping tường minh cho từng trường; không lưu thẳng __dict__ vì thêm thuộc tính nội bộ có thể làm định dạng đổi ngoài ý muốn.

    Tải file là một ranh giới đầu vào khác. File có thể bị sửa tay, hỏng cú pháp hoặc chứa giá trị sai dù JSON hợp lệ. Kiểm tra root là dict, version đúng, books là list, từng bản ghi có trường bắt buộc và mọi mã duy nhất. Khởi tạo Book qua cùng quy tắc bất biến của ứng dụng để available âm bị từ chối. Cần phân biệt file chưa tồn tại lần đầu với file có tồn tại nhưng sai: không âm thầm biến file hỏng thành thư viện rỗng rồi ghi đè mất dữ liệu.

    Ghi file tạm ở cùng thư mục rồi thay file đích giúp tránh để lại file đích bị cắt nửa trong một số lỗi ghi. Nó không tự tạo giao dịch nhiều tiến trình, không khóa hai phiên CLI cùng sửa và không bảo đảm tồn tại sau mọi sự cố phần cứng. Bài này giới hạn một người chạy một lệnh tại một thời điểm, dữ liệu nhỏ và có bản sao lưu thủ công trước khi thử file hỏng. Yêu cầu nhiều người dùng nên chuyển sang cơ chế lưu có giao dịch và kiểm soát đồng thời.

    Mã ví dụ dùng TemporaryDirectory để mọi file thử nằm trong một vùng tạm được dọn sau khi kết thúc. Trong dự án hoàn chỉnh, đường dẫn dữ liệu do người dùng chỉ định và lỗi đọc/ghi cần được trình bày rõ. Không kiểm tra tải JSON từ nguồn không tin cậy không giới hạn; ví dụ dự án đặt giới hạn kích thước file để tránh vô tình đọc dữ liệu quá lớn cho bài tự học.
    """,
    """
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
    """,
    """In `JSON round-trip: OK`. File đích chứa tiếng Việt được giữ bằng ensure_ascii=False khi có tên sách; UTF-8 được chỉ rõ lúc đọc và ghi. Test này chứng minh round-trip cho schema đơn giản đang dùng, chưa bao phủ lỗi ghi đĩa hay hai tiến trình cạnh tranh. Thử JSON sai version trong thư mục tạm và xác nhận ValueError.""",
    """
    Hướng dẫn: thêm title và available vào schema, kiểm tra 0 <= available <= total. Tự viết bốn file dữ liệu: đúng, sai cú pháp, trùng mã, số lượng âm; chạy load và ghi kết quả mong đợi. Chỉ tạo các file này trong thư mục học riêng hoặc thư mục tạm.

    Nâng mức: thêm schema_version = 2 trong một bản sao dữ liệu và thiết kế thông báo từ chối rõ thay vì đoán cấu trúc. Viết kế hoạch chuyển đổi dữ liệu cũ thành mới trên bản sao, có bước xác nhận số bản ghi trước và sau.
    """,
    """
    Với schema mở rộng, luôn dựng đối tượng bằng constructor đã xác thực và kiểm tra mã trùng ở Library.add. Đạt khi tải sai không ghi lại file nguồn, các giá trị biên được kiểm tra, và round-trip giữ nguyên cả tổng lẫn số có sẵn. Ghi rõ một tiến trình là giới hạn triển khai; atomic replace giúp một loại lỗi ghi, không thay khóa đồng thời hay backup. Bài nộp có ít nhất một test xác nhận bytes file hỏng không bị tự thay bằng dữ liệu rỗng.
    """,
    """Chỉ json.loads thành công rồi tin mọi trường là bỏ qua xác thực miền. Dùng int(True) làm total hợp lệ trái quy tắc bài. Luôn bắt OSError rồi trả [] có thể làm mất dữ liệu ở lần save kế tiếp. Tạm file khác ổ đĩa rồi coi replace luôn có cùng bảo đảm là suy luận vượt điều kiện bài.""",
    [("JSON đúng cú pháp có bảo đảm số lượng hợp lệ không?", "Không, cần xác thực schema và miền giá trị."),
     ("File chưa có và file hỏng có nên cùng trả kho rỗng không?", "Không; file hỏng cần được báo rõ."),
     ("Ghi tạm rồi replace có giải quyết mọi xung đột nhiều tiến trình không?", "Không, bài giới hạn một tiến trình tại một thời điểm.")],
    [q("Vì sao payload có schema_version?", "Để nhận biết và kiểm soát định dạng dữ liệu", "Để tự mã hóa JSON", "Để tăng số sách", "Để bỏ kiểm tra trường", "Phiên bản giúp từ chối hoặc chuyển đổi định dạng có chủ ý."),
     q("json.loads thành công cho biết điều gì?", "Cú pháp JSON đọc được, vẫn cần kiểm tra nghiệp vụ", "Mọi số lượng đều đúng", "Không thể có mã trùng", "Dữ liệu đã được phân quyền", "Cú pháp và miền hợp lệ là hai lớp kiểm tra khác nhau."),
     q("Khi gặp file có cú pháp hỏng nên xử lý thế nào?", "Báo lỗi và giữ nguyên file để kiểm tra", "Âm thầm ghi đè bằng danh sách rỗng", "Xóa file ngay", "Coi như lần đầu chạy", "Không biến lỗi đọc thành mất dữ liệu."),
     q("Ghi file tạm cùng thư mục rồi replace giải quyết được mọi cập nhật đồng thời không?", "Không", "Có với mọi hệ điều hành", "Có vì JSON là văn bản", "Có nếu dùng ensure_ascii=False", "Bài chưa cung cấp khóa hay giao dịch nhiều tiến trình."),
     q("Test round-trip kiểm tra điều gì?", "Lưu rồi tải lại giữ dữ liệu theo hợp đồng", "Chỉ tên lớp", "Chỉ có internet", "Chỉ số trang PDF", "Đối chiếu đầu vào và đầu ra kiểm tra đường lưu/tải.", "easy")],
    [PY + "library/json.html", PY + "library/pathlib.html#pathlib.Path.replace", PY + "library/tempfile.html"])


L12 = lesson(
    "Tích hợp dự án thư viện CLI và nghiệm thu",
    ["Kết nối miền nghiệp vụ, kho JSON và giao diện argparse.",
     "Chạy kiểm tra tự động và kịch bản người dùng qua CLI.",
     "Nộp bằng chứng theo rubric và mô tả giới hạn sử dụng."],
    """
    Dự án cuối khóa là một thư viện nhỏ chạy dòng lệnh: thêm đầu sách, xem danh mục, mượn và trả theo mã. Dữ liệu chỉ có mã, tên, tổng và số có sẵn, không lưu thông tin người mượn. Mô hình cố ý hẹp để nghiệm thu được ràng buộc đã học. Không ghép thêm đăng nhập, thanh toán hay mạng khi các bất biến cơ bản chưa được kiểm tra.

    Ranh giới thiết kế gồm Book bảo vệ dữ liệu, Library quản lý tập hợp, JsonRepository chuyển dữ liệu sang file và main đọc đối số. Chuỗi thực thi một lệnh ghi là: parse đối số, tải dữ liệu hợp lệ, thực hiện nghiệp vụ, lưu kết quả, báo thành công. Khi tải dữ liệu sai hoặc nghiệp vụ thất bại, không ghi file. Khi ghi lỗi, CLI phải báo thất bại; trạng thái trong bộ nhớ không phải bằng chứng đã lưu bền.

    Bộ mã đi kèm giáo trình cung cấp library_cli.py, test_library_cli.py và README.md. Tạo một thư mục dự án riêng, chép đúng các file rồi chạy python -m unittest -v trước khi thao tác. Sau đó dùng python library_cli.py --data ./sandbox-library.json add PY01 "Học Python" 2, list, borrow PY01 và return PY01. Mỗi lần chạy là một tiến trình mới nên kết quả list sau borrow chứng minh dữ liệu đã được đọc lại từ file.

    Nghiệm thu cần bằng chứng phù hợp từng yêu cầu: unit test cho bất biến, test JSON cho round-trip và file hỏng, test CLI cho mã thoát và không tạo dữ liệu khi lệnh sai. Không chấm chất lượng bằng số lớp hoặc số dòng mã. Một chương trình nhỏ rõ ràng với test tốt hơn nhiều tầng không có hợp đồng. Dự án giới hạn một người thao tác tại một thời điểm; muốn phục vụ đồng thời phải có thiết kế lưu trữ và quyền truy cập khác, nằm ngoài bản này.
    """,
    """
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
    """,
    """Ví dụ độc lập in `CLI boundary: OK`, minh họa parse và tách miền trước khi đọc mã dự án đầy đủ. Trong library_cli.py đi kèm, main trả 0 khi thành công, 2 khi lỗi đầu vào/nghiệp vụ; phần if __name__ == '__main__' gọi sys.exit. Không dùng số lượng kết quả làm mã thoát trong sản phẩm vì 0 có ý nghĩa thành công theo quy ước dòng lệnh.""",
    """
    Hướng dẫn nghiệm thu: dùng file tạm mới, thêm PY01 với 2 bản, mượn hai lần, mượn lần ba phải thất bại và file không thay đổi. Trả một lần rồi list phải có 1 bản sẵn. Thử mã trùng, mã không tồn tại, số âm và tên rỗng. Đối chiếu cả dòng báo, mã thoát và nội dung file sau thao tác.

    Tự làm phần mở rộng: thêm lệnh search từ khóa tên sách, không phân biệt hoa thường, trả kết quả theo code. Viết ba test cho có kết quả, không có kết quả và từ khóa có khoảng trắng. Không thay tên mã đã lưu và không làm thay đổi dữ liệu khi chỉ tìm kiếm.
    """,
    """
    Nộp mã nguồn, README hướng dẫn môi trường/lệnh, log unittest, bảng các kịch bản CLI và một đoạn giải thích quyết định composition. Rubric trong sổ tay chấm 100 điểm với điểm riêng cho đúng nghiệp vụ, thiết kế, dữ liệu, test, khả năng chạy và giải thích. Hoàn thành khi đạt ít nhất 70/100, các yêu cầu không âm/không vượt tổng/không ghi đè file hỏng đều đạt và người khác tái hiện được từ một thư mục mới.

    Tự kiểm tra mở rộng search: áp dụng strip và casefold cho từ khóa theo hợp đồng, lọc trên title, sắp xếp theo code và chỉ trả kết quả đọc. Ghi giới hạn tìm kiếm chuỗi đơn giản, chưa hỗ trợ xếp hạng hay tiếng Việt không dấu. Không tuyên bố triển khai nhỏ đã sẵn sàng nhiều người dùng.
    """,
    """Chạy test trên file dữ liệu đang dùng làm thử nghiệm có thể làm thay đổi kết quả học; mọi test file dùng vùng tạm. Chỉ kiểm tra print “thành công” mà không list lại sau tiến trình mới bỏ sót lỗi lưu. Sao chép nguyên mã dự án rồi không giải thích được quyền sở hữu dữ liệu chưa đạt mục tiêu; phần bảo vệ yêu cầu thay đổi một quy tắc nhỏ và cập nhật test tương ứng.""",
    [("Lệnh sai có được ghi lại dữ liệu không?", "Không; dự án chỉ save sau khi thao tác hợp lệ."),
     ("Vì sao list trong tiến trình mới hữu ích?", "Nó kiểm tra đường đọc dữ liệu đã lưu thay vì chỉ trạng thái bộ nhớ."),
     ("Điều kiện hoàn thành dự án là gì?", "Đạt rubric và các yêu cầu trọng yếu, kèm bằng chứng tái hiện được.")],
    [q("Thứ tự phù hợp cho lệnh ghi của CLI là gì?", "Parse, load hợp lệ, thực hiện, save, báo kết quả", "Save rỗng trước rồi mới load", "Báo thành công trước khi ghi", "Bỏ qua kiểm tra đầu vào", "Trình tự này tránh ghi dữ liệu khi tải hoặc nghiệp vụ đã thất bại."),
     q("Mã thoát 0 trong CLI thường biểu thị gì?", "Thành công", "Luôn có 0 sách", "Bắt buộc lỗi dữ liệu", "Chưa cài Python", "Dự án dùng quy ước thành công bằng 0.", "easy"),
     q("Vì sao cần chạy list trong tiến trình mới sau borrow?", "Để kiểm tra dữ liệu thực sự được lưu và tải lại", "Để đổi mã sách", "Để tự thêm bản mới", "Để bỏ test JSON", "Trạng thái bộ nhớ một tiến trình chưa chứng minh persistence."),
     q("Tiêu chí nào phản ánh chất lượng dự án tốt hơn số lớp?", "Hành vi đúng, test và bằng chứng chạy lại được", "Tên file dài nhất", "Nhiều inheritance nhất", "Nhiều biến toàn cục nhất", "Rubric tập trung yêu cầu quan sát được."),
     q("Chức năng search chỉ đọc nên có tác động gì tới file dữ liệu?", "Không làm thay đổi file", "Tự đặt available về 0", "Đổi schema_version ngẫu nhiên", "Xóa kết quả không khớp", "Tìm kiếm là thao tác đọc theo hợp đồng.")],
    [PY + "library/argparse.html", PY + "library/unittest.html"])


PROJECT_CODE = r'''
"""One-user library CLI for the Python OOP course; Python 3.12+, stdlib only."""
from dataclasses import dataclass
import argparse
import json
from pathlib import Path
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


class LibraryError(ValueError):
    pass


@dataclass
class Book:
    code: str
    title: str
    total: int
    available: int

    def __post_init__(self):
        for value, label in ((self.code, "Mã"), (self.title, "Tên")):
            if not isinstance(value, str) or not value.strip():
                raise LibraryError(f"{label} sách không được rỗng")
        self.code = self.code.strip()
        self.title = self.title.strip()
        if type(self.total) is not int or self.total < 0:
            raise LibraryError("Tổng phải là số nguyên không âm")
        if type(self.available) is not int or not 0 <= self.available <= self.total:
            raise LibraryError("Số có sẵn phải nằm trong khoảng từ 0 tới tổng")

    def borrow(self):
        if self.available == 0:
            raise LibraryError("Đã hết bản có thể mượn")
        self.available -= 1

    def return_copy(self):
        if self.available == self.total:
            raise LibraryError("Không có bản đang được mượn để trả")
        self.available += 1

    def to_record(self):
        return {"code": self.code, "title": self.title,
                "total": self.total, "available": self.available}


class Library:
    def __init__(self, books=()):
        self._books = {}
        for book in books:
            self.add(book)

    def add(self, book):
        if book.code in self._books:
            raise LibraryError("Mã sách đã tồn tại")
        self._books[book.code] = book

    def get(self, code):
        try:
            return self._books[code]
        except KeyError as exc:
            raise LibraryError("Không tìm thấy mã sách") from exc

    def borrow(self, code):
        self.get(code).borrow()

    def return_book(self, code):
        self.get(code).return_copy()

    def records(self):
        return [self._books[code].to_record() for code in sorted(self._books)]


class JsonRepository:
    MAX_BYTES = 1_000_000

    def __init__(self, path):
        self.path = Path(path)

    def load(self):
        if not self.path.exists():
            return Library()
        try:
            if self.path.stat().st_size > self.MAX_BYTES:
                raise LibraryError("File vượt giới hạn 1 MB của bài thực hành")
            payload = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            raise LibraryError("Không đọc được JSON; giữ nguyên file để kiểm tra") from exc
        if not isinstance(payload, dict) or set(payload) != {"schema_version", "books"}:
            raise LibraryError("Cấu trúc gốc không hợp lệ")
        if type(payload["schema_version"]) is not int or payload["schema_version"] != 1:
            raise LibraryError("Phiên bản dữ liệu không được hỗ trợ")
        if not isinstance(payload["books"], list):
            raise LibraryError("books phải là danh sách")
        books = []
        for row in payload["books"]:
            if not isinstance(row, dict) or set(row) != {"code", "title", "total", "available"}:
                raise LibraryError("Trường của bản ghi sách không hợp lệ")
            books.append(Book(**row))
        return Library(books)

    def save(self, library):
        payload = {"schema_version": 1, "books": library.records()}
        encoded = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        if len(encoded) > self.MAX_BYTES:
            raise LibraryError("Dữ liệu vượt giới hạn 1 MB của bài thực hành")
        temporary = self.path.with_name(self.path.name + ".tmp")
        try:
            temporary.write_bytes(encoded)
            temporary.replace(self.path)
        except OSError as exc:
            raise LibraryError("Không ghi được dữ liệu; kiểm tra đường dẫn và quyền ghi") from exc


def main(argv=None):
    parser = argparse.ArgumentParser(description="Thư viện CLI — bài thực hành OOP")
    parser.add_argument("--data", default="library.json", help="File dữ liệu của một người dùng")
    commands = parser.add_subparsers(dest="command", required=True)
    add = commands.add_parser("add", help="Thêm đầu sách mới")
    add.add_argument("code")
    add.add_argument("title")
    add.add_argument("total", type=int)
    commands.add_parser("list", help="Xem danh mục")
    for name in ("borrow", "return"):
        command = commands.add_parser(name)
        command.add_argument("code")
    args = parser.parse_args(argv)
    repository = JsonRepository(args.data)
    try:
        library = repository.load()
        if args.command == "list":
            for row in library.records():
                print(f"{row['code']} | {row['title']} | {row['available']}/{row['total']}")
            return 0
        if args.command == "add":
            library.add(Book(args.code, args.title, args.total, args.total))
        elif args.command == "borrow":
            library.borrow(args.code)
        else:
            library.return_book(args.code)
        repository.save(library)
    except LibraryError as exc:
        print(f"Lỗi: {exc}", file=sys.stderr)
        return 2
    print("Đã lưu thay đổi")
    return 0


if __name__ == "__main__":
    sys.exit(main())
'''


PROJECT_TESTS = r'''
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from library_cli import Book, Library, LibraryError, JsonRepository, main


class LibraryTests(unittest.TestCase):
    def test_borrow_and_return_boundaries(self):
        book = Book("PY01", "Học Python", 1, 1)
        book.borrow()
        with self.assertRaises(LibraryError):
            book.borrow()
        self.assertEqual(book.available, 0)
        book.return_copy()
        with self.assertRaises(LibraryError):
            book.return_copy()
        self.assertEqual(book.available, 1)

    def test_constructor_validation(self):
        for total in (-1, True, "2"):
            with self.subTest(total=total), self.assertRaises(LibraryError):
                Book("PY01", "Python", total, 0)
        for available in (-1, 3, True):
            with self.subTest(available=available), self.assertRaises(LibraryError):
                Book("PY01", "Python", 2, available)

    def test_blank_code_and_title(self):
        for code, title in ((" ", "Python"), ("PY01", " "), (None, "Python")):
            with self.subTest(code=code, title=title), self.assertRaises(LibraryError):
                Book(code, title, 1, 1)

    def test_duplicate_and_missing_code(self):
        library = Library([Book("PY01", "Python", 1, 1)])
        with self.assertRaises(LibraryError):
            library.add(Book("PY01", "Khác", 9, 9))
        with self.assertRaises(LibraryError):
            library.borrow("NO")
        self.assertEqual(library.get("PY01").total, 1)

    def test_record_export_is_not_mutable_alias(self):
        library = Library([Book("PY01", "Python", 2, 2)])
        rows = library.records()
        rows[0]["available"] = 0
        self.assertEqual(library.get("PY01").available, 2)

    def test_json_round_trip_and_sorting(self):
        with tempfile.TemporaryDirectory() as folder:
            repository = JsonRepository(Path(folder) / "library.json")
            self.assertEqual(repository.load().records(), [])
            library = Library([Book("B", "Java", 2, 1), Book("A", "Python", 1, 1)])
            repository.save(library)
            self.assertEqual(repository.load().records(), library.records())
            self.assertEqual(repository.load().records()[0]["code"], "A")

    def test_bad_json_not_overwritten(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "library.json"
            path.write_bytes(b"{broken")
            with self.assertRaises(LibraryError):
                JsonRepository(path).load()
            self.assertEqual(path.read_bytes(), b"{broken")

    def test_schema_and_duplicate_rows_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "library.json"
            row = {"code": "PY01", "title": "Python", "total": 1, "available": 1}
            for payload in ({"schema_version": True, "books": []},
                            {"schema_version": 2, "books": []},
                            {"schema_version": 1, "books": [row, row]},
                            {"schema_version": 1, "books": [{"code": "PY01"}]}):
                path.write_text(json.dumps(payload), encoding="utf-8")
                with self.subTest(payload=payload), self.assertRaises(LibraryError):
                    JsonRepository(path).load()

    def test_cli_persists_and_does_not_save_failed_borrow(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "library.json"
            common = ["--data", str(path)]
            with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(main(common + ["add", "PY01", "Học Python", "1"]), 0)
                self.assertEqual(main(common + ["borrow", "PY01"]), 0)
                before = path.read_bytes()
                self.assertEqual(main(common + ["borrow", "PY01"]), 2)
                self.assertEqual(path.read_bytes(), before)
                self.assertEqual(main(common + ["return", "PY01"]), 0)
                self.assertEqual(main(common + ["list"]), 0)
            self.assertEqual(JsonRepository(path).load().get("PY01").available, 1)

    def test_cli_invalid_add_does_not_create_file(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "library.json"
            with contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(main(["--data", str(path), "add", "PY01", "Python", "-1"]), 2)
            self.assertFalse(path.exists())


if __name__ == "__main__":
    unittest.main()
'''


HANDBOOK = """# Sổ tay khóa học: Python hướng đối tượng thực hành

## Phạm vi và đầu ra
Khóa học 6 tuần dành cho người đã biết biến, điều kiện, vòng lặp, hàm, list/dict và đọc thông báo lỗi Python. Thời lượng dự kiến 36 giờ gồm 24 giờ cho 12 bài và khoảng 12 giờ ôn, quiz, dự án. Tốc độ thực tế tùy nền tảng; người chưa tự viết được hàm lọc danh sách nên ôn Python cơ bản trước. Đây là chương trình tự học có bài tập và kiểm tra, không gắn với chứng nhận nghề nghiệp hoặc tín chỉ của một tổ chức đào tạo.

Sau khóa học, người học có thể diễn đạt bất biến dữ liệu; tạo lớp với API nhỏ; giải thích tham chiếu và quyền sở hữu mutable; phân biệt composition với kế thừa; dùng dataclass, property, ABC phù hợp; thiết kế lỗi nghiệp vụ; viết unittest; lưu/tải dữ liệu JSON có xác thực; và hoàn thành một CLI mà người khác chạy lại được. Học viên phải giải thích được quyết định của mình, không chỉ chạy bản lời giải.

## Chuẩn bị môi trường
- Cài Python 3.12 trở lên, kiểm tra `python --version`; Windows có thể dùng `py -3.12 --version`.
- Tạo thư mục học riêng, dùng trình soạn thảo hỗ trợ UTF-8. Không cần MySQL, tài khoản đám mây hay thư viện ngoài.
- Tùy chọn tạo môi trường ảo bằng `python -m venv .venv`; các ví dụ sử dụng thư viện chuẩn nên không có gói bắt buộc phải tải.
- Mỗi bài dùng một file example.py riêng. Ghi phiên bản và lệnh trong nhật ký; test file luôn dùng thư mục tạm.
- Có thể làm hoàn toàn offline sau khi tải giáo trình và bộ mã; các liên kết cuối bài phục vụ tra cứu thêm.

## Lộ trình 6 tuần
1. Tuần 1: lớp, đối tượng, tham chiếu; constructor và bất biến. Sản phẩm là Book bảo vệ số lượng, bảng dữ liệu biên và sơ đồ tham chiếu.
2. Tuần 2: dữ liệu lớp/thực thể, mutable dùng chung, property. Sản phẩm là hai kho độc lập và API đọc trạng thái không vô tình sửa dữ liệu.
3. Tuần 3: composition, dịch vụ danh mục, dataclass. Sản phẩm là Library chứa Book cùng một kiểu biên nhận giá trị có kiểm tra.
4. Tuần 4: kế thừa, hợp đồng thay thế, duck typing và ABC. Sản phẩm là các policy/repository khác nhau qua cùng bộ kiểm tra hợp đồng.
5. Tuần 5: ngoại lệ, unittest và kiểm tra biên. Sản phẩm là bộ test bao phủ thành công, lỗi và trạng thái sau lỗi; chứng minh test bắt được một lỗi cố ý trên bản sao.
6. Tuần 6: JSON, CLI và dự án. Sản phẩm là thư viện chạy được, file dữ liệu mẫu, README, log test và bảng nghiệm thu.

Mỗi tuần đọc hai bài, dự đoán trước khi chạy ví dụ, tự làm bài tập trước khi xem hướng giải, ghi một lỗi đã sửa và làm quiz. Nếu quiz thấp hơn 70%, quay lại các câu sai và ví dụ liên quan rồi thử bài vận dụng khác; thuộc đáp án không thay cho việc hiểu hành vi.

## Cách dùng bài kiểm tra
Mỗi bài có 5 câu trắc nghiệm độc lập để kiểm tra thuật ngữ và suy luận ngắn, các chương ghép phần luyện của hai bài. Các câu có giải thích sau khi nộp; hãy ghi lý do chọn trước khi xem đáp án. Điểm quiz phản ánh phần câu hỏi đã làm, không tự chứng nhận kỹ năng lập trình. Khi hệ thống có đủ 5 câu khác nhau cho một phần, tỷ lệ dưới 70% được dùng làm tín hiệu nên ôn; với ít câu, cần thêm căn cứ.

Đánh giá hoàn thành khóa học đề xuất: quiz đạt từ 70% và dự án đạt từ 70/100, đồng thời mọi yêu cầu trọng yếu đều đạt. Điểm dự án do giảng viên hoặc người review xem bằng chứng; hệ thống hiện không tự chấm mã nguồn theo rubric này. Nếu tự học, dùng checklist và nhờ người khác tái hiện chương trình trước khi tự đánh dấu hoàn thành. Không dùng tổng điểm để che một lỗi làm mất dữ liệu hoặc số lượng âm.

## Đề bài dự án cuối khóa
Xây dựng thư viện CLI một người dùng, dữ liệu nhỏ. Mỗi đầu sách có code duy nhất, title không rỗng, total là số nguyên không âm, available từ 0 tới total. Hỗ trợ add/list/borrow/return; từ chối mã trùng, mã không có, hết sách, trả dư, dữ liệu sai và file JSON hỏng. Lệnh sai giữ nguyên file hiện có. Không lưu tên độc giả, tài khoản hay dữ liệu thật. Thao tác cùng lúc từ nhiều tiến trình nằm ngoài hợp đồng này.

Tách Book, Library, JsonRepository và main; có thể đổi tên nếu trách nhiệm vẫn rõ. Ghi schema_version, xác thực dữ liệu lúc tải, ghi file tạm cùng thư mục rồi replace. Không coi kỹ thuật ghi này là giao dịch đa người dùng. README phải nói cách sao lưu file khi thử lỗi, giới hạn 1 MB của bản tham khảo và giới hạn thao tác tuần tự.

## Rubric 100 điểm và bằng chứng
- Đúng nghiệp vụ và bất biến: 30 điểm. Có ca thành công, hết sách, trả dư, mã trùng; trạng thái sau lỗi đúng. Yêu cầu trọng yếu: không âm, không vượt tổng, không ghi mất file hỏng.
- Thiết kế hướng đối tượng: 15 điểm. Trách nhiệm lớp rõ, composition hợp lý, tránh mutable toàn cục; giải thích được một lựa chọn không dùng kế thừa.
- Lưu/tải dữ liệu: 15 điểm. JSON UTF-8, version rõ, kiểm tra trường/kiểu/miền/mã trùng, round-trip đúng; lỗi tải không tạo thành công giả.
- Kiểm thử: 20 điểm. Unit test độc lập, có test biên và test giữ nguyên file sau lệnh sai; có log test và một ví dụ chứng minh test phát hiện lỗi.
- Khả năng sử dụng và tái hiện: 10 điểm. README đủ môi trường/lệnh, thông báo rõ, mã thoát đúng, người khác chạy được từ thư mục mới.
- Giải thích và mở rộng: 10 điểm. Trình bày giới hạn, thêm search chỉ đọc có test và trả lời thay đổi yêu cầu nhỏ mà không phá test cũ.

Hồ sơ nộp gồm mã nguồn, test, README, dữ liệu mẫu không nhạy cảm, log test, bảng 8–12 ca CLI và một trang giải thích quyết định thiết kế. Nếu không đạt một yêu cầu trọng yếu, sửa và chạy nghiệm thu lại trước khi đánh dấu đạt, dù tổng điểm tạm thời trên 70.

## Bộ mã tham khảo và lệnh tái hiện
Lưu các file đi kèm vào cùng một thư mục mới. Chạy từ thư mục đó:
```text
python -m unittest -v
python library_cli.py --data sandbox-library.json add PY01 "Học Python" 2
python library_cli.py --data sandbox-library.json list
python library_cli.py --data sandbox-library.json borrow PY01
python library_cli.py --data sandbox-library.json list
python library_cli.py --data sandbox-library.json return PY01
```
Kết quả list sau lần mượn là `PY01 | Học Python | 1/2`, sau trả là `2/2`. Thử mã không có phải trả mã thoát 2; dùng file tạm để thử JSON hỏng. Bản tham khảo có thể dùng để đối chiếu sau khi tự làm, không thay bài bảo vệ và kiểm tra vận dụng.

## Tài liệu chính thức và cách tra cứu
- Python classes: https://docs.python.org/3.12/tutorial/classes.html
- Dataclasses: https://docs.python.org/3.12/library/dataclasses.html
- ABC: https://docs.python.org/3.12/library/abc.html
- Errors: https://docs.python.org/3.12/tutorial/errors.html
- Unittest: https://docs.python.org/3.12/library/unittest.html
- JSON: https://docs.python.org/3.12/library/json.html
- Argparse: https://docs.python.org/3.12/library/argparse.html

Giáo trình và bài tập được biên soạn riêng cho lộ trình này; các liên kết giúp đối chiếu API chuẩn. Khi dùng phiên bản Python khác, đọc tài liệu tương ứng và ghi lại khác biệt thực tế trong nhật ký. Phạm vi nền tảng của khóa không bao gồm web framework, cơ sở dữ liệu nhiều người dùng, triển khai dịch vụ hay chứng nhận bảo mật ứng dụng.
"""


COURSE = dict(
    title="Python hướng đối tượng: từ mô hình đến ứng dụng CLI",
    slug="python-huong-doi-tuong-thuc-hanh",
    level="intermediate",
    description="Lộ trình 6 tuần, 6 chương và 12 bài thực hành Python OOP: thiết kế lớp, bất biến, composition, dataclass, kế thừa, đa hình, kiểm thử và lưu JSON. Có 60 câu hỏi nền tảng, mã ví dụ chạy được và dự án thư viện CLI kèm rubric, bộ test và hướng dẫn tái hiện. Yêu cầu đã học cú pháp Python cơ bản.",
    prerequisites=["Viết được hàm, vòng lặp, điều kiện và xử lý list/dict trong Python.",
                   "Biết chạy file Python và đọc traceback cơ bản.",
                   "Có Python 3.12+ và trình soạn thảo UTF-8; không cần thư viện ngoài."],
    outcomes=["Thiết kế lớp có bất biến và API rõ ràng.",
              "Phân biệt dữ liệu riêng/dùng chung và quản lý tham chiếu mutable.",
              "Chọn composition, dataclass, property và kế thừa theo hợp đồng.",
              "Viết lỗi nghiệp vụ và unittest cho các tình huống biên.",
              "Lưu/tải JSON có xác thực và tích hợp CLI dùng lại được.",
              "Nghiệm thu một dự án nhỏ bằng bằng chứng và rubric."],
    duration_hours=36,
    handbook=HANDBOOK,
    project_files={
        "library_cli.py": dedent(PROJECT_CODE).lstrip(),
        "test_library_cli.py": dedent(PROJECT_TESTS).lstrip(),
        "README.md": """# Thư viện CLI — dự án Python OOP

Python 3.12+, chỉ thư viện chuẩn. Chạy `python -m unittest -v` trước khi dùng.

```text
python library_cli.py --data sandbox-library.json add PY01 "Học Python" 2
python library_cli.py --data sandbox-library.json list
python library_cli.py --data sandbox-library.json borrow PY01
python library_cli.py --data sandbox-library.json return PY01
```

Dữ liệu UTF-8 ở file do --data chỉ định, mặc định library.json. Lệnh sai trả mã thoát 2 và không lưu dữ liệu. Đường dẫn thư mục cha phải tồn tại và ghi được. Dùng file thử riêng; sao lưu trước khi sửa JSON bằng tay.

Giới hạn: một người chạy tuần tự một lệnh tại một thời điểm, file không quá 1 MB, không quản lý độc giả, không có xác thực hay giao dịch nhiều tiến trình. File tạm rồi replace không thay khóa đồng thời. Đây là dự án nền tảng để học mô hình và kiểm thử.

Hãy tự bổ sung lệnh search chỉ đọc và test theo đề bài. Rubric trong sổ tay khóa học chấm nghiệp vụ, thiết kế, lưu trữ, test và khả năng tái hiện.
""",
    },
    chapters=[
        dict(title="Mô hình đối tượng và trạng thái hợp lệ", lessons=[L1, L2]),
        dict(title="Quyền sở hữu dữ liệu và đóng gói", lessons=[L3, L4]),
        dict(title="Composition và đối tượng giá trị", lessons=[L5, L6]),
        dict(title="Kế thừa và đa hình theo hợp đồng", lessons=[L7, L8]),
        dict(title="Xử lý lỗi và kiểm thử có căn cứ", lessons=[L9, L10]),
        dict(title="Lưu trữ và dự án thư viện CLI", lessons=[L11, L12]),
    ],
)
