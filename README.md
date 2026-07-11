# StudyOnline — Hệ thống Quản lý Học tập Trực tuyến (LMS)

Hệ thống quản lý học tập trực tuyến **StudyOnline**: Backend viết bằng **PHP** (REST API thuần, không framework) và Frontend là ứng dụng **React (Vite)**. Hai phần giao tiếp với nhau hoàn toàn qua API JSON — không phụ thuộc lẫn nhau về mã nguồn, có thể triển khai độc lập.

> Dự án còn giữ lại một phiên bản **Classic MVC (Monolithic)** cũ hơn (`app/`, `core/`, `public/`) và bản Frontend HTML/CSS/JS thuần trước khi chuyển sang React (`legacy-frontend-vanilla-backup/`) để tham khảo/đối chiếu. Hai phần này **không còn được phát triển tiếp**, chỉ giữ làm tư liệu.

---

## Cấu trúc Thư mục Dự án

```text
studyonline/
├── frontend/                  # ⭐ Frontend chính — React 18 + Vite + React Router + Tailwind CSS v4
│   ├── src/
│   │   ├── api/                # axiosClient.js — cấu hình axios, tự gắn JWT, xử lý lỗi 401
│   │   ├── services/           # 1 file / resource (courseService, quizService, userService...)
│   │   ├── context/            # AuthContext (đăng nhập/đăng xuất), ToastContext (thông báo)
│   │   ├── hooks/               # useAuth, useToast, useClickOutside
│   │   ├── routes/              # AppRoutes, ProtectedRoute (bảo vệ theo vai trò), PublicOnlyRoute
│   │   ├── layouts/             # PublicLayout, AppLayout, StudentLayout, AdminLayout, TeacherLayout
│   │   ├── components/          # common (Modal, biểu đồ...), layout, admin, teacher
│   │   ├── pages/                # Home, Login, Register, Courses, Chapters, Lesson, Quiz...
│   │   │   ├── student/          # Dashboard, Khóa học, Tiến độ, Chứng chỉ, Hồ sơ, Kết quả Quiz...
│   │   │   ├── admin/            # Dashboard, Quản lý User/Khóa học, Thống kê...
│   │   │   └── teacher/          # Dashboard, Khóa học/Chương/Bài học/Quiz, Học viên...
│   │   ├── assets/css/           # Stylesheet dùng chung (giữ nguyên thiết kế từ bản gốc)
│   │   ├── App.jsx / main.jsx
│   ├── index.html               # Entry point Vite
│   ├── vite.config.js           # plugin react() + tailwindcss()
│   ├── package.json
│   └── .env                     # VITE_API_BASE_URL trỏ tới backend
│
├── backend/                   # ⭐ Backend chính — REST API PHP thuần, JWT Authentication
│   ├── app/
│   │   ├── Controllers/         # Auth, User, Course, Chapter, Lesson, Quiz, Enrollment, Payment, Progress
│   │   ├── Core/                 # Router, Request, Response
│   │   ├── Middleware/           # AuthMiddleware, JwtMiddleware, RoleMiddleware
│   │   ├── Models/
│   │   └── Services/             # JwtService...
│   ├── config/                   # app.php, database.php, jwt.php
│   ├── public/                   # Điểm vào API duy nhất (index.php) + .htaccess (CORS, rewrite)
│   ├── routes/api.php            # Toàn bộ định nghĩa route /api/...
│   └── .env                      # Biến môi trường (DB, JWT secret, APP_URL)
│
├── database/                  # File CSDL SQL & dữ liệu mẫu
│   ├── studyonline_db.sql
│   ├── sample_data.sql
│   └── migration_add_payments.sql
│
├── app/ core/ public/          # [Legacy] Classic MVC monolithic — không còn phát triển tiếp
├── legacy-frontend-vanilla-backup/  # [Legacy] Frontend HTML/CSS/JS thuần trước khi chuyển React
└── README.md
```

---

## Tính năng Chính của Hệ thống

Dự án hỗ trợ 3 phân quyền người dùng chính: **Admin**, **Teacher (Giáo viên)** và **Student (Học viên)**.

### 1. Phân hệ Học viên (Student)
- Khám phá, đăng ký (miễn phí) hoặc thanh toán mua khóa học.
- Xem danh sách khóa học đã đăng ký, chi tiết từng chương mục và bài học.
- Học qua Video hoặc tài liệu đính kèm, đánh dấu hoàn thành bài học.
- Làm bài trắc nghiệm (Quiz), xem kết quả và chi tiết đúng/sai ngay lập tức.
- Theo dõi tiến độ học tập (biểu đồ tuần, tỉ lệ hoàn thành).
- Xem chứng chỉ, quản lý thông tin cá nhân.

### 2. Phân hệ Giáo viên (Teacher)
- Quản lý khóa học do mình phụ trách (thêm/sửa/xóa).
- Quản lý Chương học và Bài học tương ứng (dạng cây, kèm xem trước video/tài liệu).
- Tạo và cập nhật bộ câu hỏi trắc nghiệm (Quiz & Questions).
- Theo dõi danh sách học viên, thống kê lớp học qua Dashboard riêng.

### 3. Phân hệ Quản trị viên (Admin)
- Dashboard thống kê tổng quan hệ thống (số user theo vai trò, số khóa học...).
- Quản lý tài khoản người dùng (thêm/sửa/xóa, phân quyền admin/teacher/student).
- Quản lý toàn bộ khóa học trên hệ thống.

---

## Xác thực (Authentication)

Toàn bộ hệ thống dùng **JWT (JSON Web Token)**:
- Đăng nhập/đăng ký trả về `token` + thông tin `user`, được lưu ở `localStorage` phía frontend.
- Mọi request tới API được gắn tự động header `Authorization: Bearer <token>`.
- Backend kiểm tra token qua `JwtMiddleware`/`RoleMiddleware` theo từng route (xem `backend/routes/api.php`).
- Token hết hạn hoặc không hợp lệ (401) → frontend tự xóa phiên đăng nhập và chuyển về trang `/login`.

---

## 🛠️ Hướng dẫn Cài đặt & Chạy ứng dụng

### 1. Yêu cầu Hệ thống
- **PHP** >= 8.0 (khuyến nghị dùng qua XAMPP/Laragon)
- **MySQL / MariaDB**
- **Node.js** >= 18 & npm (cho phần frontend React)

### 2. Thiết lập Cơ sở Dữ liệu
1. Mở công cụ quản lý CSDL (phpMyAdmin, DBeaver, HeidiSQL...).
2. Tạo CSDL mới tên `studyonline_db`, mã hóa `utf8mb4_unicode_ci`.
3. Import lần lượt:
   - `database/studyonline_db.sql` (cấu trúc bảng)
   - `database/sample_data.sql` (dữ liệu mẫu)
   - `database/migration_add_payments.sql` (nếu CSDL cũ chưa có bảng thanh toán)

> [!NOTE]
> Tài khoản Administrator mặc định:
> - **Email**: `admin@gmail.com`
> - **Mật khẩu**: `123456`

### 3. Chạy Backend (`/backend`)
1. Đặt thư mục dự án trong `htdocs` của XAMPP (đường dẫn ví dụ: `http://localhost/studyonline/backend/public`).
2. Kiểm tra/sửa file `backend/.env`:
   ```ini
   APP_ENV=local
   APP_DEBUG=true
   APP_URL=http://localhost/studyonline

   DB_HOST=127.0.0.1
   DB_PORT=3307
   DB_NAME=studyonline_db
   DB_USER=root
   DB_PASS=""

   JWT_SECRET=studyonline_super_secret_key_2026
   JWT_EXPIRE=604800
   ```
   > Lưu ý cổng MySQL trong ví dụ trên là `3307` (thường dùng khi máy có nhiều bản MySQL) — đổi lại `3306` nếu XAMPP của bạn dùng cổng mặc định.
3. Bật Apache + MySQL trong XAMPP. Đảm bảo `mod_rewrite` và hỗ trợ `.htaccess` được bật (file `.htaccess` đã có sẵn trong `backend/public/`).
4. Kiểm tra API hoạt động: truy cập `http://localhost/studyonline/backend/public/api/courses` — phải trả về JSON.

### 4. Chạy Frontend React (`/frontend`)
```bash
cd frontend
npm install
npm run dev
```
Mặc định Vite chạy tại `http://localhost:5173`.

Kiểm tra file `frontend/.env`, đảm bảo trỏ đúng tới backend:
```ini
VITE_API_BASE_URL=http://localhost/studyonline/backend/public
```

Mở trình duyệt tại `http://localhost:5173` để sử dụng ứng dụng.

Build bản production:
```bash
npm run build   # xuất ra frontend/dist
npm run preview # xem thử bản build
```

### 5. (Tùy chọn) Phiên bản Classic MVC cũ
Vẫn có thể truy cập bản MVC monolithic cũ tại `http://localhost/studyonline/public/` (dùng `app/controllers` + `core/`), độc lập với cặp React + REST API ở trên. Phiên bản này không còn được cập nhật tính năng mới.

---

## Tổng quan API

Toàn bộ endpoint định nghĩa trong `backend/routes/api.php`, nhóm chính:

| Nhóm | Ví dụ endpoint | Ghi chú quyền |
|---|---|---|
| Auth | `POST /api/auth/login`, `/register`, `/logout`, `GET /api/auth/me` | Công khai (trừ `/me`) |
| Users | `GET/POST/PUT/DELETE /api/users` | Admin (một số thao tác cho phép tự sửa hồ sơ) |
| Courses | `GET/POST/PUT/DELETE /api/courses` | Đọc công khai, ghi: admin/teacher |
| Chapters / Lessons | `GET/POST/PUT/DELETE /api/chapters`, `/api/lessons` | Đọc công khai, ghi: admin/teacher |
| Quizzes / Questions | `GET/POST/PUT/DELETE /api/quizzes`, `/api/quizzes/questions` | Đọc công khai, ghi: admin/teacher |
| Nộp bài Quiz | `POST /api/quizzes/submit` | Cần đăng nhập |
| Enrollments | `GET/POST/DELETE /api/enrollments` | Cần đăng nhập |
| Payments | `GET /api/payments`, `POST /api/payments`, `GET /api/payments/check` | Cần đăng nhập |
| Progress | `GET/POST /api/progress` | Cần đăng nhập |

---

## Giao diện & Styling

- 4 trang công khai (Trang chủ/Đăng nhập/Đăng ký/Danh sách khóa học chung) dùng **Tailwind CSS v4** (`@tailwindcss/vite`).
- Khu vực Admin/Teacher/Student dashboard dùng bộ CSS thiết kế riêng (biến CSS `--primary`, `--s-primary`...), được giữ nguyên từ bản thiết kế gốc, có hỗ trợ responsive cho mobile/tablet/desktop.

---

Chúc bạn học tập và phát triển dự án hiệu quả! 🚀
