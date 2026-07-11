<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="container my-5">
    <!-- Welcome banner -->
    <div class="p-5 mb-4 bg-primary text-white rounded-4 shadow-sm position-relative overflow-hidden" style="border-radius: 16px;">
        <div class="position-relative z-1">
            <span class="badge bg-white text-primary mb-3 text-uppercase fw-bold px-3 py-2" style="font-size: 0.75rem; border-radius: 20px;">
                <?= htmlspecialchars(ucfirst($_SESSION['user']['role'])) ?>
            </span>
            <h1 class="display-5 fw-bold">Xin chào, <?= htmlspecialchars($_SESSION['user']['fullname']) ?>!</h1>
            <p class="col-md-8 fs-5 text-white-50">Chào mừng bạn trở lại với StudyOnline. Hãy tiếp tục hành trình nâng cao tri thức và kỹ năng của bạn ngày hôm nay.</p>
            <a href="#" class="btn btn-light btn-lg fw-semibold text-primary px-4 mt-2" style="border-radius: 8px;">Học tiếp bài học</a>
        </div>
        <div class="position-absolute end-0 bottom-0 opacity-10 d-none d-lg-block" style="font-size: 10rem; transform: translate(10%, 20%); pointer-events: none;">
            <i class="bi bi-mortarboard-fill"></i>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row g-4 mb-5">
        <div class="col-md-4">
            <div class="card border-0 shadow-sm p-4 h-100" style="border-radius: 16px;">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-semibold">Khóa học đăng ký</span>
                        <h2 class="fw-bold mb-0 mt-1">4</h2>
                    </div>
                    <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-book-half" viewBox="0 0 16 16">
                          <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                        </svg>
                    </div>
                </div>
                <div class="text-success small mt-3 fw-semibold">
                    <span>Đang học 3 khóa học</span>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card border-0 shadow-sm p-4 h-100" style="border-radius: 16px;">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-semibold">Bài tập hoàn thành</span>
                        <h2 class="fw-bold mb-0 mt-1">12 / 15</h2>
                    </div>
                    <div class="bg-warning bg-opacity-10 text-warning rounded-3 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16">
                          <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z"/>
                          <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="text-muted small mt-3">
                    <span>Đạt tỉ lệ hoàn thành 80%</span>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card border-0 shadow-sm p-4 h-100" style="border-radius: 16px;">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <span class="text-muted small text-uppercase fw-semibold">Thời gian tích lũy</span>
                        <h2 class="fw-bold mb-0 mt-1">45 giờ</h2>
                    </div>
                    <div class="bg-success bg-opacity-10 text-success rounded-3 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16">
                          <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.014a6.977 6.977 0 0 0-.692-.497l.5-.866c.36.208.702.444 1.025.704l-.833.859a7.01 7.01 0 0 0-.663-.444zM11.979 2.13a7.02 7.02 0 0 0-.735-.389l.314-.948a8.03 8.03 0 0 1 1.026.547l-.605.79zm-7.958.389a7.02 7.02 0 0 0-.735.389l-.605-.79a8.03 8.03 0 0 1 1.026-.547l.314.948zm-1.37.71a7.01 7.01 0 0 0-.439.27l-.615-.789a8.025 8.025 0 0 1 .979-.654l.493.87zm-1.834 1.014a6.977 6.977 0 0 0-.692.497l-.833-.859a8.03 8.03 0 0 1 1.025-.704l.5.866zM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                        </svg>
                    </div>
                </div>
                <div class="text-success small mt-3 fw-semibold">
                    <span>+5 giờ trong tuần này</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Active courses list -->
    <div class="card border-0 shadow-sm mb-5" style="border-radius: 16px;">
        <div class="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center" style="border-radius: 16px 16px 0 0;">
            <h4 class="mb-0 fw-bold">Khóa học của tôi</h4>
            <a href="#" class="btn btn-outline-primary btn-sm fw-semibold" style="border-radius: 8px;">Xem tất cả</a>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-4">Tên khóa học</th>
                            <th>Giảng viên</th>
                            <th>Tiến độ học tập</th>
                            <th class="text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="ps-4 py-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-primary text-white rounded-3 p-2 me-3 small">HTML</div>
                                    <div>
                                        <h6 class="mb-0 fw-bold">Lập trình Web cơ bản với HTML5/CSS3</h6>
                                        <span class="text-muted small">Cập nhật 2 ngày trước</span>
                                    </div>
                                </div>
                            </td>
                            <td>Thầy Nguyễn Văn A</td>
                            <td style="width: 30%;">
                                <div class="d-flex align-items-center">
                                    <div class="progress flex-grow-1 me-3" style="height: 6px; border-radius: 3px;">
                                        <div class="progress-bar bg-success" role="progressbar" style="width: 75%; border-radius: 3px;" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    <span class="small fw-semibold text-muted">75%</span>
                                </div>
                            </td>
                            <td class="text-center">
                                <a href="#" class="btn btn-primary btn-sm fw-semibold px-3" style="border-radius: 6px;">Học tiếp</a>
                            </td>
                        </tr>
                        <tr>
                            <td class="ps-4 py-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-success text-white rounded-3 p-2 me-3 small">PHP</div>
                                    <div>
                                        <h6 class="mb-0 fw-bold">Lập trình hướng đối tượng PHP (OOP)</h6>
                                        <span class="text-muted small">Cập nhật 1 tuần trước</span>
                                    </div>
                                </div>
                            </td>
                            <td>Cô Trần Thị B</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="progress flex-grow-1 me-3" style="height: 6px; border-radius: 3px;">
                                        <div class="progress-bar bg-success" role="progressbar" style="width: 40%; border-radius: 3px;" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    <span class="small fw-semibold text-muted">40%</span>
                                </div>
                            </td>
                            <td class="text-center">
                                <a href="#" class="btn btn-primary btn-sm fw-semibold px-3" style="border-radius: 6px;">Học tiếp</a>
                            </td>
                        </tr>
                        <tr>
                            <td class="ps-4 py-3">
                                <div class="d-flex align-items-center">
                                    <div class="bg-warning text-dark rounded-3 p-2 me-3 small">JS</div>
                                    <div>
                                        <h6 class="mb-0 fw-bold">Lập trình Javascript nâng cao</h6>
                                        <span class="text-muted small">Cập nhật 2 tuần trước</span>
                                    </div>
                                </div>
                            </td>
                            <td>Thầy Nguyễn Văn A</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="progress flex-grow-1 me-3" style="height: 6px; border-radius: 3px;">
                                        <div class="progress-bar bg-success" role="progressbar" style="width: 100%; border-radius: 3px;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    <span class="small fw-semibold text-muted">100%</span>
                                </div>
                            </td>
                            <td class="text-center">
                                <a href="#" class="btn btn-outline-success btn-sm fw-semibold px-3" style="border-radius: 6px;">Hoàn thành</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>
