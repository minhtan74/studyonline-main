<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="container my-5">
    <div class="row justify-content-center">
        <div class="col-md-5">
            <div class="card border-0 shadow-lg" style="border-radius: 16px; overflow: hidden;">
                <div class="card-header bg-primary text-white text-center py-4 border-0">
                    <h3 class="mb-0 fw-bold">Đăng ký</h3>
                    <p class="mb-0 text-white-50 mt-1">Tạo tài khoản học tập miễn phí</p>
                </div>
                <div class="card-body p-4">
                    <?php if (!empty($error)): ?>
                        <div class="alert alert-danger alert-dismissible fade show" role="alert" style="border-radius: 8px;">
                            <?= htmlspecialchars($error) ?>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    <?php endif; ?>

                    <form action="index.php?page=do-register" method="POST">
                        <div class="mb-3">
                            <label for="fullname" class="form-label fw-semibold">Họ và tên</label>
                            <input type="text" class="form-control form-control-lg" id="fullname" name="fullname" 
                                   placeholder="Nguyễn Văn A" required style="border-radius: 8px; font-size: 0.95rem;">
                        </div>

                        <div class="mb-3">
                            <label for="email" class="form-label fw-semibold">Email của bạn</label>
                            <input type="email" class="form-control form-control-lg" id="email" name="email" 
                                   placeholder="name@example.com" required style="border-radius: 8px; font-size: 0.95rem;">
                        </div>
                        
                        <div class="mb-3">
                            <label for="password" class="form-label fw-semibold">Mật khẩu</label>
                            <input type="password" class="form-control form-control-lg" id="password" name="password" 
                                   placeholder="••••••••" required style="border-radius: 8px; font-size: 0.95rem;">
                        </div>

                        <div class="mb-4">
                            <label for="confirm_password" class="form-label fw-semibold">Xác nhận mật khẩu</label>
                            <input type="password" class="form-control form-control-lg" id="confirm_password" name="confirm_password" 
                                   placeholder="••••••••" required style="border-radius: 8px; font-size: 0.95rem;">
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary btn-lg fw-bold" style="border-radius: 8px; font-size: 1rem; padding: 12px;">
                                Đăng ký tài khoản
                            </button>
                        </div>
                    </form>
                </div>
                <div class="card-footer bg-light text-center py-3 border-0">
                    <span class="text-muted small">Đã có tài khoản? <a href="index.php?page=login" class="text-primary fw-semibold text-decoration-none">Đăng nhập ngay</a></span>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>