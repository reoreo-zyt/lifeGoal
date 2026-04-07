import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { CharactersService } from './characters.service';
import { Character } from './entities/character.entity';
import { CharacterEvent } from './entities/character-event.entity';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  // 获取所有人物
  @Get()
  async findAll(): Promise<Character[]> {
    return await this.charactersService.findAll();
  }

  // 获取单个人物
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Character | null> {
    return await this.charactersService.findOne(+id);
  }

  // 创建人物 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Post()
  async create(@Body() body: { name: string; gender: string; birthYear: number; deathYear?: number; birthPlace: string; background: string; personality: string; dynasty: string; userId: number }): Promise<Character> {
    return await this.charactersService.create(body);
  }

  // 更新人物 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() body: { name?: string; gender?: string; birthYear?: number; deathYear?: number; birthPlace?: string; background?: string; personality?: string; dynasty?: string }): Promise<Character | null> {
    return await this.charactersService.update(+id, body);
  }

  // 删除人物 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<{ success: boolean }> {
    return { success: await this.charactersService.remove(+id) };
  }

  // 获取人物的时间线
  @Get(':id/timeline')
  async getTimeline(@Param('id') id: number): Promise<Array<{ id: number; year: string; age: string; reignYear: string; event: string; source: string; order: number }>> {
    return await this.charactersService.getTimeline(+id);
  }

  // 添加时间线事件 - 仅允许admin用户访问
  @UseGuards(AdminAuthGuard)
  @Post(':id/timeline')
  async addTimelineEvent(
    @Param('id') id: number,
    @Body() body: {
      year: string;
      age: string;
      reignYear: string;
      event: string;
      source: string;
      order: number;
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
      year?: string;
      age?: string;
      reignYear?: string;
      event?: string;
      source?: string;
      order?: number;
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
      year: string;
      age: string;
      reignYear: string;
      event: string;
      source: string;
    }> }
  ): Promise<{ success: boolean; count: number }> {
    const count = await this.charactersService.batchAddTimelineEvents(+id, body.events);
    return { success: true, count };
  }

  // AI 生成人物信息 - 仅允许admin用户访问（流式）
  @UseGuards(AdminAuthGuard)
  @Post('ai-generate')
  async generatePersonWithAi(
    @Body() body: { name: string; model: string },
    @Request() req,
    @Res() res: Response
  ) {
    const user = req.user;
    
    // 设置响应头为流式
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // 回调函数，用于实时发送 AI 思考的内容
    const callback = (chunk: string) => {
      res.write(`data: ${JSON.stringify({ content: chunk })}

`);
    };
    
    try {
      const result = await this.charactersService.generatePersonWithAi(body.name, user.aiToken, body.model, callback);
      // 发送完成信号
      res.write(`data: ${JSON.stringify({ complete: true, data: result })}

`);
      res.end();
    } catch (error) {
      console.error('AI 生成失败:', error);
      res.write(`data: ${JSON.stringify({ error: 'AI 生成失败' })}

`);
      res.end();
    }
  }

  // AI 生成事件 - 仅允许admin用户访问（流式）
  @UseGuards(AdminAuthGuard)
  @Post('ai/generate-events')
  async generateEventsWithAi(
    @Body() body: { name: string; model: string },
    @Request() req,
    @Res() res: Response
  ) {
    const user = req.user;
    
    // 设置响应头为流式
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // 回调函数，用于实时发送 AI 思考的内容
    const callback = (chunk: string) => {
      res.write(`data: ${JSON.stringify({ content: chunk })}`);
    };
    
    try {
      const result = await this.charactersService.generateEventsWithAi(body.name, body.model, user.aiToken, callback);
      // 发送完成信号
      res.write(`data: ${JSON.stringify({ complete: true, data: result })}`);
      res.end();
    } catch (error) {
      console.error('AI 生成失败:', error);
      res.write(`data: ${JSON.stringify({ error: 'AI 生成失败' })}`);
      res.end();
    }
  }

  // AI 生成人物和事件 - 仅允许admin用户访问（流式）
  @UseGuards(AdminAuthGuard)
  @Post('ai-generate-with-events')
  async generateCharacterWithEvents(
    @Body() body: { name: string; model: string },
    @Request() req,
    @Res() res: Response
  ) {
    const user = req.user;
    
    // 设置响应头为流式
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // 回调函数，用于实时发送 AI 思考的内容
    const callback = (chunk: string) => {
      res.write(`data: ${JSON.stringify({ content: chunk })}`);
    };
    
    try {
      const result = await this.charactersService.generateCharacterWithEvents(body.name, body.model, user.aiToken, user.id, callback);
      // 发送完成信号
      res.write(`data: ${JSON.stringify({ complete: true, data: result })}`);
      res.end();
    } catch (error) {
      console.error('AI 生成失败:', error);
      res.write(`data: ${JSON.stringify({ error: 'AI 生成失败' })}`);
      res.end();
    }
  }
}
