## Mục tiêu bài học
- Phân biệt danh tính commit với xác thực dịch vụ.
- Chọn phạm vi cấu hình local phù hợp.
- Chia thay đổi thành commit dễ review.

Thời gian dự kiến: 100 phút, gồm đọc và thực hành.

## Mục tiêu và bối cảnh
Tiếp tục repository `study-notes` sau bài đầu. Mục tiêu là tạo hai commit riêng: một cải thiện hướng dẫn học, một thêm kế hoạch tuần. Người đọc lịch sử phải hiểu được mục đích từng bước mà không cần liên hệ tác giả. Bài này cũng làm rõ tên và email trong commit không tự cấp quyền truy cập tài khoản GitHub.

## Danh tính là thông tin lịch sử
Tên và email tác giả giúp nhóm nhận diện nguồn của thay đổi. Cấu hình local áp dụng trong repository hiện tại; cấu hình global thường dùng cho nhiều repository của người dùng. Trong môi trường học chung, cấu hình local giúp tránh sửa danh tính cho các dự án khác. Thông tin email có thể hiện trong lịch sử khi repository được chia sẻ, vì vậy bài tập dùng địa chỉ minh họa. Khi dùng GitHub thực, tự lựa chọn email phù hợp và đọc tùy chọn bảo vệ email trong tài khoản.

Xác thực là quá trình chứng minh quyền truy cập một dịch vụ, có thể dùng luồng đăng nhập, credential helper hoặc SSH. Việc gõ `git config user.name` chỉ thay metadata cho commit mới, không đăng nhập máy chủ. Hai khái niệm này cần được tách trong bản hướng dẫn của dự án; nếu người học nhầm chúng, họ dễ sửa email nhiều lần trong khi lỗi thực nằm ở quyền remote.

## Thiết lập và quan sát
Chạy ở repository thực hành, không thêm cờ global.
```powershell
git config --local user.name "Nguoi Hoc"
git config --local user.email "learner@example.invalid"
git config --show-origin --get user.name
git config --show-origin --get user.email
git status --short
```
Đường dẫn nguồn cấu hình local thường trỏ đến `.git/config`. Nếu có nhiều nguồn, ghi rõ nguồn đang có hiệu lực thay vì đoán. Bạn không cần chia sẻ toàn bộ cấu hình vì có thể chứa đường dẫn nội bộ hoặc dữ liệu không liên quan.

## Thực hành hai thay đổi độc lập
Tạo thư mục `notes` bằng editor hoặc PowerShell nếu chưa có. Mở README thêm phần “Cách học”: đọc, dự đoán, chạy lệnh, ghi bằng chứng. Tạo `notes/week1.md` có ba việc cần hoàn thành. Trước tiên chỉ chọn README.
```powershell
git diff -- README.md
git add -- README.md
git diff --cached --stat
git commit -m "docs: them huong dan hoc va ghi bang chung"
git add -- notes/week1.md
git diff --cached
git commit -m "docs: them ke hoach tuan mot"
git log -2 --format="%h %an <%ae> %s"
```
Đầu ra mong đợi: hai commit khác nhau, tác giả dùng danh tính local, mỗi thông điệp giải thích một mục đích. File kế hoạch không vô tình nằm trong commit hướng dẫn. Tiền tố `docs:` trong bài là quy ước nhóm lựa chọn; Git không bắt buộc cấu trúc thông điệp này.

## Chọn kích thước commit
Một commit tốt thường có một lý do thay đổi có thể diễn giải ngắn, nhưng không đồng nghĩa chỉ được sửa một file. Nếu thay tên lệnh cần cập nhật cả README và test để nhất quán, hai file có thể thuộc cùng commit. Ngược lại, đổi màu giao diện và chỉnh cách tính điểm thường cần hai phạm vi đánh giá khác nhau. Hãy hỏi người review cần kiểm tra hành vi nào và bằng chứng nào để quyết định cách chia.

## Bài tập độc lập và tiêu chí
Bạn cần sửa lỗi chính tả trong README và thêm một ghi chú mới. Lập kế hoạch hai commit, ghi nội dung dự kiến của mỗi commit trước khi chạy. Sau đó kiểm tra bằng `git show --stat HEAD` và `git show --stat HEAD~1`. Hướng giải chấp nhận hai commit riêng nếu hai mục tiêu độc lập; cũng có thể một commit khi ghi chú mới trực tiếp giải thích chỗ sửa và bạn nêu được quan hệ. Không chấm theo số commit đơn thuần; người chấm đối chiếu phạm vi với lý do.

## Lỗi thường gặp và cách nhận biết
Thông điệp “fix everything” che giấu phạm vi; viết lại mô tả cụ thể trong commit tiếp theo nếu cần bổ sung giải thích. Dùng email người khác trên máy học chung gây lịch sử khó truy vết; kiểm tra cấu hình trước buổi học. Đưa token vào URL remote để tiện nhớ có thể làm lộ thông tin khi chụp màn hình; bài thực hành chưa dùng token. Ghi thành công lệnh mà không kiểm tra file staged có thể đưa cả tài liệu nháp vào bản nộp.

## Tự kiểm tra và đáp án
1. Đổi user.email có thay đổi tác giả các commit cũ tự động không? Không; cấu hình áp dụng cho commit tạo sau đó theo thao tác tương ứng.
2. Khi nào hai file cùng thuộc một commit? Khi chúng cùng thực hiện một mục đích và cần được đánh giá cùng nhau.
3. Cấu hình local có cấp quyền push không? Không; quyền remote phụ thuộc xác thực và phân quyền tại nơi nhận.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-config
- https://git-scm.com/docs/git-commit
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github