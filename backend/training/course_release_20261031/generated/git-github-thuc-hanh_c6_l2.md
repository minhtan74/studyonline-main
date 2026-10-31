## Mục tiêu bài học
- Tích hợp các kỹ năng thành một quy trình có bằng chứng.
- Bàn giao dự án theo rubric và tiêu chí tái tạo.
- Tự phân tích khoảng trống trước khi kết thúc khóa.

Thời gian dự kiến: 140 phút, gồm đọc và thực hành.

## Đề bài dự án
Xây dựng repository Study Notes cho nhóm học hai người. Sản phẩm quản lý ghi chú theo tuần và có công cụ kiểm tra các yêu cầu cấu trúc. Mục tiêu đánh giá là quy trình tạo thay đổi, cộng tác, kiểm tra và bàn giao; không đo số dòng mã hay số lần bấm commit. Dùng bản mẫu kèm khóa hoặc tự viết phiên bản tương đương, nhưng phải giải thích mọi bước chạy bằng README.

## Yêu cầu chức năng và cấu trúc
Repository cần README có mục đích, yêu cầu môi trường, cách chạy test và cấu trúc file; ít nhất hai ghi chú Markdown có tiêu đề; công cụ kiểm tra không chấp nhận placeholder bắt buộc; test có trường hợp hợp lệ và vi phạm; CHANGELOG; thư mục reviews ghi một đề xuất cùng phản hồi. Không dùng file ngoài repository hoặc đường dẫn tuyệt đối riêng để làm test đạt. Dùng dữ liệu minh họa do bạn tự tạo, không sao chép ghi chú riêng của người khác.

Quy trình cần ít nhất tám commit có mục đích, hai nhánh tính năng và một minh chứng giải quyết xung đột theo yêu cầu. Mô phỏng hai người bằng remote bare local với hai clone; ghi rõ ai thao tác trong mô phỏng và không giả việc người khác đã review. Có thể dùng GitHub thật trên repository học tập được phép nhưng không bắt buộc công khai hay mời người khác. Nộp cùng một bộ tiêu chí cho cả hai cách.

## Lộ trình làm dự án
1. Đọc đề, lập checklist và tạo repository trong thư mục mới. Commit README ban đầu cùng danh mục công việc.
2. Tạo nhánh notes để hoàn thiện nội dung hai tuần; tự kiểm tra link và tiêu đề, commit theo phạm vi.
3. Tạo nhánh checker cho công cụ và test. Viết test vi phạm trước hoặc chứng minh test thất bại trên một đầu vào sai có kiểm soát.
4. Mô phỏng hai clone, trao đổi thay đổi qua remote local, đọc log/diff trước khi merge.
5. Ghi hồ sơ review, thực hiện ít nhất một chỉnh sửa từ nhận xét, chạy lại test.
6. Tạo một thay đổi lab có chủ đích cần hoàn tác, dùng revert và ghi lý do; không gây lỗi thực cho dữ liệu quan trọng.
7. Kiểm tra clone sạch, cập nhật CHANGELOG, tạo tag chú thích v1.0.0 rồi xuất archive từ tag.
8. Tự chấm và ghi phần còn thiếu. Nếu chưa đạt tiêu chí, sửa bằng các commit có giải thích rồi kiểm tra lại.

## Ví dụ kiểm tra chấp nhận
Trong clone mới của bản nộp, người chấm chạy đúng hướng dẫn, chẳng hạn:
```powershell
git status --short
git log --graph --oneline --all -15
git tag --list
python -m unittest discover -s tests -v
```
Ngoài kết quả thành công, tạo một bản ghi chú sai trong môi trường kiểm tra riêng để xác nhận công cụ phát hiện. Nếu công cụ chỉ kiểm tra nội dung chuỗi bằng hàm thuần, gọi hàm với dữ liệu sai trong test thay vì sửa hàng loạt file thật. Báo cáo phải ghi đầu vào, đầu ra mong đợi, đầu ra quan sát và commit đã kiểm tra. Dòng “tất cả đạt” không đủ nếu không biết tất cả là những điều kiện nào.

## Rubric thực hành 100 điểm
Lịch sử có ý nghĩa 15; nhánh và merge 20; cộng tác và review 15; test cùng sửa lỗi 20; README và bàn giao 15; phát hành tái tạo 15. Chi tiết từng nhóm nằm ở sổ tay khóa. Đạt dự án từ 70 điểm và đáp ứng điều kiện bắt buộc về bí mật, đủ file và tái tạo. Quiz cuối khóa cần từ 70%; đây là tiêu chí hoàn thành học phần do khóa đặt, không tự đại diện chứng chỉ nghề nghiệp hoặc bảo đảm đủ năng lực cho mọi dự án công ty.

## Hướng giải và tự phản biện
Một hướng giải tốt dùng các file nguồn nhỏ, test thuần thư viện chuẩn và commit nhất quán với yêu cầu. Đồ thị có thể khác giữa fast-forward và merge commit; cần giải thích chính sách đã chọn. Khi giải xung đột, nêu hai yêu cầu và phiên bản kết quả. Khi revert, nêu thay đổi được rút cùng tác động. Khi phát hành, nêu mốc và cách tái tạo thay vì chỉ đưa ZIP.

Tự hỏi: nếu mất bản làm việc gốc, người khác có chạy được từ bản nộp không? Nếu không, tìm file hoặc bước thiết lập còn thiếu. Nếu test đạt nhưng một link hỏng, bổ sung phép kiểm hoặc checklist phù hợp và ghi giới hạn còn lại. Nếu đã đọc trước đáp án Quiz, tự giải tình huống mới và bảo vệ cách chọn thao tác; mục tiêu học là ra quyết định có căn cứ.

## Hồ sơ nộp và phản hồi
Nộp repository hoặc bundle có lịch sử, archive phát hành, `evidence.md`, phiếu review, bảng điểm tự chấm và một danh sách câu hỏi còn vướng. Người chấm phản hồi từng tiêu chí bằng bằng chứng, cho cơ hội sửa và chạy lại. Không cần nộp mật khẩu, token, private key hoặc ảnh màn hình tài khoản cá nhân. Cần ghi rõ thực hành GitHub nào đã làm thật, phần nào chỉ mô phỏng.

## Tự kiểm tra và đáp án
1. Tám commit bất kỳ có chắc đạt phần lịch sử không? Không; phải có phạm vi và lý do có thể hiểu.
2. Bằng chứng quan trọng nhất của bàn giao là gì? Người khác tái tạo được các bước đã ghi từ dữ liệu được nộp.
3. Điểm Quiz cao có thay toàn bộ dự án không? Không; quy trình cộng tác và bàn giao cần minh chứng thực hành riêng.

## Nguồn đọc tiếp
- https://git-scm.com/docs/gittutorial
- https://git-scm.com/docs/git-archive
- https://git-scm.com/docs/git-bundle
- https://docs.github.com/en/pull-requests/reference/pull-requests