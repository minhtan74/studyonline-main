## Mục tiêu bài học
- Đọc được dòng thêm, xóa trong diff.
- Chọn đúng so sánh working tree, index và commit.
- Truy tìm commit liên quan đến một file.

Thời gian dự kiến: 100 phút, gồm đọc và thực hành.

## Điều kiện và sản phẩm
Repository đã có README và ghi chú tuần đầu. Bài này không yêu cầu thay đổi lịch sử. Sản phẩm là báo cáo `evidence-diff.md` giải thích một thay đổi từ yêu cầu đến diff và commit. Mỗi nhận xét cần nêu file, phần nội dung và tác động; chép lại cả màn hình mà không diễn giải chưa đủ minh chứng đọc hiểu.

## Đọc một bản so sánh
Diff mô tả sự khác nhau giữa hai trạng thái. Trong dạng unified quen thuộc, dòng bắt đầu bằng dấu trừ thuộc bản trước, dấu cộng thuộc bản sau; các dòng ngữ cảnh giúp định vị đoạn sửa. Ký hiệu đầu file `---` và `+++` là header của bản diff, không phải câu lệnh xóa hoặc tạo ba lần. Khi thay một câu, thường có một dòng xóa và một dòng thêm, dù người viết chỉ cảm thấy mình “sửa một dòng”.

So sánh mặc định của `git diff` tập trung vào phần working tree khác index. `git diff --cached` tập trung phần index khác HEAD. So sánh hai commit cần nêu hai mốc hoặc phạm vi phù hợp. Cùng một file nhưng hai lệnh cho kết quả khác nhau không có nghĩa Git mất nội dung; thường bạn đang hỏi hai câu khác nhau. Trước khi review, viết câu hỏi bằng lời: “Tôi muốn xem phần chưa chọn” hay “Tôi muốn xem thứ sẽ vào commit?”.

## Thực hành từng bước
Mở README thêm dòng “Mỗi bài cần có bằng chứng kiểm tra”. Giữ thay đổi chưa stage rồi chạy:
```powershell
git diff -- README.md
git diff --stat
git add -- README.md
git diff -- README.md
git diff --cached -- README.md
git commit -m "docs: yeu cau bang chung cho tung bai"
git log --oneline -- README.md
git show --stat HEAD
git show HEAD -- README.md
```
Sau add, diff mặc định của README rỗng nếu bạn chưa sửa thêm, còn diff cached vẫn có dòng mới. Sau commit, `git show HEAD` chứa thay đổi vừa lưu. `--` phân cách tham số và đường dẫn; cách viết rõ giúp tránh mơ hồ khi tên nhánh hoặc mốc trùng với tên file.

## Tra lịch sử bằng câu hỏi
Khi thấy quy định lạ trong ghi chú, bắt đầu từ lịch sử file để tìm các commit đã tác động tới nó. Đọc thông điệp rồi mở diff của commit phù hợp. Một thông điệp “sửa hướng dẫn” không chứng minh lý do sửa đúng; cần đọc nội dung và test hoặc yêu cầu liên quan. `git log --graph --oneline --all` giúp nhìn nhánh khi đã có nhiều nhánh, nhưng hình đồ thị chỉ thể hiện quan hệ commit, không phải biểu đồ chất lượng công việc.

## Bài tập hướng dẫn: nhận diện phần bị bỏ quên
Thêm hai dòng vào README, add file rồi sửa lại dòng thứ hai. Dự đoán kết quả hai loại diff trước khi chạy. Lập bảng gồm “lệnh”, “hai trạng thái được so”, “nội dung quan sát”. Hướng giải: cached phản ánh hai dòng ở thời điểm add; diff mặc định cho biết dòng thứ hai đã tiếp tục đổi. Muốn commit đúng ý phải kiểm tra cả hai, chọn lại nội dung cần lưu và xem bản staged cuối cùng.

## Nhiệm vụ độc lập và đáp án định hướng
Tạo hai commit liên tiếp cho `notes/week1.md`: đầu tiên thêm câu hỏi, sau đó thêm đáp án. Tìm commit nào đưa đáp án vào bằng lịch sử file và chứng minh qua `git show`. Không dùng quy tắc “commit cuối chắc chắn là đáp án” vì trong repository thật có thể có nhiều thay đổi xen kẽ. Đạt khi người chấm có thể dùng mã commit bạn ghi để nhìn thấy đúng phần thêm, và bạn giải thích vì sao việc thêm đáp án không có nghĩa câu hỏi đã được kiểm chứng.

## Lỗi thường gặp
Chỉ đọc thống kê số dòng có thể bỏ qua sửa sai một toán tử quan trọng. Thấy file đổi toàn bộ dòng có thể do line ending hoặc định dạng; hãy xác định nguyên nhân trước khi review nghiệp vụ. Dùng mã hash từ ví dụ trên máy khác sẽ không tìm được commit; lấy mã từ lịch sử của bạn. Gõ đường dẫn không đúng chữ hoa/thường có thể gây khác biệt giữa hệ thống; ghi tên nhất quán từ đầu.

## Tự kiểm tra và đáp án
1. Dòng `+` trong diff có chứng minh dòng đó tốt hơn không? Không, nó chỉ được thêm vào trạng thái sau.
2. Vì sao cần tên file sau `--`? Để xác định phạm vi và tránh diễn giải nhầm tên đường dẫn thành mốc.
3. Log cho thấy ai sửa có thay thế việc đọc yêu cầu không? Không; lịch sử hỗ trợ truy vết, còn đúng sai cần đối chiếu tiêu chí.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-diff
- https://git-scm.com/docs/git-log
- https://git-scm.com/docs/git-show