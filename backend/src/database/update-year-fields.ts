import { createConnection, ConnectionOptions } from 'typeorm';
import { Character } from '../characters/entities/character.entity';
import { CharacterEvent } from '../characters/entities/character-event.entity';

async function updateYearFields() {
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

    // 查询所有人物
    const characters = await characterRepository.find();
    console.log(`找到 ${characters.length} 个人物`);

    // 更新年份字段
    let updatedCount = 0;
    for (const character of characters) {
      let needsUpdate = false;

      // 检查 birthYear
      if (character.birthYear === '0' || character.birthYear === '3000') {
        character.birthYear = '?';
        needsUpdate = true;
      }

      // 检查 deathYear
      if (character.deathYear === '0' || character.deathYear === '3000') {
        character.deathYear = '?';
        needsUpdate = true;
      }

      // 保存更新
      if (needsUpdate) {
        await characterRepository.save(character);
        updatedCount++;
      }
    }

    console.log(`更新了 ${updatedCount} 个人物的年份字段`);

    // 关闭连接
    await connection.close();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('更新年份字段时出错:', error);
  }
}

// 运行脚本
updateYearFields();