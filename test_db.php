<?php
echo "Testing database connections...\n";

$configs = [
    ['host' => '127.0.0.1', 'port' => 3306, 'user' => 'root', 'pass' => ''],
    ['host' => '127.0.0.1', 'port' => 3307, 'user' => 'root', 'pass' => '']
];

foreach ($configs as $cfg) {
    try {
        $dsn = "mysql:host={$cfg['host']};port={$cfg['port']}";
        $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
            PDO::ATTR_TIMEOUT => 2,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        echo "SUCCESS: Connected to MySQL on port {$cfg['port']}!\n";
        
        // Let's check what databases exist
        $stmt = $pdo->query("SHOW DATABASES");
        $dbs = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "Databases: " . implode(', ', $dbs) . "\n";
        
    } catch (Exception $e) {
        echo "FAILED: Port {$cfg['port']} - " . $e->getMessage() . "\n";
    }
}
