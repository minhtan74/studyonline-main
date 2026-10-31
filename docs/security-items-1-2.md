# Mục 1 và 2 — JWT riêng và mật khẩu bcrypt

Đã sinh khóa JWT ngẫu nhiên 64 byte qua secrets.token_urlsafe, cập nhật backend/.env (Git bỏ qua); không ghi khóa vào mã nguồn, báo cáo hay log. Settings không còn khóa mặc định và từ chối khóa trống/ngắn dưới 32 byte hoặc khóa mẫu. Đổi khóa thu hồi chữ ký token và link media trước đó khi backend nạp lại cấu hình. Khởi động lại backend nếu không bật reload.

Đã bỏ nhánh so sánh trực tiếp đầu vào với giá trị password lưu DB. Chỉ bcrypt.checkpw được dùng xác minh. Đã chuyển 15/15 tài khoản local từ plaintext sang bcrypt trong một transaction và tăng token_version; mật khẩu người dùng giữ nguyên. Kiểm tra sau chuyển: 15/15 bcrypt, không còn plaintext. Không xuất email, mật khẩu hoặc hash ra log.

Script hash_legacy_passwords.py mặc định dry-run; --apply khóa dòng và chuyển toàn bộ trong transaction. Chạy lại idempotent: 0 cần chuyển. Giá trị rỗng/định dạng bắt đầu $ không hỗ trợ hoặc quá 72 byte sẽ chặn toàn bộ lượt chuyển để xử lý riêng, không băm đè hash lạ. SQL khởi tạo/mẫu đã đổi sang bcrypt; tài khoản mẫu vẫn dùng mật khẩu demo như trước.

Script generate_jwt_secret.py khởi tạo khóa cho máy mới, không ghi đè khóa riêng hiện có nếu thiếu --rotate. Các mẫu env không chứa khóa dùng được. Không cần migration schema hoặc quyền DDL, tài khoản runtime có thể chuyển password.

Kiểm tra: 34 kiểm thử hardening/thu hồi phiên/cấu hình đạt trên dữ liệu cô lập. Bao gồm bcrypt đúng/sai, từ chối plaintext và giá trị hash nhập như mật khẩu, khóa JWT mặc định/ngắn bị từ chối, chữ ký cũ hết hiệu lực khi đổi khóa, chuyển password giữ nguyên mật khẩu, dry-run/idempotency, rollback khi gặp định dạng không hỗ trợ. Không đăng nhập bằng tài khoản Admin thật trong quá trình kiểm tra.
