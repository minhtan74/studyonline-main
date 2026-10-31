## Mục tiêu bài học
- Hiểu vai trò GitHub trong quy trình cộng tác.
- Lập phương án xác thực không đưa bí mật vào tài liệu.
- Mô tả một đề xuất thay đổi có thể review.

Thời gian dự kiến: 100 phút, gồm đọc và thực hành.

## Mục tiêu và lựa chọn thực hành
GitHub bổ sung nơi lưu repository, thảo luận, review và các dịch vụ cộng tác. Bài cho hai lộ trình: mô phỏng toàn bộ hồ sơ bằng Markdown local hoặc tự thao tác trên repository học tập riêng ở GitHub. Kết quả cần đạt giống nhau: một đề xuất thay đổi có mục đích, diff, cách kiểm tra và nhận xét. Lộ trình web do người học tự thực hiện trên tài khoản được phép; không cần gửi token cho giảng viên hay AI Tutor.

## Git và GitHub trong một quy trình
Commit và branch là dữ liệu/quy trình Git đã thực hành local. Pull request là đề xuất tích hợp thay đổi trên GitHub, cung cấp ngữ cảnh để thảo luận và đánh giá trước khi merge. Một pull request có thể gồm nhiều commit; lời mô tả cần giải thích trạng thái sản phẩm sau thay đổi, không chỉ chép danh sách file. Việc mở đề xuất không đồng nghĩa đã được chấp nhận, và một review được chấp thuận không tự thay thế các kiểm tra khác của nhóm.

## Danh tính, xác thực và quyền
Danh tính tác giả trong commit không phải quyền ghi vào GitHub. Quyền tài nguyên phụ thuộc tài khoản, xác thực và phân quyền của repository/tổ chức. GitHub hỗ trợ nhiều cách xác thực cho các ngữ cảnh khác nhau; người học chọn hướng dẫn chính thức hiện hành cho HTTPS/credential helper hoặc SSH thay vì ghi mật khẩu vào lệnh. Không nhúng bí mật vào URL remote, không đặt private key trong thư mục nguồn, không chụp token làm bằng chứng hoàn thành bài. Các yêu cầu tài khoản và giao diện có thể thay đổi, nên đọc tài liệu xác thực gắn ở cuối bài.

## Thực hành local: hồ sơ tương đương một đề xuất
Tạo nhánh `feature/learning-checklist` trong repository xuyên khóa, thêm checklist ba bước kiểm tra. Đọc diff, commit rồi tạo file `reviews/change-01.md` theo mẫu:
```text
# Thêm checklist học tập
## Vấn đề
Người mới chưa biết cần ghi bằng chứng nào sau mỗi bài.
## Hành vi sau thay đổi
README dẫn tới checklist gồm diff, kết quả test và câu hỏi còn vướng.
## Cách kiểm tra
Mở link tương đối từ README và đối chiếu ba mục với nội dung file.
## Phản hồi review
Ghi nhận xét, cách xử lý và vấn đề còn chưa giải quyết.
```
Đừng ghi “đã test” khi chưa chạy; thay bằng đúng lệnh hoặc thao tác cùng kết quả. Ghi một nhận xét cụ thể như “link README trỏ sai chữ hoa/thường”, sửa rồi tạo commit tiếp. Không cần tác giả khác giả mạo tên để minh họa; bản tự review phải ghi rõ tự review.

## Thực hành GitHub tùy chọn
Trước khi tạo repository học tập, quyết định ai được xem nội dung. Dùng một repository riêng không chứa dữ liệu công việc. Tự cấu hình remote theo URL mà GitHub cung cấp, kiểm tra `git remote -v`, gửi nhánh tính năng rồi mở pull request vào nhánh đích. Điền mục đích, tác động, cách kiểm tra và giới hạn. Có thể dùng draft khi vẫn đang hoàn thiện. Nếu chưa có người review, ghi tự review và giữ báo cáo honest; không gọi đó là đã được nhóm phê duyệt.

## Bài tập độc lập và hướng giải
Một đề xuất chỉ ghi “sửa file”. Viết lại thành mô tả đủ để người chưa học cùng buổi hiểu lý do, kết quả và cách xác minh. Thêm một tình huống sai để người review thử, chẳng hạn link tới file không tồn tại. Hướng giải cần nêu kết quả mong đợi và bằng chứng, không dùng số dòng thay đổi làm thước đo chất lượng. Đạt khi người khác có thể tìm đúng diff, thực hiện kiểm tra và biết lỗi nào cần phản hồi.

## Lỗi thường gặp
Nhầm fork với branch dẫn tới không biết thay đổi nằm ở repository nào; xác định cả chủ repository và tên nhánh. Sửa description sau review mà không báo phạm vi thay đổi có thể làm người review bỏ sót; cập nhật thông tin khi kết quả cuối đổi. Lấy ảnh nút màu xanh làm bằng chứng duy nhất bỏ qua nội dung và quyền. Trên máy dùng chung, dùng credential helper theo chính sách máy và đăng xuất phiên không còn cần thiết.

## Tự kiểm tra và đáp án
1. Pull request có phải lệnh Git local không? Không; đây là cơ chế cộng tác của dịch vụ GitHub.
2. Có nên gửi token cho người chấm để chứng minh đăng nhập không? Không; minh chứng bằng trạng thái và nội dung đã che thông tin riêng.
3. Đề xuất đã mở có nghĩa đã merge chưa? Chưa; cần quyết định tích hợp theo quy trình và quyền.

## Nguồn đọc tiếp
- https://docs.github.com/en/pull-requests/reference/pull-requests
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github
- https://docs.github.com/en/get-started/git-basics/about-remote-repositories