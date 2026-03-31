import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// 内存存储用户数据
let users: Array<{
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}> = [];
let nextId = 1;

@Injectable()
export class UsersService {
  async create(email: string, password: string, name: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();
    const user = {
      id: nextId++,
      email,
      password: hashedPassword,
      name,
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
