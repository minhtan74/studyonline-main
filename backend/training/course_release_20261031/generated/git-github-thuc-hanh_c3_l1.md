## Mục tiêu bài học
- Tạo và chuyển nhánh theo một yêu cầu.
- Đọc quan hệ commit khi merge.
- Kiểm tra sản phẩm sau hợp nhất.

Thời gian dự kiến: 100 phút, gồm đọc và thực hành.

## Điều kiện và mục tiêu
Working tree của `study-notes` cần sạch trước khi bắt đầu. Nếu còn nội dung nháp, hoàn tất commit có mục đích hoặc lưu riêng bản nháp trong vùng đã dự kiến, rồi kiểm tra lại. Sản phẩm là nhánh `feature/week2`, một thay đổi độc lập và lịch sử hợp nhất vào `main` có giải thích. Bài không đòi hỏi repository từ xa.

## Nhánh phục vụ mục đích gì
Nhánh giúp nhóm đặt tên cho một dòng phát triển. Thay vì sửa trực tiếp bản đang dùng, người học có thể hoàn thành một mục tiêu trên nhánh rồi đánh giá trước khi tích hợp. Nhánh không phải bản sao toàn bộ thư mục cho mỗi lần tạo; khi chuyển nhánh, nội dung working tree có thể được cập nhật theo commit đích. Vì vậy cần hiểu trạng thái file trước khi switch, không chỉ nhìn tên nhánh ở editor.

Trong thực hành này, main đại diện cho bản tài liệu được chấp nhận, còn feature/week2 là đề xuất bổ sung kế hoạch học. Đặt một tên nhánh cho một yêu cầu giúp lịch sử và hồ sơ review cùng kể một câu chuyện. Tên nhánh tự nó không chứng minh công việc đã được duyệt; người học vẫn cần xem diff, kiểm tra và ghi quyết định.

## Thực hành nhánh đầu tiên
```powershell
git status --short
git branch --show-current
git switch -c feature/week2
```
Tạo hoặc chỉnh `notes/week2.md` với tiêu đề, mục tiêu đọc diff và mục tiêu kiểm tra ignore. Sau đó:
```powershell
git add -- notes/week2.md
git diff --cached
git commit -m "docs: them muc tieu tuan hai"
git switch main
git diff main...feature/week2 -- notes/week2.md
git merge --ff-only feature/week2
git log --graph --oneline --all -6
```
Nếu main chưa phát triển thêm từ lúc tạo nhánh, `--ff-only` cho phép cập nhật main tới đỉnh nhánh mà không tạo merge commit riêng. Nếu điều kiện không còn đúng, Git từ chối; đọc lịch sử và phân tích, không đổi sang một thao tác mạnh hơn chỉ để làm mất thông báo. Mục tiêu của cờ này trong bài là biến một giả định lịch sử thành điều kiện được kiểm tra.

## Hiểu fast-forward và merge commit
Khi một nhánh là tổ tiên của nhánh kia, tích hợp có thể chỉ cập nhật con trỏ nhánh. Khi cả hai đã có các commit riêng, hợp nhất thường cần một commit có nhiều cha, trừ khi chọn chiến lược khác. Một đồ thị “thẳng đẹp” không luôn có nhiều thông tin hơn; nhóm chọn chính sách phù hợp để review và truy vết. Khóa này dùng merge rõ ràng để học quan hệ lịch sử trước khi học các quy trình viết lại commit ở khóa nâng cao.

## Bài tập có hướng dẫn
Tạo nhánh `feature/checklist`, thêm một file checklist. Trở lại main, thêm một ghi chú độc lập ở README và commit. So sánh đồ thị trước khi merge. Vì hai phía đã phát triển, dự đoán `git merge --ff-only feature/checklist` có từ chối không. Sau khi đã đọc diff và bảo đảm các thay đổi đáp ứng yêu cầu, dùng `git merge --no-ff feature/checklist -m "merge: them checklist hoc tap"`. Kiểm tra hai file đều còn và lịch sử có commit hợp nhất. Các lệnh này chỉ áp dụng trong repository bài tập có trạng thái được mô tả.

## Nhiệm vụ độc lập và hướng giải
Thiết kế nhánh bổ sung `reviews/README.md` mô tả cách ghi review. Trước khi merge, tự viết ba tiêu chí: file có mục đích, đường dẫn đúng, không chứa thông tin riêng. Đọc diff giữa nhánh và main, kiểm tra tiêu chí rồi hợp nhất. Đạt khi bạn giải thích được tại sao chọn fast-forward hoặc merge commit trong lịch sử thực tế của mình. Không chấm trừ chỉ vì hash hoặc số dòng đồ thị khác ví dụ.

## Lỗi thường gặp
Nhầm switch thành merge khiến nghĩ chuyển nhánh là đã tích hợp. Đặt nhiều yêu cầu không liên quan vào một nhánh làm review khó. Chỉ kiểm tra merge không xung đột rồi bỏ qua nội dung có thể đưa lỗi logic vào main. Sửa file nháp trên nhánh không mong muốn cần dừng và xác định nơi lưu phù hợp, tránh tiếp tục theo thói quen.

## Tự kiểm tra và đáp án
1. Switch sang feature có đưa thay đổi của feature vào main không? Không, đó là chuyển vị trí làm việc.
2. Fast-forward có luôn tạo commit hợp nhất mới không? Không; có thể chỉ tiến con trỏ nhánh.
3. Merge thành công có thay thế kiểm tra sản phẩm không? Không, tính hợp lệ về nội dung vẫn cần đối chiếu yêu cầu.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-switch
- https://git-scm.com/docs/git-branch
- https://git-scm.com/docs/git-merge