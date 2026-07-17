<?php
return [
    'secret' => $_ENV['JWT_SECRET'] ?? 'studyonline_super_secret_key_2026',
    'expire' => (int)($_ENV['JWT_EXPIRE'] ?? 604800), // 7 ngày tính bằng giây
];
