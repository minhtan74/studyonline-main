# Báo cáo sửa mục 4 — Khóa học của tôi

Ngày kiểm tra: 31/10/2026. Phạm vi: mục 4 trong báo cáo tổng quát general-web-check.md (không phải mục gợi ý sau quiz đã làm trước đó).

## Trước và sau

| Trường hợp | Trước | Sau |
|---|---|---|
| API tiến độ lỗi | Hiện 0/0 bài, 0%, Chưa bắt đầu | Cảnh báo lỗi; ghi Chưa xác định tiến độ; không hiện % hoặc thanh tiến độ; vẫn vào khóa được |
| API ghi danh lỗi | Danh sách trống, không cảnh báo | Thông báo Chưa tải được trạng thái đăng ký và nút thử lại; không kết luận chưa đăng ký |
| API danh mục lỗi | Bị coi là không có khóa | Cảnh báo và nút thử lại danh sách khóa học |
| ID ghi danh dạng chuỗi | Không khớp ID khóa dạng số | Chuẩn hóa cùng kiểu qua hàm tổng hợp dùng chung Dashboard |
| Thiếu bản ghi tiến độ hoặc done > total | Mặc định chưa bắt đầu hoặc % sai | Chưa xác định; không tự tạo tiến độ |
| Khóa có 0 bài | 0/0, 0%, Chưa bắt đầu | Ghi Chưa có bài học |
| Chưa đăng ký khóa thực sự | Chung thông báo không có khóa | Thông báo riêng và liên kết Khám phá khóa học |
| Không khớp bộ lọc | Chỉ thông báo trống | Có Xóa bộ lọc; thêm tab Chưa xác định để tìm khóa chưa rõ tiến độ |

## Thực hiện

- Tải ba nguồn dữ liệu độc lập, kiểm tra HTTP, success và cấu trúc payload; từ chối ID ghi danh không hợp lệ.
- Mỗi nguồn có nút thử lại riêng, không tải lại các nguồn đã thành công. Giữ từ khóa và bộ lọc.
- Bỏ cập nhật state khi component đã unmount; lỗi không tự tạo dữ liệu rỗng/0%.
- Dùng buildDashboardOverview chung với Dashboard để tránh hai trang suy luận trạng thái khác nhau.
- Giữ đường dẫn vào học /chapters?course_id và giao diện thẻ chung. Không sửa backend, điểm, ghi danh hay thanh toán.

## Kiểm tra

- 23 kiểm tra UI bằng API giả lập đạt, không có lỗi JavaScript: my-courses-fix-browser-results.json.
- Bao phủ lỗi HTTP, lỗi mạng, payload sai, retry độc lập, ID chuỗi, giá trị tiến độ thiếu/sai/0 bài, danh sách rỗng thật, lọc và mobile.
- 23 kiểm thử dữ liệu frontend hiện có đạt.
- Frontend build thành công; vẫn còn cảnh báo font @import và bundle lớn đã có trước.
- Không dùng tài khoản thật, không ghi tiến độ hoặc đăng ký khóa trong kiểm tra giao diện. Chưa kiểm chứng end-to-end việc lưu tiến độ mới trên MySQL trong lượt này.

Ảnh mobile: my-courses-fixed-mobile.png. Script tái lập: my-courses-fix-browser.cjs.
