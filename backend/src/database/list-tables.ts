import { DataSource } from 'typeorm';

async function listTables() {
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
    // 获取所有表
    const tables = await queryRunner.query(`SHOW TABLES`);
    console.log('数据库中的表:');
    tables.forEach((table: any) => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
  } catch (error) {
    console.error('获取表列表失败:', error);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

listTables();
