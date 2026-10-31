# Sổ tay học tập và dự án cuối khóa

Lập Trình Java Căn Bản

Biên soạn nội bộ StudyOnline · 31/10/2026. Tài liệu thực hành bổ sung cho các bài giảng hiện có.

## Điều kiện đầu vào và chuẩn bị
Cài JDK có javac; biết biến, điều kiện và vòng lặp; chọn một phiên bản JDK cố định cho cả nhóm.

## Kết quả học tập có thể kiểm tra
- Mô hình hóa thực thể và bảo vệ bất biến qua constructor.
- Dùng interface và collection cho nghiệp vụ nhỏ.
- Phân biệt lỗi đầu vào, lỗi nghiệp vụ và lỗi lưu file.

## Đề cương và lộ trình học
Mỗi tuần dự kiến 4–6 giờ gồm đọc, làm ví dụ, bài tập và tự đánh giá. Điều chỉnh thời gian theo kết quả thực hành; không xem thời lượng đọc là chứng minh đã nắm vững kiến thức.

### Chương 1: Cú Pháp Cơ Bản Java
- Bài 1: Cài đặt JDK & IntelliJ
- Bài 2: Biến, kiểu dữ liệu trong Java
- Bài 3: Cấu trúc điều khiển
Hoàn thành nhóm bài này ở chặng 1/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 2: Lập Trình Hướng Đối Tượng Trong Java
- Bài 1: Class, Object, Constructor
- Bài 2: Kế thừa & Đa hình
- Bài 3: Interface & Abstract Class
Hoàn thành nhóm bài này ở chặng 2/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

### Chương 3: Xử Lý Ngoại Lệ & Collection
- Bài 1: Try-catch & Custom Exception
- Bài 2: ArrayList & HashMap
- Bài 3: Dự án: Quản lý sản phẩm
Hoàn thành nhóm bài này ở chặng 3/3. Sau mỗi bài: tự viết tóm tắt 5 dòng, chạy lại ví dụ với dữ liệu khác, giải bài trước khi xem hướng giải và ghi ít nhất một lỗi đã sửa. Nếu Quiz cho thấy cần củng cố, quay về đúng bài có căn cứ thay vì đọc lại toàn bộ khóa.

## Quy trình học một buổi
1. Đọc mục tiêu và tự kiểm tra kiến thức đầu vào trong 10 phút.
2. Đọc lý thuyết rồi tự chạy hoặc phân tích ví dụ, ghi đầu ra dự đoán trước khi chạy.
3. Làm bài độc lập trong 30–60 phút; giữ bản nháp và bằng chứng lỗi.
4. Đối chiếu hướng giải, giải thích nguyên nhân chênh lệch.
5. Làm Quiz để phát hiện nội dung cần ôn, sau đó thử một bài tương đương với dữ liệu mới.
6. Mỗi cuối chặng bổ sung một phần dự án, không để toàn bộ dự án đến buổi cuối.

## Đề bài dự án: Quản lý mượn sách bằng Java
Thư viện nhỏ lưu sách theo mã, tên và số bản còn. Cho phép mượn, trả và tra cứu; không xử lý thanh toán hoặc nhiều người dùng đồng thời. Một lượt mượn phải tham chiếu sách tồn tại và không làm số bản còn âm.

### Mốc 1: Thiết kế lớp
Vẽ Book, Loan, Library và trách nhiệm mỗi lớp. Book không cho mã rỗng hoặc số lượng âm. Constructor phải đảm bảo đối tượng tạo xong ở trạng thái hợp lệ.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 2: Collection và hợp đồng
Dùng Map<String,Book> để tra mã; mô tả cách xử lý trùng mã bằng lỗi rõ ràng. Interface Repository chỉ khai báo thao tác cần dùng. Chưa cần tạo cây kế thừa nếu composition đã đủ.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 3: Ngoại lệ và lưu file
Khi mượn mã không có hoặc hết sách, trả lỗi nghiệp vụ xác định. Dùng try-with-resources cho luồng file; giữ thông báo phân biệt lỗi dữ liệu với lỗi IO. Tài liệu hóa giới hạn định dạng CSV nếu dùng CSV đơn giản.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

### Mốc 4: Kiểm thử và bàn giao
Viết lớp chạy test với assertions hoặc framework đã chọn; hướng dẫn bật -ea nếu dùng assert Java. Có ca mượn thành công, hết sách, trả sai mã và round-trip lưu/đọc.
Nộp sản phẩm ở mốc này cùng hai trường hợp kiểm tra và giải thích kết quả. Nếu chưa đạt, ghi việc cần sửa cụ thể trước khi chuyển mốc.

## Ví dụ khởi động và kết quả đối chiếu
```java
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
Lưu thành Main.java, chạy javac Main.java rồi java Main. Kết quả: B01: 3. Đây là kiểm tra tra cứu, chưa thay thế toàn bộ Library.

## Bảng nghiệm thu theo nghiệp vụ
1. Mã sách duy nhất.
2. Mượn giảm đúng một bản; trả tăng đúng một bản.
3. Hết sách không tạo Loan mới.
4. Không để lớp giao diện sửa trực tiếp collection nội bộ.
5. Đọc dữ liệu lỗi có thông báo và giữ dữ liệu cũ.
6. Người khác chạy được theo README trên JDK đã ghi.

## Rubric chấm dự án — 100 điểm
- Đúng nghiệp vụ và dữ liệu: 35 điểm. Kiểm tra các điều kiện nghiệm thu, chỉ cho điểm phần có bằng chứng.
- Thiết kế và giải thích lựa chọn: 20 điểm. Cấu trúc rõ, nêu giả định, hiểu giới hạn.
- Kiểm thử và xử lý trường hợp lỗi: 25 điểm. Có ca đúng, sai, biên và bằng chứng chạy lại sau sửa.
- Tài liệu bàn giao và khả năng tái hiện: 15 điểm. README, dữ liệu mẫu, lệnh chạy hoặc quy trình quan sát.
- Tự phản biện và trình bày: 5 điểm. Giải thích một quyết định, một lỗi từng gặp và cách kiểm chứng.
Điều kiện hoàn thành được đề xuất cho giảng viên: Quiz đạt tối thiểu 70% và dự án tối thiểu 70/100, đồng thời đáp ứng các điều kiện nghiệp vụ cốt lõi. Dự án cần giảng viên đánh giá bằng sản phẩm; điểm Quiz không tự chuyển thành điểm dự án.

## Bộ hồ sơ cần nộp
- README mô tả công cụ/phiên bản, cách chuẩn bị và cách chạy từng bước.
- Mã nguồn hoặc hồ sơ phân tích, dữ liệu mẫu đã loại thông tin cá nhân.
- Test plan hoặc danh sách kiểm tra có expected/actual, ảnh hoặc nhật ký phù hợp.
- Báo cáo 2–4 trang: mục tiêu, thiết kế, kết quả, giới hạn và hướng cải tiến.
- Tự đánh giá rubric kèm đường dẫn tới bằng chứng. Người khác phải tái hiện được kết quả từ tài liệu, không cần đoán bước còn thiếu.

## Hướng tự sửa và đánh giá lại
Khi thất bại một ca, giữ nguyên dữ liệu tái hiện nhỏ nhất, xác định sai từ đầu vào hay từ xử lý, sửa một nguyên nhân rồi chạy lại cả ca lỗi và các ca liên quan. Với câu Quiz sai, giải thích vì sao đáp án đúng và vì sao phương án đã chọn không phù hợp. Chỉ nhớ chữ cái đáp án không giúp giải quyết tình huống mới.
Giảng viên có thể giao biến thể dữ liệu hoặc yêu cầu giải thích trực tiếp để kiểm tra mức hiểu. Ghi rõ phần chưa hoàn thành, không thay bằng ảnh giao diện đẹp hoặc số lượng dòng mã.

## Tài liệu tham khảo và học tiếp
- https://dev.java/learn/classes-objects/
- https://dev.java/learn/collections-framework/
- https://dev.java/learn/exceptions/
