import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async findAll(): Promise<Article[]> {
    return this.articlesService.findAll();
  }

  @Get('by-time-range')
  async findByTimeRange(@Body('days') days: number = 7): Promise<Article[]> {
    return this.articlesService.findByTimeRange(days);
  }

  @UseGuards(AdminAuthGuard)
  @Post('crawl-toutiao')
  async crawlToutiao(@Body('timeRange') timeRange: string = '7days'): Promise<{ message: string; count: number }> {
    let days = 7;
    
    switch (timeRange) {
      case '3days':
        days = 3;
        break;
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
    }
    
    const count = await this.articlesService.crawlToutiaoHotArticles(days);
    return {
      message: `成功爬取并保存了 ${count} 篇文章`,
      count
    };
  }

  @UseGuards(AdminAuthGuard)
  @Delete('clear-all')
  async clearAll(): Promise<{ message: string }> {
    await this.articlesService.clearAll();
    return { message: '所有文章已清空' };
  }
}