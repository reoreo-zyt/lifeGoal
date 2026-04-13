import { createConnection, ConnectionOptions } from 'typeorm';
import { Character } from '../characters/entities/character.entity';
import { CharacterEvent } from '../characters/entities/character-event.entity';

async function checkDatabase() {
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

    // 查看 character 表的结构
    const tableStructure = await connection.query('DESCRIBE `character`');
    console.log('Character 表结构:');
    console.table(tableStructure);

    // 查看前 10 条数据
    const characters = await connection.query('SELECT id, name, birthYear, deathYear FROM `character` LIMIT 10');
    console.log('\n前 10 条数据:');
    console.table(characters);

    // 统计不同 birthYear 值的数量
    const birthYearStats = await connection.query('SELECT birthYear, COUNT(*) as count FROM `character` GROUP BY birthYear ORDER BY birthYear');
    console.log('\nbirthYear 统计:');
    console.table(birthYearStats);

    // 统计不同 deathYear 值的数量
    const deathYearStats = await connection.query('SELECT deathYear, COUNT(*) as count FROM `character` GROUP BY deathYear ORDER BY deathYear');
    console.log('\ndeathYear 统计:');
    console.table(deathYearStats);

    // 关闭连接
    await connection.close();
    console.log('\n数据库连接已关闭');
  } catch (error) {
    console.error('检查数据库时出错:', error);
  }
}

// 运行脚本
checkDatabase();