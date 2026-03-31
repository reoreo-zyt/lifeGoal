import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// 内存存储用户数据
let users: Array<{
  id: number;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = [];
let nextId = 1;

@Injectable()
export class UsersService {
  constructor() {
    // 初始化 admin 用户
    this.initializeAdminUser();
  }

  // 初始化 admin 用户
  private async initializeAdminUser() {
    const adminEmail = '768119359@qq.com';
    const existingAdmin = await this.findOneByEmail(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('1540689086Zyt@', 10);
      const now = new Date();
      const adminUser = {
        id: nextId++,
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        isAdmin: true,
        createdAt: now,
        updatedAt: now,
      };
      users.push(adminUser);
      console.log('Admin user initialized:', adminEmail);
    }
  }

  async create(email: string, password: string, name: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();
    const user = {
      id: nextId++,
      email,
      password: hashedPassword,
      name,
      isAdmin: false,
      createdAt: now,
      updatedAt: now,
    };
    users.push(user);
    return user;
  }

  async findOneByEmail(email: string): Promise<any | undefined> {
    return users.find(user => user.email === email);
  }

  async findOneById(id: number): Promise<any | undefined> {
    return users.find(user => user.id === id);
  }
}
