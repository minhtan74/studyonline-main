import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../assets/css/public-help.css';

const GUIDES = [
  {id:'start',title:'Làm thế nào để bắt đầu một khóa học?',text:'Tạo tài khoản hoặc đăng nhập, mở danh mục Khóa học và xem nội dung khóa bạn quan tâm. Sau khi đăng ký thành công, khóa sẽ xuất hiện trong “Khóa học của tôi”. Các yêu cầu đăng ký hoặc thanh toán được hiển thị theo từng khóa.',to:'/courses',label:'Xem khóa học'},
  {id:'materials',title:'Tôi xem bài học và tài liệu ở đâu?',text:'Trong “Khóa học của tôi”, vào khóa đã đăng ký và chọn chương, bài muốn học. Tài liệu đính kèm được hiển thị tại bài học hoặc phần tài liệu khóa. Nếu nội dung bị khóa, kiểm tra tài khoản đang dùng và trạng thái đăng ký của bạn.'},
  {id:'quiz',title:'Tôi cần lưu ý gì khi làm Quiz?',text:'Đọc thông tin về số câu, thời gian và số lượt trước khi bắt đầu. Trả lời và xác nhận nộp bài để xem kết quả. Một số đề chỉ hiển thị đáp án đúng sau lượt làm cuối; quy định phụ thuộc từng quiz.'},
  {id:'recommendations',title:'“Nên ôn tập” và “Chưa đủ dữ liệu” khác nhau thế nào?',text:'“Nên ôn tập” là phần đã có ít nhất 5 câu khác nhau và tỷ lệ đúng dưới 70%. “Chưa đủ dữ liệu” nghĩa là số câu còn ít để phân loại. Bạn vẫn có thể xem lại câu sai và luyện thêm. Kết quả một lượt quiz được phân biệt với gợi ý tổng hợp trong khóa.'},
  {id:'ai',title:'Sử dụng AI Tutor như thế nào?',text:'Chọn đúng khóa hoặc bài học, rồi đặt câu hỏi cụ thể về nội dung đang học. Khi có nguồn tài liệu, bạn có thể mở để đối chiếu câu trả lời. AI có thể thiếu thông tin hoặc trả lời chưa chính xác; hãy kiểm tra lại với tài liệu và giảng viên.'},
  {id:'support',title:'Tôi cần chuẩn bị gì khi yêu cầu hỗ trợ?',text:'Liên hệ quản trị viên quản lý hệ thống qua kênh của lớp hoặc đơn vị bạn đang học. Cung cấp email đăng ký, tên khóa hoặc bài học, thao tác gặp lỗi và thời điểm xảy ra. Có thể gửi ảnh lỗi đã che thông tin riêng tư. Không gửi mật khẩu, mã OTP hoặc thông tin thẻ.',to:'/forgot-password',label:'Hướng dẫn cấp lại mật khẩu'},
];

export default function Help() {
  const { hash } = useLocation();
  useEffect(() => {
    const target = document.getElementById(hash.slice(1));
    if (target) { target.open = true; target.scrollIntoView({block:'start'}); }
    else window.scrollTo(0,0);
  }, [hash]);
  return <main className="public-help">
    <nav aria-label="Đường dẫn trang"><Link to="/">Trang chủ</Link><span aria-hidden="true">/</span><span>Hướng dẫn sử dụng</span></nav>
    <header><p className="public-help-eyebrow">Đồng hành cùng bạn</p><h1>Học thuận tiện hơn với StudyOnline</h1><p>Tìm câu trả lời nhanh cho những thao tác thường gặp trong quá trình học.</p></header>
    <div className="public-help-layout"><aside><h2>Nội dung hướng dẫn</h2><nav aria-label="Mục lục hướng dẫn">{GUIDES.map((guide,index) => <Link to={`#${guide.id}`} key={guide.id}><span>{String(index+1).padStart(2,'0')}</span>{guide.title}</Link>)}</nav></aside>
      <section aria-label="Các câu hỏi thường gặp">{GUIDES.map((guide,index) => <details id={guide.id} className="public-help-question" key={guide.id} open={index===0 ? true : undefined}>
        <summary>{guide.title}<span aria-hidden="true">+</span></summary><div><p>{guide.text}</p>{guide.to && <Link to={guide.to}>{guide.label} →</Link>}</div>
      </details>)}<p className="public-help-note">Nếu hướng dẫn chưa giải quyết được vấn đề, hãy liên hệ quản trị viên để được kiểm tra đúng tài khoản và khóa học.</p></section>
    </div>
  </main>;
}
