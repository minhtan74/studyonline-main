## Mục tiêu bài học
- Phân biệt sửa lỗi sản phẩm với thay lịch sử.
- Tạo commit hoàn tác có lý do.
- Đọc diff và chạy kiểm tra sau hoàn tác.

Thời gian dự kiến: 100 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện
Bài dùng repository mới `revert-lab` để quan sát một thay đổi và commit hoàn tác của nó. Không thực hành trên nhánh được người khác dùng. Sản phẩm là ba commit rõ ràng: bản gốc, thay đổi cần hoàn tác, commit revert. Bạn cần giải thích trạng thái nội dung cuối và lý do lịch sử vẫn giữ dấu vết của thay đổi từng xảy ra.

## Hai câu hỏi trước khi sửa sai
Thứ nhất: lỗi nằm ở nội dung cần sửa hay một thay đổi cần được rút lại hoàn toàn? Nếu một hướng dẫn chỉ sai một đường dẫn, commit bổ sung sửa đường dẫn thường là cách dễ review. Nếu cả tính năng đang bị tạm rút, một revert có thể diễn đạt ý định rõ hơn. Thứ hai: lịch sử đã được chia sẻ chưa? Khi nhiều người đã dựa vào commit, một commit mới thể hiện việc hoàn tác giúp người khác theo dõi thay vì giả sử commit cũ chưa từng tồn tại.

Revert tạo thay đổi ngược với một commit theo ngữ cảnh áp dụng, rồi lưu thành commit mới. Nó không có nghĩa xóa mọi dấu vết hoặc đưa toàn bộ repository về một thời điểm trong mọi tình huống. Nếu các thay đổi sau đó chồng lấn, hoàn tác có thể cần giải quyết xung đột và kiểm tra lại. Vì vậy hãy đọc diff kết quả và chạy test; thông báo thành công của Git không thay thế việc đối chiếu mục tiêu sản phẩm.

## Thực hành một hoàn tác đơn giản
Chạy từ thư mục cha dành riêng cho bài học. Dùng file minh họa không chứa dữ liệu thật.
```powershell
mkdir revert-lab
cd revert-lab
git init --initial-branch=main
git config user.name "Nguoi Hoc"
git config user.email "learner@example.invalid"
Set-Content -LiteralPath rule.txt -Value 'Quiz can it nhat 5 cau' -Encoding utf8
git add -- rule.txt
git commit -m "docs: ghi quy tac goc"
Set-Content -LiteralPath rule.txt -Value 'Quiz chi can 1 cau' -Encoding utf8
git add -- rule.txt
git commit -m "docs: thu thay doi quy tac"
git show --stat HEAD
git revert --no-edit HEAD
git log --oneline -3
Get-Content -LiteralPath rule.txt
```
Đầu ra mong đợi: nội dung trở lại quy tắc ít nhất 5 câu, nhưng log có ba commit và commit cuối thể hiện revert. Không dùng ví dụ này để tự thay ngưỡng hệ thống LMS; đây chỉ là file văn bản trong repository bài tập. Mã hash khác nhau ở mỗi máy và không cần sao chép mã từ tài liệu.

## Sửa lỗi có phạm vi nhỏ
Sau ví dụ, thêm một dòng hướng dẫn có lỗi chính tả vào file mới, commit rồi sửa bằng commit bổ sung. So sánh hai cách: commit sửa nêu phần nội dung cần đổi; revert nêu ý định rút lại một thay đổi trước đó. Cả hai đều cần thông điệp và bằng chứng. Không nhất thiết chọn revert cho mọi lỗi, nhất là khi một phần thay đổi vẫn cần giữ.

## Bài tập hướng dẫn
Một commit thêm hai quy tắc: yêu cầu tiêu đề và yêu cầu có link đọc thêm. Sau khi đọc yêu cầu nhóm, chỉ quy tắc link cần sửa thành tùy chọn. Bạn sẽ revert toàn commit hay sửa phần link? Hướng giải thường là commit bổ sung chỉ sửa quy tắc link, vì yêu cầu tiêu đề vẫn hợp lệ. Người học được đề xuất cách khác nếu giải thích đầy đủ trạng thái cuối và tác động, nhưng không được vô tình bỏ cả yêu cầu đúng.

## Nhiệm vụ độc lập và tiêu chí
Viết báo cáo `why-revert.md` gồm vấn đề, commit liên quan, lý do chọn hoàn tác, kết quả diff và kiểm tra sau cùng. Tạo một hoàn tác có chủ đích trong lab rồi bàn giao log. Đạt khi người khác nhìn lịch sử hiểu việc gì đã xảy ra và file cuối đáp ứng quy tắc ban đầu. Không tự nhận đã “xóa bí mật khỏi lịch sử” bằng revert: commit chứa bí mật cũ vẫn có thể được truy xuất, nên xử lý bí mật phải theo quy trình riêng.

## Lỗi thường gặp
Hoàn tác nhầm HEAD vì đang đứng ở repository khác; kiểm tra đường dẫn và show trước. Tin rằng revert luôn không conflict; ngữ cảnh sửa có thể đã thay đổi. Chỉ xem log mà bỏ nội dung cuối; một revert về cú pháp có thể làm test khác thất bại. Xóa bằng chứng lỗi vì ngại lịch sử nhìn xấu sẽ mất thông tin học và review; trong khóa này, lịch sử rõ ràng có giá trị hơn hình thức đẹp.

## Tự kiểm tra và đáp án
1. Revert có xóa commit cũ khỏi lịch sử không? Không, nó thêm commit thể hiện thay đổi ngược.
2. Có nên revert cả commit khi chỉ một phần cần sửa? Cần đánh giá phạm vi; commit bổ sung có thể giữ đúng phần còn hợp lệ.
3. Vì sao cần test sau hoàn tác? Nội dung cuối có thể ảnh hưởng các thay đổi phụ thuộc về sau.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-revert
- https://git-scm.com/docs/git-show
- https://git-scm.com/docs/git-log