import { createConnection, ConnectionOptions } from 'typeorm';
import { Character } from '../characters/entities/character.entity';
import { CharacterEvent } from '../characters/entities/character-event.entity';

async function updateYearValues() {
  try {
    // 数据库连接配置
    const connectionOptions: ConnectionOptions = {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1540689086Zyt@',
      database: 'lifegoal',
      entities: [Character, CharacterEvent],
      synchronize: true,
    };

    // 创建数据库连接
    const connection = await createConnection(connectionOptions);
    console.log('数据库连接成功');

    // 获取 Character 仓库
    const characterRepository = connection.getRepository(Character);

    // 直接执行 SQL 语句更新数据
    await connection.query("UPDATE `character` SET birthYear = '?' WHERE birthYear = 0 OR birthYear = 3000 OR birthYear = '0' OR birthYear = '3000'");
    await connection.query("UPDATE `character` SET deathYear = '?' WHERE deathYear = 0 OR deathYear = 3000 OR deathYear = '0' OR deathYear = '3000'");

    console.log('更新年份值成功');

    // 验证更新结果
    const birthYearCount = await connection.query("SELECT COUNT(*) AS count FROM `character` WHERE birthYear = '?'");
    const deathYearCount = await connection.query("SELECT COUNT(*) AS count FROM `character` WHERE deathYear = '?'");

    console.log(`更新后的 birthYear 为 '?' 的记录数: ${birthYearCount[0].count}`);
    console.log(`更新后的 deathYear 为 '?' 的记录数: ${deathYearCount[0].count}`);

    // 关闭连接
    await connection.close();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('更新年份值时出错:', error);
  }
}

// 运行脚本
updateYearValues();