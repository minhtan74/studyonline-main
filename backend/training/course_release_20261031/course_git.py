"""Original Vietnamese foundational Git/GitHub curriculum, reviewed 2026-10-31."""
from textwrap import dedent


def quiz(rows):
    result = []
    for index, (prompt, answer, wrong, explanation) in enumerate(rows):
        options = list(wrong)
        correct = index % 4
        options.insert(correct, answer)
        result.append(dict(prompt=prompt, options=options, correct=correct,
                           explanation=explanation, difficulty="easy" if index < 2 else "medium"))
    return result


def lesson(title, objectives, body, questions, minutes=100, checks=None):
    return dict(title=title, objectives=objectives, duration_minutes=minutes,
                body=dedent(body).strip(), questions=quiz(questions), checks=checks or [])


COURSE = dict(
    title="Git & GitHub: quản lý phiên bản và cộng tác thực hành",
    slug="git-github-thuc-hanh",
    level="beginner",
    description="Lộ trình Git và GitHub qua 6 chương, 12 bài: lưu phiên bản, đọc thay đổi, nhánh, merge, remote, review và phát hành. Mỗi bài có thực hành kiểm chứng, bài tập có hướng giải và 5 câu Quiz. Kết thúc bằng một kho tài liệu học tập có lịch sử, quy trình review và bản phát hành có thể tái tạo.",
    prerequisites=["Sử dụng được trình quản lý file và trình soạn thảo văn bản.", "Biết mở PowerShell hoặc terminal và chuyển thư mục.", "Có Git hiện hành hỗ trợ git switch; không bắt buộc tài khoản GitHub cho bài tập local.", "Dành một thư mục thực hành mới, tách khỏi mã nguồn hoặc dữ liệu đang sử dụng."],
    outcomes=["Giải thích working tree, staging area và commit bằng một ví dụ tự thực hiện.", "Tạo các commit có phạm vi rõ và kiểm tra nội dung trước khi lưu.", "Làm việc trên nhánh, hợp nhất và giải quyết xung đột có căn cứ.", "Phân biệt fetch với tích hợp nhánh và trao đổi qua remote local.", "Viết đề xuất thay đổi và review theo tiêu chí có thể kiểm chứng.", "Bàn giao repository có README, tag, bản phát hành và minh chứng kiểm tra."],
    duration_hours=30,
    handbook=dedent(r"""
    ## Giới thiệu và kết quả đầu ra
    Đây là khóa nền tảng tự học có hướng dẫn, thời lượng dự kiến 30 giờ gồm khoảng 20 giờ đọc và thực hành từng bài, 6 giờ dự án, 4 giờ ôn tập và đánh giá. Thời lượng là ước lượng học tập, không phải số giờ video. Sau khóa, người học bàn giao một repository quản lý tài liệu và quy trình thay đổi; người chấm có thể clone vào thư mục mới và kiểm tra lại bằng lệnh được ghi trong README.

    ## Chuẩn bị môi trường
    Cài Git từ https://git-scm.com/downloads hoặc trình quản lý phần mềm được máy cho phép. Mở PowerShell mới, chạy `git --version`. Các bài dùng PowerShell để tạo file; trên Linux/macOS có thể tạo cùng file bằng trình soạn thảo và chạy các lệnh Git tương ứng. Bài tập không cần dịch vụ mạng, token hoặc quyền quản trị hệ thống. Tài khoản GitHub chỉ dùng cho phần thực hành web tùy chọn.
    Tạo thư mục mới `git-lab-2026`; trước mỗi bài đọc dòng “Điều kiện đầu” để biết dùng repository trước hay tạo repository độc lập. Luôn kiểm tra `git status` và `git rev-parse --show-toplevel` trước khi thao tác. Cấu hình tên/email trong repository thực hành; địa chỉ `learner@example.invalid` là địa chỉ minh họa, không dùng để nhận thư.

    ## Kế hoạch sáu tuần
    - Tuần 1, khoảng 4 giờ: chương 1; tạo repository, commit đầu, nhật ký học tập và hình vẽ ba vùng dữ liệu.
    - Tuần 2, khoảng 4 giờ: chương 2; phân tích diff, tra lịch sử và thiết lập quy tắc loại file sinh tự động.
    - Tuần 3, khoảng 5 giờ: chương 3; hai nhánh tính năng, merge sạch và một xung đột được giải thích bằng hai yêu cầu.
    - Tuần 4, khoảng 4 giờ: chương 4; remote bare local, hai bản clone mô phỏng hai người, nhật ký fetch/merge và kế hoạch xác thực GitHub.
    - Tuần 5, khoảng 5 giờ: chương 5; phiếu đề xuất thay đổi, review, test, sửa lỗi bằng commit bổ sung và hoàn tác bằng revert.
    - Tuần 6, khoảng 8 giờ: chương 6, hoàn thiện capstone, đóng gói bản phát hành, làm Quiz cuối khóa và tự đánh giá.
    Có thể học nhanh hơn nhưng vẫn cần nộp đủ bằng chứng, không bỏ bài xung đột chỉ vì câu lệnh khó nhớ. Một buổi học nên gồm đọc khái niệm, dự đoán đầu ra, chạy lệnh rồi giải thích chênh lệch.

    ## Cấu trúc mỗi bài và cách luyện
    Mỗi bài có mục tiêu, giải thích, lệnh chạy trong môi trường riêng, đầu ra mong đợi theo tính chất, bài tập có hướng dẫn, nhiệm vụ độc lập, lỗi thường gặp và câu tự kiểm tra có đáp án. Không học thuộc mã hash vì hash và thời gian commit thay đổi. Ghi tên file, trạng thái, số commit và nội dung diff làm bằng chứng ổn định. Quiz đo hiểu biết với ít nhất 5 câu mỗi bài; đọc đáp án xong cần tự dựng lại tình huống khác để tránh chỉ nhớ lựa chọn.

    ## Đánh giá
    Gợi ý điều kiện hoàn thành khóa: Quiz tổng hợp đạt ít nhất 70% và dự án đạt ít nhất 70/100, đồng thời không phạm lỗi bắt buộc về bí mật hoặc khả năng tái tạo. Điểm dự án do người học/giảng viên đối chiếu rubric và bằng chứng; hệ thống Quiz không tự chấm chất lượng GitHub review hoặc dự án thực hành.
    - Lịch sử có ý nghĩa: 15 điểm. Có ít nhất 8 commit nhỏ, thông điệp nêu hành vi, không gộp tất cả vào một commit cuối.
    - Nhánh và hợp nhất: 20 điểm. Có hai nhánh tính năng, chứng minh merge và giải thích một xung đột; sản phẩm sau merge đáp ứng cả hai yêu cầu.
    - Cộng tác và review: 15 điểm. Có remote local, hai bản clone, phiếu đề xuất thay đổi và một lượt review dựa trên diff.
    - Kiểm tra và sửa lỗi: 20 điểm. Có test tự động, ghi kết quả mong đợi, một commit sửa lỗi cùng test và một revert được giải thích.
    - Tài liệu bàn giao: 15 điểm. README ghi mục tiêu, yêu cầu, cách chạy, sơ đồ file và giới hạn; CHANGELOG nêu thay đổi bản phát hành.
    - Phát hành tái tạo: 15 điểm. Tag chú thích, archive ZIP, clone sạch kiểm tra được đúng phiên bản, ghi kết quả hash hoặc nội dung.
    Không đạt điều kiện bắt buộc nếu đưa token/mật khẩu thật vào lịch sử hoặc giao bản clone sạch không chạy theo README. Cần sửa tình huống và nộp lại bằng chứng; xóa dòng khỏi bản hiện tại không tự xóa bí mật khỏi lịch sử.

    ## Dự án xuyên khóa: Study Notes
    Xây repository gồm `README.md`, `notes/week1.md`, `notes/week2.md`, `CHANGELOG.md`, `.gitignore`, `tools/check_notes.py` và `tests/test_notes.py`. Công cụ kiểm tra chỉ đọc thư mục notes, yêu cầu mỗi Markdown có tiêu đề và không chứa placeholder `TODO_REQUIRED`. Có thể viết bằng Python chuẩn để tránh phụ thuộc mạng. Tạo nhánh `feature/notes` và `feature/checker`; mô phỏng hai người bằng hai clone của một remote bare local. Thêm `reviews/change-01.md` mô tả yêu cầu, diff, test, nhận xét và quyết định.
    Hồ sơ nộp gồm repository hoặc Git bundle, ZIP của tag `v1.0.0`, báo cáo `evidence.md` ghi lệnh cùng kết quả, phiếu review và bảng tự chấm. Tag chỉ đánh dấu phiên bản; không phải chứng nhận bảo mật. Lưu thư mục `.git` khi bàn giao repository, còn archive phát hành thường không chứa lịch sử. Dùng GitHub tùy chọn nếu cần trải nghiệm pull request thực; giữ cùng tiêu chí cho bản mô phỏng local.

    ## Tài liệu gốc và phạm vi
    Nội dung diễn giải và bài tập do dự án biên soạn, đối chiếu tài liệu chính thức ngày 31/10/2026. GitHub có thể thay đổi vị trí nút và chính sách; dựa vào mục đích thao tác cùng tài liệu hiện hành thay vì một ảnh giao diện cố định.
    - https://git-scm.com/docs/gittutorial
    - https://git-scm.com/docs/git
    - https://docs.github.com/en/pull-requests/reference/pull-requests
    - https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github
    Phạm vi là quy trình nền tảng cho một nhóm nhỏ. Quản trị GitHub tổ chức, chính sách doanh nghiệp, submodule phức tạp và ứng cứu rò rỉ bí mật trên hệ thống thực cần học phần chuyên biệt và người phụ trách tương ứng.
    """).strip(),
    project_files={
        "README.md": "# Study Notes\n\nGhi chú học tập có kiểm tra tự động.\n\nChạy kiểm tra: python -m unittest discover -s tests -v\n",
        "notes/week1.md": "# Tuần 1\n\nGiải thích working tree, index và commit bằng ví dụ của bạn.\n",
        "tools/check_notes.py": "from pathlib import Path\n\ndef check_notes(root):\n    problems = []\n    for path in sorted(Path(root).glob('*.md')):\n        text = path.read_text(encoding='utf-8')\n        if not text.startswith('# '):\n            problems.append(path.name + ': missing heading')\n        if 'TODO_REQUIRED' in text:\n            problems.append(path.name + ': unfinished note')\n    return problems\n",
        "tests/test_notes.py": "import unittest\nfrom pathlib import Path\nfrom tools.check_notes import check_notes\n\nclass NotesTest(unittest.TestCase):\n    def test_notes_have_required_content(self):\n        self.assertTrue(list(Path('notes').glob('*.md')), 'Need at least one note')\n        self.assertEqual(check_notes('notes'), [])\n\nif __name__ == '__main__':\n    unittest.main()\n",
        ".gitignore": "__pycache__/\n*.pyc\n.env\n.local/\nartifacts/\n",
        "CHANGELOG.md": "# Lịch sử thay đổi\n\n## Chưa phát hành\n\n- Kho ghi chú và bộ kiểm tra nền tảng.\n",
        "reviews/change-01.md": "# Đề xuất thay đổi\n\n## Yêu cầu\nMô tả hành vi cần thay đổi.\n\n## Bằng chứng\nGhi diff, lệnh test và đầu ra.\n\n## Review\nGhi nhận xét và cách xử lý.\n",
    },
    chapters=[
        dict(title="Nền tảng quản lý phiên bản", lessons=[
            lesson("Repository, commit và ba vùng dữ liệu", ["Giải thích được mục đích lưu phiên bản.", "Phân biệt working tree, staging area và commit.", "Tạo repository và commit đầu trong thư mục mới."], r"""
## Mục tiêu và điều kiện đầu
Bắt đầu trong một thư mục mới chưa có dữ liệu quan trọng. Cần Git hỗ trợ `git switch`; xác nhận bằng `git --version`. Toàn bộ bài là thao tác local, chưa liên hệ GitHub. Sản phẩm là repository `study-notes` với README và một commit, kèm bản giải thích file đi qua những trạng thái nào. Khi gõ lệnh, đọc kết quả của lệnh trước thay vì dán cả khối rồi bỏ qua lỗi.

## Vì sao cần lưu phiên bản
Giả sử bạn có ba bản ghi chú tên “cuối”, “cuối sửa” và “cuối thật”. Tên file không giải thích được dòng nào đổi, tại sao đổi hay phiên bản nào dùng được. Một lịch sử commit giúp gắn thay đổi nội dung với thời điểm và thông điệp. Trong bài tập, một commit đại diện cho một bước học có mục tiêu; bản sao dự phòng và việc quản lý phiên bản phục vụ các nhu cầu liên quan nhưng khác nhau. Repository local vẫn có thể mất nếu ổ đĩa hỏng, nên chưa thể coi một commit local là đã sao lưu từ xa.

Working tree là các file bạn đang mở và sửa. Staging area, còn gọi là index, ghi lựa chọn nội dung cho commit kế tiếp. Commit lưu một snapshot được chọn cùng thông tin như thông điệp và cha của nó. Một file được sửa sau `git add` có thể có hai phiên bản khác nhau: một bản đã stage và một bản mới hơn ở working tree. Nắm điểm này giúp tránh tưởng rằng commit luôn lấy mọi thay đổi đang thấy trong editor.

## Thực hành có hướng dẫn
Ví dụ dưới dùng PowerShell và địa chỉ minh họa. Tạo file bằng trình soạn thảo cũng cho kết quả tương đương.
```powershell
mkdir study-notes
cd study-notes
git init --initial-branch=main
git config user.name "Nguoi Hoc"
git config user.email "learner@example.invalid"
Set-Content -LiteralPath README.md -Value '# Study Notes' -Encoding utf8
git status --short
git add -- README.md
git diff --cached
git commit -m "docs: khoi tao ghi chu hoc tap"
git status --short
git log --oneline -1
```
Trước add, `README.md` thường được ghi là untracked bằng `??`. Sau add, nó là file mới đã stage. `git diff --cached` cho thấy tiêu đề sẽ đi vào commit. Sau commit, `git status --short` không in dòng nào nếu không còn thay đổi. `git log` có một commit; mã hash không cần giống ảnh hoặc máy khác. Nếu chưa cấu hình danh tính, đọc lỗi và cấu hình trong đúng repository rồi thực hiện lại commit.

## Quan sát thay đổi theo từng bước
Thêm dòng mô tả, chạy `git diff`, sau đó add và chạy lại cả `git diff` lẫn `git diff --cached`. Trước add, phần mới nằm ở so sánh working tree với index; sau add, phần đó chuyển sang so sánh index với HEAD. Dùng ba ô trên giấy ghi “đang sửa”, “đã chọn”, “đã lưu”; ghi nội dung README ở mỗi ô. Đừng thay một khái niệm bằng một câu lệnh: `git add` là hành động cập nhật lựa chọn, còn index là trạng thái dữ liệu.

## Bài tập độc lập và hướng giải
Tạo `goals.md` gồm tiêu đề và ba mục tiêu học. Stage riêng file này rồi sửa thêm một mục tiêu thứ tư trước khi commit. Dự đoán commit có ba hay bốn mục tiêu, xác nhận bằng `git show HEAD:goals.md`. Hướng giải: khi chưa add lại, snapshot staged vẫn có ba mục tiêu; working tree có bốn. Muốn commit cả bốn cần add lại file rồi đọc diff staged. Đạt yêu cầu khi bạn giải thích kết quả bằng phiên bản nội dung, không chỉ nói lệnh chạy thành công.

## Lỗi thường gặp
Chạy lệnh ngoài repository gây thông báo không tìm thấy Git repository; kiểm tra thư mục bằng `Get-Location`. Nhầm commit với upload khiến tưởng đồng đội đã nhận bài dù chưa có remote. Chọn nhầm thư mục dự án đang làm thật có thể đưa file ngoài bài vào lịch sử; luôn xem `git rev-parse --show-toplevel`. Thông điệp “update” khó giúp người đọc; mô tả điều đã thay đổi như “thêm mục tiêu tuần đầu”.

## Tự kiểm tra và đáp án
1. Sửa file sau khi add có tự thay nội dung đã stage không? Không; cần add lại nếu muốn chọn bản mới.
2. Commit local đã đồng nghĩa có bản trên GitHub chưa? Chưa; bài này chưa có remote và chưa trao đổi dữ liệu.
3. Vì sao trạng thái sạch không chứng minh nội dung đúng? Nó chỉ cho biết các vùng dữ liệu đang đồng bộ theo trạng thái Git; lỗi nội dung vẫn có thể đã được commit.

## Nguồn đọc tiếp
- https://git-scm.com/docs/gittutorial
- https://git-scm.com/docs/git-init
- https://git-scm.com/docs/git-add
""", [
                ("Staging area dùng để làm gì?", "Chọn nội dung cho commit kế tiếp", ["Lưu mật khẩu GitHub", "Chỉ chứa các file đã upload", "Tự chạy kiểm thử"], "Index ghi snapshot được chọn để tạo commit kế tiếp."),
                ("Một commit vừa tạo local đã xuất hiện trên GitHub chưa?", "Chưa, cần cấu hình remote và trao đổi dữ liệu thích hợp", ["Luôn xuất hiện ngay", "Chỉ cần có Internet là tự xuất hiện", "Phải đổi tên file thành github"], "Git hoạt động local; GitHub là dịch vụ lưu trữ từ xa riêng."),
                ("Bạn add README rồi sửa thêm một dòng nhưng chưa add lại. Commit chứa gì?", "Phiên bản README tại lần add gần nhất", ["Luôn chứa mọi dòng mới nhất trong editor", "Không chứa README nữa", "Xóa README khỏi máy"], "Sửa working tree không tự cập nhật snapshot trong index."),
                ("Lệnh nào xem nội dung đã stage trước commit?", "git diff --cached", ["git remote -v", "git branch --show-current", "git version"], "Diff cached so sánh index với commit hiện tại."),
                ("Trạng thái working tree sạch chứng minh điều gì?", "Không còn thay đổi được báo so với trạng thái Git hiện tại", ["Ứng dụng chắc chắn không có lỗi", "Đã có bản sao trên mọi máy", "Tất cả bí mật đã được xóa khỏi lịch sử"], "Trạng thái sạch phản ánh đồng bộ dữ liệu Git, không phải bảo đảm chất lượng nội dung."),
            ]),
            lesson("Danh tính, cấu hình và commit có mục đích", ["Phân biệt danh tính commit với xác thực dịch vụ.", "Chọn phạm vi cấu hình local phù hợp.", "Chia thay đổi thành commit dễ review."], r"""
## Mục tiêu và bối cảnh
Tiếp tục repository `study-notes` sau bài đầu. Mục tiêu là tạo hai commit riêng: một cải thiện hướng dẫn học, một thêm kế hoạch tuần. Người đọc lịch sử phải hiểu được mục đích từng bước mà không cần liên hệ tác giả. Bài này cũng làm rõ tên và email trong commit không tự cấp quyền truy cập tài khoản GitHub.

## Danh tính là thông tin lịch sử
Tên và email tác giả giúp nhóm nhận diện nguồn của thay đổi. Cấu hình local áp dụng trong repository hiện tại; cấu hình global thường dùng cho nhiều repository của người dùng. Trong môi trường học chung, cấu hình local giúp tránh sửa danh tính cho các dự án khác. Thông tin email có thể hiện trong lịch sử khi repository được chia sẻ, vì vậy bài tập dùng địa chỉ minh họa. Khi dùng GitHub thực, tự lựa chọn email phù hợp và đọc tùy chọn bảo vệ email trong tài khoản.

Xác thực là quá trình chứng minh quyền truy cập một dịch vụ, có thể dùng luồng đăng nhập, credential helper hoặc SSH. Việc gõ `git config user.name` chỉ thay metadata cho commit mới, không đăng nhập máy chủ. Hai khái niệm này cần được tách trong bản hướng dẫn của dự án; nếu người học nhầm chúng, họ dễ sửa email nhiều lần trong khi lỗi thực nằm ở quyền remote.

## Thiết lập và quan sát
Chạy ở repository thực hành, không thêm cờ global.
```powershell
git config --local user.name "Nguoi Hoc"
git config --local user.email "learner@example.invalid"
git config --show-origin --get user.name
git config --show-origin --get user.email
git status --short
```
Đường dẫn nguồn cấu hình local thường trỏ đến `.git/config`. Nếu có nhiều nguồn, ghi rõ nguồn đang có hiệu lực thay vì đoán. Bạn không cần chia sẻ toàn bộ cấu hình vì có thể chứa đường dẫn nội bộ hoặc dữ liệu không liên quan.

## Thực hành hai thay đổi độc lập
Tạo thư mục `notes` bằng editor hoặc PowerShell nếu chưa có. Mở README thêm phần “Cách học”: đọc, dự đoán, chạy lệnh, ghi bằng chứng. Tạo `notes/week1.md` có ba việc cần hoàn thành. Trước tiên chỉ chọn README.
```powershell
git diff -- README.md
git add -- README.md
git diff --cached --stat
git commit -m "docs: them huong dan hoc va ghi bang chung"
git add -- notes/week1.md
git diff --cached
git commit -m "docs: them ke hoach tuan mot"
git log -2 --format="%h %an <%ae> %s"
```
Đầu ra mong đợi: hai commit khác nhau, tác giả dùng danh tính local, mỗi thông điệp giải thích một mục đích. File kế hoạch không vô tình nằm trong commit hướng dẫn. Tiền tố `docs:` trong bài là quy ước nhóm lựa chọn; Git không bắt buộc cấu trúc thông điệp này.

## Chọn kích thước commit
Một commit tốt thường có một lý do thay đổi có thể diễn giải ngắn, nhưng không đồng nghĩa chỉ được sửa một file. Nếu thay tên lệnh cần cập nhật cả README và test để nhất quán, hai file có thể thuộc cùng commit. Ngược lại, đổi màu giao diện và chỉnh cách tính điểm thường cần hai phạm vi đánh giá khác nhau. Hãy hỏi người review cần kiểm tra hành vi nào và bằng chứng nào để quyết định cách chia.

## Bài tập độc lập và tiêu chí
Bạn cần sửa lỗi chính tả trong README và thêm một ghi chú mới. Lập kế hoạch hai commit, ghi nội dung dự kiến của mỗi commit trước khi chạy. Sau đó kiểm tra bằng `git show --stat HEAD` và `git show --stat HEAD~1`. Hướng giải chấp nhận hai commit riêng nếu hai mục tiêu độc lập; cũng có thể một commit khi ghi chú mới trực tiếp giải thích chỗ sửa và bạn nêu được quan hệ. Không chấm theo số commit đơn thuần; người chấm đối chiếu phạm vi với lý do.

## Lỗi thường gặp và cách nhận biết
Thông điệp “fix everything” che giấu phạm vi; viết lại mô tả cụ thể trong commit tiếp theo nếu cần bổ sung giải thích. Dùng email người khác trên máy học chung gây lịch sử khó truy vết; kiểm tra cấu hình trước buổi học. Đưa token vào URL remote để tiện nhớ có thể làm lộ thông tin khi chụp màn hình; bài thực hành chưa dùng token. Ghi thành công lệnh mà không kiểm tra file staged có thể đưa cả tài liệu nháp vào bản nộp.

## Tự kiểm tra và đáp án
1. Đổi user.email có thay đổi tác giả các commit cũ tự động không? Không; cấu hình áp dụng cho commit tạo sau đó theo thao tác tương ứng.
2. Khi nào hai file cùng thuộc một commit? Khi chúng cùng thực hiện một mục đích và cần được đánh giá cùng nhau.
3. Cấu hình local có cấp quyền push không? Không; quyền remote phụ thuộc xác thực và phân quyền tại nơi nhận.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-config
- https://git-scm.com/docs/git-commit
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github
""", [
                ("git config --local user.email tác động chủ yếu tới đâu?", "Cấu hình của repository hiện tại", ["Mọi repository của mọi người trên máy", "Mật khẩu tài khoản GitHub", "DNS hệ điều hành"], "Phạm vi local lưu cấu hình trong repository hiện tại."),
                ("Tên tác giả commit và xác thực GitHub có quan hệ nào?", "Là hai loại thông tin khác nhau", ["Tên tác giả chính là mật khẩu", "Chỉ cần trùng tên là được push mọi repo", "Email commit luôn cấp quyền admin"], "Metadata commit không tự chứng minh quyền truy cập dịch vụ."),
                ("Commit nào dễ đánh giá phạm vi hơn?", "docs: thêm hướng dẫn chạy kiểm tra", ["update", "mọi thứ", "bản mới nhất cuối cùng"], "Thông điệp cụ thể nêu mục đích để người đọc biết phải xem gì."),
                ("Một thay đổi tên hàm cùng test cập nhật có nên luôn tách hai commit không?", "Không bắt buộc; có thể cùng commit để giữ hành vi và test nhất quán", ["Luôn tách vì mỗi commit chỉ được một file", "Git không cho commit nhiều file", "Phải bỏ test khỏi lịch sử"], "Phạm vi logic, không phải số file, quyết định tính nhất quán của commit."),
                ("Lệnh nào giúp xác định file nguồn của cấu hình tên tác giả?", "git config --show-origin --get user.name", ["git status --short", "git diff --stat", "git branch --list"], "Show-origin cho biết nơi cung cấp giá trị cấu hình."),
            ]),
        ]),
        dict(title="Đọc thay đổi và tổ chức repository", lessons=[
            lesson("Diff, lịch sử và truy vết một thay đổi", ["Đọc được dòng thêm, xóa trong diff.", "Chọn đúng so sánh working tree, index và commit.", "Truy tìm commit liên quan đến một file."], r"""
## Điều kiện và sản phẩm
Repository đã có README và ghi chú tuần đầu. Bài này không yêu cầu thay đổi lịch sử. Sản phẩm là báo cáo `evidence-diff.md` giải thích một thay đổi từ yêu cầu đến diff và commit. Mỗi nhận xét cần nêu file, phần nội dung và tác động; chép lại cả màn hình mà không diễn giải chưa đủ minh chứng đọc hiểu.

## Đọc một bản so sánh
Diff mô tả sự khác nhau giữa hai trạng thái. Trong dạng unified quen thuộc, dòng bắt đầu bằng dấu trừ thuộc bản trước, dấu cộng thuộc bản sau; các dòng ngữ cảnh giúp định vị đoạn sửa. Ký hiệu đầu file `---` và `+++` là header của bản diff, không phải câu lệnh xóa hoặc tạo ba lần. Khi thay một câu, thường có một dòng xóa và một dòng thêm, dù người viết chỉ cảm thấy mình “sửa một dòng”.

So sánh mặc định của `git diff` tập trung vào phần working tree khác index. `git diff --cached` tập trung phần index khác HEAD. So sánh hai commit cần nêu hai mốc hoặc phạm vi phù hợp. Cùng một file nhưng hai lệnh cho kết quả khác nhau không có nghĩa Git mất nội dung; thường bạn đang hỏi hai câu khác nhau. Trước khi review, viết câu hỏi bằng lời: “Tôi muốn xem phần chưa chọn” hay “Tôi muốn xem thứ sẽ vào commit?”.

## Thực hành từng bước
Mở README thêm dòng “Mỗi bài cần có bằng chứng kiểm tra”. Giữ thay đổi chưa stage rồi chạy:
```powershell
git diff -- README.md
git diff --stat
git add -- README.md
git diff -- README.md
git diff --cached -- README.md
git commit -m "docs: yeu cau bang chung cho tung bai"
git log --oneline -- README.md
git show --stat HEAD
git show HEAD -- README.md
```
Sau add, diff mặc định của README rỗng nếu bạn chưa sửa thêm, còn diff cached vẫn có dòng mới. Sau commit, `git show HEAD` chứa thay đổi vừa lưu. `--` phân cách tham số và đường dẫn; cách viết rõ giúp tránh mơ hồ khi tên nhánh hoặc mốc trùng với tên file.

## Tra lịch sử bằng câu hỏi
Khi thấy quy định lạ trong ghi chú, bắt đầu từ lịch sử file để tìm các commit đã tác động tới nó. Đọc thông điệp rồi mở diff của commit phù hợp. Một thông điệp “sửa hướng dẫn” không chứng minh lý do sửa đúng; cần đọc nội dung và test hoặc yêu cầu liên quan. `git log --graph --oneline --all` giúp nhìn nhánh khi đã có nhiều nhánh, nhưng hình đồ thị chỉ thể hiện quan hệ commit, không phải biểu đồ chất lượng công việc.

## Bài tập hướng dẫn: nhận diện phần bị bỏ quên
Thêm hai dòng vào README, add file rồi sửa lại dòng thứ hai. Dự đoán kết quả hai loại diff trước khi chạy. Lập bảng gồm “lệnh”, “hai trạng thái được so”, “nội dung quan sát”. Hướng giải: cached phản ánh hai dòng ở thời điểm add; diff mặc định cho biết dòng thứ hai đã tiếp tục đổi. Muốn commit đúng ý phải kiểm tra cả hai, chọn lại nội dung cần lưu và xem bản staged cuối cùng.

## Nhiệm vụ độc lập và đáp án định hướng
Tạo hai commit liên tiếp cho `notes/week1.md`: đầu tiên thêm câu hỏi, sau đó thêm đáp án. Tìm commit nào đưa đáp án vào bằng lịch sử file và chứng minh qua `git show`. Không dùng quy tắc “commit cuối chắc chắn là đáp án” vì trong repository thật có thể có nhiều thay đổi xen kẽ. Đạt khi người chấm có thể dùng mã commit bạn ghi để nhìn thấy đúng phần thêm, và bạn giải thích vì sao việc thêm đáp án không có nghĩa câu hỏi đã được kiểm chứng.

## Lỗi thường gặp
Chỉ đọc thống kê số dòng có thể bỏ qua sửa sai một toán tử quan trọng. Thấy file đổi toàn bộ dòng có thể do line ending hoặc định dạng; hãy xác định nguyên nhân trước khi review nghiệp vụ. Dùng mã hash từ ví dụ trên máy khác sẽ không tìm được commit; lấy mã từ lịch sử của bạn. Gõ đường dẫn không đúng chữ hoa/thường có thể gây khác biệt giữa hệ thống; ghi tên nhất quán từ đầu.

## Tự kiểm tra và đáp án
1. Dòng `+` trong diff có chứng minh dòng đó tốt hơn không? Không, nó chỉ được thêm vào trạng thái sau.
2. Vì sao cần tên file sau `--`? Để xác định phạm vi và tránh diễn giải nhầm tên đường dẫn thành mốc.
3. Log cho thấy ai sửa có thay thế việc đọc yêu cầu không? Không; lịch sử hỗ trợ truy vết, còn đúng sai cần đối chiếu tiêu chí.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-diff
- https://git-scm.com/docs/git-log
- https://git-scm.com/docs/git-show
""", [
                ("git diff mặc định so sánh chủ yếu hai vùng nào?", "Working tree và index", ["Hai tài khoản GitHub", "Remote với tất cả tag", "RAM và ổ cứng"], "Diff mặc định hiển thị thay đổi chưa được stage so với index."),
                ("Dấu cộng ở đầu một dòng trong diff biểu thị gì?", "Dòng có trong trạng thái sau của so sánh", ["Dòng đã được xác nhận đúng nghiệp vụ", "Dòng được cộng vào điểm quiz", "Lệnh phải chạy với quyền admin"], "Ký hiệu diff biểu diễn thay đổi nội dung, không đánh giá chất lượng."),
                ("Lệnh nào tập trung lịch sử của README.md?", "git log --oneline -- README.md", ["git remote add README.md", "git init README.md", "git config README.md"], "Đường dẫn sau -- giới hạn log theo file."),
                ("Vì sao diff mặc định rỗng nhưng diff cached có nội dung?", "Thay đổi đã stage và working tree chưa đổi thêm", ["Git tự xóa mọi thay đổi", "Mạng chắc chắn bị ngắt", "File không thể commit"], "Hai lệnh so sánh các vùng khác nhau."),
                ("Khi diff cho thấy toàn file đổi dòng, bước phù hợp là gì?", "Kiểm tra định dạng và line ending cùng thay đổi thực", ["Mặc định mọi dòng đều thay đổi nghiệp vụ", "Bỏ qua review hoàn toàn", "Xóa repository để khởi tạo lại"], "Thay đổi toàn dòng có thể do định dạng; cần xác định nguyên nhân để review đúng."),
            ]),
            lesson("Gitignore, cấu trúc file và dữ liệu nhạy cảm", ["Chọn file nguồn cần quản lý và file sinh tự động.", "Giải thích giới hạn của .gitignore.", "Thiết kế repository dễ clone và tái tạo."], r"""
## Bối cảnh của bài
Dự án ghi chú bắt đầu có file tạm, kết quả chạy thử và cấu hình cá nhân. Nếu lưu tất cả, một commit nội dung nhỏ có thể bị lẫn hàng trăm file sinh tự động. Sản phẩm bài là `.gitignore`, một cây thư mục rõ ràng và danh mục file cần bàn giao. Không dùng dữ liệu bí mật thật để thử tính năng bỏ qua; mọi ví dụ đều là chuỗi minh họa.

## Phân loại trước khi viết quy tắc
File nguồn gồm ghi chú do người viết tạo, mã kiểm tra và tài liệu hướng dẫn. File sinh tự động là thứ có thể dựng lại từ nguồn theo quy trình được ghi, chẳng hạn cache hoặc báo cáo tạm. Có những sản phẩm dựng cần phát hành nhưng không nhất thiết lưu trong lịch sử nguồn; quyết định phụ thuộc mục tiêu. Không dùng quy tắc “mọi PDF đều bỏ qua” nếu PDF là tài liệu duy nhất cần giao cho học viên. Với mỗi loại file, ghi nơi lưu, cách tạo lại và ai cần dùng.

`.gitignore` đưa ra mẫu để Git bỏ qua những file chưa được theo dõi phù hợp với quy tắc. Nó không làm biến mất các phiên bản đã commit. Một file đã được theo dõi rồi mới thêm vào ignore vẫn cần xử lý theo trạng thái và chính sách của dự án; bài này chỉ thực hành với file mới để không vô tình thay lịch sử cần giữ. Nếu bí mật thật từng được đưa vào commit, cần thông báo người phụ trách và thay/thu hồi bí mật theo quy trình; chỉ sửa file hiện tại không khôi phục được tính bí mật đã mất.

## Thực hành có hướng dẫn
Trong repository thực hành, tạo file `.gitignore` bằng trình soạn thảo với nội dung sau. `artifacts/` là thư mục báo cáo có thể dựng lại trong khóa này, không phải quy tắc bắt buộc cho mọi dự án.
```text
__pycache__/
*.pyc
.env
.local/
artifacts/
```
Tạo `.env` với dòng `APP_MODE=learning` và tạo `.env.example` cũng chỉ có cấu hình minh họa. Chạy:
```powershell
git status --short
git check-ignore -v -- .env
git check-ignore -v -- .env.example
git add -- .gitignore .env.example
git diff --cached
git commit -m "chore: them quy tac file local va mau cau hinh"
```
Đầu ra mong đợi: `.env` khớp mẫu và không xuất hiện trong danh sách untracked thông thường; `.env.example` không khớp mẫu `.env`, nên có thể được lưu. `git check-ignore` có thể trả mã khác 0 khi không có mẫu khớp; điều này là kết quả kiểm tra, không tự chứng minh lệnh bị hỏng.

## Cấu trúc bàn giao
Đề xuất thư mục `notes/` cho nội dung, `tools/` cho công cụ nhỏ, `tests/` cho kiểm tra và `reviews/` cho hồ sơ thay đổi. README cần chỉ cách chạy từ thư mục gốc. Tránh đường dẫn tuyệt đối như ổ D của một người trong công cụ; ưu tiên đường dẫn tương đối được tính từ vị trí đã ghi rõ. Nếu có tệp mẫu, ghi cách sao chép và những giá trị người học phải tự điền. Mẫu không được chứa token hoạt động.

## Bài tập độc lập và hướng giải
Tạo `artifacts/report.txt`, `notes/week2.md` và `.local/session.txt`. Trước khi add, dự đoán file nào được status liệt kê. Chạy `git status --short --untracked-files=all` rồi `git check-ignore -v` cho từng file. Hướng giải: report và session bị bỏ qua do thư mục tương ứng; ghi chú tuần 2 vẫn có thể quản lý. Đạt khi quy tắc nhắm đúng phần sinh tự động và không che nhầm ghi chú nguồn. Thử đổi tên thư mục báo cáo trong đề xuất giấy rồi phân tích cần sửa quy tắc nào, không cần sửa hàng loạt file để đoán.

## Tình huống phân tích
Một đồng đội thêm `notes/` vào ignore vì nghĩ ghi chú là riêng tư. Sau khi clone, người mới không thấy các ghi chú chưa từng được commit. Nguồn gốc vấn đề là hợp đồng bàn giao chưa rõ, không phải clone làm mất file. Nhóm cần quyết định ghi chú nào là sản phẩm chung rồi viết lại quy tắc phù hợp; kiểm tra trên clone sạch giúp lộ thiếu sót này sớm.

## Tự kiểm tra và đáp án
1. Thêm mật khẩu vào `.gitignore` sau khi commit có xóa nó khỏi lịch sử không? Không.
2. Vì sao `.env.example` có ích? Nó ghi cấu hình cần thiết bằng giá trị an toàn để người khác tự chuẩn bị môi trường.
3. Một file không xuất hiện trong status có luôn nghĩa đã commit chưa? Không; nó có thể bị ignore, cần kiểm tra trạng thái cụ thể.

## Nguồn đọc tiếp
- https://git-scm.com/docs/gitignore
- https://git-scm.com/docs/git-check-ignore
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
""", [
                (".gitignore chủ yếu áp dụng thế nào?", "Bỏ qua file chưa được theo dõi theo mẫu phù hợp", ["Xóa mọi file đã commit", "Mã hóa mật khẩu trong lịch sử", "Cấm mọi người clone repository"], "Ignore không tự loại bỏ nội dung đã được quản lý trước đó."),
                ("File cấu hình mẫu nên chứa gì?", "Tên biến và giá trị minh họa an toàn", ["Token đang hoạt động của nhóm", "Mật khẩu thật của người quản trị", "Khóa riêng SSH của giảng viên"], "Mẫu giúp chuẩn bị môi trường mà không chia sẻ bí mật thật."),
                ("Lệnh nào chỉ ra quy tắc ignore khớp một file?", "git check-ignore -v -- ten-file", ["git log --graph", "git commit --stat", "git branch --show-current"], "Chế độ verbose cung cấp nguồn và mẫu ignore khớp."),
                ("Một token thật từng có trong commit nên được xử lý ra sao trước tiên?", "Thông báo người phụ trách và thu hồi/thay token theo quy trình", ["Chỉ thêm tên file vào ignore là đủ", "Đổi tên file và giữ token", "Chụp token vào báo cáo để chứng minh"], "Bí mật đã lộ không thể coi là an toàn chỉ vì bản hiện tại đã sửa."),
                ("Vì sao nên kiểm tra dự án từ clone sạch?", "Phát hiện file nguồn hoặc bước thiết lập còn thiếu", ["Để tự tăng điểm quiz", "Để biến mọi file ignored thành tracked", "Để xóa quyền tác giả"], "Clone chỉ có dữ liệu được chia sẻ, nên phát hiện phụ thuộc local chưa được bàn giao."),
            ]),
        ]),
        dict(title="Nhánh và hợp nhất", lessons=[
            lesson("Thiết kế nhánh tính năng và hợp nhất có kiểm tra", ["Tạo và chuyển nhánh theo một yêu cầu.", "Đọc quan hệ commit khi merge.", "Kiểm tra sản phẩm sau hợp nhất."], r"""
## Điều kiện và mục tiêu
Working tree của `study-notes` cần sạch trước khi bắt đầu. Nếu còn nội dung nháp, hoàn tất commit có mục đích hoặc lưu riêng bản nháp trong vùng đã dự kiến, rồi kiểm tra lại. Sản phẩm là nhánh `feature/week2`, một thay đổi độc lập và lịch sử hợp nhất vào `main` có giải thích. Bài không đòi hỏi repository từ xa.

## Nhánh phục vụ mục đích gì
Nhánh giúp nhóm đặt tên cho một dòng phát triển. Thay vì sửa trực tiếp bản đang dùng, người học có thể hoàn thành một mục tiêu trên nhánh rồi đánh giá trước khi tích hợp. Nhánh không phải bản sao toàn bộ thư mục cho mỗi lần tạo; khi chuyển nhánh, nội dung working tree có thể được cập nhật theo commit đích. Vì vậy cần hiểu trạng thái file trước khi switch, không chỉ nhìn tên nhánh ở editor.

Trong thực hành này, main đại diện cho bản tài liệu được chấp nhận, còn feature/week2 là đề xuất bổ sung kế hoạch học. Đặt một tên nhánh cho một yêu cầu giúp lịch sử và hồ sơ review cùng kể một câu chuyện. Tên nhánh tự nó không chứng minh công việc đã được duyệt; người học vẫn cần xem diff, kiểm tra và ghi quyết định.

## Thực hành nhánh đầu tiên
```powershell
git status --short
git branch --show-current
git switch -c feature/week2
```
Tạo hoặc chỉnh `notes/week2.md` với tiêu đề, mục tiêu đọc diff và mục tiêu kiểm tra ignore. Sau đó:
```powershell
git add -- notes/week2.md
git diff --cached
git commit -m "docs: them muc tieu tuan hai"
git switch main
git diff main...feature/week2 -- notes/week2.md
git merge --ff-only feature/week2
git log --graph --oneline --all -6
```
Nếu main chưa phát triển thêm từ lúc tạo nhánh, `--ff-only` cho phép cập nhật main tới đỉnh nhánh mà không tạo merge commit riêng. Nếu điều kiện không còn đúng, Git từ chối; đọc lịch sử và phân tích, không đổi sang một thao tác mạnh hơn chỉ để làm mất thông báo. Mục tiêu của cờ này trong bài là biến một giả định lịch sử thành điều kiện được kiểm tra.

## Hiểu fast-forward và merge commit
Khi một nhánh là tổ tiên của nhánh kia, tích hợp có thể chỉ cập nhật con trỏ nhánh. Khi cả hai đã có các commit riêng, hợp nhất thường cần một commit có nhiều cha, trừ khi chọn chiến lược khác. Một đồ thị “thẳng đẹp” không luôn có nhiều thông tin hơn; nhóm chọn chính sách phù hợp để review và truy vết. Khóa này dùng merge rõ ràng để học quan hệ lịch sử trước khi học các quy trình viết lại commit ở khóa nâng cao.

## Bài tập có hướng dẫn
Tạo nhánh `feature/checklist`, thêm một file checklist. Trở lại main, thêm một ghi chú độc lập ở README và commit. So sánh đồ thị trước khi merge. Vì hai phía đã phát triển, dự đoán `git merge --ff-only feature/checklist` có từ chối không. Sau khi đã đọc diff và bảo đảm các thay đổi đáp ứng yêu cầu, dùng `git merge --no-ff feature/checklist -m "merge: them checklist hoc tap"`. Kiểm tra hai file đều còn và lịch sử có commit hợp nhất. Các lệnh này chỉ áp dụng trong repository bài tập có trạng thái được mô tả.

## Nhiệm vụ độc lập và hướng giải
Thiết kế nhánh bổ sung `reviews/README.md` mô tả cách ghi review. Trước khi merge, tự viết ba tiêu chí: file có mục đích, đường dẫn đúng, không chứa thông tin riêng. Đọc diff giữa nhánh và main, kiểm tra tiêu chí rồi hợp nhất. Đạt khi bạn giải thích được tại sao chọn fast-forward hoặc merge commit trong lịch sử thực tế của mình. Không chấm trừ chỉ vì hash hoặc số dòng đồ thị khác ví dụ.

## Lỗi thường gặp
Nhầm switch thành merge khiến nghĩ chuyển nhánh là đã tích hợp. Đặt nhiều yêu cầu không liên quan vào một nhánh làm review khó. Chỉ kiểm tra merge không xung đột rồi bỏ qua nội dung có thể đưa lỗi logic vào main. Sửa file nháp trên nhánh không mong muốn cần dừng và xác định nơi lưu phù hợp, tránh tiếp tục theo thói quen.

## Tự kiểm tra và đáp án
1. Switch sang feature có đưa thay đổi của feature vào main không? Không, đó là chuyển vị trí làm việc.
2. Fast-forward có luôn tạo commit hợp nhất mới không? Không; có thể chỉ tiến con trỏ nhánh.
3. Merge thành công có thay thế kiểm tra sản phẩm không? Không, tính hợp lệ về nội dung vẫn cần đối chiếu yêu cầu.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-switch
- https://git-scm.com/docs/git-branch
- https://git-scm.com/docs/git-merge
""", [
                ("git switch -c feature/week2 thực hiện gì?", "Tạo nhánh mới và chuyển sang nhánh đó", ["Hợp nhất mọi nhánh vào main", "Tự upload file lên GitHub", "Xóa lịch sử main"], "Cờ -c dùng để tạo nhánh trước khi switch."),
                ("Khi nào một merge có thể fast-forward?", "Nhánh hiện tại là tổ tiên của nhánh được tích hợp", ["Hai nhánh có cùng tên file", "Máy đang kết nối Wi-Fi", "Mọi commit đều có thông điệp ngắn"], "Quan hệ tổ tiên giữa commit quyết định khả năng tiến thẳng."),
                ("Nếu --ff-only từ chối, nên làm gì?", "Đọc đồ thị và xác định cách tích hợp phù hợp", ["Lặp lệnh vô hạn", "Xóa mọi nhánh ngay", "Đổi tên README để tránh lịch sử"], "Từ chối phản ánh giả định fast-forward không đúng; cần phân tích lịch sử."),
                ("Một merge không báo conflict có bảo đảm tài liệu đáp ứng yêu cầu không?", "Không, vẫn cần đọc và kiểm tra nội dung", ["Có, Git đã chấm đúng nghiệp vụ", "Có, mọi test tự chạy mặc định", "Có nếu nhánh tên feature"], "Git hợp nhất dữ liệu, không tự hiểu mọi yêu cầu của sản phẩm."),
                ("Vì sao một nhánh nên có mục tiêu rõ?", "Giúp review và truy vết thay đổi theo yêu cầu", ["Vì Git cấm sửa nhiều file", "Để tăng dung lượng repository", "Để không cần commit"], "Phạm vi rõ giúp người đánh giá biết tiêu chí và tác động cần xem."),
            ]),
            lesson("Giải quyết xung đột theo yêu cầu nội dung", ["Tái tạo xung đột trong repository riêng.", "Kết hợp hai yêu cầu thay vì chọn bên ngẫu nhiên.", "Hoàn tất merge và xác nhận không còn marker."], r"""
## Mục tiêu và môi trường riêng
Bài này dùng repository mới `conflict-lab` trong thư mục học, để các bước tạo xung đột không ảnh hưởng dự án xuyên khóa. Sản phẩm là file kế hoạch chứa đồng thời hai yêu cầu, một merge commit và biên bản giải thích cách giải. Mở terminal ở thư mục cha không chứa repository quan trọng rồi tự kiểm tra đường dẫn trước khi tạo thư mục.

## Xung đột là thông tin cần quyết định
Hai người có thể sửa cùng một dòng từ một bản gốc nhưng theo mục tiêu khác. Git không đủ dữ liệu để chọn phiên bản đúng, nên yêu cầu người dùng quyết định. Mục tiêu học không phải làm biến mất dấu xung đột bằng cách chọn ngẫu nhiên một bên; mục tiêu là hiểu hai yêu cầu và dựng một kết quả đáp ứng chúng. Có trường hợp chỉ một yêu cầu được chấp nhận, nhưng quyết định phải được ghi cùng lý do.

Trong tình huống giả lập, bản gốc ghi giờ ôn chưa chốt. Nhánh thực hành yêu cầu có phần làm bài; main yêu cầu có phần thảo luận. Kết quả hợp lý có thể là cả thực hành và thảo luận, không nhất thiết giống nguyên văn bên nào. Khi yêu cầu thật xung đột về thời gian hoặc giới hạn khác, cần làm rõ với người phụ trách trước khi sửa, thay vì tự suy đoán.

## Tạo tình huống có thể lặp lại
Các dòng PowerShell dưới chỉ ghi đè `plan.txt` trong repository bài tập vừa tạo.
```powershell
mkdir conflict-lab
cd conflict-lab
git init --initial-branch=main
git config user.name "Nguoi Hoc"
git config user.email "learner@example.invalid"
Set-Content -LiteralPath plan.txt -Value 'Buoi hoc: chua chot' -Encoding utf8
git add -- plan.txt
git commit -m "docs: tao ke hoach goc"
git switch -c feature/practice
Set-Content -LiteralPath plan.txt -Value 'Buoi hoc: thuc hanh' -Encoding utf8
git add -- plan.txt
git commit -m "docs: de xuat phan thuc hanh"
git switch main
Set-Content -LiteralPath plan.txt -Value 'Buoi hoc: thao luan' -Encoding utf8
git add -- plan.txt
git commit -m "docs: de xuat phan thao luan"
git merge feature/practice
git status --short
```
Lệnh merge cuối dự kiến trả trạng thái lỗi do conflict; đây là kết quả được tạo có chủ đích, không cần sửa cài đặt Git. Mở file và xác định các marker cùng hai phần nội dung. Không dùng toàn bộ khối lệnh như một test yêu cầu mọi mã thoát đều bằng 0; bước conflict phải được quan sát riêng.

## Hoàn tất theo hai yêu cầu
Sửa `plan.txt` thành `Buoi hoc: thuc hanh va thao luan`. Xóa các dòng marker bằng cách chỉnh đúng file bài tập, đọc lại kết quả cuối, sau đó:
```powershell
git add -- plan.txt
git diff --cached
git status
git commit -m "merge: ket hop thuc hanh va thao luan"
git log --graph --oneline -5
```
Đầu ra mong đợi: không còn unmerged path; commit hợp nhất xuất hiện; file chứa cả hai phần. Một công cụ có nút accept current/incoming có thể giúp thao tác, nhưng nút không tự hiểu tiêu chí. Nếu chưa sẵn sàng quyết định, ghi lại yêu cầu và hỏi người phụ trách; không biến việc chọn theo màu thành quy tắc nghiệp vụ.

## Bài tập độc lập và hướng giải
Trong repository khác dành riêng cho bài tập, dựng xung đột ở dòng hướng dẫn nộp bài: một phía thêm yêu cầu báo cáo, phía kia thêm yêu cầu test. Viết kết quả gộp, kèm hai câu giải thích nguồn gốc từng yêu cầu. Hướng giải chấp nhận một câu hoặc hai dòng miễn thể hiện cả báo cáo và test, không còn marker và người khác đọc được. Tự kiểm tra trên clone local sạch hoặc mở commit kết quả bằng `git show`.

## Chẩn đoán lỗi thường gặp
Merge chưa kết thúc vì đã sửa file nhưng chưa add; status thường cho biết file còn unmerged. Hoàn tất commit mà vẫn để marker trong nội dung là lỗi kiểm tra của người giải; cần đọc sản phẩm cuối và dùng kiểm tra phù hợp. Xung đột không chỉ là hai người viết cùng một chữ; đổi/xóa hoặc đổi tên file cũng có thể tạo tình huống cần quyết định. Bài này giữ ví dụ văn bản nhỏ để người học nắm quy trình trước.

## Tự kiểm tra và đáp án
1. Conflict có nghĩa repository bị hỏng không? Không; cần quyết định cách tích hợp nội dung.
2. Vì sao add sau khi giải? Để ghi phiên bản đã giải vào index trước khi hoàn tất merge.
3. Chọn “incoming” luôn đúng không? Không; đúng sai phụ thuộc yêu cầu và kết quả cần đạt.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-merge
- https://git-scm.com/docs/git-status
""", [
                ("Vì sao Git có thể báo xung đột khi hai nhánh sửa cùng dòng?", "Không đủ căn cứ để tự chọn nội dung hợp nhất", ["Mọi repository đã bị hỏng", "Chắc chắn máy hết RAM", "Git không hỗ trợ văn bản"], "Một số thay đổi cần người hiểu yêu cầu quyết định kết quả."),
                ("Sau khi sửa đúng file conflict, bước nào chọn phiên bản đã giải?", "git add -- file", ["git remote -v", "git init lại main", "Đổi tên tài khoản GitHub"], "Add cập nhật index với nội dung giải quyết xung đột."),
                ("Hai phía yêu cầu báo cáo và test. Kết quả phù hợp nên dựa vào gì?", "Cả hai yêu cầu và quyết định đã thống nhất", ["Bên có nhiều dòng hơn", "Màu nút đẹp hơn", "Người commit có tên ngắn hơn"], "Xung đột cần được giải theo ngữ nghĩa, không theo đặc điểm ngẫu nhiên."),
                ("Lệnh merge tạo conflict trong bài thực hành trả mã khác 0. Điều này nói gì?", "Tình huống cần giải đã được tạo như dự kiến", ["Phải cài lại hệ điều hành", "Mọi bước trước đều sai", "Cần xóa toàn bộ thư mục học"], "Bài cố ý dựng conflict nên bước đó được đánh giá theo trạng thái mong đợi."),
                ("Trước khi kết thúc merge, cần kiểm tra điều gì trong file?", "Nội dung đúng yêu cầu và không còn marker xung đột", ["Chỉ tổng số ký tự là số chẵn", "Mã hash giống của giảng viên", "Tên file được viết hoa toàn bộ"], "Giải xong phải kiểm tra sản phẩm, không chỉ trạng thái công cụ."),
            ], minutes=110),
        ]),
        dict(title="Remote và cộng tác", lessons=[
            lesson("Clone, fetch và trao đổi qua remote local", ["Phân biệt repository local với remote.", "Mô phỏng hai người bằng hai bản clone.", "Fetch rồi tích hợp có kiểm soát."], r"""
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
""", [
                ("Tên remote origin bắt buộc chỉ tới đâu?", "Không cố định; có thể là đường dẫn local hoặc dịch vụ từ xa", ["Luôn là github.com", "Luôn là ổ C", "Luôn là thư mục tests"], "Origin chỉ là tên remote theo quy ước thường dùng."),
                ("Fetch riêng lẻ có đồng nghĩa main đã được hợp nhất không?", "Không, nó lấy/cập nhật dữ liệu remote theo cấu hình", ["Có trong mọi trường hợp", "Nó luôn tạo merge commit", "Nó luôn xóa commit local"], "Bài tách fetch và merge để quan sát việc nhận và tích hợp."),
                ("Repository bare trong mô phỏng có vai trò gì?", "Điểm trao đổi không có working tree thông thường", ["Trình soạn thảo README", "Máy chủ DNS", "Công cụ tự chấm mọi bài tập"], "Bare repository lưu dữ liệu Git để các clone trao đổi."),
                ("Alice push thay đổi, Bob chưa fetch. Điều gì đúng?", "Bob có thể vẫn đang xem trạng thái local cũ", ["README của Bob luôn đổi ngay", "Bob đã tự tạo merge commit", "Lịch sử Bob đã bị xóa"], "Các clone độc lập, cần bước trao đổi để biết trạng thái remote mới."),
                ("Trước khi push vào một repository chưa quen, nên kiểm tra gì?", "Remote URL và nhánh cần gửi", ["Tên màu nền terminal", "Số ký tự mật khẩu của bạn học", "Ngày tạo màn hình"], "Kiểm tra đích và phạm vi giúp tránh gửi nhầm thay đổi."),
            ], minutes=110),
            lesson("GitHub, quyền truy cập và hồ sơ thay đổi", ["Hiểu vai trò GitHub trong quy trình cộng tác.", "Lập phương án xác thực không đưa bí mật vào tài liệu.", "Mô tả một đề xuất thay đổi có thể review."], r"""
## Mục tiêu và lựa chọn thực hành
GitHub bổ sung nơi lưu repository, thảo luận, review và các dịch vụ cộng tác. Bài cho hai lộ trình: mô phỏng toàn bộ hồ sơ bằng Markdown local hoặc tự thao tác trên repository học tập riêng ở GitHub. Kết quả cần đạt giống nhau: một đề xuất thay đổi có mục đích, diff, cách kiểm tra và nhận xét. Lộ trình web do người học tự thực hiện trên tài khoản được phép; không cần gửi token cho giảng viên hay AI Tutor.

## Git và GitHub trong một quy trình
Commit và branch là dữ liệu/quy trình Git đã thực hành local. Pull request là đề xuất tích hợp thay đổi trên GitHub, cung cấp ngữ cảnh để thảo luận và đánh giá trước khi merge. Một pull request có thể gồm nhiều commit; lời mô tả cần giải thích trạng thái sản phẩm sau thay đổi, không chỉ chép danh sách file. Việc mở đề xuất không đồng nghĩa đã được chấp nhận, và một review được chấp thuận không tự thay thế các kiểm tra khác của nhóm.

## Danh tính, xác thực và quyền
Danh tính tác giả trong commit không phải quyền ghi vào GitHub. Quyền tài nguyên phụ thuộc tài khoản, xác thực và phân quyền của repository/tổ chức. GitHub hỗ trợ nhiều cách xác thực cho các ngữ cảnh khác nhau; người học chọn hướng dẫn chính thức hiện hành cho HTTPS/credential helper hoặc SSH thay vì ghi mật khẩu vào lệnh. Không nhúng bí mật vào URL remote, không đặt private key trong thư mục nguồn, không chụp token làm bằng chứng hoàn thành bài. Các yêu cầu tài khoản và giao diện có thể thay đổi, nên đọc tài liệu xác thực gắn ở cuối bài.

## Thực hành local: hồ sơ tương đương một đề xuất
Tạo nhánh `feature/learning-checklist` trong repository xuyên khóa, thêm checklist ba bước kiểm tra. Đọc diff, commit rồi tạo file `reviews/change-01.md` theo mẫu:
```text
# Thêm checklist học tập
## Vấn đề
Người mới chưa biết cần ghi bằng chứng nào sau mỗi bài.
## Hành vi sau thay đổi
README dẫn tới checklist gồm diff, kết quả test và câu hỏi còn vướng.
## Cách kiểm tra
Mở link tương đối từ README và đối chiếu ba mục với nội dung file.
## Phản hồi review
Ghi nhận xét, cách xử lý và vấn đề còn chưa giải quyết.
```
Đừng ghi “đã test” khi chưa chạy; thay bằng đúng lệnh hoặc thao tác cùng kết quả. Ghi một nhận xét cụ thể như “link README trỏ sai chữ hoa/thường”, sửa rồi tạo commit tiếp. Không cần tác giả khác giả mạo tên để minh họa; bản tự review phải ghi rõ tự review.

## Thực hành GitHub tùy chọn
Trước khi tạo repository học tập, quyết định ai được xem nội dung. Dùng một repository riêng không chứa dữ liệu công việc. Tự cấu hình remote theo URL mà GitHub cung cấp, kiểm tra `git remote -v`, gửi nhánh tính năng rồi mở pull request vào nhánh đích. Điền mục đích, tác động, cách kiểm tra và giới hạn. Có thể dùng draft khi vẫn đang hoàn thiện. Nếu chưa có người review, ghi tự review và giữ báo cáo honest; không gọi đó là đã được nhóm phê duyệt.

## Bài tập độc lập và hướng giải
Một đề xuất chỉ ghi “sửa file”. Viết lại thành mô tả đủ để người chưa học cùng buổi hiểu lý do, kết quả và cách xác minh. Thêm một tình huống sai để người review thử, chẳng hạn link tới file không tồn tại. Hướng giải cần nêu kết quả mong đợi và bằng chứng, không dùng số dòng thay đổi làm thước đo chất lượng. Đạt khi người khác có thể tìm đúng diff, thực hiện kiểm tra và biết lỗi nào cần phản hồi.

## Lỗi thường gặp
Nhầm fork với branch dẫn tới không biết thay đổi nằm ở repository nào; xác định cả chủ repository và tên nhánh. Sửa description sau review mà không báo phạm vi thay đổi có thể làm người review bỏ sót; cập nhật thông tin khi kết quả cuối đổi. Lấy ảnh nút màu xanh làm bằng chứng duy nhất bỏ qua nội dung và quyền. Trên máy dùng chung, dùng credential helper theo chính sách máy và đăng xuất phiên không còn cần thiết.

## Tự kiểm tra và đáp án
1. Pull request có phải lệnh Git local không? Không; đây là cơ chế cộng tác của dịch vụ GitHub.
2. Có nên gửi token cho người chấm để chứng minh đăng nhập không? Không; minh chứng bằng trạng thái và nội dung đã che thông tin riêng.
3. Đề xuất đã mở có nghĩa đã merge chưa? Chưa; cần quyết định tích hợp theo quy trình và quyền.

## Nguồn đọc tiếp
- https://docs.github.com/en/pull-requests/reference/pull-requests
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github
- https://docs.github.com/en/get-started/git-basics/about-remote-repositories
""", [
                ("Pull request trên GitHub chủ yếu là gì?", "Đề xuất để thảo luận và review thay đổi trước khi tích hợp", ["Lệnh thay mọi mật khẩu Git", "Một file bắt buộc tên pull.txt", "Bằng chứng tự động rằng sản phẩm không có lỗi"], "PR tập hợp ngữ cảnh và trao đổi cho quyết định hợp nhất."),
                ("Token truy cập nên được đặt ở đâu trong báo cáo nộp bài?", "Không đưa token thật vào báo cáo", ["Dòng đầu README công khai", "Ảnh chụp màn hình chưa che", "Tên nhánh tính năng"], "Bằng chứng học tập không cần tiết lộ bí mật xác thực."),
                ("Thông tin nào giúp reviewer kiểm tra một đề xuất?", "Mục đích, hành vi mới, diff và cách xác minh", ["Chỉ số lượng dấu cộng", "Chỉ ảnh đại diện tác giả", "Chỉ câu đã sửa xong"], "Review cần ngữ cảnh và tiêu chí quan sát được."),
                ("user.email đúng có tự cấp quyền push repository GitHub không?", "Không; còn cần xác thực và quyền phù hợp", ["Có với mọi repository", "Có nếu email dài hơn 20 ký tự", "Có nếu commit đã có tag"], "Danh tính commit không thay cho phân quyền tài nguyên."),
                ("Khi chỉ có tự review trong bài học, nên ghi thế nào?", "Ghi rõ tự review và các kiểm tra đã thực hiện", ["Giả tên người duyệt khác", "Ghi được chuyên gia chứng nhận", "Bỏ qua mọi bằng chứng"], "Hồ sơ phải phản ánh đúng người và mức kiểm tra đã diễn ra."),
            ]),
        ]),
        dict(title="Chất lượng thay đổi và sửa lỗi", lessons=[
            lesson("Review, kiểm tra tự động và bằng chứng", ["Lập checklist review dựa trên yêu cầu.", "Chạy một test tự động đơn giản cho dự án.", "Ghi nhận giới hạn thay vì khẳng định quá mức."], r"""
## Mục tiêu và môi trường
Sử dụng repository Study Notes. Cần Python 3 hiện hành có thư viện chuẩn; bài không yêu cầu cài package mạng. Mục tiêu là kiểm tra một quy tắc nội dung cụ thể: ghi chú phải có tiêu đề Markdown. Sau bài, repo có một test chạy được trên clone sạch và một hồ sơ review ghi rõ test kiểm tra được gì. Tên file hoặc trạng thái sạch không đủ chứng minh mọi liên kết hay kiến thức đều đúng.

## Review bắt đầu bằng hợp đồng
Trước khi đọc diff, ghi yêu cầu: tất cả file Markdown trong notes phải bắt đầu bằng tiêu đề cấp 1 và không còn placeholder bắt buộc. Người review đối chiếu kết quả với hợp đồng này, kiểm tra đường dẫn, đầu vào rỗng và thông báo lỗi. Kiểm thử tự động giúp lặp một phép kiểm đã định nghĩa; nó không tự biết mọi yêu cầu chưa được mã hóa. Do đó cần cả bài tập thành công và tình huống bị từ chối, cùng lời giải thích giới hạn.

## Ví dụ thực thi độc lập
Lưu đoạn dưới thành `test_heading.py` trong repository bài tập rồi chạy `python test_heading.py`. Đây là ví dụ thuần Python, không truy cập mạng và chưa quét file trên máy.
```python
import unittest

def has_heading(text):
    return text.lstrip('\ufeff').startswith('# ')

class HeadingTests(unittest.TestCase):
    def test_valid_note(self):
        self.assertTrue(has_heading('# Tuan mot\nNoi dung'))

    def test_missing_heading(self):
        self.assertFalse(has_heading('Noi dung chua co tieu de'))

    def test_bom_from_editor(self):
        self.assertTrue(has_heading('\ufeff# Tuan mot'))

if __name__ == '__main__':
    unittest.main()
```
Đầu ra mong đợi là ba test đạt. Test BOM nhắc rằng editor có thể tạo ký tự đánh dấu mã hóa trước chữ đầu; hợp đồng đã chọn cho phép ký tự đó. Đây là một quyết định phải nói rõ, không phải mọi ứng dụng đều có cùng quy tắc xử lý khoảng trắng. Nếu dùng dự án mẫu kèm khóa, kiểm tra thực tế bằng `python -m unittest discover -s tests -v` từ thư mục gốc.

## Đưa kiểm tra vào quy trình nhánh
Tạo nhánh `feature/heading-check`, thêm test và hướng dẫn chạy vào README. Đọc diff cached trước commit, chạy test rồi ghi kết quả vào hồ sơ review. Thử thay dữ liệu test thành văn bản thiếu tiêu đề để kiểm chứng test có thể phát hiện lỗi; khôi phục nội dung mong muốn bằng editor sau khi đã ghi bằng chứng, rồi chạy lại. Không thêm test chỉ khẳng định `True` để có màu xanh; một test hữu ích cần phân biệt được ít nhất hai tình huống có ý nghĩa.

## Mẫu ghi bằng chứng
```text
Yeu cau: ghi chu can tieu de cap 1.
Lenh: python test_heading.py
Ket qua: 3 test dat.
Tinh huong am: doi du lieu thanh van ban thieu tieu de, test hop le that bai.
Gioi han: chua kiem tra tinh dung kien thuc trong ghi chu.
```
Thời điểm, phiên bản Python và commit được kiểm tra giúp tái hiện. Chỉ ghi dữ liệu cần thiết, không chụp toàn bộ terminal chứa thông tin khác của máy. Nếu test chạy trước lần sửa cuối, cần chạy lại hoặc ghi rõ kết quả chưa áp dụng cho trạng thái cuối.

## Bài tập độc lập và hướng giải
Thêm quy tắc không chứa `TODO_REQUIRED`. Viết một trường hợp có placeholder và một trường hợp bình thường. Giải thích vì sao không cấm toàn bộ chuỗi “TODO” nếu người học đang viết bài dạy về TODO như một khái niệm. Hướng giải nên nhận đầu vào rõ ràng, có kết quả mong đợi và mô tả phạm vi; đạt khi test phát hiện đúng vi phạm được thống nhất và README cho người khác chạy lại.

## Lỗi thường gặp
Chỉ chạy test trên file không được commit khiến clone sạch thiếu công cụ. Tạo test phụ thuộc đường dẫn cá nhân làm người khác không chạy được. Nhầm số test lớn với độ bao phủ đầy đủ; ba test có ý nghĩa vẫn chỉ kiểm tra ba góc nhìn. Review chỉ xem format mà bỏ yêu cầu có thể bỏ sót một công cụ luôn trả thành công.

## Tự kiểm tra và đáp án
1. Test tiêu đề đạt có chứng minh nội dung ghi chú đúng học thuật không? Không; chỉ quy tắc tiêu đề được kiểm.
2. Vì sao cần test tình huống sai? Để chứng minh phép kiểm có thể phân biệt một vi phạm đã định nghĩa.
3. Sửa code sau khi test đạt cần làm gì? Chạy lại kiểm tra liên quan cho trạng thái mới rồi cập nhật bằng chứng.

## Nguồn đọc tiếp
- https://docs.python.org/3/library/unittest.html
- https://docs.github.com/en/pull-requests/reference/pull-request-reviews
- https://git-scm.com/docs/git-diff
""", [
                ("Test kiểm tra tiêu đề Markdown đạt chứng minh điều gì?", "Các tình huống về quy tắc tiêu đề được test đã đạt", ["Mọi kiến thức trong tài liệu đã đúng", "Không còn bất kỳ lỗi nào", "Repository đã có chứng nhận nghề nghiệp"], "Kết luận cần giới hạn theo điều kiện được kiểm tra."),
                ("Tình huống âm trong test là gì ở bài này?", "Một đầu vào vi phạm quy tắc cần bị từ chối", ["Một commit không có hash", "Máy có âm lượng bằng 0", "Một file luôn được bỏ qua"], "Đầu vào sai giúp kiểm tra khả năng phát hiện lỗi của phép kiểm."),
                ("Sau khi sửa code cuối cùng, nên dùng bằng chứng test nào?", "Kết quả chạy lại trên trạng thái code mới", ["Kết quả từ tháng trước của bản khác", "Chỉ ảnh commit thành công", "Chỉ số lượng file"], "Bằng chứng phải tương ứng với phiên bản được bàn giao."),
                ("Vì sao README cần ghi lệnh test và thư mục chạy?", "Để người khác tái hiện kiểm tra trên clone sạch", ["Để thay thế mọi test", "Để Git tự upload file", "Để tránh phải xác định yêu cầu"], "Lệnh và ngữ cảnh thực thi là phần của khả năng tái tạo."),
                ("Một test chỉ assert True có ích gì cho quy tắc tiêu đề?", "Không chứng minh được phép kiểm phát hiện vi phạm tiêu đề", ["Chứng minh mọi ghi chú hợp lệ", "Tự sửa nội dung thiếu tiêu đề", "Kiểm tra tất cả file chưa commit"], "Test phải có khả năng thất bại khi điều kiện có ý nghĩa bị vi phạm."),
            ]),
            lesson("Sửa sai bằng commit bổ sung và revert", ["Phân biệt sửa lỗi sản phẩm với thay lịch sử.", "Tạo commit hoàn tác có lý do.", "Đọc diff và chạy kiểm tra sau hoàn tác."], r"""
## Mục tiêu và điều kiện
Bài dùng repository mới `revert-lab` để quan sát một thay đổi và commit hoàn tác của nó. Không thực hành trên nhánh được người khác dùng. Sản phẩm là ba commit rõ ràng: bản gốc, thay đổi cần hoàn tác, commit revert. Bạn cần giải thích trạng thái nội dung cuối và lý do lịch sử vẫn giữ dấu vết của thay đổi từng xảy ra.

## Hai câu hỏi trước khi sửa sai
Thứ nhất: lỗi nằm ở nội dung cần sửa hay một thay đổi cần được rút lại hoàn toàn? Nếu một hướng dẫn chỉ sai một đường dẫn, commit bổ sung sửa đường dẫn thường là cách dễ review. Nếu cả tính năng đang bị tạm rút, một revert có thể diễn đạt ý định rõ hơn. Thứ hai: lịch sử đã được chia sẻ chưa? Khi nhiều người đã dựa vào commit, một commit mới thể hiện việc hoàn tác giúp người khác theo dõi thay vì giả sử commit cũ chưa từng tồn tại.

Revert tạo thay đổi ngược với một commit theo ngữ cảnh áp dụng, rồi lưu thành commit mới. Nó không có nghĩa xóa mọi dấu vết hoặc đưa toàn bộ repository về một thời điểm trong mọi tình huống. Nếu các thay đổi sau đó chồng lấn, hoàn tác có thể cần giải quyết xung đột và kiểm tra lại. Vì vậy hãy đọc diff kết quả và chạy test; thông báo thành công của Git không thay thế việc đối chiếu mục tiêu sản phẩm.

## Thực hành một hoàn tác đơn giản
Chạy từ thư mục cha dành riêng cho bài học. Dùng file minh họa không chứa dữ liệu thật.
```powershell
mkdir revert-lab
cd revert-lab
git init --initial-branch=main
git config user.name "Nguoi Hoc"
git config user.email "learner@example.invalid"
Set-Content -LiteralPath rule.txt -Value 'Quiz can it nhat 5 cau' -Encoding utf8
git add -- rule.txt
git commit -m "docs: ghi quy tac goc"
Set-Content -LiteralPath rule.txt -Value 'Quiz chi can 1 cau' -Encoding utf8
git add -- rule.txt
git commit -m "docs: thu thay doi quy tac"
git show --stat HEAD
git revert --no-edit HEAD
git log --oneline -3
Get-Content -LiteralPath rule.txt
```
Đầu ra mong đợi: nội dung trở lại quy tắc ít nhất 5 câu, nhưng log có ba commit và commit cuối thể hiện revert. Không dùng ví dụ này để tự thay ngưỡng hệ thống LMS; đây chỉ là file văn bản trong repository bài tập. Mã hash khác nhau ở mỗi máy và không cần sao chép mã từ tài liệu.

## Sửa lỗi có phạm vi nhỏ
Sau ví dụ, thêm một dòng hướng dẫn có lỗi chính tả vào file mới, commit rồi sửa bằng commit bổ sung. So sánh hai cách: commit sửa nêu phần nội dung cần đổi; revert nêu ý định rút lại một thay đổi trước đó. Cả hai đều cần thông điệp và bằng chứng. Không nhất thiết chọn revert cho mọi lỗi, nhất là khi một phần thay đổi vẫn cần giữ.

## Bài tập hướng dẫn
Một commit thêm hai quy tắc: yêu cầu tiêu đề và yêu cầu có link đọc thêm. Sau khi đọc yêu cầu nhóm, chỉ quy tắc link cần sửa thành tùy chọn. Bạn sẽ revert toàn commit hay sửa phần link? Hướng giải thường là commit bổ sung chỉ sửa quy tắc link, vì yêu cầu tiêu đề vẫn hợp lệ. Người học được đề xuất cách khác nếu giải thích đầy đủ trạng thái cuối và tác động, nhưng không được vô tình bỏ cả yêu cầu đúng.

## Nhiệm vụ độc lập và tiêu chí
Viết báo cáo `why-revert.md` gồm vấn đề, commit liên quan, lý do chọn hoàn tác, kết quả diff và kiểm tra sau cùng. Tạo một hoàn tác có chủ đích trong lab rồi bàn giao log. Đạt khi người khác nhìn lịch sử hiểu việc gì đã xảy ra và file cuối đáp ứng quy tắc ban đầu. Không tự nhận đã “xóa bí mật khỏi lịch sử” bằng revert: commit chứa bí mật cũ vẫn có thể được truy xuất, nên xử lý bí mật phải theo quy trình riêng.

## Lỗi thường gặp
Hoàn tác nhầm HEAD vì đang đứng ở repository khác; kiểm tra đường dẫn và show trước. Tin rằng revert luôn không conflict; ngữ cảnh sửa có thể đã thay đổi. Chỉ xem log mà bỏ nội dung cuối; một revert về cú pháp có thể làm test khác thất bại. Xóa bằng chứng lỗi vì ngại lịch sử nhìn xấu sẽ mất thông tin học và review; trong khóa này, lịch sử rõ ràng có giá trị hơn hình thức đẹp.

## Tự kiểm tra và đáp án
1. Revert có xóa commit cũ khỏi lịch sử không? Không, nó thêm commit thể hiện thay đổi ngược.
2. Có nên revert cả commit khi chỉ một phần cần sửa? Cần đánh giá phạm vi; commit bổ sung có thể giữ đúng phần còn hợp lệ.
3. Vì sao cần test sau hoàn tác? Nội dung cuối có thể ảnh hưởng các thay đổi phụ thuộc về sau.

## Nguồn đọc tiếp
- https://git-scm.com/docs/git-revert
- https://git-scm.com/docs/git-show
- https://git-scm.com/docs/git-log
""", [
                ("git revert thường thể hiện hoàn tác bằng cách nào?", "Tạo commit mới với thay đổi ngược phù hợp", ["Xóa mọi commit cũ khỏi mọi clone", "Mã hóa lịch sử", "Chỉ đổi tên nhánh"], "Revert giữ lịch sử và thêm một thay đổi mới để hoàn tác."),
                ("Revert một commit chứa token có làm token biến mất khỏi lịch sử không?", "Không", ["Có tuyệt đối", "Có nếu thông điệp viết hoa", "Có nếu đổi email tác giả"], "Commit trước vẫn tồn tại; xử lý bí mật cần thu hồi/thay và quy trình phù hợp."),
                ("Chỉ một dòng trong commit cần sửa, các phần khác đúng. Cách hợp lý có thể là gì?", "Tạo commit bổ sung sửa đúng dòng đó", ["Luôn phải rút toàn bộ mọi thay đổi", "Xóa cả repository", "Bỏ mọi test liên quan"], "Chọn thao tác theo phạm vi cần đổi để giữ phần vẫn hợp lệ."),
                ("Trước khi revert HEAD, nên xem gì?", "Repository hiện tại và nội dung commit HEAD", ["Chỉ chiều cao cửa sổ terminal", "Chỉ tên ảnh đại diện", "Số màu của editor"], "Cần xác định đúng đích và thay đổi sẽ bị hoàn tác."),
                ("Revert thành công về Git có đủ để kết luận ứng dụng hoạt động đúng không?", "Chưa, cần kiểm tra nội dung và hành vi liên quan", ["Đủ với mọi loại hệ thống", "Đủ nếu không có mạng", "Đủ nếu log chỉ còn một màu"], "Các thay đổi phụ thuộc có thể bị ảnh hưởng nên cần xác minh sản phẩm cuối."),
            ]),
        ]),
        dict(title="Phát hành và dự án cuối khóa", lessons=[
            lesson("Tag, ghi chú phát hành và bàn giao tái tạo", ["Gắn tag chú thích cho phiên bản được kiểm tra.", "Phân biệt archive mã nguồn với repository đầy đủ.", "Kiểm tra một bản bàn giao ở thư mục mới."], r"""
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
""", [
                ("Tag v1.0.0 trong khóa học giúp làm gì?", "Tham chiếu một mốc phiên bản đã chọn", ["Tự bảo đảm không còn lỗi", "Tự chấm điểm mọi bài tập", "Tự xóa file ignored"], "Tag đánh dấu mốc; bằng chứng kiểm tra thuộc quy trình phát hành."),
                ("git archive từ tag chủ yếu chứa gì?", "Nội dung được quản lý tại mốc tag", ["Mọi file chưa commit trên ổ đĩa", "Mọi token trong trình quản lý mật khẩu", "Luôn cả toàn bộ lịch sử .git"], "Archive xuất cây nội dung của mốc chỉ định."),
                ("Sau tag, bạn sửa file nhưng chưa commit. Archive từ tag thay đổi thế nào?", "Vẫn phản ánh nội dung của mốc tag cũ", ["Luôn lấy sửa mới nhất từ editor", "Tự tạo tag mới", "Tự thêm mọi file bị ignore"], "Mốc nguồn xác định nội dung archive, không phải working tree hiện tại."),
                ("Chạy kiểm tra từ clone sạch giúp xác nhận điều gì?", "Bản được chia sẻ có đủ file và hướng dẫn thực thi", ["Mọi lỗ hổng bảo mật đều đã biến mất", "Tag tự tăng phiên bản", "Mọi nhóm đều dùng cùng hệ điều hành"], "Clone sạch giúp tìm phụ thuộc local hoặc thiếu sót bàn giao."),
                ("Bài nộp yêu cầu xem lịch sử nhưng chỉ có ZIP archive. Thiếu gì?", "Dữ liệu repository hoặc bundle phù hợp để xem lịch sử", ["Chỉ màu ảnh bìa", "Bắt buộc mật khẩu tài khoản", "Chỉ tên file dài hơn"], "Archive nội dung không tự cung cấp toàn bộ lịch sử Git."),
            ]),
            lesson("Dự án Study Notes và đánh giá hoàn thành", ["Tích hợp các kỹ năng thành một quy trình có bằng chứng.", "Bàn giao dự án theo rubric và tiêu chí tái tạo.", "Tự phân tích khoảng trống trước khi kết thúc khóa."], r"""
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
""", [
                ("Tiêu chí nào phản ánh khả năng bàn giao tốt nhất?", "Người khác chạy được hướng dẫn từ bản clone hoặc bản nộp sạch", ["Chỉ có nhiều file", "Chỉ ảnh màn hình màu xanh", "Chỉ thông điệp final cuối cùng"], "Khả năng tái tạo kiểm chứng dữ liệu và hướng dẫn bàn giao."),
                ("Điểm Quiz cao có tự thay thế phần dự án Git không?", "Không, dự án cần minh chứng kỹ năng thực hành", ["Có trong mọi trường hợp", "Có nếu làm Quiz nhanh", "Có nếu tên repository dài"], "Kiến thức lựa chọn đáp án và năng lực thực hiện quy trình cần đánh giá bổ sung."),
                ("Một hồ sơ review tự thực hiện nên ghi thông tin nào?", "Tự review, nhận xét cụ thể và cách xử lý", ["Tên giả của một người duyệt", "Token của giảng viên", "Khẳng định đã được chuyên gia chứng nhận"], "Bằng chứng cần phản ánh trung thực hoạt động thực tế."),
                ("Số commit lớn có đủ chứng minh lịch sử chất lượng không?", "Không; cần phạm vi logic, thông điệp và bằng chứng", ["Có vì mỗi commit luôn đúng", "Có nếu tất cả thông điệp giống nhau", "Có nếu không có test"], "Rubric đánh giá ý nghĩa và khả năng truy vết, không chỉ đếm commit."),
                ("Nếu clone sạch thiếu file cần cho test, nên làm gì?", "Bổ sung nguồn/bước thiết lập hợp lệ, commit và kiểm tra lại", ["Chỉ chạy ở máy gốc rồi bỏ qua", "Gửi mật khẩu máy tính cho người chấm", "Đổi kết quả báo cáo thành đạt"], "Sửa nguyên nhân bàn giao và chạy lại giúp tạo bằng chứng thực."),
            ], minutes=140),
        ]),
    ],
)


GIT_WORKFLOW_CHECK = r'''
import os
from pathlib import Path
import subprocess
import shutil
import stat
import uuid

def run(folder, *args, expected=0):
    result = subprocess.run(['git', '-c', 'commit.gpgsign=false', *args], cwd=folder,
                            text=True, encoding='utf-8', capture_output=True,
                            env={**os.environ, 'GIT_TERMINAL_PROMPT': '0'})
    assert result.returncode == expected, (args, result.stdout, result.stderr)
    return result.stdout.strip()

temp_parent = Path.cwd().resolve() / 'data' / 'git_course_checks'
temp_parent.mkdir(parents=True, exist_ok=True)
root = (temp_parent / ('studyonline_git_course_' + uuid.uuid4().hex)).resolve()
root.mkdir()
try:
    assert root.is_relative_to(temp_parent.resolve()) and root != temp_parent.resolve()
    run(root, 'init', '--bare', '--initial-branch=main', 'shared.git')
    run(root, 'clone', str(root / 'shared.git'), 'alice')
    alice = root / 'alice'
    run(alice, 'config', 'user.name', 'Course Alice')
    run(alice, 'config', 'user.email', 'alice@example.invalid')
    run(alice, 'config', 'core.hooksPath', str(root / 'empty-hooks'))
    (alice / 'README.md').write_text('# Study Notes\n', encoding='utf-8')
    run(alice, 'add', '--', 'README.md')
    assert 'README.md' in run(alice, 'diff', '--cached', '--name-only')
    run(alice, 'commit', '-m', 'docs: start notes')
    run(alice, 'push', '--set-upstream', 'origin', 'main')
    run(root, 'clone', str(root / 'shared.git'), 'bob')
    bob = root / 'bob'
    run(bob, 'config', 'user.name', 'Course Bob')
    run(bob, 'config', 'user.email', 'bob@example.invalid')
    run(bob, 'config', 'core.hooksPath', str(root / 'empty-hooks'))
    run(alice, 'switch', '-c', 'feature/notes')
    (alice / 'week1.md').write_text('# Week 1\n', encoding='utf-8')
    run(alice, 'add', '--', 'week1.md')
    run(alice, 'commit', '-m', 'docs: add week one')
    run(alice, 'switch', 'main')
    run(alice, 'merge', '--ff-only', 'feature/notes')
    run(alice, 'push', 'origin', 'main')
    assert not (bob / 'week1.md').exists()
    run(bob, 'fetch', 'origin')
    assert not (bob / 'week1.md').exists()
    run(bob, 'merge', '--ff-only', 'origin/main')
    assert (bob / 'week1.md').read_text(encoding='utf-8') == '# Week 1\n'
    (bob / '.gitignore').write_text('.env\n', encoding='utf-8')
    (bob / '.env').write_text('APP_MODE=learning\n', encoding='utf-8')
    assert run(bob, 'check-ignore', '--', '.env') == '.env'
    run(bob, 'add', '--', '.gitignore')
    run(bob, 'commit', '-m', 'chore: ignore local settings')
    before = run(bob, 'rev-list', '--count', 'HEAD')
    (bob / 'rule.txt').write_text('unwanted rule\n', encoding='utf-8')
    run(bob, 'add', '--', 'rule.txt')
    run(bob, 'commit', '-m', 'docs: temporary rule')
    run(bob, 'revert', '--no-edit', 'HEAD')
    assert not (bob / 'rule.txt').exists()
    assert int(run(bob, 'rev-list', '--count', 'HEAD')) == int(before) + 2
    run(bob, 'tag', '-a', 'v1.0.0', '-m', 'Course release')
    archive = root / 'release.zip'
    run(bob, 'archive', '--format=zip', '--output=' + str(archive), 'v1.0.0')
    import zipfile
    with zipfile.ZipFile(archive) as bundle:
        assert 'README.md' in bundle.namelist()
        assert '.env' not in bundle.namelist()
        assert 'rule.txt' not in bundle.namelist()
    assert run(bob, 'status', '--porcelain') == ''
finally:
    assert root.is_relative_to(temp_parent.resolve()) and root != temp_parent.resolve()
    def allow_remove(function, path, error):
        os.chmod(path, stat.S_IWRITE | stat.S_IREAD)
        function(path)
    shutil.rmtree(root, onexc=allow_remove)
'''

COURSE["chapters"][-1]["lessons"][-1]["checks"] = [
    {"name": "git_local_workflow", "code": GIT_WORKFLOW_CHECK}
]

GIT_CONFLICT_CHECK = GIT_WORKFLOW_CHECK.split("temp_parent = ", 1)[0] + r'''
temp_parent = Path.cwd().resolve() / 'data' / 'git_course_checks'
temp_parent.mkdir(parents=True, exist_ok=True)
root = (temp_parent / ('studyonline_git_conflict_' + uuid.uuid4().hex)).resolve()
root.mkdir()
try:
    assert root.is_relative_to(temp_parent.resolve()) and root != temp_parent.resolve()
    run(root, 'init', '--initial-branch=main')
    run(root, 'config', 'user.name', 'Course Learner')
    run(root, 'config', 'user.email', 'learner@example.invalid')
    run(root, 'config', 'core.hooksPath', str(root / 'empty-hooks'))
    plan = root / 'plan.txt'
    plan.write_text('Buoi hoc: chua chot\n', encoding='utf-8')
    run(root, 'add', '--', 'plan.txt')
    run(root, 'commit', '-m', 'docs: initial plan')
    run(root, 'switch', '-c', 'feature/practice')
    plan.write_text('Buoi hoc: thuc hanh\n', encoding='utf-8')
    run(root, 'add', '--', 'plan.txt')
    run(root, 'commit', '-m', 'docs: add practice')
    run(root, 'switch', 'main')
    plan.write_text('Buoi hoc: thao luan\n', encoding='utf-8')
    run(root, 'add', '--', 'plan.txt')
    run(root, 'commit', '-m', 'docs: add discussion')
    run(root, 'merge', 'feature/practice', expected=1)
    assert 'UU plan.txt' in run(root, 'status', '--short')
    assert '<<<<<<<' in plan.read_text(encoding='utf-8')
    plan.write_text('Buoi hoc: thuc hanh va thao luan\n', encoding='utf-8')
    run(root, 'add', '--', 'plan.txt')
    run(root, 'commit', '-m', 'merge: retain practice and discussion')
    assert len(run(root, 'rev-list', '--parents', '-n', '1', 'HEAD').split()) == 3
    assert run(root, 'show', 'HEAD:plan.txt') == 'Buoi hoc: thuc hanh va thao luan'
    assert run(root, 'status', '--porcelain') == ''
finally:
    assert root.is_relative_to(temp_parent.resolve()) and root != temp_parent.resolve()
    def allow_remove(function, path, error):
        os.chmod(path, stat.S_IWRITE | stat.S_IREAD)
        function(path)
    shutil.rmtree(root, onexc=allow_remove)
'''
COURSE["chapters"][2]["lessons"][1]["checks"] = [
    {"name": "git_conflict_resolution", "code": GIT_CONFLICT_CHECK}
]
