import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArticlesService } from './articles.service';

@Injectable()
export class ArticleCrawlTask {
  private readonly logger = new Logger(ArticleCrawlTask.name);

  constructor(private readonly articlesService: ArticlesService) {}

  // 每天凌晨 1 点爬取今日头条热门文章
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCrawlTask() {
    this.logger.log('开始执行定时爬取任务');
    try {
      const count = await this.articlesService.crawlToutiaoHotArticles(7);
      this.logger.log(`定时爬取任务完成，成功爬取 ${count} 篇文章`);
    } catch (error) {
      this.logger.error(`定时爬取任务失败: ${error.message}`);
    }
  }
}
