## Mục tiêu bài học
- Tái tạo xung đột trong repository riêng.
- Kết hợp hai yêu cầu thay vì chọn bên ngẫu nhiên.
- Hoàn tất merge và xác nhận không còn marker.

Thời gian dự kiến: 110 phút, gồm đọc và thực hành.

## Mục tiêu và môi trường riêng
Bài này dùng repository mới `conflict-lab` trong thư mục học, để các bước tạo xung đột không ảnh hưởng dự án xuyên khóa. Sản phẩm là file kế hoạch chứa đồng thời hai yêu cầu, một merge commit và biên bản giải thích cách giải. Mở terminal ở thư mục cha không chứa repository quan trọng rồi tự kiểm tra đường dẫn trước khi tạo thư mục.

## Xung đột là thông tin cần quyết định
Hai người có thể sửa cùng một dòng từ một bản gốc nhưng theo mục tiêu khác. Git không đủ dữ liệu để chọn phiên bản đúng, nên yêu cầu người dùng quyết định. Mục tiêu học không phải làm biến mất dấu xung đột bằng cách chọn ngẫu nhiên một bên; mục tiêu là hiểu hai yêu cầu và dựng một kết quả đáp ứng chúng. Có trường hợp chỉ một yêu cầu được chấp nhận, nhưng quyết định phải được ghi cùng lý do.

Trong tình huống giả lập, bản gốc ghi giờ ôn chưa chốt. Nhánh thực hành yêu cầu có phần làm bài; main yêu cầu có phần thảo luận. Kết quả hợp lý có thể là cả thực hành và thảo luận, không nhất thiết giống nguyên văn bên nào. Khi yêu cầu thật xung đột về thời gian hoặc giới hạn khác, cần làm rõ với người phụ trách trước khi sửa, thay vì tự suy đoán.

## Tạo tình huống có thể lặp lại
Các dòng PowerShell dưới chỉ ghi đè `plan.txt` trong repository bài tập vừa tạo.
```powershell
mkdir conflict-lab
cd conflict-lab
git init --initial-branch=main
git config user.name "Nguoi Hoc"
git config user.email "learner@example.invalid"
Set-Content -LiteralPath plan.txt -Value 'Buoi hoc: chua chot' -Encoding utf8
git add -- plan.txt
git commit -m "docs: tao ke hoach goc"
git switch -c feature/practice
Set-Content -LiteralPath plan.txt -Value 'Buoi hoc: thuc hanh' -Encoding utf8
git add -- plan.txt
git commit -m "docs: de xuat phan thuc hanh"
git switch main
Set-Content -LiteralPath plan.txt -Value 'Buoi hoc: thao luan' -Encoding utf8
git add -- plan.txt
git commit -m "docs: de xuat phan thao luan"
git merge feature/practice
git status --short
```
Lệnh merge cuối dự kiến trả trạng thái lỗi do conflict; đây là kết quả được tạo có chủ đích, không cần sửa cài đặt Git. Mở file và xác định các marker cùng hai phần nội dung. Không dùng toàn bộ khối lệnh như một test yêu cầu mọi mã thoát đều bằng 0; bước conflict phải được quan sát riêng.

## Hoàn tất theo hai yêu cầu
Sửa `plan.txt` thành `Buoi hoc: thuc hanh va thao luan`. Xóa các dòng marker bằng cách chỉnh đúng file bài tập, đọc lại kết quả cuối, sau đó:
```powershell
git add -- plan.txt
git diff --cached
git status
git commit -m "merge: ket hop thuc hanh va thao luan"
git log --graph --oneline -5
```
Đầu ra mong đợi: không còn unmerged path; commit hợp nhất xuất hiện; file chứa cả hai phần. Một công cụ có nút accept current/incoming có thể giúp thao tác, nhưng nút không tự hiểu tiêu chí. Nếu chưa sẵn sàng quyết định, ghi lại yêu cầu và hỏi người phụ trách; không biến việc chọn theo màu thành quy tắc nghiệp vụ.

## Bài tập độc lập và hướng giải
Trong repository khác dành riêng cho bài tập, dựng xung đột ở dòng hướng dẫn nộp bài: một phía thêm yêu cầu báo cáo, phía kia thêm yêu cầu test. Viết kết quả gộp, kèm hai câu giải thích nguồn gốc từng yêu cầu. Hướng giải chấp nhận một câu hoặc hai dòng miễn thể hiện cả báo cáo và test, không còn marker và người khác đọc được. Tự kiểm tra trên clone local sạch hoặc mở commit kết quả bằng `git show`.

## Chẩn đoán lỗi thường gặp
Merge chưa kết thúc vì đã sửa file nhưng chưa add; status thường cho biết file còn unmerged. Hoàn tất commit mà vẫn để marker trong nội dung là lỗi kiểm tra của người giải; cần đọc sản phẩm cuối và dùng kiểm tra phù hợp. Xung đột không chỉ là hai người viết cùng một chữ; đổi/xóa hoặc đổi tên file cũng có thể tạo tình huống cần quyết định. Bài này giữ ví dụ văn bản nhỏ để người học nắm quy trình trước.

## Tự kiểm tra và đáp án
1. Conflict có nghĩa repository bị hỏng không? Không; cần quyết định cách tích hợp nội dung.
2. Vì sao add sau khi giải? Để ghi phiên bản đã giải vào index trước khi hoàn tất merge.
3. Chọn “incoming” luôn đúng không? Không; đúng sai phụ thuộc yêu cầu và kết quả cần đạt.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-merge
- https://git-scm.com/docs/git-status