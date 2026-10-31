"""Original practice guides for the ten existing courses; preserve lesson PDFs."""

SPECS = {
    'python-co-ban': dict(
        prerequisites='Máy tính có Python 3.12 trở lên; biết tạo thư mục, mở terminal và lưu file UTF-8.',
        outcomes=['Phân tích dữ liệu đầu vào và chọn list/dict phù hợp.', 'Tách xử lý thành hàm, kiểm tra đầu vào và giải thích ngoại lệ.', 'Tổ chức chương trình nhỏ có lớp, lưu dữ liệu và kiểm thử được.'],
        project='Sổ thu chi cá nhân trên dòng lệnh',
        scenario='Một sinh viên cần ghi các khoản thu/chi và xem tổng theo loại. Mỗi giao dịch có mã duy nhất, loại thu hoặc chi, số tiền nguyên dương tính bằng đồng và mô tả. Chương trình phục vụ một người, chạy cục bộ; dữ liệu thử không chứa thông tin tài chính thật.',
        checkpoints=[('Mô hình dữ liệu', 'Chuẩn bị 8 giao dịch gồm thu, chi, hai khoản cùng loại và dữ liệu sai. Viết hàm kiểm tra số tiền dương; từ chối số âm và chuỗi không phải số. Ghi rõ dùng số nguyên đồng để tránh sai số số thực.'), ('Hàm nghiệp vụ', 'Viết add_transaction, total_by_type và balance. Truyền danh sách vào hàm thay vì phụ thuộc biến toàn cục. Với thu 200000 và chi 35000, số dư là 165000. Tạo dữ liệu mới cho từng test.'), ('Đối tượng và lưu trữ', 'Tạo Ledger quản lý giao dịch; lưu JSON với UTF-8. Khi mở lại phải giữ mã giao dịch. File chưa có tạo danh sách rỗng; file hỏng phải thông báo rõ và giữ bản gốc.'), ('Hoàn thiện giao diện', 'Làm menu thêm/xem/tổng kết/thoát. Bắt lỗi nhập số tại ranh giới giao diện, không nuốt mọi Exception trong nghiệp vụ. Viết README chạy bằng python main.py và cung cấp dữ liệu mẫu.')],
        acceptance=['Thêm đúng 8 giao dịch và không nhận mã trùng.', 'Dữ liệu rỗng cho tổng 0.', 'Sai số tiền được từ chối mà danh sách không thay đổi.', 'Tổng thu trừ tổng chi đúng với bảng tính tay.', 'Ghi rồi đọc JSON giữ đủ trường và dấu tiếng Việt.', 'Có ít nhất 8 assert cho luồng đúng, lỗi và dữ liệu biên.'],
        example='''```python
def balance(rows):
    return sum(r["amount"] if r["kind"] == "income" else -r["amount"] for r in rows)

rows = [{"kind": "income", "amount": 200000}, {"kind": "expense", "amount": 35000}]
assert balance(rows) == 165000
assert balance([]) == 0
print(balance(rows))  # 165000
```''',
        references=['https://docs.python.org/3.12/tutorial/controlflow.html', 'https://docs.python.org/3.12/tutorial/datastructures.html', 'https://docs.python.org/3.12/library/json.html']),
    'javascript-tu-zero-den-hero': dict(
        prerequisites='Biết HTML cơ bản; dùng trình duyệt có DevTools và trình soạn thảo; chạy ví dụ trong thư mục riêng.',
        outcomes=['Tách dữ liệu JavaScript khỏi thao tác DOM.', 'Xử lý sự kiện và trạng thái giao diện có thể kiểm tra.', 'Thực hiện tác vụ bất đồng bộ với loading/error rõ ràng.'],
        project='Bảng theo dõi bài học bằng JavaScript thuần',
        scenario='Học viên quản lý danh sách bài tự học gồm id, tên, thời lượng và trạng thái hoàn thành. Màn hình cho thêm bài, đánh dấu đã học, tìm kiếm và xem số phút còn lại. Dữ liệu được lưu cục bộ trong trình duyệt để thực hành.',
        checkpoints=[('Dữ liệu và hàm thuần', 'Tạo 6 bài mẫu và hàm lọc theo tên không phân biệt hoa thường. Tính tổng phút của bài chưa hoàn thành. Sao chép dữ liệu trước khi thay đổi trong test để tránh test phụ thuộc thứ tự.'), ('DOM và sự kiện', 'Render danh sách bằng createElement/textContent. Liên kết label với input; xử lý submit bằng preventDefault. Tên chứa <b> phải hiển thị như văn bản; không chèn chuỗi người dùng bằng innerHTML.'), ('Lưu và phục hồi', 'Lưu danh sách vào localStorage sau thao tác thành công. Bao JSON.parse trong khối xử lý lỗi phù hợp; khi dữ liệu cũ không đúng cấu trúc phải thông báo và cho phép tạo bộ mẫu mới có xác nhận.'), ('Bất đồng bộ và nghiệm thu', 'Tạo hàm nạp mẫu trả Promise rồi mô phỏng lỗi có kiểm soát. Trong khi nạp vô hiệu hóa nút nạp; khi lỗi hiện nút thử lại, không tự thêm trùng dữ liệu. Kiểm tra bàn phím và màn hình hẹp.')],
        acceptance=['Danh sách 6 bài hiển thị theo dữ liệu.', 'Tên rỗng và thời lượng không dương được báo lỗi.', 'Đánh dấu hoàn thành cập nhật tổng phút đúng.', 'Tìm kiếm không làm mất trạng thái bài.', 'Tải lại trang giữ dữ liệu hợp lệ.', 'Loading, rỗng và lỗi đều có thông báo dễ hiểu.'],
        example='''```javascript
const lessons = [{id: 1, minutes: 30, done: false}, {id: 2, minutes: 45, done: true}];
const remaining = rows => rows.filter(x => !x.done).reduce((sum, x) => sum + x.minutes, 0);
console.assert(remaining(lessons) === 30);
console.assert(remaining([]) === 0);
console.log(remaining(lessons)); // 30
```''',
        references=['https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', 'https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement', 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage']),
    'lap-trinh-java-can-ban': dict(
        prerequisites='Cài JDK có javac; biết biến, điều kiện và vòng lặp; chọn một phiên bản JDK cố định cho cả nhóm.',
        outcomes=['Mô hình hóa thực thể và bảo vệ bất biến qua constructor.', 'Dùng interface và collection cho nghiệp vụ nhỏ.', 'Phân biệt lỗi đầu vào, lỗi nghiệp vụ và lỗi lưu file.'],
        project='Quản lý mượn sách bằng Java',
        scenario='Thư viện nhỏ lưu sách theo mã, tên và số bản còn. Cho phép mượn, trả và tra cứu; không xử lý thanh toán hoặc nhiều người dùng đồng thời. Một lượt mượn phải tham chiếu sách tồn tại và không làm số bản còn âm.',
        checkpoints=[('Thiết kế lớp', 'Vẽ Book, Loan, Library và trách nhiệm mỗi lớp. Book không cho mã rỗng hoặc số lượng âm. Constructor phải đảm bảo đối tượng tạo xong ở trạng thái hợp lệ.'), ('Collection và hợp đồng', 'Dùng Map<String,Book> để tra mã; mô tả cách xử lý trùng mã bằng lỗi rõ ràng. Interface Repository chỉ khai báo thao tác cần dùng. Chưa cần tạo cây kế thừa nếu composition đã đủ.'), ('Ngoại lệ và lưu file', 'Khi mượn mã không có hoặc hết sách, trả lỗi nghiệp vụ xác định. Dùng try-with-resources cho luồng file; giữ thông báo phân biệt lỗi dữ liệu với lỗi IO. Tài liệu hóa giới hạn định dạng CSV nếu dùng CSV đơn giản.'), ('Kiểm thử và bàn giao', 'Viết lớp chạy test với assertions hoặc framework đã chọn; hướng dẫn bật -ea nếu dùng assert Java. Có ca mượn thành công, hết sách, trả sai mã và round-trip lưu/đọc.')],
        acceptance=['Mã sách duy nhất.', 'Mượn giảm đúng một bản; trả tăng đúng một bản.', 'Hết sách không tạo Loan mới.', 'Không để lớp giao diện sửa trực tiếp collection nội bộ.', 'Đọc dữ liệu lỗi có thông báo và giữ dữ liệu cũ.', 'Người khác chạy được theo README trên JDK đã ghi.'],
        example='''```java
import java.util.Map;
public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stock = Map.of("B01", 3, "B02", 0);
        if (stock.getOrDefault("B01", 0) != 3) throw new AssertionError();
        if (stock.getOrDefault("UNKNOWN", 0) != 0) throw new AssertionError();
        System.out.println("B01: " + stock.get("B01"));
    }
}
```
Lưu thành Main.java, chạy javac Main.java rồi java Main. Kết quả: B01: 3. Đây là kiểm tra tra cứu, chưa thay thế toàn bộ Library.''',
        references=['https://dev.java/learn/classes-objects/', 'https://dev.java/learn/collections-framework/', 'https://dev.java/learn/exceptions/']),
    'html-css-nhap-mon': dict(
        prerequisites='Biết tạo file index.html và style.css; trình duyệt có DevTools; không cần framework.',
        outcomes=['Tạo cấu trúc HTML có ý nghĩa và điều hướng bằng bàn phím.', 'Thiết kế bố cục bằng Flexbox/Grid và xử lý nội dung dài.', 'Kiểm tra responsive, biểu mẫu và trạng thái focus.'],
        project='Trang giới thiệu một khóa học có thể truy cập',
        scenario='Thiết kế trang giới thiệu khóa học gồm tiêu đề, đầu ra học tập, đề cương, giảng viên và biểu mẫu đăng ký nhận thông tin. Dùng nội dung tự viết, ảnh tự có quyền sử dụng; biểu mẫu chỉ minh họa phía trình duyệt nếu chưa có server.',
        checkpoints=[('Nội dung và cấu trúc', 'Phác thảo thứ tự đọc; dùng một h1 chính, các h2 cho mục lớn. Có header, nav, main, footer và link bỏ qua điều hướng. Đặt mục tiêu nội dung trước khi trang trí.'), ('Bố cục cơ sở', 'Dùng box-sizing:border-box và chiều rộng nội dung tối đa. Tạo lưới hai cột khi đủ không gian, một cột khi hẹp. Kiểm tra tên khóa dài, không chỉ tên mẫu ngắn.'), ('Biểu mẫu và tương tác', 'Mỗi input có label và kiểu phù hợp. Button dùng cho hành động, a dùng cho điều hướng. Hiện focus rõ và không truyền thông tin chỉ bằng màu. Mô tả chỗ nhận dữ liệu thật nếu sau này tích hợp backend.'), ('Kiểm tra chất lượng', 'Kiểm tra ở chiều rộng 360, 768 và 1280 CSS px; zoom 200%; đi hết form bằng Tab/Shift+Tab. Chụp bằng chứng, ghi lỗi và sửa rồi chạy lại các ca đã lỗi.')],
        acceptance=['Thứ tự tiêu đề hợp lý và nội dung đọc được khi tắt CSS.', 'Không cuộn ngang ngoài ý muốn ở 360px.', 'Form nhập được hoàn toàn bằng bàn phím.', 'Focus luôn nhận biết được.', 'Ảnh có alt phù hợp hoặc alt rỗng khi trang trí.', 'Không có liên kết điều hướng vô nghĩa chỉ trỏ #.'],
        example='''```html
<form>
  <label for="email">Email nhận thông tin</label>
  <input id="email" name="email" type="email" autocomplete="email" required>
  <button type="submit">Kiểm tra biểu mẫu</button>
</form>
```
Đầu ra mong đợi: trình duyệt liên kết nhãn với trường email và ngăn submit khi trường rỗng hoặc không đúng kiểu email. Ví dụ chưa lưu dữ liệu; cần server hoặc xử lý submit nếu muốn đăng ký thực sự.''',
        references=['https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout', 'https://www.w3.org/WAI/tutorials/forms/labels/']),
    'reactjs-chuyen-sau': dict(
        prerequisites='Đã học JavaScript ES6, array methods, Promise và HTML/CSS; dùng React theo phiên bản package của dự án.',
        outcomes=['Thiết kế component có trách nhiệm rõ ràng và state tối thiểu.', 'Xử lý form, danh sách, loading/error và cập nhật bất biến.', 'Dùng effect cho đồng bộ bên ngoài và kiểm tra tương tác.'],
        project='Bảng kế hoạch học tập bằng React',
        scenario='Ứng dụng quản lý kế hoạch gồm khóa học, mục tiêu tuần và trạng thái bài. Người dùng thêm mục, lọc theo khóa, đánh dấu xong và xem số mục còn lại. Dùng API giả lập có độ trễ/lỗi để luyện hành vi bất đồng bộ có thể lặp lại.',
        checkpoints=[('Phân chia component', 'Vẽ StudyApp, StudyForm, FilterBar, StudyList và StudyItem. Chọn nơi sở hữu state; số bài còn lại được tính từ state, tránh lưu bản sao cần đồng bộ.'), ('State và form', 'Mỗi bản ghi có id ổn định. Dùng controlled input, trim tiêu đề và kiểm tra không rỗng. Cập nhật bằng map/filter hoặc tạo mảng mới; kiểm tra thêm hai bản ghi tên giống nhau vẫn sửa đúng bản.'), ('Effect và dữ liệu', 'Effect tải dữ liệu cần xử lý việc phản hồi đến muộn khi đổi khóa. Ghi rõ trạng thái loading, empty và error. Không dùng effect để tính mọi biến dẫn xuất hoặc tự tạo vòng gọi API.'), ('Kiểm thử và tối ưu', 'Test theo hành vi người dùng: thêm, lọc, hoàn thành, lỗi và thử lại. Chỉ tối ưu sau khi có bằng chứng render chậm; không bọc mọi hàm bằng memoization như một nghi thức.')],
        acceptance=['Thêm/sửa/xóa đúng bản ghi dù tiêu đề trùng.', 'Bộ lọc không làm mất dữ liệu gốc.', 'Tổng còn lại khớp danh sách.', 'Phản hồi cũ không ghi đè khóa vừa chọn.', 'Có giao diện tải, rỗng, lỗi và thử lại.', 'Test không chỉ kiểm tra tên class CSS.'],
        example='''```javascript
const toggle = (rows, id) => rows.map(row => row.id === id ? {...row, done: !row.done} : row);
const before = [{id: 1, done: false}, {id: 2, done: false}];
const after = toggle(before, 2);
console.assert(before[1].done === false);
console.assert(after[1].done === true);
console.assert(after[0] === before[0]);
```
Đây là hàm JavaScript thuần dùng trong cập nhật state: setRows(rows => toggle(rows, id)).''',
        references=['https://react.dev/learn/thinking-in-react', 'https://react.dev/learn/updating-arrays-in-state', 'https://react.dev/learn/synchronizing-with-effects']),
    'mysql-thiet-ke-csdl': dict(
        prerequisites='MySQL 8.4 và client; quyền tạo một database thực hành riêng; biết SELECT và khóa chính.',
        outcomes=['Thiết kế lược đồ có ràng buộc phù hợp nghiệp vụ.', 'Viết JOIN và tổng hợp tránh đếm trùng.', 'Dùng transaction, chỉ mục và EXPLAIN có căn cứ.'],
        project='Cơ sở dữ liệu đăng ký khóa học',
        scenario='Thiết kế students, courses và enrollments cho trung tâm nhỏ. Một học viên chỉ ghi danh một lần cho một khóa. Dữ liệu thử gồm 5 học viên, 3 khóa và 8 ghi danh, có học viên chưa ghi danh và khóa chưa có ai học.',
        checkpoints=[('ERD và ràng buộc', 'Ghi cardinality rồi tạo khóa chính/ngoại. Enrollments có UNIQUE(student_id,course_id). Phân biệt thiếu giá trị với chuỗi rỗng; chọn kiểu tiền chính xác nếu bổ sung học phí.'), ('Dữ liệu và truy vấn', 'Nạp dữ liệu có kiểm soát trong database thực hành riêng. Viết LEFT JOIN giữ khóa không có ghi danh. Đối chiếu COUNT(e.id) với COUNT(*) để thấy vì sao hàng NULL gây khác biệt.'), ('Transaction và cạnh tranh', 'Thử hai phiên cùng thêm một cặp ghi danh. Ràng buộc duy nhất phải chặn trùng dù cả hai phiên đã kiểm tra trước. Dùng transaction cho một nghiệp vụ nhiều bước; thử rollback trong dữ liệu thử.'), ('Hiệu năng và bàn giao', 'Dùng EXPLAIN cho truy vấn theo student_id và course_id. Giải thích dựa trên truy vấn thực tế trước khi thêm chỉ mục. Có script schema, sample_data và queries chạy theo thứ tự trên database riêng.')],
        acceptance=['Ràng buộc FK chặn tham chiếu không tồn tại.', 'Không thể ghi danh trùng một cặp.', 'Báo cáo vẫn hiện khóa chưa có học viên.', 'Tổng ghi danh khớp dữ liệu kiểm tra bằng tay.', 'Rollback không để lại nghiệp vụ nửa chừng.', 'README ghi rõ database thử và không yêu cầu xóa dữ liệu thật.'],
        example='''```sql
SELECT c.id, c.title, COUNT(e.id) AS enrollment_count
FROM courses AS c
LEFT JOIN enrollments AS e ON e.course_id = c.id
GROUP BY c.id, c.title
ORDER BY c.id;
```
Chạy trong schema thực hành có hai bảng tương ứng. Khóa chưa có ghi danh phải hiện enrollment_count = 0; COUNT(*) ở truy vấn này sẽ cho 1 với hàng được bù NULL.''',
        references=['https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html', 'https://dev.mysql.com/doc/refman/8.4/en/commit.html', 'https://dev.mysql.com/doc/refman/8.4/en/using-explain.html']),
    'os': dict(
        prerequisites='Biết biến, hàm và vòng lặp; hiểu file, tiến trình ở mức sử dụng; bài mô phỏng dùng Python 3.12+.',
        outcomes=['Phân biệt chương trình, tiến trình và tiểu trình.', 'Mô phỏng lịch chạy và tính chỉ số theo quy ước rõ ràng.', 'Phân tích race condition và điều kiện đồng bộ.'],
        project='Mô phỏng điều phối CPU và phân tích đồng bộ',
        scenario='Viết chương trình mô phỏng FCFS cho các công việc có mã, thời điểm đến và CPU burst. Sau đó phân tích một biến đếm chia sẻ với hai tiểu trình bằng các bước xen kẽ trên giấy. Đây là mô hình học tập, không phải công cụ đo hiệu năng hệ điều hành thật.',
        checkpoints=[('Giả định và dữ liệu', 'Dùng A(arrival=0,burst=3), B(1,2), C(6,1). Burst dương, arrival không âm; hòa arrival giải theo thứ tự nhập. Ghi rõ một CPU, không preemption và bỏ qua chi phí chuyển ngữ cảnh.'), ('Mô phỏng lịch', 'Với FCFS: A chạy 0–3, B chạy 3–5, CPU rỗi 5–6, C chạy 6–7. Không bắt đầu C ở thời điểm 5 khi nó chưa đến. Lưu start và finish để tính waiting=start-arrival.'), ('Đồng bộ', 'Vẽ read-modify-write của hai phép tăng cùng biến, chỉ ra cách mất cập nhật. Đề xuất vùng tới hạn và khóa; phân biệt tính đúng với số lần chạy thử không thấy lỗi. Không khẳng định GIL giải quyết mọi race.'), ('Phân tích và nghiệm thu', 'So sánh bộ dữ liệu đảo burst và thời điểm đến. Tính trung bình waiting/turnaround bằng tay rồi đối chiếu. Viết báo cáo giới hạn mô hình, không dùng kết quả mô phỏng để kết luận CPU thật nhanh/chậm.')],
        acceptance=['Khoảng CPU rỗi được giữ đúng.', 'Burst âm hoặc arrival âm bị từ chối.', 'Mỗi công việc chạy đủ burst đúng một lần.', 'Waiting của A,B,C lần lượt 0,2,0.', 'Turnaround lần lượt 3,4,1.', 'Báo cáo có một lịch xen kẽ gây mất cập nhật và cách bảo vệ.'],
        example='''```python
jobs = [("A", 0, 3), ("B", 1, 2), ("C", 6, 1)]
clock, waiting = 0, []
for name, arrival, burst in jobs:
    start = max(clock, arrival)
    waiting.append(start - arrival)
    clock = start + burst
assert waiting == [0, 2, 0]
assert clock == 7
print(waiting)  # [0, 2, 0]
```''',
        references=['https://pages.cs.wisc.edu/~remzi/OSTEP/', 'https://docs.python.org/3.12/library/threading.html']),
    'mang-may-tinh-co-ban': dict(
        prerequisites='Biết sử dụng máy tính và terminal; làm truy vấn DNS/HTTP trên dịch vụ được phép; không quét mạng bên ngoài.',
        outcomes=['Tính mạng con IPv4 và giải thích địa chỉ gateway.', 'Phân biệt lỗi DNS, kết nối và HTTP bằng bằng chứng.', 'Lập sơ đồ và kế hoạch kiểm tra mạng LAN nhỏ.'],
        project='Thiết kế mạng phòng học và hồ sơ chẩn đoán',
        scenario='Phòng học có 25 máy học viên, 1 máy giảng viên, 1 máy in và 1 gateway. Chọn một mạng con có ít nhất 28 địa chỉ host dùng được, dự phòng theo yêu cầu và mô tả cách truy cập website học. Chỉ mô phỏng sơ đồ và kiểm tra trên máy của người học.',
        checkpoints=[('Địa chỉ hóa', 'Đề xuất 192.168.50.0/27: network .0, broadcast .31, host .1–.30. Cấp gateway .1, máy giảng viên .2, máy in .3 và DHCP .4–.28; ghi rõ còn .29–.30 dự phòng. Nhu cầu tăng thêm vượt 30 host cần thiết kế lại.'), ('Thiết bị và dịch vụ', 'Vẽ switch, router, AP và phạm vi LAN. Tách chức năng DHCP cấp cấu hình khỏi DNS phân giải tên. Mô tả ARP trong LAN và next-hop khi đích ngoài mạng con.'), ('Ca chẩn đoán', 'Soạn ba ca: sai gateway, resolver không phản hồi, HTTP 500. Ghi quan sát mong đợi ở mỗi bước. Ping thất bại không đủ kết luận máy đích tắt vì ICMP có thể bị chặn.'), ('Bàn giao', 'Nộp sơ đồ, bảng địa chỉ, quy trình cấp máy mới và bảng bằng chứng. Chỉ sử dụng hostname mẫu hoặc dịch vụ được phép; không chia sẻ địa chỉ nội bộ thật nếu không cần.')],
        acceptance=['Không cấp network/broadcast cho máy.', 'Không trùng IP giữa DHCP và địa chỉ tĩnh.', 'Đủ 28 host và mô tả dự phòng.', 'Phân biệt switch L2 với router.', 'Phân biệt DNS thành công với HTTP thành công.', 'Có quy trình kiểm tra thay vì chỉ đề xuất khởi động lại.'],
        example='''```python
import ipaddress
net = ipaddress.ip_network("192.168.50.0/27")
assert str(net.network_address) == "192.168.50.0"
assert str(net.broadcast_address) == "192.168.50.31"
assert len(list(net.hosts())) == 30
print(net.num_addresses)  # 32 địa chỉ tổng cộng
```''',
        references=['https://www.rfc-editor.org/rfc/rfc1918.html', 'https://www.rfc-editor.org/rfc/rfc9110.html', 'https://docs.python.org/3.12/library/ipaddress.html']),
    'cau-truc-du-lieu-giai-thuat-co-ban': dict(
        prerequisites='Biết hàm, list, dict và vòng lặp Python; phân biệt số phép toán với thời gian đo thực tế.',
        outcomes=['Chọn cấu trúc dữ liệu theo thao tác cần hỗ trợ.', 'Giải thích điều kiện áp dụng tìm kiếm/sắp xếp.', 'Dùng test biên và phân tích độ phức tạp cho thuật toán.'],
        project='Bộ tra cứu danh mục và tìm đường trong đồ thị nhỏ',
        scenario='Danh mục có mã sản phẩm duy nhất, tên và giá nguyên. Cần tra mã, sắp xếp giá và tìm đường ít cạnh trong đồ thị kệ hàng không trọng số. Tập dữ liệu thử gồm phần tử trùng tên, giá bằng nhau và một đỉnh không kết nối.',
        checkpoints=[('Tra cứu', 'Dùng dict theo mã; so sánh với quét list theo số phép so sánh. Không kết luận O(1) nghĩa là mất đúng một nano giây. Mô tả giả định băm và trường hợp thiếu mã.'), ('Sắp xếp và tìm kiếm', 'Dùng khóa (price,id) cho thứ tự ổn định theo yêu cầu. Binary search chỉ dùng khi danh sách đã sắp theo đúng khóa. Có test rỗng, một phần tử, đầu/cuối và không tìm thấy.'), ('Duyệt đồ thị', 'BFS dùng queue và visited; ghi parent khi phát hiện đỉnh để dựng đường. Trong đồ thị không trọng số, đường ít cạnh là tiêu chí; không áp dụng máy móc cho cạnh có trọng số.'), ('Đo và báo cáo', 'Đếm số thao tác trên n=10,100,1000 và giải thích xu hướng. Khi đo thời gian, chạy lặp và ghi môi trường. Test tính đúng phải có trước benchmark.')],
        acceptance=['Không mất phần tử khi tên/giá trùng.', 'Kết quả sort theo khóa đã công bố.', 'Binary search trả trường hợp không có rõ ràng.', 'BFS không lặp vô hạn trên chu trình.', 'Đỉnh không nối báo không có đường.', 'Báo cáo phân biệt độ phức tạp và thời gian cụ thể.'],
        example='''```python
from collections import deque
graph = {"A": ["B", "C"], "B": ["D"], "C": [], "D": []}
queue, seen, order = deque(["A"]), {"A"}, []
while queue:
    node = queue.popleft()
    order.append(node)
    for nxt in graph[node]:
        if nxt not in seen:
            seen.add(nxt)
            queue.append(nxt)
assert order == ["A", "B", "C", "D"]
```''',
        references=['https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', 'https://docs.python.org/3.12/library/collections.html#collections.deque', 'https://docs.python.org/3.12/library/bisect.html']),
    'kiem-thu-phan-mem-nhap-mon': dict(
        prerequisites='Hiểu luồng website và HTTP cơ bản; có một bản ứng dụng thử hoặc đặc tả để kiểm thử, không dùng giao dịch thật.',
        outcomes=['Chuyển yêu cầu thành tiêu chí chấp nhận và test case.', 'Chọn test theo biên, phân vùng và bảng quyết định.', 'Viết báo cáo lỗi, truy vết và báo cáo kết quả có giới hạn rõ.'],
        project='Hồ sơ kiểm thử chức năng ghi danh khóa học',
        scenario='Đặc tả: học viên đang hoạt động được ghi danh khóa xuất bản; cùng một cặp học viên/khóa chỉ có một ghi danh. Khóa trả phí cần thanh toán đã xác nhận; khóa miễn phí không cần thanh toán. Người dùng không được ghi danh thay người khác.',
        checkpoints=[('Review yêu cầu', 'Đặt mã R01–R06 cho quyền, trạng thái khóa, trùng ghi danh, miễn phí, thanh toán và tính nguyên tử. Ghi các câu hỏi chưa rõ như khóa bị lưu trữ sau khi đã mua; không tự coi giả định là yêu cầu được duyệt.'), ('Thiết kế test', 'Lập bảng quyết định free/paid, paid/unpaid, published/draft. Chọn ít nhất 12 test gồm happy path, thiếu quyền, dữ liệu sai, bấm hai lần và phản hồi timeout. Mỗi test có điều kiện trước, bước, kết quả mong đợi và kiểm tra dữ liệu.'), ('Thực thi và báo lỗi', 'Ghi actual riêng với expected; lỗi cần bước tái hiện, môi trường và bằng chứng đã che token. Severity dựa trên tác động, priority cần ngữ cảnh nhóm; không đồng nhất hai khái niệm.'), ('Hồi quy và báo cáo', 'Sau sửa lỗi đăng ký trùng, kiểm tra confirmation cho ca lỗi rồi regression các ca miễn phí, trả phí và quyền. Tính tỷ lệ pass chỉ trên test đã chạy; liệt kê blocked/not-run riêng.')],
        acceptance=['Mỗi test truy vết tới yêu cầu.', 'Có điều kiện trước và kết quả dữ liệu cụ thể.', 'Bao phủ cặp request trùng hoặc đồng thời.', 'Không dùng mã HTTP một mình thay cho kiểm tra dữ liệu.', 'Có báo cáo lỗi đủ tái hiện hoặc ghi rõ không phát hiện.', 'Báo cáo nêu rủi ro còn lại và ca chưa chạy.'],
        example='''```text
TC-04: Ghi danh lại cùng khóa miễn phí
Trước: học viên hoạt động đã ghi danh khóa K đang xuất bản.
Bước: gửi lại yêu cầu ghi danh K bằng cùng tài khoản.
Mong đợi: không có bản ghi thứ hai; phản hồi theo hợp đồng API.
Bằng chứng: số ghi danh của cặp học viên/K vẫn là 1.
```
Nếu hợp đồng quy định 200 với bản ghi cũ hoặc 409 báo trùng thì test phải theo đúng hợp đồng đã duyệt; không áp đặt một mã duy nhất cho mọi hệ thống.''',
        references=['https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/', 'https://www.rfc-editor.org/rfc/rfc9110.html']),
}


def handbook(course, chapters, lessons):
    key = course['slug'] or ('os' if course['title'].casefold() == 'nguyên lí hdh' else None)
    spec = SPECS.get(key)
    if not spec:
        raise ValueError(f"No reviewed practice guide for {course['title']}")
    parts = [f"# Sổ tay học tập và dự án cuối khóa\n\n{course['title']}\n\nBiên soạn nội bộ StudyOnline · 31/10/2026. Tài liệu thực hành bổ sung cho các bài giảng hiện có.",
             '## Điều kiện đầu vào và chuẩn bị\n' + spec['prerequisites'],
             '## Kết quả học tập có thể kiểm tra\n' + '\n'.join('- ' + x for x in spec['outcomes']),
             '## Đề cương và lộ trình học\nMỗi tuần dự kiến 4–6 giờ gồm đọc, làm ví dụ, bài tập và tự đánh giá. Điều chỉnh thời gian theo kết quả thực hành; không xem thời lượng đọc là chứng minh đã nắm vững kiến thức.']
    for i, chapter in enumerate(chapters, 1):
        rows = [l for l in lessons if l['chapter_id'] == chapter['id']]
        parts.append(f"### {chapter['chapter_name']}\n" + '\n'.join('- ' + l['title'] for l in rows) +
                     f"\nHoàn thành nhóm bài này ở chặng {i}/{len(chapters)}. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.")
    parts.extend([
        '## Quy trình học một buổi\n1. Đọc mục tiêu và tự kiểm tra kiến thức đầu vào trong 10 phút.\n2. Đọc lý thuyết rồi tự chạy hoặc phân tích ví dụ, ghi đầu ra dự đoán trước khi chạy.\n3. Làm bài độc lập trong 30–60 phút; giữ bản nháp và bằng chứng lỗi.\n4. Đối chiếu hướng giải, giải thích nguyên nhân chênh lệch.\n5. Làm Quiz để phát hiện nội dung cần ôn, sau đó thử một bài tương đương với dữ liệu mới.\n6. Mỗi cuối chặng bổ sung một phần dự án, không để toàn bộ dự án đến buổi cuối.',
        f"## Đề bài dự án: {spec['project']}\n{spec['scenario']}",
    ])
    for i, (title, body) in enumerate(spec['checkpoints'], 1):
        parts.append(f'### Mốc {i}: {title}\n{body}\nNộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.')
    parts.extend([
        '## Ví dụ khởi động và kết quả đối chiếu\n' + spec['example'],
        '## Bảng nghiệm thu theo nghiệp vụ\n' + '\n'.join(f'{i}. {value}' for i, value in enumerate(spec['acceptance'], 1)),
        '## Rubric chấm dự án — 100 điểm\n- Đúng nghiệp vụ và dữ liệu: 35 điểm. Kiểm tra các điều kiện nghiệm thu, chỉ cho điểm phần có bằng chứng.\n- Thiết kế và giải thích lựa chọn: 20 điểm. Cấu trúc rõ, nêu giả định, hiểu giới hạn.\n- Kiểm thử và xử lý trường hợp lỗi: 25 điểm. Có ca đúng, sai, biên và bằng chứng chạy lại sau sửa.\n- Tài liệu bàn giao và khả năng tái hiện: 15 điểm. README, dữ liệu mẫu, lệnh chạy hoặc quy trình quan sát.\n- Tự phản biện và trình bày: 5 điểm. Giải thích một quyết định, một lỗi từng gặp và cách kiểm chứng.\nĐiều kiện hoàn thành được đề xuất cho giảng viên: Quiz đạt tối thiểu 70% và dự án tối thiểu 70/100, đồng thời đáp ứng các điều kiện nghiệp vụ cốt lõi. Dự án cần giảng viên đánh giá bằng sản phẩm; điểm Quiz không tự chuyển thành điểm dự án.',
        '## Bộ hồ sơ cần nộp\n- README mô tả công cụ/phiên bản, cách chuẩn bị và cách chạy từng bước.\n- Mã nguồn hoặc hồ sơ phân tích, dữ liệu mẫu đã loại thông tin cá nhân.\n- Test plan hoặc danh sách kiểm tra có expected/actual, ảnh hoặc nhật ký phù hợp.\n- Báo cáo 2–4 trang: mục tiêu, thiết kế, kết quả, giới hạn và hướng cải tiến.\n- Tự đánh giá rubric kèm đường dẫn tới bằng chứng. Người khác phải tái hiện được kết quả từ tài liệu, không cần đoán bước còn thiếu.',
        '## Hướng tự sửa và đánh giá lại\nKhi thất bại một ca, giữ nguyên dữ liệu tái hiện nhỏ nhất, xác định sai từ đầu vào hay từ xử lý, sửa một nguyên nhân rồi chạy lại cả ca lỗi và các ca liên quan. Với câu Quiz sai, giải thích vì sao đáp án đúng và vì sao phương án đã chọn không phù hợp. Chỉ nhớ chữ cái đáp án không giúp giải quyết tình huống mới.\nGiảng viên có thể giao biến thể dữ liệu hoặc yêu cầu giải thích trực tiếp để kiểm tra mức hiểu. Ghi rõ phần chưa hoàn thành, không thay bằng ảnh giao diện đẹp hoặc số lượng dòng mã.',
        '## Tài liệu tham khảo và học tiếp\n' + '\n'.join('- ' + url for url in spec['references']),
    ])
    return '\n\n'.join(parts) + '\n'
