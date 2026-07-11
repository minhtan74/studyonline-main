import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 text-white py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
            Học bất cứ điều gì,
            <br />
            mọi lúc mọi nơi 🚀
          </h1>
          <p className="text-lg opacity-85 mb-8 max-w-xl mx-auto">
            StudyOnline cung cấp hàng trăm khóa học chất lượng cao từ các giảng viên hàng đầu, giúp bạn nâng cao kỹ
            năng và phát triển sự nghiệp.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Bắt đầu miễn phí
            </Link>
            <Link
              to="/courses"
              className="px-8 py-3.5 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Xem khóa học
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold text-blue-600">500+</div>
              <div className="text-slate-500 text-sm mt-1">Khóa học</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-blue-600">10k+</div>
              <div className="text-slate-500 text-sm mt-1">Học viên</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-blue-600">200+</div>
              <div className="text-slate-500 text-sm mt-1">Giảng viên</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-blue-600">98%</div>
              <div className="text-slate-500 text-sm mt-1">Hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12 text-slate-900">Tại sao chọn StudyOnline?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-bold mb-2">Học theo lộ trình</h3>
              <p className="text-slate-500 text-sm">
                Nội dung được sắp xếp khoa học từ cơ bản đến nâng cao, giúp bạn tiến bộ vững chắc.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-bold mb-2">Học mọi thiết bị</h3>
              <p className="text-slate-500 text-sm">
                Giao diện responsive hoàn toàn, học trên máy tính, tablet hay điện thoại đều mượt mà.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-bold mb-2">Quiz kiểm tra</h3>
              <p className="text-slate-500 text-sm">
                Hệ thống bài thi trắc nghiệm giúp bạn kiểm tra kiến thức và theo dõi tiến độ học tập.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-violet-600 text-white text-center py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-4">Sẵn sàng bắt đầu hành trình học tập?</h2>
          <p className="opacity-85 mb-8 text-lg">Đăng ký ngay hôm nay và trải nghiệm hơn 500 khóa học miễn phí.</p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
          >
            Đăng ký ngay — Miễn phí
          </Link>
        </div>
      </section>
    </>
  );
}
