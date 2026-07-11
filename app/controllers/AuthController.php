<?php
require_once "../core/Database.php";

class AuthController
{
    public function login()
    {
        $error = $_SESSION['error'] ?? null;
        $success = $_SESSION['success'] ?? null;
        unset($_SESSION['error'], $_SESSION['success']);
        require_once dirname(__DIR__) . "/views/auth/login.php";
    }

    public function register()
    {
        $error = $_SESSION['error'] ?? null;
        unset($_SESSION['error']);
        require_once dirname(__DIR__) . "/views/auth/register.php";
    }

    public function doRegister()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $fullname = trim($_POST['fullname'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $password = trim($_POST['password'] ?? '');
            $confirm_password = trim($_POST['confirm_password'] ?? '');

            if (empty($fullname) || empty($email) || empty($password) || empty($confirm_password)) {
                $_SESSION['error'] = "Vui lòng nhập đầy đủ các trường.";
                header("Location: index.php?page=register");
                exit();
            }

            if ($password !== $confirm_password) {
                $_SESSION['error'] = "Mật khẩu xác nhận không khớp.";
                header("Location: index.php?page=register");
                exit();
            }

            $db = new Database();
            $conn = $db->connect();

            // Check if email already exists
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
            $stmt->execute(['email' => $email]);
            if ($stmt->fetch()) {
                $_SESSION['error'] = "Email này đã được đăng ký sử dụng.";
                header("Location: index.php?page=register");
                exit();
            }

            // Insert new user
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO users (fullname, email, password, role) VALUES (:fullname, :email, :password, 'student')");
            $stmt->execute([
                'fullname' => $fullname,
                'email' => $email,
                'password' => $hashedPassword
            ]);

            $_SESSION['success'] = "Đăng ký thành công! Bạn có thể đăng nhập ngay.";
            header("Location: index.php?page=login");
            exit();
        }
    }

    public function doLogin()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = trim($_POST['email'] ?? '');
            $password = trim($_POST['password'] ?? '');

            if (empty($email) || empty($password)) {
                $_SESSION['error'] = "Vui lòng nhập đầy đủ email và mật khẩu.";
                header("Location: index.php?page=login");
                exit();
            }

            $db = new Database();
            $conn = $db->connect();

            $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // Support plain text comparison (for default seed data) and password_verify
                if ($password === $user['password'] || password_verify($password, $user['password'])) {
                    $_SESSION['user'] = [
                        'id' => $user['id'],
                        'fullname' => $user['fullname'],
                        'email' => $user['email'],
                        'role' => $user['role']
                    ];
                    header("Location: index.php?page=dashboard");
                    exit();
                }
            }

            $_SESSION['error'] = "Email hoặc mật khẩu không chính xác.";
            header("Location: index.php?page=login");
            exit();
        }
    }

    public function logout()
    {
        unset($_SESSION['user']);
        session_destroy();
        header("Location: index.php");
        exit();
    }
}