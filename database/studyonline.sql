-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3307
-- Thời gian đã tạo: Th7 21, 2026 lúc 11:57 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `studyonline_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chapters`
--

CREATE TABLE `chapters` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `chapter_name` varchar(255) NOT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chapters`
--

INSERT INTO `chapters` (`id`, `course_id`, `chapter_name`, `order_index`, `created_at`) VALUES
(1, 1, 'Làm Quen Với Python', 1, '2026-07-07 04:03:55'),
(2, 1, 'Cấu Trúc Điều Khiển & Hàm', 2, '2026-07-07 04:03:55'),
(3, 1, 'Lập Trình Hướng Đối Tượng Cơ Bản', 3, '2026-07-07 04:03:55'),
(4, 2, 'Nhập Môn JavaScript', 1, '2026-07-07 04:03:55'),
(5, 2, 'DOM & Xử Lý Sự Kiện', 2, '2026-07-07 04:03:55'),
(6, 2, 'JavaScript Hiện Đại (ES6+)', 3, '2026-07-07 04:03:55'),
(7, 3, 'Cú Pháp Cơ Bản Java', 1, '2026-07-07 04:03:55'),
(8, 3, 'Lập Trình Hướng Đối Tượng Trong Java', 2, '2026-07-07 04:03:55'),
(9, 3, 'Xử Lý Ngoại Lệ & Collection', 3, '2026-07-07 04:03:55'),
(10, 4, 'HTML Cơ Bản', 1, '2026-07-07 04:03:55'),
(11, 4, 'CSS Cơ Bản', 2, '2026-07-07 04:03:55'),
(12, 4, 'Responsive Design', 3, '2026-07-07 04:03:55'),
(13, 5, 'React Cơ Bản', 1, '2026-07-07 04:03:55'),
(14, 5, 'State Management & Hooks Nâng Cao', 2, '2026-07-07 04:03:55'),
(15, 5, 'Xây Dựng Ứng Dụng Thực Tế', 3, '2026-07-07 04:03:55'),
(16, 6, 'Nhập Môn Cơ Sở Dữ Liệu', 1, '2026-07-07 04:03:55'),
(17, 6, 'Truy Vấn SQL Nâng Cao', 2, '2026-07-07 04:03:55'),
(18, 6, 'Thiết Kế Database Chuẩn Hoá', 3, '2026-07-07 04:03:55');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `level` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `courses`
--

INSERT INTO `courses` (`id`, `teacher_id`, `title`, `slug`, `description`, `thumbnail`, `price`, `level`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'Python Cơ Bản Cho Người Mới Bắt Đầu', 'python-co-ban', 'Khoá học giúp bạn nắm vững cú pháp Python, cấu trúc điều khiển, hàm và lập trình hướng đối tượng cơ bản.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3okoVB6kjjT0nM98EwhozVLWRmyYV_pDDLHr2x06gtg&s=10', 599000.00, 'beginner', 'published', '2026-07-07 04:03:55', '2026-07-17 09:00:20'),
(2, 3, 'JavaScript Từ Zero Đến Hero', 'javascript-tu-zero-den-hero', 'Học JavaScript từ cơ bản đến nâng cao: DOM, sự kiện, ES6+, bất đồng bộ và xây dựng ứng dụng thực tế.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCNNHUWUoaauQOEoQWmsDbZ4_EKaexTJIncJb8ueWQMQ&s=10', 699000.00, 'beginner', 'published', '2026-07-07 04:03:55', '2026-07-21 21:45:43'),
(3, 4, 'Lập Trình Java Căn Bản', 'lap-trinh-java-can-ban', 'Nắm vững Java: cú pháp, OOP, xử lý ngoại lệ và Collection Framework để xây dựng ứng dụng backend.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuGI-sF5tVHqipSwjMNSRGhzQJPHzNPlEyugQVZUaDgQ&s=10', 799000.00, 'intermediate', 'published', '2026-07-07 04:03:55', '2026-07-21 21:46:18'),
(4, 3, 'HTML & CSS Nhập Môn', 'html-css-nhap-mon', 'Khoá học miễn phí giúp bạn xây dựng nền tảng HTML, CSS và thiết kế giao diện responsive.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqRqYH8hojxoRIbpBHvF4CguhyPJf7i8NmpCw4mckxWw&s=10', 0.00, 'beginner', 'published', '2026-07-07 04:03:55', '2026-07-21 21:46:37'),
(5, 3, 'ReactJS Chuyên Sâu', 'reactjs-chuyen-sau', 'Xây dựng ứng dụng thực tế với ReactJS: Hooks nâng cao, quản lý state, tối ưu hiệu năng.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-zU2PP6QhzfnpoBEq5E4ndbW-9SjDjyqNLgC6bpG6dw&s=10', 899000.00, 'advanced', 'published', '2026-07-07 04:03:55', '2026-07-21 21:47:01'),
(6, 5, 'MySQL & Thiết Kế Cơ Sở Dữ Liệu', 'mysql-thiet-ke-csdl', 'Học cách thiết kế cơ sở dữ liệu chuẩn hoá và viết truy vấn SQL hiệu quả với MySQL.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSk9jfdMcNUKHJq8fVxkA-F94WLbZyz_luftvV8IjUbJA&s=10', 499000.00, 'intermediate', 'published', '2026-07-07 04:03:55', '2026-07-21 21:47:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `enroll_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `enrollments`
--

INSERT INTO `enrollments` (`id`, `user_id`, `course_id`, `enroll_date`) VALUES
(1, 6, 1, '2026-07-07 04:03:55'),
(2, 6, 2, '2026-07-07 04:03:55'),
(3, 7, 2, '2026-07-07 04:03:55'),
(4, 7, 4, '2026-07-07 04:03:55'),
(5, 8, 1, '2026-07-07 04:03:55'),
(6, 8, 3, '2026-07-07 04:03:55'),
(7, 9, 4, '2026-07-07 04:03:55'),
(8, 9, 5, '2026-07-07 04:03:55'),
(9, 10, 1, '2026-07-07 04:03:55'),
(10, 11, 2, '2026-07-07 04:03:55'),
(11, 11, 6, '2026-07-07 04:03:55'),
(12, 12, 3, '2026-07-07 04:03:55'),
(13, 13, 5, '2026-07-07 04:03:55'),
(14, 13, 6, '2026-07-07 04:03:55'),
(15, 14, 4, '2026-07-07 04:03:55'),
(16, 15, 1, '2026-07-07 04:03:55'),
(17, 15, 2, '2026-07-07 04:03:55'),
(18, 15, 6, '2026-07-07 04:03:55'),
(19, 7, 6, '2026-07-13 04:12:51'),
(20, 7, 5, '2026-07-13 04:13:14');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lessons`
--

CREATE TABLE `lessons` (
  `id` int(11) NOT NULL,
  `chapter_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `duration` int(11) NOT NULL DEFAULT 0 COMMENT 'Thời lượng tính bằng giây',
  `order_index` int(11) NOT NULL DEFAULT 0 COMMENT 'Thứ tự bài học trong chương',
  `is_free` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = xem thử miễn phí',
  `status` enum('draft','published') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `lessons`
--

INSERT INTO `lessons` (`id`, `chapter_id`, `title`, `description`, `video_url`, `document_url`, `duration`, `order_index`, `is_free`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Cài đặt Python & IDE', 'Hướng dẫn cài đặt Python và VS Code.', 'https://www.youtube.com/watch?v=bP3CKt0ZJQA', 'docs/py_01.pdf', 600, 1, 1, 'published', '2026-07-07 04:03:55', '2026-07-15 07:13:45'),
(2, 1, 'Biến và kiểu dữ liệu', 'Tìm hiểu về biến, kiểu dữ liệu cơ bản trong Python.', 'https://www.youtube.com/watch?v=RDiL6VLud-Q&t=1s', 'docs/py_02.pdf', 720, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-21 21:49:08'),
(3, 1, 'Toán tử trong Python', 'Các loại toán tử số học, so sánh, logic.', 'https://www.youtube.com/watch?v=r9vECIW0Z3M&t=1s', 'docs/py_03.pdf', 540, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-21 21:49:38'),
(4, 2, 'Câu lệnh if - else', 'Cấu trúc rẽ nhánh trong Python.', 'videos/py_04.mp4', 'docs/py_04.pdf', 660, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(5, 2, 'Vòng lặp for, while', 'Cách sử dụng vòng lặp trong Python.', 'videos/py_05.mp4', 'docs/py_05.pdf', 780, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(6, 2, 'Định nghĩa và sử dụng hàm', 'Cách viết hàm, tham số, giá trị trả về.', 'videos/py_06.mp4', 'docs/py_06.pdf', 700, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(7, 3, 'Class và Object', 'Khái niệm lớp và đối tượng trong Python.', 'videos/py_07.mp4', 'docs/py_07.pdf', 800, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(8, 3, 'Kế thừa (Inheritance)', 'Tính kế thừa trong lập trình hướng đối tượng.', 'videos/py_08.mp4', 'docs/py_08.pdf', 750, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(9, 3, 'Dự án nhỏ: Quản lý sinh viên', 'Áp dụng OOP xây dựng chương trình quản lý sinh viên.', 'videos/py_09.mp4', 'docs/py_09.pdf', 900, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(10, 4, 'JavaScript là gì?', 'Giới thiệu tổng quan về JavaScript.', 'videos/js_01.mp4', 'docs/js_01.pdf', 500, 1, 1, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(11, 4, 'Biến, kiểu dữ liệu & toán tử', 'Var, let, const và các kiểu dữ liệu trong JS.', 'videos/js_02.mp4', 'docs/js_02.pdf', 650, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(12, 4, 'Hàm trong JavaScript', 'Function declaration, function expression, arrow function.', 'videos/js_03.mp4', 'docs/js_03.pdf', 700, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(13, 5, 'Tổng quan về DOM', 'DOM là gì và cách thao tác với DOM.', 'videos/js_04.mp4', 'docs/js_04.pdf', 620, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(14, 5, 'Xử lý sự kiện click, submit', 'Event listener và xử lý sự kiện người dùng.', 'videos/js_05.mp4', 'docs/js_05.pdf', 680, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(15, 5, 'Dự án: To-do List', 'Xây dựng ứng dụng to-do list bằng JavaScript thuần.', 'videos/js_06.mp4', 'docs/js_06.pdf', 900, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(16, 6, 'Arrow function & Destructuring', 'Cú pháp ES6 giúp code ngắn gọn hơn.', 'videos/js_07.mp4', 'docs/js_07.pdf', 640, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(17, 6, 'Promise & Async/Await', 'Xử lý bất đồng bộ trong JavaScript.', 'videos/js_08.mp4', 'docs/js_08.pdf', 760, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(18, 6, 'Module & Fetch API', 'Import/export module và gọi API bằng fetch.', 'videos/js_09.mp4', 'docs/js_09.pdf', 700, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(19, 7, 'Cài đặt JDK & IntelliJ', 'Chuẩn bị môi trường lập trình Java.', 'https://www.youtube.com/watch?v=iPYTxg99eMY', 'docs/java_01.pdf', 600, 1, 1, 'published', '2026-07-07 04:03:55', '2026-07-21 21:53:03'),
(20, 7, 'Biến, kiểu dữ liệu trong Java', 'Kiểu dữ liệu nguyên thuỷ và tham chiếu.', 'http://youtube.com/watch?v=9A5ztUs1zBw', 'docs/java_02.pdf', 650, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-21 21:53:24'),
(21, 7, 'Cấu trúc điều khiển', 'If-else, switch-case, vòng lặp trong Java.', 'https://www.youtube.com/watch?v=-_4_O9t0rn8', 'docs/java_03.pdf', 700, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-21 21:53:49'),
(22, 8, 'Class, Object, Constructor', 'Khái niệm lớp, đối tượng và constructor.', 'videos/java_04.mp4', 'docs/java_04.pdf', 750, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(23, 8, 'Kế thừa & Đa hình', 'Inheritance và Polymorphism trong Java.', 'videos/java_05.mp4', 'docs/java_05.pdf', 800, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(24, 8, 'Interface & Abstract Class', 'Sự khác biệt và cách sử dụng interface, abstract class.', 'videos/java_06.mp4', 'docs/java_06.pdf', 780, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(25, 9, 'Try-catch & Custom Exception', 'Xử lý ngoại lệ trong Java.', 'videos/java_07.mp4', 'docs/java_07.pdf', 640, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(26, 9, 'ArrayList & HashMap', 'Làm việc với Collection Framework.', 'videos/java_08.mp4', 'docs/java_08.pdf', 700, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(27, 9, 'Dự án: Quản lý sản phẩm', 'Ứng dụng console quản lý sản phẩm bằng Java.', 'videos/java_09.mp4', 'docs/java_09.pdf', 900, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(28, 10, 'Cấu trúc tài liệu HTML', 'Thẻ HTML cơ bản và cấu trúc trang.', 'videos/html_01.mp4', 'docs/html_01.pdf', 500, 1, 1, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(29, 10, 'Form và bảng biểu', 'Thẻ form, input, table trong HTML.', 'videos/html_02.mp4', 'docs/html_02.pdf', 600, 2, 1, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(30, 10, 'Semantic HTML', 'Các thẻ ngữ nghĩa: header, section, article...', 'videos/html_03.mp4', 'docs/html_03.pdf', 550, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(31, 11, 'Selector & thuộc tính CSS', 'Cách chọn phần tử và áp dụng style.', 'videos/css_01.mp4', 'docs/css_01.pdf', 620, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(32, 11, 'Box Model & Flexbox', 'Hiểu về box model và bố cục Flexbox.', 'videos/css_02.mp4', 'docs/css_02.pdf', 700, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(33, 11, 'CSS Grid', 'Xây dựng bố cục bằng CSS Grid.', 'videos/css_03.mp4', 'docs/css_03.pdf', 680, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(34, 12, 'Media Query', 'Thiết kế responsive với media query.', 'videos/css_04.mp4', 'docs/css_04.pdf', 640, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(35, 12, 'Mobile First Design', 'Nguyên tắc thiết kế ưu tiên mobile.', 'videos/css_05.mp4', 'docs/css_05.pdf', 600, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(36, 12, 'Dự án: Landing Page Responsive', 'Xây dựng landing page hoàn chỉnh, responsive.', 'videos/css_06.mp4', 'docs/css_06.pdf', 900, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(37, 13, 'Giới thiệu React & JSX', 'React là gì, cách JSX hoạt động.', 'videos/react_01.mp4', 'https://www.youtube.com/watch?v=jzLupKff3gI', 600, 1, 1, 'published', '2026-07-07 04:03:55', '2026-07-21 21:50:58'),
(38, 13, 'Component & Props', 'Xây dựng component và truyền dữ liệu qua props.', 'http://youtube.com/watch?v=5TJ5RcPxPR8', 'docs/react_02.pdf', 700, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-21 21:51:44'),
(39, 13, 'State & useState', 'Quản lý trạng thái component với useState.', 'https://www.youtube.com/watch?v=8E_DJVQnWLE', 'docs/react_03.pdf', 720, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-21 21:52:18'),
(40, 14, 'useEffect & vòng đời component', 'Xử lý side-effect trong React.', 'videos/react_04.mp4', 'docs/react_04.pdf', 750, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(41, 14, 'useContext & useReducer', 'Quản lý state phức tạp với Context và Reducer.', 'videos/react_05.mp4', 'docs/react_05.pdf', 800, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(42, 14, 'Custom Hooks', 'Xây dựng custom hook để tái sử dụng logic.', 'videos/react_06.mp4', 'docs/react_06.pdf', 700, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(43, 15, 'Kết nối API với Axios', 'Gọi API và xử lý dữ liệu trong React.', 'videos/react_07.mp4', 'docs/react_07.pdf', 780, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(44, 15, 'Routing với React Router', 'Điều hướng nhiều trang trong ứng dụng React.', 'videos/react_08.mp4', 'docs/react_08.pdf', 700, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(45, 15, 'Dự án: Trang quản lý khoá học', 'Xây dựng ứng dụng quản lý khoá học hoàn chỉnh.', 'videos/react_09.mp4', 'docs/react_09.pdf', 1000, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(46, 16, 'Khái niệm cơ sở dữ liệu', 'CSDL quan hệ, bảng, khoá chính, khoá ngoại.', 'videos/sql_01.mp4', 'docs/sql_01.pdf', 550, 1, 1, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(47, 16, 'Cài đặt MySQL & Workbench', 'Hướng dẫn cài đặt công cụ làm việc với MySQL.', 'videos/sql_02.mp4', 'docs/sql_02.pdf', 500, 2, 1, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(48, 16, 'Câu lệnh SELECT cơ bản', 'Truy vấn dữ liệu cơ bản với SELECT.', 'videos/sql_03.mp4', 'docs/sql_03.pdf', 620, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(49, 17, 'JOIN nhiều bảng', 'INNER JOIN, LEFT JOIN, RIGHT JOIN.', 'videos/sql_04.mp4', 'docs/sql_04.pdf', 700, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(50, 17, 'GROUP BY & Aggregate Function', 'Tổng hợp dữ liệu với GROUP BY, SUM, COUNT.', 'videos/sql_05.mp4', 'docs/sql_05.pdf', 680, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(51, 17, 'Subquery & View', 'Truy vấn con và tạo view trong MySQL.', 'videos/sql_06.mp4', 'docs/sql_06.pdf', 720, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(52, 18, 'Chuẩn hoá dữ liệu (1NF-3NF)', 'Các dạng chuẩn hoá cơ sở dữ liệu.', 'videos/sql_07.mp4', 'docs/sql_07.pdf', 750, 1, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(53, 18, 'Thiết kế ERD', 'Vẽ sơ đồ thực thể - quan hệ cho hệ thống.', 'videos/sql_08.mp4', 'docs/sql_08.pdf', 700, 2, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(54, 18, 'Dự án: Thiết kế CSDL website học trực tuyến', 'Áp dụng kiến thức thiết kế CSDL cho một hệ thống thực tế.', 'videos/sql_09.mp4', 'docs/sql_09.pdf', 900, 3, 0, 'published', '2026-07-07 04:03:55', '2026-07-07 04:03:55');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `watched_sec` int(11) NOT NULL DEFAULT 0 COMMENT 'Số giây đã xem',
  `completed_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `lesson_progress`
--

INSERT INTO `lesson_progress` (`id`, `user_id`, `lesson_id`, `is_completed`, `watched_sec`, `completed_at`, `updated_at`) VALUES
(1, 6, 1, 1, 600, '2026-06-01 03:00:00', '2026-07-07 04:03:55'),
(2, 6, 2, 1, 720, '2026-06-02 03:00:00', '2026-07-07 04:03:55'),
(3, 6, 3, 0, 200, NULL, '2026-07-07 04:03:55'),
(4, 6, 10, 1, 500, '2026-06-05 02:00:00', '2026-07-07 04:03:55'),
(5, 8, 1, 1, 600, '2026-05-20 01:30:00', '2026-07-07 04:03:55'),
(6, 8, 4, 1, 660, '2026-05-21 01:30:00', '2026-07-07 04:03:55'),
(7, 8, 19, 1, 600, '2026-06-10 07:00:00', '2026-07-07 04:03:55'),
(8, 10, 1, 1, 600, '2026-06-15 13:00:00', '2026-07-07 04:03:55'),
(9, 10, 2, 0, 300, NULL, '2026-07-07 04:03:55'),
(10, 15, 1, 1, 600, '2026-06-01 00:00:00', '2026-07-07 04:03:55'),
(11, 15, 2, 1, 720, '2026-06-01 01:00:00', '2026-07-07 04:03:55'),
(12, 15, 3, 1, 540, '2026-06-02 00:00:00', '2026-07-07 04:03:55'),
(13, 15, 10, 1, 500, '2026-06-03 00:00:00', '2026-07-07 04:03:55'),
(14, 11, 10, 1, 500, '2026-06-04 00:00:00', '2026-07-07 04:03:55'),
(15, 11, 46, 1, 550, '2026-06-12 00:00:00', '2026-07-07 04:03:55'),
(16, 7, 10, 1, 0, '2026-07-07 10:29:31', '2026-07-07 15:29:31'),
(17, 6, 37, 1, 0, '2026-07-12 20:56:26', '2026-07-13 03:56:26'),
(18, 6, 46, 1, 0, '2026-07-12 20:56:50', '2026-07-13 03:56:50'),
(19, 6, 47, 1, 0, '2026-07-12 20:56:54', '2026-07-13 03:56:54'),
(20, 6, 48, 1, 0, '2026-07-12 20:56:56', '2026-07-13 03:56:56'),
(21, 6, 49, 1, 0, '2026-07-12 20:56:59', '2026-07-13 03:56:59'),
(22, 6, 50, 1, 0, '2026-07-12 20:57:01', '2026-07-13 03:57:01'),
(23, 6, 51, 1, 0, '2026-07-12 20:57:03', '2026-07-13 03:57:03'),
(24, 6, 52, 1, 0, '2026-07-12 20:57:05', '2026-07-13 03:57:05'),
(25, 6, 53, 1, 0, '2026-07-12 20:57:07', '2026-07-13 03:57:07'),
(26, 6, 54, 1, 0, '2026-07-12 20:57:09', '2026-07-13 03:57:09'),
(27, 6, 28, 1, 0, '2026-07-12 21:02:05', '2026-07-13 04:02:05'),
(28, 6, 11, 1, 0, '2026-07-12 21:08:48', '2026-07-13 04:08:48'),
(29, 7, 46, 1, 0, '2026-07-12 21:12:51', '2026-07-13 04:12:51'),
(30, 7, 47, 1, 0, '2026-07-12 21:14:53', '2026-07-13 04:14:53'),
(31, 7, 48, 1, 0, '2026-07-12 21:15:06', '2026-07-13 04:15:06'),
(32, 7, 49, 1, 0, '2026-07-13 19:35:17', '2026-07-14 02:35:17'),
(33, 7, 50, 1, 0, '2026-07-13 19:38:07', '2026-07-14 02:38:07'),
(34, 7, 51, 1, 0, '2026-07-13 19:38:09', '2026-07-14 02:38:09'),
(35, 7, 52, 1, 0, '2026-07-13 19:38:11', '2026-07-14 02:38:11'),
(36, 7, 53, 1, 0, '2026-07-13 19:38:15', '2026-07-14 02:38:15'),
(37, 7, 54, 1, 0, '2026-07-13 19:38:18', '2026-07-14 02:38:18'),
(38, 7, 11, 1, 0, '2026-07-13 19:41:29', '2026-07-14 02:41:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `method` enum('card','bank_transfer','momo','zalopay') DEFAULT 'card',
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `transaction_ref` varchar(100) DEFAULT NULL COMMENT 'Mã giao dịch / mã tham chiếu',
  `note` text DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`id`, `user_id`, `course_id`, `amount`, `method`, `status`, `transaction_ref`, `note`, `paid_at`, `created_at`, `updated_at`) VALUES
(1, 6, 1, 599000.00, 'momo', 'completed', 'TXN20260601001', 'Thanh toán khoá Python cơ bản', '2026-05-30 02:15:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(2, 6, 2, 699000.00, 'card', 'completed', 'TXN20260601002', 'Thanh toán khoá JavaScript', '2026-05-30 02:20:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(3, 7, 2, 699000.00, 'bank_transfer', 'completed', 'TXN20260602001', NULL, '2026-06-01 03:00:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(4, 8, 1, 599000.00, 'zalopay', 'completed', 'TXN20260602002', NULL, '2026-05-19 01:00:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(5, 8, 3, 799000.00, 'card', 'completed', 'TXN20260603001', NULL, '2026-06-09 07:00:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(6, 9, 5, 899000.00, 'momo', 'pending', 'TXN20260604001', 'Đang chờ xác nhận thanh toán', NULL, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(7, 10, 1, 599000.00, 'card', 'completed', 'TXN20260605001', NULL, '2026-06-14 12:00:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(8, 11, 2, 699000.00, 'bank_transfer', 'completed', 'TXN20260606001', NULL, '2026-06-03 13:00:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(9, 11, 6, 499000.00, 'momo', 'completed', 'TXN20260606002', NULL, '2026-06-11 00:30:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(10, 12, 3, 799000.00, 'card', 'failed', 'TXN20260607001', 'Thẻ hết hạn mức, thanh toán thất bại', NULL, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(11, 13, 5, 899000.00, 'zalopay', 'completed', 'TXN20260608001', NULL, '2026-06-19 02:00:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(12, 13, 6, 499000.00, 'card', 'completed', 'TXN20260608002', NULL, '2026-06-19 02:05:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(13, 15, 1, 599000.00, 'momo', 'completed', 'TXN20260609001', NULL, '2026-05-31 23:30:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(14, 15, 2, 699000.00, 'momo', 'completed', 'TXN20260609002', NULL, '2026-05-31 23:35:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(15, 15, 6, 499000.00, 'bank_transfer', 'refunded', 'TXN20260609003', 'Học viên yêu cầu hoàn tiền', '2026-06-04 23:40:00', '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(16, 7, 5, 899000.00, 'momo', 'completed', 'SO2607130413141004', NULL, '2026-07-13 04:13:14', '2026-07-13 04:13:14', '2026-07-13 04:13:14');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `option_a` varchar(255) NOT NULL,
  `option_b` varchar(255) NOT NULL,
  `option_c` varchar(255) NOT NULL,
  `option_d` varchar(255) NOT NULL,
  `correct_answer` enum('A','B','C','D') NOT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `questions`
--

INSERT INTO `questions` (`id`, `quiz_id`, `content`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `order_index`) VALUES
(1, 1, 'Từ khoá nào dùng để định nghĩa hàm trong Python?', 'func', 'def', 'function', 'lambda', 'B', 1),
(2, 1, 'Kiểu dữ liệu nào dùng để lưu danh sách có thể thay đổi trong Python?', 'tuple', 'set', 'list', 'dict', 'C', 2),
(3, 1, 'Toán tử nào dùng để so sánh bằng trong Python?', '=', '==', '===', '!=', 'B', 3),
(4, 1, 'Vòng lặp nào dùng để lặp qua từng phần tử của một danh sách?', 'while', 'for', 'do-while', 'repeat', 'B', 4),
(5, 1, 'Kết quả của \"print(type(3.14))\" là gì?', 'int', 'str', 'float', 'bool', 'C', 5),
(6, 2, 'Từ khoá nào dùng để khai báo biến không đổi trong ES6?', 'var', 'let', 'const', 'static', 'C', 1),
(7, 2, 'Phương thức nào dùng để chọn phần tử theo id trong DOM?', 'querySelectorAll', 'getElementById', 'getElementByClass', 'find', 'B', 2),
(8, 2, 'Kết quả của \"typeof null\" trong JavaScript là gì?', 'null', 'undefined', 'object', 'number', 'C', 3),
(9, 2, 'Cú pháp nào là arrow function hợp lệ?', 'function() => {}', '() => {}', '=> function() {}', 'func => {}', 'B', 4),
(10, 2, 'Promise có trạng thái nào sau khi hoàn thành thành công?', 'pending', 'fulfilled', 'rejected', 'idle', 'B', 5),
(11, 3, 'Từ khoá nào dùng để kế thừa một lớp trong Java?', 'implements', 'extends', 'inherits', 'super', 'B', 1),
(12, 3, 'Java hỗ trợ đa kế thừa với lớp thông qua?', 'class', 'interface', 'abstract class', 'không hỗ trợ', 'B', 2),
(13, 3, 'Từ khoá nào dùng để bắt ngoại lệ trong Java?', 'catch', 'except', 'handle', 'rescue', 'A', 3),
(14, 3, 'Cấu trúc dữ liệu nào lưu trữ theo dạng key-value trong Java?', 'ArrayList', 'HashMap', 'LinkedList', 'Stack', 'B', 4),
(15, 3, 'Constructor trong Java có đặc điểm gì?', 'Có kiểu trả về', 'Trùng tên với lớp', 'Không thể overload', 'Là static', 'B', 5),
(16, 4, 'Thẻ nào dùng để tạo liên kết trong HTML?', '<link>', '<a>', '<href>', '<url>', 'B', 1),
(17, 4, 'Thuộc tính CSS nào dùng để đổi màu chữ?', 'background-color', 'color', 'font-color', 'text-style', 'B', 2),
(18, 4, 'Flexbox thuộc tính nào dùng để căn giữa theo trục chính?', 'align-items', 'justify-content', 'flex-direction', 'flex-wrap', 'B', 3),
(19, 4, 'Media query dùng để làm gì?', 'Tối ưu SEO', 'Thiết kế responsive', 'Kết nối database', 'Xử lý sự kiện', 'B', 4),
(20, 4, 'Thẻ HTML nào mang tính ngữ nghĩa (semantic)?', '<div>', '<span>', '<section>', '<b>', 'C', 5),
(21, 5, 'Hook nào dùng để quản lý state trong function component?', 'useEffect', 'useState', 'useRef', 'useMemo', 'B', 1),
(22, 5, 'Props trong React có đặc điểm gì?', 'Có thể thay đổi trong component con', 'Chỉ đọc (read-only)', 'Chỉ dùng cho class component', 'Không truyền được dữ liệu', 'B', 2),
(23, 5, 'Hook nào dùng để xử lý side-effect?', 'useState', 'useEffect', 'useContext', 'useCallback', 'B', 3),
(24, 5, 'JSX là gì?', 'Một ngôn ngữ lập trình mới', 'Cú pháp mở rộng của JavaScript', 'Một framework CSS', 'Một cơ sở dữ liệu', 'B', 4),
(25, 5, 'Thư viện nào thường dùng để định tuyến trong React?', 'Redux', 'Axios', 'React Router', 'Lodash', 'C', 5),
(26, 6, 'Câu lệnh nào dùng để truy vấn dữ liệu trong SQL?', 'GET', 'SELECT', 'FETCH', 'SHOW', 'B', 1),
(27, 6, 'Loại JOIN nào trả về tất cả các dòng từ bảng bên trái?', 'INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN', 'C', 2),
(28, 6, 'Khoá ngoại (foreign key) dùng để làm gì?', 'Tăng tốc truy vấn', 'Liên kết dữ liệu giữa 2 bảng', 'Mã hoá dữ liệu', 'Xoá dữ liệu tự động', 'B', 3),
(29, 6, 'Hàm nào dùng để đếm số dòng trong SQL?', 'SUM()', 'COUNT()', 'TOTAL()', 'LEN()', 'B', 4),
(30, 6, 'Dạng chuẩn nào yêu cầu loại bỏ sự phụ thuộc bắc cầu?', '1NF', '2NF', '3NF', 'BCNF', 'C', 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `quizzes`
--

INSERT INTO `quizzes` (`id`, `course_id`, `title`, `description`, `created_at`) VALUES
(1, 1, 'Kiểm tra kiến thức Python cơ bản', 'Bài kiểm tra tổng hợp về biến, cấu trúc điều khiển và hàm trong Python.', '2026-07-07 04:03:55'),
(2, 2, 'Kiểm tra JavaScript nền tảng', 'Bài kiểm tra về biến, hàm, DOM và ES6+.', '2026-07-07 04:03:55'),
(3, 3, 'Kiểm tra Java OOP', 'Bài kiểm tra về lớp, đối tượng, kế thừa trong Java.', '2026-07-07 04:03:55'),
(4, 4, 'Kiểm tra HTML & CSS', 'Bài kiểm tra kiến thức HTML, CSS và responsive design.', '2026-07-07 04:03:55'),
(5, 5, 'Kiểm tra ReactJS', 'Bài kiểm tra về component, props, state và hooks.', '2026-07-07 04:03:55'),
(6, 6, 'Kiểm tra SQL căn bản', 'Bài kiểm tra về truy vấn SELECT, JOIN và thiết kế CSDL.', '2026-07-07 04:03:55');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `results`
--

CREATE TABLE `results` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `score` int(11) NOT NULL DEFAULT 0,
  `total` int(11) NOT NULL DEFAULT 0 COMMENT 'Tổng số câu hỏi',
  `submit_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `results`
--

INSERT INTO `results` (`id`, `user_id`, `quiz_id`, `score`, `total`, `submit_time`) VALUES
(1, 6, 1, 4, 5, '2026-06-10 04:00:00'),
(2, 8, 1, 5, 5, '2026-06-11 02:00:00'),
(3, 10, 1, 3, 5, '2026-06-16 14:00:00'),
(4, 15, 1, 5, 5, '2026-06-03 01:00:00'),
(5, 6, 2, 3, 5, '2026-06-12 05:00:00'),
(6, 7, 2, 4, 5, '2026-06-13 03:00:00'),
(7, 11, 2, 5, 5, '2026-06-14 08:00:00'),
(8, 15, 2, 4, 5, '2026-06-04 02:00:00'),
(9, 8, 3, 4, 5, '2026-06-15 03:00:00'),
(10, 12, 3, 3, 5, '2026-06-17 07:00:00'),
(11, 9, 4, 5, 5, '2026-06-18 09:00:00'),
(12, 14, 4, 4, 5, '2026-06-19 10:00:00'),
(13, 9, 5, 3, 5, '2026-06-20 11:00:00'),
(14, 13, 5, 5, 5, '2026-06-21 12:00:00'),
(15, 11, 6, 4, 5, '2026-06-22 03:00:00'),
(16, 13, 6, 5, 5, '2026-06-23 04:00:00'),
(17, 15, 6, 3, 5, '2026-06-24 05:00:00'),
(18, 6, 1, 1, 5, '2026-07-07 04:05:01'),
(19, 6, 1, 1, 5, '2026-07-07 04:38:08'),
(20, 7, 1, 0, 5, '2026-07-07 15:29:59'),
(21, 7, 1, 0, 5, '2026-07-08 01:04:40'),
(22, 7, 1, 0, 5, '2026-07-08 01:06:39'),
(23, 6, 1, 5, 5, '2026-07-08 01:08:31'),
(24, 7, 2, 2, 5, '2026-07-08 01:33:05'),
(25, 6, 1, 5, 5, '2026-07-08 01:35:57'),
(26, 7, 1, 0, 5, '2026-07-08 01:49:13'),
(27, 7, 1, 0, 5, '2026-07-08 01:56:16'),
(28, 7, 1, 1, 5, '2026-07-08 01:56:37'),
(29, 7, 1, 2, 5, '2026-07-08 02:14:15'),
(30, 7, 1, 0, 5, '2026-07-08 02:16:18'),
(31, 7, 1, 0, 5, '2026-07-08 02:17:20'),
(32, 7, 1, 0, 5, '2026-07-08 02:17:39'),
(33, 7, 1, 2, 5, '2026-07-08 02:18:26'),
(34, 7, 1, 3, 5, '2026-07-08 02:19:36'),
(35, 7, 1, 1, 5, '2026-07-08 02:20:00'),
(36, 7, 1, 3, 5, '2026-07-08 02:22:03'),
(37, 7, 1, 1, 5, '2026-07-08 02:22:52'),
(38, 6, 1, 0, 5, '2026-07-13 03:47:37'),
(39, 7, 1, 1, 5, '2026-07-13 04:16:40'),
(40, 7, 1, 4, 5, '2026-07-13 04:17:11'),
(41, 7, 1, 1, 5, '2026-07-15 07:38:32');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') DEFAULT 'student',
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `role`, `avatar`, `bio`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'admin@gmail.com', '123456', 'admin', NULL, NULL, 1, '2026-07-07 04:03:37', '2026-07-07 04:03:37'),
(2, 'Nguyễn Văn An', 'an.nguyen@studyonline.vn', '123456', 'teacher', 'avatars/teacher_an.jpg', 'Giảng viên Python với 8 năm kinh nghiệm phát triển backend.', 1, '2026-07-07 04:03:55', '2026-07-15 09:07:04'),
(3, 'Trần Thị Bình', 'binh.tran@studyonline.vn', '123456', 'teacher', 'avatars/teacher_binh.jpg', 'Frontend Developer, chuyên JavaScript, React và UI/UX.', 1, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(4, 'Lê Văn Cường', 'cuong.le@studyonline.vn', '123456', 'teacher', 'avatars/teacher_cuong.jpg', 'Kỹ sư backend Java, từng làm việc tại nhiều dự án doanh nghiệp lớn.', 1, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(5, 'Phạm Thị Duyên', 'duyen.pham@studyonline.vn', '123456', 'teacher', 'avatars/teacher_duyen.jpg', 'Chuyên gia cơ sở dữ liệu, quản trị hệ thống MySQL/PostgreSQL.', 1, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(6, 'Hoàng Văn Em', 'em.hoang@gmail.com', '123456', 'student', 'avatars/student_em.jpg', 'Sinh viên năm 3, đam mê lập trình web.', 1, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(7, 'Vũ Thị Phươngg', 'phuong.vu@gmail.com', '123456', 'student', 'avatars/student_phuong.jpg', 'Đang chuyển ngành sang IT.', 1, '2026-07-07 04:03:55', '2026-07-13 03:42:25'),
(8, 'Đặng Văn Giang', 'giang.dang@gmail.com', '123456', 'student', 'avatars/student_giang.jpg', 'Học lập trình để tự động hoá công việc.', 1, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(9, 'Bùi Thị Hoa', 'hoa.bui@gmail.com', '123456', 'student', 'avatars/student_hoa.jpg', 'Yêu thích thiết kế web và giao diện.', 1, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(10, 'Đỗ Văn Khôi', 'khoi.do@gmail.com', '123456', 'student', 'avatars/student_khoi.jpg', 'Mới bắt đầu học lập trình.', 1, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(11, 'Ngô Thị Lan', 'lan.ngo@gmail.com', '123456', 'student', 'avatars/student_lan.jpg', 'Sinh viên CNTT năm 2.', 1, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(12, 'Dương Văn Minh', 'minh.duong@gmail.com', '123456', 'student', 'avatars/student_minh.jpg', 'Muốn trở thành Fullstack Developer.', 1, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(13, 'Lý Thị Ngọc', 'ngoc.ly@gmail.com', '123456', 'student', 'avatars/student_ngoc.jpg', 'Đang ôn thi chứng chỉ lập trình.', 1, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(14, 'Phan Văn Phúc', 'phuc.phan@gmail.com', '123456', 'student', 'avatars/student_phuc.jpg', 'Tự học lập trình qua các khoá online.', 0, '2026-07-07 04:03:55', '2026-07-07 04:03:55'),
(15, 'Trịnh Thị Quỳnh', 'quynh.trinh@gmail.com', '123456', 'student', 'avatars/student_quynh.jpg', 'Yêu thích cơ sở dữ liệu và phân tích số liệu.', 1, '2026-07-07 04:03:55', '2026-07-07 04:03:55');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `chapters`
--
ALTER TABLE `chapters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_chapter_course` (`course_id`);

--
-- Chỉ mục cho bảng `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_course_teacher` (`teacher_id`);

--
-- Chỉ mục cho bảng `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_enrollment` (`user_id`,`course_id`),
  ADD KEY `fk_enroll_course` (`course_id`);

--
-- Chỉ mục cho bảng `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lesson_chapter` (`chapter_id`);

--
-- Chỉ mục cho bảng `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_progress` (`user_id`,`lesson_id`),
  ADD KEY `fk_progress_lesson` (`lesson_id`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_payment_user` (`user_id`),
  ADD KEY `fk_payment_course` (`course_id`);

--
-- Chỉ mục cho bảng `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_question_quiz` (`quiz_id`);

--
-- Chỉ mục cho bảng `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_quiz_course` (`course_id`);

--
-- Chỉ mục cho bảng `results`
--
ALTER TABLE `results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_result_user` (`user_id`),
  ADD KEY `fk_result_quiz` (`quiz_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `chapters`
--
ALTER TABLE `chapters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT cho bảng `lesson_progress`
--
ALTER TABLE `lesson_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT cho bảng `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT cho bảng `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `results`
--
ALTER TABLE `results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `chapters`
--
ALTER TABLE `chapters`
  ADD CONSTRAINT `fk_chapter_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `fk_course_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `fk_enroll_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_enroll_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `fk_lesson_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `fk_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `fk_question_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `fk_quiz_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `results`
--
ALTER TABLE `results`
  ADD CONSTRAINT `fk_result_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_result_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
