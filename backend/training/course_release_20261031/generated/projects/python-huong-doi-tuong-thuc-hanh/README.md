# Thư viện CLI — dự án Python OOP

Python 3.12+, chỉ thư viện chuẩn. Chạy `python -m unittest -v` trước khi dùng.

```text
python library_cli.py --data sandbox-library.json add PY01 "Học Python" 2
python library_cli.py --data sandbox-library.json list
python library_cli.py --data sandbox-library.json borrow PY01
python library_cli.py --data sandbox-library.json return PY01
```

Dữ liệu UTF-8 ở file do --data chỉ định, mặc định library.json. Lệnh sai trả mã thoát 2 và không lưu dữ liệu. Đường dẫn thư mục cha phải tồn tại và ghi được. Dùng file thử riêng; sao lưu trước khi sửa JSON bằng tay.

Giới hạn: một người chạy tuần tự một lệnh tại một thời điểm, file không quá 1 MB, không quản lý độc giả, không có xác thực hay giao dịch nhiều tiến trình. File tạm rồi replace không thay khóa đồng thời. Đây là dự án nền tảng để học mô hình và kiểm thử.

Hãy tự bổ sung lệnh search chỉ đọc và test theo đề bài. Rubric trong sổ tay khóa học chấm nghiệp vụ, thiết kế, lưu trữ, test và khả năng tái hiện.
