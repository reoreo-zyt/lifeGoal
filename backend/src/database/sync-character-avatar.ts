import mysql from 'mysql2/promise';

async function syncCharacterAvatarField() {
  let connection;
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '1540689086Zyt@',
      database: 'lifegoal',
    });

    console.log('数据库连接成功');

    // 检查 character 表是否存在
    const [tableResult] = await connection.execute(
      "SHOW TABLES LIKE 'character'"
    );

    if (Array.isArray(tableResult) && tableResult.length > 0) {
      console.log('character 表存在');

      // 检查 avatar 字段是否存在
      const [columnResult] = await connection.execute(
        "SHOW COLUMNS FROM `character` WHERE Field = 'avatar'"
      );

      if (Array.isArray(columnResult) && columnResult.length > 0) {
        console.log('avatar 字段已存在');
      } else {
        console.log('avatar 字段不存在，正在添加...');
        
        // 手动添加 avatar 字段
        await connection.execute('ALTER TABLE `character` ADD COLUMN avatar VARCHAR(255) NOT NULL DEFAULT \'ancient_character_men.webp\'');
        console.log('avatar 字段添加成功');
      }
    } else {
      console.log('character 表不存在');
    }

    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('同步数据库表结构失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

syncCharacterAvatarField();
