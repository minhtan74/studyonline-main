## Mục tiêu bài học
- Giải thích được mục đích lưu phiên bản.
- Phân biệt working tree, staging area và commit.
- Tạo repository và commit đầu trong thư mục mới.

Thời gian dự kiến: 100 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện đầu
Bắt đầu trong một thư mục mới chưa có dữ liệu quan trọng. Cần Git hỗ trợ `git switch`; xác nhận bằng `git --version`. Toàn bộ bài là thao tác local, chưa liên hệ GitHub. Sản phẩm là repository `study-notes` với README và một commit, kèm bản giải thích file đi qua những trạng thái nào. Khi gõ lệnh, đọc kết quả của lệnh trước thay vì dán cả khối rồi bỏ qua lỗi.

## Vì sao cần lưu phiên bản
Giả sử bạn có ba bản ghi chú tên “cuối”, “cuối sửa” và “cuối thật”. Tên file không giải thích được dòng nào đổi, tại sao đổi hay phiên bản nào dùng được. Một lịch sử commit giúp gắn thay đổi nội dung với thời điểm và thông điệp. Trong bài tập, một commit đại diện cho một bước học có mục tiêu; bản sao dự phòng và việc quản lý phiên bản phục vụ các nhu cầu liên quan nhưng khác nhau. Repository local vẫn có thể mất nếu ổ đĩa hỏng, nên chưa thể coi một commit local là đã sao lưu từ xa.

Working tree là các file bạn đang mở và sửa. Staging area, còn gọi là index, ghi lựa chọn nội dung cho commit kế tiếp. Commit lưu một snapshot được chọn cùng thông tin như thông điệp và cha của nó. Một file được sửa sau `git add` có thể có hai phiên bản khác nhau: một bản đã stage và một bản mới hơn ở working tree. Nắm điểm này giúp tránh tưởng rằng commit luôn lấy mọi thay đổi đang thấy trong editor.

## Thực hành có hướng dẫn
Ví dụ dưới dùng PowerShell và địa chỉ minh họa. Tạo file bằng trình soạn thảo cũng cho kết quả tương đương.
```powershell
mkdir study-notes
cd study-notes
git init --initial-branch=main
git config user.name "Nguoi Hoc"
git config user.email "learner@example.invalid"
Set-Content -LiteralPath README.md -Value '# Study Notes' -Encoding utf8
git status --short
git add -- README.md
git diff --cached
git commit -m "docs: khoi tao ghi chu hoc tap"
git status --short
git log --oneline -1
```
Trước add, `README.md` thường được ghi là untracked bằng `??`. Sau add, nó là file mới đã stage. `git diff --cached` cho thấy tiêu đề sẽ đi vào commit. Sau commit, `git status --short` không in dòng nào nếu không còn thay đổi. `git log` có một commit; mã hash không cần giống ảnh hoặc máy khác. Nếu chưa cấu hình danh tính, đọc lỗi và cấu hình trong đúng repository rồi thực hiện lại commit.

## Quan sát thay đổi theo từng bước
Thêm dòng mô tả, chạy `git diff`, sau đó add và chạy lại cả `git diff` lẫn `git diff --cached`. Trước add, phần mới nằm ở so sánh working tree với index; sau add, phần đó chuyển sang so sánh index với HEAD. Dùng ba ô trên giấy ghi “đang sửa”, “đã chọn”, “đã lưu”; ghi nội dung README ở mỗi ô. Đừng thay một khái niệm bằng một câu lệnh: `git add` là hành động cập nhật lựa chọn, còn index là trạng thái dữ liệu.

## Bài tập độc lập và hướng giải
Tạo `goals.md` gồm tiêu đề và ba mục tiêu học. Stage riêng file này rồi sửa thêm một mục tiêu thứ tư trước khi commit. Dự đoán commit có ba hay bốn mục tiêu, xác nhận bằng `git show HEAD:goals.md`. Hướng giải: khi chưa add lại, snapshot staged vẫn có ba mục tiêu; working tree có bốn. Muốn commit cả bốn cần add lại file rồi đọc diff staged. Đạt yêu cầu khi bạn giải thích kết quả bằng phiên bản nội dung, không chỉ nói lệnh chạy thành công.

## Lỗi thường gặp
Chạy lệnh ngoài repository gây thông báo không tìm thấy Git repository; kiểm tra thư mục bằng `Get-Location`. Nhầm commit với upload khiến tưởng đồng đội đã nhận bài dù chưa có remote. Chọn nhầm thư mục dự án đang làm thật có thể đưa file ngoài bài vào lịch sử; luôn xem `git rev-parse --show-toplevel`. Thông điệp “update” khó giúp người đọc; mô tả điều đã thay đổi như “thêm mục tiêu tuần đầu”.

## Tự kiểm tra và đáp án
1. Sửa file sau khi add có tự thay nội dung đã stage không? Không; cần add lại nếu muốn chọn bản mới.
2. Commit local đã đồng nghĩa có bản trên GitHub chưa? Chưa; bài này chưa có remote và chưa trao đổi dữ liệu.
3. Vì sao trạng thái sạch không chứng minh nội dung đúng? Nó chỉ cho biết các vùng dữ liệu đang đồng bộ theo trạng thái Git; lỗi nội dung vẫn có thể đã được commit.

## Nguồn đọc tiếp
- https://git-scm.com/docs/gittutorial
- https://git-scm.com/docs/git-init
- https://git-scm.com/docs/git-add