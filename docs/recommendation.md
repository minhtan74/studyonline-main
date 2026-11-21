# Gợi ý học tập theo nội dung bài kiểm tra

## Kiến thức chi tiết trong chủ đề — 07/11/2026

`wrong_details` bổ sung phần kiến thức cụ thể và hướng dẫn ôn cho các câu có phân loại đã đối chiếu. Phạm vi ban đầu: 10 câu trong bài Phân loại HĐH, thuộc Hệ thống phân tán/Hệ thống song song. Danh mục `question_review_details.json` lưu phân loại biên soạn riêng theo nội dung câu, không lấy nguyên giải thích đáp án hoặc tự đoán từ từ khóa. Khóa khớp gồm khóa học, tên chủ đề đã lưu và fingerprint nội dung/phương án; không sử dụng ID câu đơn lẻ làm căn cứ. Câu mới hoặc sửa nội dung không khớp sẽ giữ gợi ý cấp chủ đề, cần phân loại bổ sung. Chưa có giao diện giáo viên soạn phân loại chi tiết; phần này được quản lý bằng danh mục mã nguồn.

Mỗi phần chi tiết tính số câu đúng/sai và ngưỡng riêng; chỉ hiện khi có câu sai. Dưới 5 câu ghi cần kiểm tra thêm, không kết luận yếu từ tỷ lệ sai của chủ đề cha. Nội dung đúng hết bị loại; lượt mới cập nhật theo quy tắc căn cứ chương/bài hiện tại. Không đổi điểm, đáp án, phân loại chủ đề gốc hoặc dữ liệu bài làm. Với kết quả cũ thiếu fingerprint, nếu đối chiếu được nội dung hiện tại sẽ ghi rõ giới hạn khôi phục. Đây là phân loại biên soạn, không phải suy luận của mô hình AI.

## Hướng dẫn từ câu trả lời sai — 07/11/2026

Phần “Bạn nên xem lại” hiện hiển thị `wrong_topics`: các chủ đề được lưu tại lúc nộp có câu trả lời sai trong tập căn cứ chương/bài đang dùng. Mỗi mục ghi số câu sai/tổng số câu khác nhau. Chủ đề đúng hết bị loại; chủ đề đạt từ 70% nhưng còn câu sai vẫn có thể xem lại mà không bị gắn nhãn cần củng cố. Dưới 5 câu vẫn ghi chưa đủ dữ liệu. Câu sai chưa có chủ đề được đếm riêng, không tự suy đoán nội dung từ tên bài hoặc từ khóa.

Không còn dùng danh mục tài liệu của cả bài để tạo hướng dẫn cá nhân này. Danh mục và helper cũ vẫn còn trong mã nguồn nhưng không được gọi từ luồng tổng hợp kiến thức. `review_guidance` cho bài được tạo từ chính các chủ đề có câu sai; `review_topics` và ngưỡng chọn bài/chương giữ nguyên. Giao diện hiển thị danh sách chủ đề sai trực tiếp, không lặp lại ví dụ chung của tài liệu. Các mô tả về danh mục bên dưới là lịch sử triển khai trước thay đổi này.

## Chi tiết kiến thức trong bài được gợi ý

### Mở rộng hướng dẫn ôn cho toàn bộ bài học

Khối “Bạn nên xem lại” hiện dùng danh mục `backend/app/services/lesson_review_catalog.json`, sinh lại bằng `python scripts/build_review_guidance.py` trong thư mục backend. Danh mục lấy đề mục từ tài liệu Markdown, mục tiêu bài học của bộ Git/OOP/FastAPI và tình huống minh họa có trong tài liệu; không gọi AI hoặc suy diễn từ câu sai. Khóa tra cứu gồm tên khóa và tên bài đã chuẩn hóa, tránh lấy nội dung của môn khác có cùng tên bài. Dữ liệu danh mục được nạp một lần mỗi tiến trình; sau khi dựng lại cần khởi động lại backend.

Kiểm tra database hiện tại có 138 bài: 137 bài khớp danh mục tài liệu, một bài thuộc “PYTEST Course” dùng mô tả bài học. Bài mới không có trong danh mục dùng mô tả hiện tại; nếu chưa có mô tả thì chỉ hướng dẫn ôn khái niệm/ví dụ/bài tập của cả bài, không tạo chi tiết giả. Mục ôn tài liệu và chủ đề có kết quả đúng/sai riêng được ghi nhãn phân biệt. Nội dung danh mục cần dựng lại nếu giảng viên thay đổi tài liệu; đây không phải trích xuất trực tiếp từ PDF vừa tải lên.

Kiểm chứng: 62 kiểm thử backend đạt; kiểm tra chỉ đọc MySQL với 5 học viên, 28 đánh giá cấp bài đều có hướng dẫn. Đối chiếu danh mục với toàn bộ 138 bài; chưa kiểm chứng trực tiếp trên trình duyệt.

Bài “Khái niệm về hệ điều hành” bổ sung khối “Bạn nên xem lại”: vai trò quản lý tài nguyên, CPU/bộ nhớ/I/O và việc cạnh tranh/chờ tài nguyên khi chạy nhiều ứng dụng. Nội dung được biên soạn từ tài liệu bổ sung của bài (`backend/training/lesson_docs/edition_20261029/generated/lesson_55_b7decac16b17.html`), cấu hình tại `backend/app/services/review_guidance.py`. Đây là hướng dẫn ôn ở cấp bài, được ghi rõ riêng với các chủ đề có số liệu cá nhân; không tạo số câu hay suy diễn điểm yếu chi tiết. Các bài khác chưa có hướng dẫn biên soạn vẫn dùng căn cứ chủ đề/chương/bài sẵn có. Kiểm tra sau bổ sung: 60 kiểm thử backend đạt và frontend build thành công; chưa kiểm chứng trên trình duyệt.

Các gợi ý chương/bài bổ sung `review_topics`, tổng hợp chủ đề đã lưu tại lúc nộp từ chính tập câu trả lời đang làm căn cứ của chương/bài. Giao diện tóm tắt (mở “Vì sao?”), danh sách gợi ý và phần căn cứ chương/bài hiển thị tên chủ đề, số câu đúng/tổng và trạng thái. Chủ đề có ít nhất 5 nội dung khác nhau và dưới 70% được đề nghị ôn; chủ đề ít câu có câu sai chỉ được đề nghị kiểm tra thêm. Chủ đề đạt ngưỡng không đưa vào danh sách này. Không đọc phân loại hiện tại để tự thay tên chủ đề của kết quả đã lưu, không suy đoán từ từ khóa. Khi không có chủ đề đủ thông tin, giữ gợi ý ở cấp chương/bài. Phần này giải thích chi tiết các gợi ý chương/bài hiện có, không thay đổi cách chọn bài hoặc điểm chính thức.

Kiểm tra: 59 kiểm thử knowledge/recommendations/question_evidence đạt; frontend build thành công. Chưa kiểm chứng hiển thị trực tiếp trên trình duyệt với tài khoản học viên.

Cập nhật 31/10/2026. Hệ thống dùng quy tắc Python trên dữ liệu đúng/sai từng câu. Không dùng LLM để kết luận năng lực; nhập tay, Word và AI dùng chung quy tắc sau khi giáo viên duyệt câu hỏi.

## Gợi ý theo chương và bài học — ba cấp kiểm tra

Trang kết quả quiz theo chương bổ sung khối “Bạn nên ôn bài nào, phần kiến thức nào?”. Khối dùng `knowledge` của chính lượt nộp (cả khi vừa nộp và tải lại lịch sử), hiển thị chủ đề cần chú ý và nội dung ôn của từng bài. Phần kiến thức được mở sẵn; các mục thiếu căn cứ vẫn nằm trong nhóm “Chưa đủ dữ liệu”. Nếu điểm chung của bài đạt ngưỡng nhưng chủ đề riêng đủ căn cứ dưới ngưỡng, vẫn hiển thị bài với nhãn “Có chủ đề cần ôn”. Giữ điểm chính thức, không suy đoán bài từ câu chỉ gắn chương. Không hiển thị danh sách Quiz làm căn cứ hoặc ghi chú dữ liệu cũ trong khối này. Kiểm tra: 64 kiểm thử backend đạt và frontend build thành công; chưa kiểm chứng trực tiếp bằng trình duyệt.

Trang kết quả quiz hiển thị **Bạn nên ôn phần nào?** theo cây **Chương → Bài học → Nút ôn**, dựa trên câu trả lời của chính lượt đang xem. Chương/bài cần củng cố được ưu tiên; phần dưới 5 câu có câu sai vẫn hiện để ôn nhưng ghi **Chưa đủ dữ liệu**. Mỗi mục có số câu đúng/tổng, tỷ lệ đúng và liên kết ôn nội dung còn tồn tại. Nút **Xem câu sai** dẫn tới từng câu sai tương ứng trong trang kết quả. Bài cần củng cố vẫn hiển thị khi tổng chương đạt ngưỡng. Các phần còn lại, bảng kết quả chi tiết và gợi ý hiện tại từ tất cả quiz trong khóa được thu gọn. Không suy luận về nội dung chưa có câu hỏi; gợi ý tổng hợp có thể khác kết quả của lượt cũ đang xem.

Câu hỏi có `knowledge_chapter_id` và `knowledge_lesson_id`. Giảng viên chọn ngay trong form soạn câu hỏi hoặc thẻ duyệt Word/AI; API kiểm tra chương/bài thuộc đúng khóa và đúng phạm vi bộ ôn tập. Sinh AI theo chương/đề cuối khóa giữ mã chương của từng câu và đề nghị mã bài từ danh sách cho phép; giảng viên cần kiểm tra trước khi duyệt. Câu tổng hợp có thể chỉ gắn chương, không bắt buộc gán một bài không chính xác.

- **Theo bài:** thống kê số câu đúng của bài, dẫn về bài và bộ luyện tương ứng.
- **Theo chương:** cộng số đúng/tổng số câu thuộc chương, thống kê từng bài đã phân loại; ưu tiên bài cụ thể có đủ căn cứ.
- **Cuối khóa/đề tổng hợp:** dùng chương/bài của từng câu, không gán toàn bộ đề cho một chương.

Khi nộp bài, `result_answers` lưu mã và tên chương/bài tại lúc nộp (`knowledge_version=2`). Trang kết quả hiển thị bảng kiến thức của riêng lượt đó, giữ nguyên khi giáo viên sửa phân loại sau này. Gợi ý bên dưới và Dashboard/Tiến độ dùng căn cứ hiện tại: lấy **lượt nộp mới nhất cho từng bài qua mọi loại đề**; kết quả luyện bài mới thay thế căn cứ cũ của bài đó, các bài khác giữ căn cứ gần nhất. Câu chỉ gắn chương có nhóm riêng theo chương và cũng lấy lượt mới nhất. Tổng chương có thể kết hợp các bài được kiểm tra ở các thời điểm khác nhau; không phải điểm chính thức của một đề. Một câu dùng lại trong nhiều Quiz được tính một lần theo nội dung và bộ phương án, kể cả khi đảo thứ tự đáp án; ưu tiên kết quả mới nhất.

Cần 5 câu khác nhau; dưới 70% thì cần củng cố. Dưới 5 câu chỉ đề nghị kiểm tra thêm khi có câu sai. Nếu chương đủ căn cứ nhưng các bài còn ít câu, ưu tiên gợi ý chương. Nếu đã có bài yếu đủ căn cứ, bảng vẫn giữ tổng chương nhưng thẻ hành động ưu tiên bài, tránh gợi ý trùng. Có tối đa 3 hành động chương/bài ưu tiên; các phần còn lại xem trong bảng kiến thức. Gợi ý chủ đề cũ được dùng cho phần chưa được bao phủ bởi căn cứ chương/bài.

Nút làm bài luyện chỉ hiện khi bộ luyện hiện có có câu hỏi, học viên còn ghi danh và còn lượt hoặc có thể tiếp tục lượt đang làm. Chưa có bộ luyện bài thì có thể dẫn sang bộ luyện của chương, ghi rõ **Luyện cả chương**; không tự tạo đề hoặc gọi AI khi học viên bấm gợi ý. Phần giải thích nhắc luyện câu tương đương để giảm ảnh hưởng nhớ đáp án; hiện chưa tự thay bộ câu hỏi cho mỗi lượt.

Mở ôn bài/chương hoặc bài luyện ghi checkpoint riêng cho phần kiến thức. Sau bài mới, phần trước/sau so sánh đúng phần đó, báo khác bộ câu và mẫu nhỏ; không sửa điểm cuối khóa hoặc chứng nhận thành thạo. Học tiếp ưu tiên khóa chưa hoàn thành có lượt nộp quiz gần nhất.

Migration `0021_knowledge_scope` đã áp dụng local. Dữ liệu cũ chỉ được khôi phục từ phạm vi đề hoặc tên bài/chương khớp duy nhất (cho phép bỏ tiền tố số bài), ghi `knowledge_version=1` và thông báo giới hạn. Không suy đoán tên đồng nghĩa; các câu chưa rõ vẫn tính điểm và báo chưa phân loại. Trên môi trường khác chạy `alembic upgrade head` trước khi chạy code mới.

Kiểm chứng mới: **98 kiểm thử backend**, **3 kiểm thử Node**, **9 kiểm tra tích hợp trên bản sao MySQL**, **8 kiểm tra Chrome** và build frontend thành công. Xem [báo cáo triển khai](knowledge-recommendations-20261022.md).

## Hai mục đích đánh giá

- **Điểm chính thức:** giữ cấu hình cao nhất/lần đầu/lần cuối/trung bình của từng đề. Bộ ôn tập không tính vào điểm trung bình chính thức.
- **Gợi ý nội dung:** dùng lượt nộp gần nhất của mỗi quiz, bao gồm bài kiểm tra và bộ ôn tập. Một chủ đề được tính riêng theo từng khóa. Không gọi điểm cao nhất trong quá khứ là kiến thức hiện tại.

Tỷ lệ đúng theo chủ đề = số câu đúng / số câu khác nhau có kết quả × 100. Khi đề lấy trung bình nhiều lượt, phần gợi ý vẫn chỉ dùng lượt gần nhất. Câu trả lời ở các bài khác nhau có thể có thời điểm khác nhau; đây chưa phải phép đo năng lực tức thời hoặc đã kiểm chứng học thuật.

## Dữ liệu và ngưỡng

- Dùng `results`, `result_answers`, `questions.topic`, thông tin khóa/bài của quiz và `lesson_progress`.
- Cần ít nhất **5 nội dung câu hỏi khác nhau** trong mỗi chủ đề để phân loại. Làm lại hoặc sao chép cùng câu sang Quiz khác không tăng số câu làm căn cứ. Nhận diện trùng khớp dựa trên nội dung và bốn phương án, giữ phân biệt chữ hoa/thường và khoảng trắng bên trong mã; không tự đoán hai cách diễn đạt khác nhau là cùng câu.
- Dưới 5 câu: `Insufficient` — Chưa đủ dữ liệu; hiện số câu đúng/tổng số câu, khuyến khích luyện thêm.
- Từ 5 câu: dưới 50% Yếu; từ 50% đến dưới 70% Trung bình; từ 70% đến dưới 85% Khá; từ 85% Tốt. Dưới 70% ưu tiên ôn tập.
- Các ngưỡng là quy tắc cấu hình ban đầu (`MIN_TOPIC_QUESTIONS`, `TOPIC_REVIEW_THRESHOLD`), không phải chuẩn năng lực được nghiên cứu xác nhận.
- Tên chủ đề chuẩn hóa Unicode NFC, khoảng trắng và chữ hoa/thường; không tự suy đoán hai tên khác nghĩa là cùng chủ đề. Không gộp chủ đề cùng tên của hai môn.
- Câu không có chủ đề vẫn tính điểm tổng, được báo số lượng thiếu phân loại, không đưa vào nhóm kiến thức.
- Thời gian xem video không được cộng vào điểm kiến thức. Tiến độ chỉ dùng chọn bài chưa hoàn thành tiếp theo.

## Nội dung gợi ý

Ví dụ: “Bạn trả lời đúng 2/6 câu về Đồng bộ hóa (33,3%) trong khóa HĐH. Ôn bài Các giải pháp đồng bộ hóa.”

Ưu tiên tối đa 3 chủ đề cần củng cố, sau đó gợi ý làm lại đề, tối đa 2 chủ đề cần thêm dữ liệu, thông báo thiếu phân loại và bài học tiếp theo. Giao diện dashboard có nút xem tất cả để các mục phía sau không bị ẩn vĩnh viễn. Toàn bộ điểm theo chủ đề xem ở trang Tiến độ.

Thẻ gợi ý dùng nhãn `ContentBased` (Theo chủ đề) hoặc `Insufficient` (Chưa đủ dữ liệu); không xếp hạng chung con người bằng trung bình mọi môn. Nhãn Yếu/Trung bình/Khá/Tốt chỉ dành cho kết quả nội dung có đủ số câu. Điểm chính thức vẫn hiển thị riêng ở phần phân tích tổng quan.

## Danh mục chủ đề và liên kết ôn tập

Mỗi khóa có danh mục `course_topics`, tên chuẩn hóa duy nhất và mã chủ đề. Các câu nhập tay, Word và AI chọn cùng danh mục. API kiểm tra chủ đề thuộc đúng khóa; client cũ gửi tên vẫn được đối chiếu theo Unicode/khoảng trắng/chữ hoa-thường. Không tự gộp các tên khác nghĩa.

Giảng viên chọn hoặc thêm chủ đề ngay trong form soạn câu hỏi, nhập Word và duyệt câu AI. Trang quản lý **Chủ đề kiến thức** riêng đã được gỡ; đường dẫn cũ `/teacher/topics` chuyển về `/teacher/quizzes`. Phân loại câu hỏi, kết quả đã lưu và gợi ý theo chủ đề vẫn được giữ.

Các liên kết bài học/bộ ôn tập đã xác nhận trước đây tiếp tục được sử dụng. Giao diện hiện không có bước tạo hoặc xác nhận liên kết riêng; chủ đề mới dùng thông tin bài học của câu hỏi hoặc liên kết về danh sách bài trong khóa khi chưa xác định được bài cụ thể. API quản lý liên kết vẫn kiểm tra bài học cùng khóa và bộ ôn có câu hỏi cùng chủ đề.

Gợi ý ưu tiên liên kết được xác nhận. Nếu chưa có liên kết xác nhận, chỉ dùng nguồn bài học rõ ràng hoặc tên bài trùng chính xác, không đoán theo từ khóa; khi không rõ thì dẫn đến danh sách bài trong khóa. Nút **Làm bài luyện** chỉ hiện với liên kết bộ ôn tập được xác nhận, có câu cùng chủ đề, còn quyền truy cập và còn lượt hoặc có lượt đang làm có thể tiếp tục.

## Căn cứ và lịch sử phân loại

Nút **Vì sao có gợi ý này?** hiện số câu đúng/tổng, ngưỡng, tình trạng xác nhận, đề làm căn cứ, thời điểm nộp và link kết quả. Gợi ý làm lại đề có cách tính điểm và số lượt đã dùng/còn lại.

Từ phiên bản này, `result_answers` lưu mã và tên chủ đề tại lúc nộp (`classification_version=2`). Sửa chủ đề của câu hỏi về sau không đổi phân loại của kết quả cũ. Dữ liệu trước migration chỉ có thể khôi phục theo thông tin câu hỏi ở thời điểm migration (`classification_version=1`), được nêu rõ trong phần căn cứ; không khẳng định đã biết phân loại chính xác tại thời điểm nộp trong quá khứ.

## So sánh trước/sau khi mở gợi ý ôn

Khi học viên bấm **Ôn bài học / Xem bài học / Làm bài luyện** ở một gợi ý có mã chủ đề, hệ thống lưu checkpoint: căn cứ hiện tại và mốc kết quả gần nhất. Bấm lại khi chưa có kết quả mới không tạo thêm mốc giống nhau.

Phần **Kết quả trước/sau khi mở gợi ý ôn** hiển thị tối đa 10 mốc gần nhất. Chỉ lấy kết quả nộp mới sau checkpoint của chính học viên, cùng chủ đề và khóa còn ghi danh. Chưa có bài mới thì báo đang chờ. Có bài mới thì hiện số câu đúng/tổng và chênh lệch **điểm phần trăm**. Báo rõ hai mốc có cùng bộ câu hay không và có đủ 5 câu ở cả hai mốc không.

Đây là thay đổi quan sát được sau khi mở gợi ý, không phải bằng chứng học viên đã học xong hoặc việc ôn gây ra cải thiện. Cùng câu có thể nhớ đáp án; khác câu có thể khác độ khó. Không dùng chênh lệch này để tự động chứng nhận thành thạo.

## Gợi ý làm lại đề

Dùng chính `_graded` và `_attempts_used` của luồng quiz để khớp điểm được tính, điểm đạt lưu lúc nộp và số lượt đã dùng (kể cả bỏ dở).

- Gợi ý khi chưa đạt yêu cầu đề **hoặc** điểm được tính dưới 70%. Thông báo phân biệt “chưa đạt yêu cầu đề” và “cần luyện thêm”.
- Đề lấy điểm lần đầu không được gợi ý làm lại nhằm tăng điểm chính thức; vẫn có gợi ý ôn chủ đề.
- Hết lượt thì không đề nghị mở lượt mới. Nếu lượt cuối đang làm và chưa hết giờ, nút là “Tiếp tục bài”.
- Chỉ tạo hành động theo khóa còn ghi danh; API theo khóa kiểm tra quyền truy cập.

## API và lưu lịch sử

- `GET /api/recommendations?course_id=` tính từ dữ liệu mới nhất, trả gợi ý và lịch sử.
- `POST /api/recommendations/refresh` tính lại và lưu lịch sử; snapshot không đổi thiếu điểm thành 0.
- `GET /api/analytics/topics` dùng cùng nguồn dữ liệu nội dung với thẻ gợi ý.
- `GET/POST/PUT /api/topics`: quản lý danh mục, kiểm tra quyền chủ khóa/admin.
- `POST /api/recommendations/study`: lưu mốc khi mở gợi ý ôn.
- `GET /api/recommendations/progress`: so sánh các mốc của chính học viên.
- `based_on` lưu phương thức, ngưỡng, số câu chưa phân loại và căn cứ đầy đủ từng chủ đề.

Migration `0019_content_recommendations` thêm trạng thái mới, cho phép điểm snapshot NULL. `0020_topic_catalog` tạo danh mục, lưu phân loại tại lúc nộp và checkpoint ôn tập. Đã áp dụng database local; môi trường khác cần chạy `alembic upgrade head` trước khi dùng code mới.

## Kiểm tra

27 kiểm thử riêng dùng SQLite trong bộ nhớ, cùng 49 kiểm thử Word/sinh quiz/đảo đề: **76 passed**. Kiểm tra dữ liệu thiếu, điểm cao nhưng chủ đề yếu, ngưỡng, điểm đạt/cách tính điểm, lượt bỏ dở/hết hạn/đang làm, cùng tên ở hai khóa, quyền giáo viên, liên kết sai khóa, bộ luyện không có chủ đề, sửa câu hỏi sau khi nộp và so sánh trước/sau. Các test không ghi database demo.

Build frontend thành công. TestClient với MySQL local xác nhận API danh mục, gợi ý, checkpoint/progress, nhập tay/Word/AI, liên kết giảng viên xác nhận và lưu snapshot lúc nộp. Các lượt ghi để kiểm tra được rollback; không thêm điểm hoặc checkpoint giả vào dữ liệu học viên.

[Bộ tình huống và hướng dẫn demo](recommendation-validation.md).

Giao diện gợi ý hiện tại cũng gom thành một danh sách chương, bên dưới là các bài nên ôn có căn cứ từ quiz. Không hiển thị thêm thẻ chương/bài rời trùng nhau. Các liên kết luyện tập hiện có và mốc khi bấm ôn trong gợi ý hiện tại được giữ lại; nếu mới xác định được chương, không tự suy đoán bài yếu.


## Cập nhật độ tin cậy gợi ý — 31/10/2026

Thẻ tóm tắt trên Tiến độ [tách hai nhóm](study-summary-groups.md): bài Nên ôn tập hiện 5 mục đầu với bộ đếm/xem thêm riêng; bài Chưa đủ dữ liệu thu gọn mặc định. Khi mở nhóm ít dữ liệu, hiển thị số câu đã trả lời so với mức tối thiểu và số câu sai, không hiển thị phần trăm như một kết luận năng lực.

[Dashboard mới](dashboard-redesign.md) cũng dùng chung thẻ tóm tắt này, thay `RecommendationCard compact` cũ để nhãn, bộ lọc và nhóm ít dữ liệu đồng bộ giữa hai trang.

Bộ lọc **Khóa học** có ở thẻ gợi ý trên trang Tiến độ và trang xem tất cả gợi ý. Mặc định là Tất cả khóa học; có thể kết hợp với mức gợi ý và tìm kiếm. Danh sách khóa dùng căn cứ Quiz và dữ liệu khóa đã tham gia, giữ cả khóa chưa có gợi ý. Lựa chọn lưu trong `course_id` trên URL và được giữ khi chuyển giữa hai trang. Số liệu, nhóm chương/bài và trạng thái rỗng cập nhật theo bộ lọc; đổi khóa đưa thẻ tóm tắt về 5 mục đầu. [Kiểm chứng bộ lọc](study-course-filter.md).

Ngưỡng giữ nguyên: ít nhất 5 nội dung khác nhau, dưới 70% cần củng cố. Từ 70% đạt ngưỡng. Dưới 5 câu có câu sai hiển thị **Cần kiểm tra thêm**; đủ căn cứ và dưới ngưỡng hiển thị **Nên ôn tập**. Tóm tắt đếm riêng hai nhóm; nhóm chưa đủ căn cứ có nút luyện/chọn Quiz để bổ sung dữ liệu.

Migration `0024_question_evidence` thêm `result_answers.question_fingerprint`. Lượt nộp mới lưu định danh nội dung tại thời điểm chấm, giúp việc sửa/đảo phương án sau này không đổi nhận diện câu đã lưu. Dữ liệu cũ dùng nội dung hiện có của câu hỏi để nhận diện và có thông báo giới hạn trong phần giải thích. Nếu bản sao cùng câu trong một lượt có kết quả mâu thuẫn, phần gợi ý tính câu đó sai một lần. Điểm chính thức, số câu của lượt đã nộp và câu trả lời gốc được giữ nguyên.

Ba khóa Git/OOP/FastAPI bổ sung 180 câu vận dụng, đưa 36 bộ ôn bài từ 5 lên 10 câu. Mỗi khóa có 120 nội dung câu hỏi khác nhau; đề cuối khóa vẫn 60 câu, bộ ôn chương vẫn 10 câu. Xem [thay đổi trước/sau và kiểm chứng](study-recommendations-update-20261031.md).
