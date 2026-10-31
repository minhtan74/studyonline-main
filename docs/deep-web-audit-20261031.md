# Rà soát kỹ sau các bản sửa — 31/10/2026

## Kết luận

Các luồng chính đã kiểm tra hoạt động trên trạng thái hiện tại. Còn hai lỗi/giới hạn mới đã tái hiện cần xử lý: phản hồi 401 cũ xóa token mới sau đổi mật khẩu, và bcrypt bỏ qua phần mật khẩu vượt 72 byte. Không thể kết luận toàn bộ web không còn lỗi từ các kiểm tra này.

## Phạm vi và bằng chứng

| Hạng mục | Kết quả | Giới hạn |
|---|---|---|
| Backend | 268/268 kiểm thử đạt sau cập nhật fixture cũ | Không chạy hai suite test_api.py/test_ai_sources.py với fixture cũ trên DB chung; không coi là kiểm thử toàn bộ endpoint |
| Dữ liệu frontend | 23/23 đạt | Kiểm tra hàm tổng hợp/lọc dữ liệu |
| Frontend build | Thành công | Còn cảnh báo CSS font import và JS bundle khoảng 1,1 MB |
| API đọc MySQL thật | 60/60 đạt | Dùng TestClient trong tiến trình và override danh tính; không thay thế kiểm tra đăng nhập qua trình duyệt |
| Luồng học MySQL thật | 58 kiểm tra đạt | Dùng dữ liệu tạm trong outer transaction, rollback cuối; auto-increment MySQL có thể tạo khoảng trống ID |
| UI giả lập | 121 kiểm tra đạt | Dashboard 36, Khám phá 24, sau quiz 22, thu hồi phiên 16, Khóa học của tôi 23 |
| Tài liệu | 225/225 file documents tồn tại | Chưa đọc/đánh giá chất lượng từng nội dung |
| File bài học | 137/137 đường dẫn cục bộ tồn tại | Chưa kiểm tra mọi URL ngoài và phát video thực tế |

Luồng 58 kiểm tra có tạo giảng viên/học viên tạm, khóa/chương/bài và ba loại quiz. Kiểm tra: quyền trước ghi danh, ghi danh và trùng ghi danh, mở bài, lưu tiến độ, ẩn đáp án, nộp quiz bài/chương/khóa, lưu kết quả, gợi ý đúng bài, đổi mật khẩu, token cũ bị 401, token mới hoạt động, đăng xuất, đăng nhập lại bằng mật khẩu mới. Không gọi ngân hàng hoặc LLM. Đã xác nhận không còn tài khoản/khóa tạm sau rollback. Script: deep-audit-lifecycle.py; kết quả: deep-audit-lifecycle.json.

Kiểm thử cũ test_media_uses_human_filename_and_preserves_stored_file có fixture user thiếu token_version sau bản sửa phiên; đã cập nhật fixture (không sửa logic ứng dụng trong lượt này). Lần chạy toàn bộ nhóm được chọn sau đó đạt 268/268.

## 1. Vừa — Request cũ nhận 401 xóa nhầm phiên mới

Mã: frontend/src/api/axiosClient.js:67.

Tái hiện bằng browser/API giả lập: giữ request ghi danh được gửi bằng token cũ; đổi mật khẩu và lưu token mới; trả 401 cho request cũ. Interceptor xóa localStorage không đối chiếu token của request với token đang dùng, đẩy về /login. Người dùng đã đổi mật khẩu thành công vẫn bị mất phiên mới khi phản hồi đến muộn.

Bằng chứng: deep-audit-session-race.cjs và deep-audit-session-race.json. Không dùng token thật.

Hướng sửa: chỉ xử lý thu hồi/redirect nếu token bị 401 vẫn là token hiện tại; không để phản hồi request phiên cũ thay đổi phiên mới.

## 2. Cao về tính đúng của mật khẩu — Bcrypt cắt sau 72 byte

Mã: backend/app/core/security.py:20 và :25; auth.py chỉ kiểm tra độ dài tối thiểu, chưa giới hạn byte tối đa.

Đã kiểm tra thuần bộ nhớ: hash chuỗi gồm 72 ký tự a và hậu tố x; xác minh bằng chuỗi cùng tiền tố nhưng hậu tố y vẫn trả true. Đầu vào Unicode có thể chạm 72 byte trước 72 ký tự. Không kiểm tra trên mật khẩu tài khoản thật. Đây là giới hạn bcrypt hiện chưa được API xử lý rõ ràng, không phải tái xuất hiện nhánh chấp nhận plaintext đã bỏ.

Bằng chứng: deep-audit-data.json, trường bcrypt_72_byte_collision=true.

Hướng sửa: giới hạn và thông báo rõ tối đa 72 byte UTF-8 tại tất cả luồng tạo/đổi/reset mật khẩu, hoặc chuyển sang cơ chế hash có phiên bản hỗ trợ mật khẩu dài và kế hoạch tương thích hash cũ. Không cắt ngầm đầu vào.

## 3. Còn thiếu — Giới hạn thử đăng nhập

Chưa có cơ chế giới hạn số lần thử trong auth.py hoặc middleware ứng dụng. Chưa thực hiện kiểm tra tải/brute force. Nên bổ sung giới hạn theo tài khoản và IP trước khi công khai.

## 4. Vừa — Timeout mặc định của API

Axios client chưa có timeout mặc định; một số luồng (logout, AI) đã đặt riêng, nhưng request khác có thể treo lâu khi kết nối không kết thúc. Chưa mô phỏng mạng treo với toàn bộ trang. Nên đặt timeout chung cùng thông báo theo chức năng, không dùng thông báo AI cho mọi timeout.

## 5. Nội dung chưa hoàn chỉnh

Footer còn hotline 1900 xxxx; email hỗ trợ chưa xác minh. Trang admin không có lối vào hồ sơ/đổi mật khẩu rõ ràng trong menu admin dù admin có thể vào /teacher/profile. Đây là vấn đề điều hướng/nội dung, không kết luận API đổi mật khẩu Admin hỏng.

## 6. Chính sách gợi ý chưa điều chỉnh

Vẫn dùng kết quả mới nhất theo bài. Quiz mới ít câu có thể chuyển bài từ đủ căn cứ về chưa đủ dữ liệu. Mục 5 trước đây chưa được chọn thực hiện; không thay đổi chính sách trong lượt kiểm tra.

## Chưa xác minh

- Giao dịch/hoàn tiền VNPay và callback thực từ cổng ngân hàng.
- Chất lượng và độ ổn định LLM thật; không gọi dịch vụ tính phí.
- Mọi luồng tạo/sửa/xóa admin/giảng viên, upload file mới và video bên ngoài qua trình duyệt thực.
- Cạnh tranh nhiều request trên MySQL dưới tải lớn, đặc biệt thanh toán.
- Triển khai HTTPS/domain ngoài máy và phục hồi backup.

Không sửa logic sản phẩm trong lượt này. Chỉ cập nhật fixture kiểm thử cũ, tạo script/báo cáo và chạy dữ liệu tạm có hoàn tác. Preview QA cổng 5174 được tắt khi hoàn tất.

## Cập nhật sau kiểm tra

Lỗi phản hồi 401 cũ xóa token mới đã được sửa và kiểm chứng; xem [bản sửa](session-race-fix.md). Các phát hiện còn lại giữ nguyên để xử lý theo phạm vi riêng.
