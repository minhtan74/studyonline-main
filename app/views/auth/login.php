<?php require_once dirname(__DIR__) . '/layouts/header.php'; ?>

<div class="container my-5">
    <div class="row justify-content-center">
        <div class="col-md-5">
            <div class="card border-0 shadow-lg" style="border-radius: 16px; overflow: hidden;">
                <div class="card-header bg-primary text-white text-center py-4 border-0">
                    <h3 class="mb-0 fw-bold">Đăng nhập</h3>
                    <p class="mb-0 text-white-50 mt-1">Học tập và kết nối mọi lúc mọi nơi</p>
                </div>
                <div class="card-body p-4">
                    <?php if (!empty($error)): ?>
                        <div class="alert alert-danger alert-dismissible fade show" role="alert"
                            style="border-radius: 8px;">
                            <?= htmlspecialchars($error) ?>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($success)): ?>
                        <div class="alert alert-success alert-dismissible fade show" role="alert" style="border-radius: 8px;">
                            <?= htmlspecialchars($success) ?>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    <?php endif; ?>

                    <form action="index.php?page=do-login" method="POST">
                        <div class="mb-3">
                            <label for="email" class="form-label fw-semibold">Email của bạn</label>
                            <input type="email" class="form-control form-control-lg" id="email" name="email"
                                placeholder="name@gmail.com" required style="border-radius: 8px; font-size: 0.95rem;">
                        </div>

                        <div class="mb-4">
                            <label for="password" class="form-label fw-semibold">Mật khẩu</label>
                            <input type="password" class="form-control form-control-lg" id="password" name="password"
                                placeholder="••••••••" required style="border-radius: 8px; font-size: 0.95rem;">
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary btn-lg fw-bold"
                                style="border-radius: 8px; font-size: 1rem; padding: 12px;">
                                Đăng nhập
                            </button>
                        </div>
                    </form>
                </div>
                <div class="card-footer bg-light text-center py-3 border-0">
                    <span class="text-muted small">Chưa có tài khoản? <a href="index.php?page=register"
                            class="text-primary fw-semibold text-decoration-none">Đăng ký ngay</a></span>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once dirname(__DIR__) . '/layouts/footer.php'; ?>