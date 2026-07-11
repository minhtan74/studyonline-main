# Hướng Dẫn Chạy Dự Án StudyOnline 🚀

Dự án này gồm 2 phần độc lập (Decoupled):
1. **Backend**: REST API viết bằng PHP (không cần Composer, dùng auto-loader tự chế).
2. **Frontend**: Giao diện Single Page App sử dụng React, Vite và TailwindCSS v4.

---

## 🛠️ Bước 1: Cài đặt và Nhập Cơ sở Dữ liệu (MySQL)

Hệ thống cần kết nối với cơ sở dữ liệu MySQL (ví dụ từ XAMPP hoặc Laragon).

### 1. Kiểm tra Port MySQL của bạn:
Chúng tôi đã tạo một script kiểm tra database tại thư mục gốc. Bạn hãy mở một Terminal mới ở thư mục gốc `studyonline-main` và chạy lệnh sau:
```bash
php test_db.php
```
*Script này sẽ báo cho bạn biết cổng MySQL nào đang hoạt động (3306 hoặc 3307) và danh sách database hiện tại.*

### 2. Tạo Cơ sở dữ liệu và Nhập dữ liệu mẫu:
Mở công cụ quản lý CSDL của bạn (phpMyAdmin, DBeaver, HeidiSQL...) và:
1. Tạo một database mới tên là `studyonline_db` với mã hóa `utf8mb4_unicode_ci`.
2. Import các file SQL theo đúng thứ tự sau:
   - 📄 **`database/studyonline_db.sql`** (Khởi tạo các bảng cơ bản)
   - 📄 **`database/migration_add_payments.sql`** (Thêm bảng thanh toán `payments`)
   - 📄 **`database/sample_data.sql`** (Nhập dữ liệu mẫu: Tài khoản, khóa học, bài học, quiz...)

---

## ⚙️ Bước 2: Cấu hình và Chạy Backend (REST API)

### 1. Cấu hình file `.env` của Backend:
Mở file `backend/.env` lên và điều chỉnh thông tin kết nối MySQL phù hợp với máy của bạn:
```ini
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3307         # Đổi thành 3306 nếu MySQL của bạn chạy trên cổng mặc định 3306
DB_NAME=studyonline_db
DB_USER=root
DB_PASS=""           # Thêm mật khẩu nếu MySQL của bạn có set password
```

### 2. Chạy Server Backend:
Mở một Terminal mới, di chuyển vào thư mục `backend` và khởi chạy máy chủ PHP:
```bash
cd backend
php -S localhost:8000 -t public
```
*Lúc này, API Backend sẽ chạy tại địa chỉ: **`http://localhost:8000`***

---

## 💻 Bước 3: Cấu hình và Chạy Frontend (React + Vite)

*Hiện tại hệ thống đã tự chạy sẵn lệnh `npm run dev` ở thư mục `frontend` của bạn.*

### 1. Cấu hình file `.env` của Frontend:
Để giao diện React kết nối được tới Backend PHP chạy trên cổng 8000, hãy mở file **`frontend/.env`** và sửa lại dòng sau:
```ini
VITE_API_BASE_URL=http://localhost:8000
```

### 2. Truy cập ứng dụng:
Vite sẽ cung cấp cho bạn một đường link local (thường là **`http://localhost:5173`** hoặc tương tự). Hãy nhấp vào link đó trên terminal của bạn để mở giao diện học tập trực tuyến.

---

## 🔑 Tài khoản Thử nghiệm (Mật khẩu chung: `123456`)

Bạn có thể đăng nhập bằng các tài khoản mẫu tương ứng với 3 phân quyền sau:

1. **Quản trị viên (Admin)**:
   - Email: `admin@gmail.com`
   - Quyền: Quản lý thành viên, xem dashboard thống kê hệ thống.
   
2. **Giáo viên (Teacher)**:
   - Email: `an.nguyen@studyonline.vn` (hoặc `binh.tran@studyonline.vn`)
   - Quyền: Quản lý khóa học, bài học, chương học, tạo/sửa câu hỏi trắc nghiệm (Quizzes).

3. **Học sinh (Student)**:
   - Email: `em.hoang@gmail.com` (hoặc `phuong.vu@gmail.com`)
   - Quyền: Xem danh sách khóa học, xem bài học/video, làm bài trắc nghiệm, theo dõi tiến độ học tập.

---
*Chúc bạn chạy dự án thành công! Nếu gặp bất kỳ lỗi kết nối nào, hãy kiểm tra lại trạng thái MySQL.*
