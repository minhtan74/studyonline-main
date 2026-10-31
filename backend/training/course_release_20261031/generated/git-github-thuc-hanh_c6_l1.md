## Mục tiêu bài học
- Gắn tag chú thích cho phiên bản được kiểm tra.
- Phân biệt archive mã nguồn với repository đầy đủ.
- Kiểm tra một bản bàn giao ở thư mục mới.

Thời gian dự kiến: 100 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện
Repository Study Notes có các ghi chú, quy tắc ignore và test được commit. Working tree phải sạch trước khi chọn phiên bản phát hành; nếu còn sửa, quyết định có đưa vào bản phát hành hay không và kiểm tra lại. Sản phẩm là tag chú thích `v1.0.0`, CHANGELOG, archive ZIP và báo cáo kiểm tra từ một bản clone mới.

## Phiên bản cần được chỉ rõ
Một tag đặt tên cho một đối tượng Git, giúp nhóm tham chiếu một mốc được thống nhất như phiên bản 1.0.0. Tag chú thích có thông tin bổ sung, phù hợp khi cần mô tả lý do phát hành. Tên tag không tự bảo đảm mọi test đã chạy; trách nhiệm của quy trình là ghi bằng chứng gắn với đúng commit. Trong bài, chỉ tạo tag sau khi đọc diff cuối, chạy test và cập nhật hướng dẫn.

Ghi chú phát hành trả lời ba câu: có gì mới, ai bị ảnh hưởng, cần làm gì khi dùng bản này. Không cần liệt kê mọi commit nếu người dùng chỉ cần hiểu hành vi. Với dự án ghi chú, ghi chú có thể nêu thêm bộ kiểm tra tiêu đề, cách chạy và giới hạn chưa kiểm chứng nội dung chuyên môn. Nếu còn lỗi đã biết, ghi ngắn và cụ thể để người nhận quyết định sử dụng phù hợp.

## Thực hành phát hành local
Sửa CHANGELOG thêm mục 1.0.0, đối chiếu tên file và lệnh test trong README, rồi commit phần bàn giao. Chạy từ thư mục gốc repository:
```powershell
git status --short
python -m unittest discover -s tests -v
git log --oneline -1
git tag -a v1.0.0 -m "Phat hanh ghi chu va bo kiem tra nen tang"
git show v1.0.0 --stat
git archive --format=zip --output=../study-notes-v1.0.0.zip v1.0.0
```
Nếu dự án chỉ dùng file `test_heading.py` của bài trước, chạy đúng file đó thay cho discovery và ghi lựa chọn trong README. Đừng ghi test chưa tồn tại để cho giống mẫu. Archive được tạo từ tag nên chỉ gồm nội dung được quản lý tại mốc đó; file ignored hoặc thay đổi chưa commit không tự nằm trong archive.

## Clone sạch để xác nhận
Từ thư mục cha, clone repository Study Notes sang tên mới `study-notes-check`, chuyển vào đó rồi chọn tag:
```powershell
git clone study-notes study-notes-check
cd study-notes-check
git switch --detach v1.0.0
git status --short
python -m unittest discover -s tests -v
```
Trạng thái detached HEAD ở đây là dự kiến vì đang xem mốc phát hành, chưa bắt đầu một nhánh làm việc mới. Nếu cần sửa tiếp, tạo nhánh có tên thay vì để commit mới khó nhận diện. Bài kiểm tra bàn giao phải dùng đường dẫn và cách chạy trong README, không dựa vào file riêng còn nằm ở bản gốc.

## Archive và lịch sử
ZIP từ git archive phục vụ phân phối nội dung tại một phiên bản, thường không chứa thư mục .git và toàn bộ lịch sử. Người nhận ZIP có thể đọc/chạy nội dung nhưng không tự có mọi commit để nghiên cứu quy trình. Khi bài nộp yêu cầu lịch sử, gửi repository phù hợp hoặc một Git bundle có hướng dẫn phục hồi, đồng thời archive cho sản phẩm phát hành. Hai loại bàn giao cần được ghi rõ, tránh nộp ZIP rồi khẳng định người chấm xem được các nhánh.

## Bài tập độc lập và hướng giải
Sau khi tạo v1.0.0, thêm một ghi chú chưa commit vào bản làm việc. Tạo archive lại từ chính tag với tên file khác, rồi kiểm tra ghi chú mới có xuất hiện không. Hướng giải: tag vẫn trỏ mốc cũ, nên file chưa commit không thuộc archive đó. Đạt khi bạn giải thích bằng mốc nguồn, không kết luận archive bị lỗi. Không di chuyển tag cũ tùy tiện để làm kết quả giống mong muốn; tạo phiên bản tiếp theo theo chính sách nhóm khi có thay đổi đã được duyệt.

## Lỗi thường gặp
Gắn tag trước lần sửa cuối dẫn tới bản phát hành thiếu bản sửa. Thử chạy test trong bản gốc rồi bỏ qua clone sạch có thể che phụ thuộc local. Nén cả thư mục bằng công cụ hệ điều hành có thể đưa file riêng hoặc secret vào ZIP nếu chọn bừa; git archive giúp xác định nội dung theo mốc đã chọn nhưng vẫn cần kiểm tra nguồn được quản lý.

## Tự kiểm tra và đáp án
1. Tag có tự chạy test không? Không.
2. Archive từ tag có lấy file mới chưa commit không? Không, nó lấy nội dung của mốc được chỉ định.
3. Vì sao ZIP chưa đủ khi yêu cầu đánh giá lịch sử? ZIP nội dung không chứa toàn bộ dữ liệu Git để xem quá trình phát triển.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-tag
- https://git-scm.com/docs/git-archive
- https://git-scm.com/docs/git-bundle
- https://git-scm.com/docs/git-switch