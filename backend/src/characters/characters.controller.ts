import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CharactersService, Person, TimelineEvent } from './characters.service';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {
    // 初始化数据
    this.charactersService.initializeData();
  }

  // 获取所有人物
  @Get()
  async findAll(): Promise<Person[]> {
    return await this.charactersService.findAll();
  }

  // 根据ID获取人物
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Person | null> {
    return await this.charactersService.findOne(+id);
  }

  // 创建人物
  @Post()
  async create(@Body() body: { name: string; dynasty: string }): Promise<Person> {
    return await this.charactersService.create(body);
  }

  // 更新人物
  @Put(':id')
  async update(@Param('id') id: number, @Body() body: { name?: string; dynasty?: string }): Promise<Person | null> {
    return await this.charactersService.update(+id, body);
  }

  // 删除人物
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<{ success: boolean }> {
    return { success: await this.charactersService.remove(+id) };
  }

  // 获取人物的时间线
  @Get(':id/timeline')
  async getTimeline(@Param('id') id: number): Promise<TimelineEvent[]> {
    return await this.charactersService.getTimeline(+id);
  }

  // 添加时间线事件
  @Post(':id/timeline')
  async addTimelineEvent(
    @Param('id') id: number,
    @Body() body: {
      year: string;
      age: string;
      reignYear: string;
      event: string;
      source: string;
      order?: number;
    }
  ): Promise<TimelineEvent> {
    return await this.charactersService.addTimelineEvent(+id, body);
  }

  // 更新时间线事件
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
  ): Promise<TimelineEvent | null> {
    return await this.charactersService.updateTimelineEvent(+eventId, body);
  }

  // 删除时间线事件
  @Delete('timeline/:eventId')
  async removeTimelineEvent(@Param('eventId') eventId: number): Promise<{ success: boolean }> {
    return { success: await this.charactersService.removeTimelineEvent(+eventId) };
  }

  // 重新排序时间线事件
  @Post(':id/timeline/reorder')
  async reorderTimelineEvents(
    @Param('id') id: number,
    @Body() body: { eventOrders: { id: number; order: number }[] }
  ): Promise<{ success: boolean }> {
    await this.charactersService.reorderTimelineEvents(+id, body.eventOrders);
    return { success: true };
  }
}