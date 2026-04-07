import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ConfigService } from './config.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('admin/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getConfig(@Request() req) {
    const userId = req.user.id;
    const configs = await this.configService.getConfigs(userId);
    return {
      volcengineToken: configs.volcengineToken || '',
      defaultModel: configs.defaultModel || 'gpt-4o',
    };
  }

  @UseGuards(AuthGuard)
  @Post()
  async setConfig(@Request() req, @Body() body: {
    volcengineToken: string;
    defaultModel: string;
  }) {
    const userId = req.user.id;
    await this.configService.setConfigs(userId, {
      volcengineToken: body.volcengineToken,
      defaultModel: body.defaultModel,
    });
    
    return {
      message: '配置保存成功',
    };
  }
}