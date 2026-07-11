<!DOCTYPE html>
<html lang="vi">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StudyOnline</title>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">

    <link rel="stylesheet" href="/studyonline/public/css/style.css">

</head>

<body>

    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">

        <div class="container">

            <a class="navbar-brand" href="/studyonline/public/">
                StudyOnline
            </a>
            <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu">

                <span class="navbar-toggler-icon"></span>

            </button>
            <div class="collapse navbar-collapse" id="menu">

                <ul class="navbar-nav me-auto">

                    <li class="nav-item">
                        <a class="nav-link" href="/studyonline/public/">Trang chủ</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="#">Khóa học</a>
                    </li>

                    <li class="nav-item">
                        <a class="nav-link" href="#">Giảng viên</a>
                    </li>

                </ul>

                <ul class="navbar-nav">

                    <?php if (isset($_SESSION['user'])): ?>
                        <!-- Nếu ĐÃ đăng nhập (có $_SESSION['user']): Hiển thị Dropdown chào mừng và nút Đăng xuất -->
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                                aria-expanded="false">
                                Xin chào, <?= htmlspecialchars($_SESSION['user']['fullname']) ?>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="index.php?page=dashboard">Bảng điều khiển</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="index.php?page=logout">Đăng xuất</a></li>
                            </ul>
                        </li>
                    <?php else: ?>
                        <li class="nav-item">
                            <a class="nav-link" href="index.php?page=login">Đăng nhập</a>
                        </li>
                    <?php endif; ?>

                </ul>

            </div>

        </div>

    </nav>