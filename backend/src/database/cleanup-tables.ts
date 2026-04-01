import { DataSource } from 'typeorm';

async function cleanupTables() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '1540689086Zyt@',
    database: 'lifegoal',
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('数据库连接成功');

  const queryRunner = dataSource.createQueryRunner();
  
  try {
    // 删除不需要的表
    const tablesToDrop = [
      'character',
      'character_event',
      'download',
      'user'
    ];

    for (const tableName of tablesToDrop) {
      try {
        await queryRunner.query(`DROP TABLE IF EXISTS \`${tableName}\``);
        console.log(`表 ${tableName} 已删除`);
      } catch (error) {
        console.error(`删除表 ${tableName} 失败:`, error.message);
      }
    }

    console.log('数据库清理完成');
  } catch (error) {
    console.error('清理数据库失败:', error);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

cleanupTables();
