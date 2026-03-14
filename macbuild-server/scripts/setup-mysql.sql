-- Run this on your Linux server as root or any MySQL admin user:
-- mysql -u root -p < scripts/setup-mysql.sql

CREATE DATABASE IF NOT EXISTS macbuild CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'macbuild'@'localhost' IDENTIFIED BY 'MacBuild2024!';
GRANT ALL PRIVILEGES ON macbuild.* TO 'macbuild'@'localhost';
FLUSH PRIVILEGES;

SELECT 'MySQL setup done ✓' as status;
