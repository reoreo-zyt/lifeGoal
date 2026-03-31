import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CharactersService } from './characters.service';
import { Character } from './entities/character.entity';
import { CharacterEvent } from './entities/character-event.entity';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  // AI 生成人物信息 - 需要登录用户
  @UseGuards(AuthGuard('jwt'))
  @Post('ai-generate')
  async generatePersonWithAi(@Body() body: { name: string, model: string }, @Request() req) {
    const user = req.user;
    return await this.charactersService.generatePersonWithAi(body.name, user.aiToken, body.model);
  }

  // 获取所有人物 - 允许未登录用户访问
  @Get()
  async findAll(): Promise<Character[]> {
    return await this.charactersService.findAll();
  }

  // 根据ID获取人物 - 允许未登录用户访问
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Character | null> {
    return await this.charactersService.findOne(+id);
  }

  // 创建人物 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Post()
  async create(@Body() body: { name: string; gender: string; birthYear: number; birthPlace: string; background: string; personality: string; userId: number }): Promise<Character> {
    return await this.charactersService.create(body);
  }

  // 更新人物 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() body: { name?: string; gender?: string; birthYear?: number; birthPlace?: string; background?: string; personality?: string }): Promise<Character | null> {
    return await this.charactersService.update(+id, body);
  }

  // 删除人物 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<{ success: boolean }> {
    return { success: await this.charactersService.remove(+id) };
  }

  // 获取人物的时间线 - 允许未登录用户访问
  @Get(':id/timeline')
  async getTimeline(@Param('id') id: number): Promise<CharacterEvent[]> {
    return await this.charactersService.getTimeline(+id);
  }

  // 添加时间线事件 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Post(':id/timeline')
  async addTimelineEvent(
    @Param('id') id: number,
    @Body() body: {
      year: number;
      title: string;
      description: string;
      impact: string;
    }
  ): Promise<CharacterEvent> {
    return await this.charactersService.addTimelineEvent(+id, body);
  }

  // 更新时间线事件 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Put('timeline/:eventId')
  async updateTimelineEvent(
    @Param('eventId') eventId: number,
    @Body() body: {
      year?: number;
      title?: string;
      description?: string;
      impact?: string;
    }
  ): Promise<CharacterEvent | null> {
    return await this.charactersService.updateTimelineEvent(+eventId, body);
  }

  // 删除时间线事件 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Delete('timeline/:eventId')
  async removeTimelineEvent(@Param('eventId') eventId: number): Promise<{ success: boolean }> {
    return { success: await this.charactersService.removeTimelineEvent(+eventId) };
  }

  // 批量添加时间线事件 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Post(':id/timeline/batch')
  async batchAddTimelineEvents(
    @Param('id') id: number,
    @Body() body: { events: Array<{
      year: number;
      title: string;
      description: string;
      impact: string;
    }> }
  ): Promise<{ success: boolean; count: number }> {
    const count = await this.charactersService.batchAddTimelineEvents(+id, body.events);
    return { success: true, count };
  }

  // AI 生成事件 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Post('ai/generate-events')
  async generateEventsWithAi(
    @Body() body: { name: string; model: string },
    @Request() req
  ): Promise<Array<{
    year: number;
    title: string;
    description: string;
    impact: string;
  }>> {
    const user = req.user;
    return await this.charactersService.generateEventsWithAi(body.name, body.model, user.aiToken);
  }
}