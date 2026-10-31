## Mục tiêu bài học
- Chọn file nguồn cần quản lý và file sinh tự động.
- Giải thích giới hạn của .gitignore.
- Thiết kế repository dễ clone và tái tạo.

Thời gian dự kiến: 100 phút, gồm đọc và thực hành.

## Bối cảnh của bài
Dự án ghi chú bắt đầu có file tạm, kết quả chạy thử và cấu hình cá nhân. Nếu lưu tất cả, một commit nội dung nhỏ có thể bị lẫn hàng trăm file sinh tự động. Sản phẩm bài là `.gitignore`, một cây thư mục rõ ràng và danh mục file cần bàn giao. Không dùng dữ liệu bí mật thật để thử tính năng bỏ qua; mọi ví dụ đều là chuỗi minh họa.

## Phân loại trước khi viết quy tắc
File nguồn gồm ghi chú do người viết tạo, mã kiểm tra và tài liệu hướng dẫn. File sinh tự động là thứ có thể dựng lại từ nguồn theo quy trình được ghi, chẳng hạn cache hoặc báo cáo tạm. Có những sản phẩm dựng cần phát hành nhưng không nhất thiết lưu trong lịch sử nguồn; quyết định phụ thuộc mục tiêu. Không dùng quy tắc “mọi PDF đều bỏ qua” nếu PDF là tài liệu duy nhất cần giao cho học viên. Với mỗi loại file, ghi nơi lưu, cách tạo lại và ai cần dùng.

`.gitignore` đưa ra mẫu để Git bỏ qua những file chưa được theo dõi phù hợp với quy tắc. Nó không làm biến mất các phiên bản đã commit. Một file đã được theo dõi rồi mới thêm vào ignore vẫn cần xử lý theo trạng thái và chính sách của dự án; bài này chỉ thực hành với file mới để không vô tình thay lịch sử cần giữ. Nếu bí mật thật từng được đưa vào commit, cần thông báo người phụ trách và thay/thu hồi bí mật theo quy trình; chỉ sửa file hiện tại không khôi phục được tính bí mật đã mất.

## Thực hành có hướng dẫn
Trong repository thực hành, tạo file `.gitignore` bằng trình soạn thảo với nội dung sau. `artifacts/` là thư mục báo cáo có thể dựng lại trong khóa này, không phải quy tắc bắt buộc cho mọi dự án.
```text
__pycache__/
*.pyc
.env
.local/
artifacts/
```
Tạo `.env` với dòng `APP_MODE=learning` và tạo `.env.example` cũng chỉ có cấu hình minh họa. Chạy:
```powershell
git status --short
git check-ignore -v -- .env
git check-ignore -v -- .env.example
git add -- .gitignore .env.example
git diff --cached
git commit -m "chore: them quy tac file local va mau cau hinh"
```
Đầu ra mong đợi: `.env` khớp mẫu và không xuất hiện trong danh sách untracked thông thường; `.env.example` không khớp mẫu `.env`, nên có thể được lưu. `git check-ignore` có thể trả mã khác 0 khi không có mẫu khớp; điều này là kết quả kiểm tra, không tự chứng minh lệnh bị hỏng.

## Cấu trúc bàn giao
Đề xuất thư mục `notes/` cho nội dung, `tools/` cho công cụ nhỏ, `tests/` cho kiểm tra và `reviews/` cho hồ sơ thay đổi. README cần chỉ cách chạy từ thư mục gốc. Tránh đường dẫn tuyệt đối như ổ D của một người trong công cụ; ưu tiên đường dẫn tương đối được tính từ vị trí đã ghi rõ. Nếu có tệp mẫu, ghi cách sao chép và những giá trị người học phải tự điền. Mẫu không được chứa token hoạt động.

## Bài tập độc lập và hướng giải
Tạo `artifacts/report.txt`, `notes/week2.md` và `.local/session.txt`. Trước khi add, dự đoán file nào được status liệt kê. Chạy `git status --short --untracked-files=all` rồi `git check-ignore -v` cho từng file. Hướng giải: report và session bị bỏ qua do thư mục tương ứng; ghi chú tuần 2 vẫn có thể quản lý. Đạt khi quy tắc nhắm đúng phần sinh tự động và không che nhầm ghi chú nguồn. Thử đổi tên thư mục báo cáo trong đề xuất giấy rồi phân tích cần sửa quy tắc nào, không cần sửa hàng loạt file để đoán.

## Tình huống phân tích
Một đồng đội thêm `notes/` vào ignore vì nghĩ ghi chú là riêng tư. Sau khi clone, người mới không thấy các ghi chú chưa từng được commit. Nguồn gốc vấn đề là hợp đồng bàn giao chưa rõ, không phải clone làm mất file. Nhóm cần quyết định ghi chú nào là sản phẩm chung rồi viết lại quy tắc phù hợp; kiểm tra trên clone sạch giúp lộ thiếu sót này sớm.

## Tự kiểm tra và đáp án
1. Thêm mật khẩu vào `.gitignore` sau khi commit có xóa nó khỏi lịch sử không? Không.
2. Vì sao `.env.example` có ích? Nó ghi cấu hình cần thiết bằng giá trị an toàn để người khác tự chuẩn bị môi trường.
3. Một file không xuất hiện trong status có luôn nghĩa đã commit chưa? Không; nó có thể bị ignore, cần kiểm tra trạng thái cụ thể.

## Nguồn đọc tiếp
- https://git-scm.com/docs/gitignore
- https://git-scm.com/docs/git-check-ignore
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository