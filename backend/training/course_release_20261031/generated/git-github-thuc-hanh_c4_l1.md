## Mục tiêu bài học
- Phân biệt repository local với remote.
- Mô phỏng hai người bằng hai bản clone.
- Fetch rồi tích hợp có kiểm soát.

Thời gian dự kiến: 110 phút, gồm đọc và thực hành.

## Mục tiêu và điều kiện
Bài tạo thư mục `remote-lab` mới, gồm một repository bare và hai clone đặt tên `alice`, `bob`. Mọi đường dẫn remote đều trên máy hiện tại; không truy cập tài khoản, không gửi thông tin ra Internet. Sản phẩm là nhật ký cho thấy Bob chưa nhận thay đổi trong working tree chỉ vì Alice đã push; Bob cần cập nhật thông tin rồi tích hợp phù hợp.

## Remote là một đích trao đổi
Tên như origin là bí danh gắn với URL hoặc đường dẫn, không phải từ khóa biểu thị GitHub duy nhất. Repository bare phù hợp làm điểm trao đổi trong mô phỏng vì không có working tree dùng để sửa file thông thường. Clone tạo một repository local từ nguồn có sẵn cùng cấu hình trao đổi ban đầu. Vì có thể có nhiều bản local và nhiều remote, mỗi lần phân tích cần hỏi rõ “đang đứng ở bản nào” và “remote đang trỏ đâu”.

Fetch cập nhật dữ liệu và các tham chiếu theo cấu hình từ remote; nó không tự đồng nghĩa working tree của nhánh hiện tại đã mang nội dung mới. Trong bài, tách fetch và merge để nhìn rõ hai giai đoạn. Pull kết hợp việc lấy dữ liệu và tích hợp theo cấu hình/lựa chọn; trước khi dùng trong dự án thật cần biết chính sách tích hợp của nhóm, không coi pull luôn là một hành vi duy nhất trong mọi cấu hình.

## Tạo mô phỏng hai người
Chạy từng bước từ thư mục cha của các bài trước. Đường dẫn tương đối dưới đây chỉ đúng khi bạn ở đúng vị trí được ghi.
```powershell
mkdir remote-lab
cd remote-lab
git init --bare --initial-branch=main shared.git
git clone shared.git alice
cd alice
git config user.name "Alice Lab"
git config user.email "alice@example.invalid"
Set-Content -LiteralPath README.md -Value '# Team Notes' -Encoding utf8
git add -- README.md
git commit -m "docs: tao ghi chu nhom"
git push --set-upstream origin main
cd ..
git clone shared.git bob
cd bob
git config user.name "Bob Lab"
git config user.email "bob@example.invalid"
git remote -v
git log --oneline -1
```
Clone đầu của repository trống có thể in cảnh báo repository rỗng, là tình trạng dự kiến. Sau khi Alice push commit đầu, clone của Bob có README. Origin của cả hai là đường dẫn local tới shared.git; kiểm tra bằng remote -v trước khi trao đổi.

## Quan sát một lần cập nhật
Ở Alice, thêm dòng “Lich hop: thu hai” vào README, add, đọc diff cached, commit rồi push. Trở lại Bob:
```powershell
git status --short
git fetch origin
git log --oneline main..origin/main
git diff main..origin/main -- README.md
git merge --ff-only origin/main
```
Đầu ra mong đợi sau fetch: có thể xem commit mới qua origin/main, nhưng nhánh main chưa tự tích hợp bởi thao tác fetch riêng. Sau merge fast-forward, README của Bob có lịch họp. Nếu Bob cũng đã sửa và commit, giả định fast-forward có thể không còn đúng; áp dụng phân tích nhánh từ chương trước thay vì ép ghi đè lịch sử.

## Bài tập độc lập và hướng giải
Bob tạo `notes-bob.md`, commit và push. Alice fetch rồi đọc diff trước khi tích hợp. Ghi bảng gồm vị trí đang đứng, HEAD của main, origin/main và file quan sát. Hướng giải phải chứng minh mỗi bản local độc lập cho tới các bước trao đổi; việc cùng nằm trên một ổ đĩa không làm working tree tự đồng bộ. Đạt khi cả hai có nội dung cuối giống nhau và người học có thể giải thích thứ tự lệnh.

## Lỗi thường gặp
Gõ lệnh trong shared.git bare rồi tìm file README như working tree là nhầm vai trò. Nghĩ push sẽ cập nhật mọi clone bỏ qua bước cập nhật của người nhận. Dùng origin trong một repository khác mà không xem URL có thể trao đổi sai nơi. Gặp từ chối non-fast-forward cần xem lịch sử và tích hợp thay đổi phù hợp, không chuyển sang force chỉ để tránh thông báo.

## Tự kiểm tra và đáp án
1. Origin có bắt buộc là GitHub không? Không, bài này origin là đường dẫn local.
2. Sau fetch, làm sao xem phần chưa tích hợp? Đọc log/diff giữa main và origin/main.
3. Vì sao có hai clone thay vì hai cửa sổ cùng thư mục? Hai clone mô phỏng hai lịch sử local và working tree độc lập rõ hơn.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-clone
- https://git-scm.com/docs/git-remote
- https://git-scm.com/docs/git-fetch
- https://git-scm.com/docs/git-push