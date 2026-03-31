import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    // 初始化 admin 用户
    this.initializeAdminUser();
  }

  // 初始化 admin 用户
  private async initializeAdminUser() {
    const adminEmail = '768119359@qq.com';
    const existingAdmin = await this.findOneByEmail(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('1540689086Zyt@', 10);
      const adminUser = this.usersRepository.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        isAdmin: true,
        aiToken: '',
      });
      await this.usersRepository.save(adminUser);
      console.log('Admin user initialized:', adminEmail);
    }
  }

  async create(email: string, password: string, name: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      isAdmin: false,
      aiToken: '',
    });
    return await this.usersRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findOneById(id: number): Promise<User | undefined> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async updateAiToken(id: number, aiToken: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return undefined;
    }
    
    user.aiToken = aiToken;
    return await this.usersRepository.save(user);
  }
}
