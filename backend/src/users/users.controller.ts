import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('ai-token')
  async updateAiToken(@Body() body: { aiToken: string }, @Request() req): Promise<{ user: User }> {
    const user = await this.usersService.updateAiToken(req.user.id, body.aiToken);
    if (!user) {
      throw new Error('User not found');
    }
    return { user };
  }
}
