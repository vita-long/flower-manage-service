-- 设置数据库字符集
ALTER DATABASE flower_manage CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 授予用户权限
GRANT ALL PRIVILEGES ON flower_manage.* TO 'admin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- 可以在这里添加初始数据插入语句
-- INSERT INTO ...