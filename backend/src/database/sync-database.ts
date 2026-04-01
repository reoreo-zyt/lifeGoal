import { DataSource } from 'typeorm';

async function syncDatabase() {
  // 首先连接到 MySQL 服务器（不指定数据库）
  const adminDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '1540689086Zyt@',
    database: '',
    synchronize: false,
  });

  await adminDataSource.initialize();
  console.log('MySQL 服务器连接成功');

  // 检查数据库是否存在，如果不存在则创建
  await adminDataSource.query(`CREATE DATABASE IF NOT EXISTS lifegoal`);
  console.log('数据库 lifegoal 已创建或已存在');
  await adminDataSource.destroy();

  // 连接到 lifegoal 数据库
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
    // 创建 users 表
    console.log('创建 users 表...');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        isAdmin BOOLEAN DEFAULT FALSE,
        aiToken VARCHAR(255) NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('users 表创建成功');

    // 创建 characters 表
    console.log('创建 characters 表...');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS characters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        gender VARCHAR(255) NOT NULL,
        birthYear INT NOT NULL,
        deathYear INT NULL,
        birthPlace VARCHAR(255) NOT NULL,
        background VARCHAR(255) NOT NULL,
        personality VARCHAR(255) NOT NULL,
        dynasty VARCHAR(255) NOT NULL,
        userId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('characters 表创建成功');

    // 创建 character_events 表
    console.log('创建 character_events 表...');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS character_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        characterId INT NOT NULL,
        year VARCHAR(255) NOT NULL,
        age VARCHAR(255) NOT NULL DEFAULT '',
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        impact VARCHAR(255) NOT NULL,
        \`order\` INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('character_events 表创建成功');

    console.log('数据库同步完成');
  } catch (error) {
    console.error('数据库同步失败:', error);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

syncDatabase();
