-- 更新 birthYear 字段，将 0 和 3000 改为 '?'
UPDATE character SET birthYear = '?' WHERE birthYear = '0' OR birthYear = '3000';

-- 更新 deathYear 字段，将 0 和 3000 改为 '?'
UPDATE character SET deathYear = '?' WHERE deathYear = '0' OR deathYear = '3000';

-- 验证更新结果
SELECT COUNT(*) AS updated_birthYear FROM character WHERE birthYear = '?';
SELECT COUNT(*) AS updated_deathYear FROM character WHERE deathYear = '?';
