import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Article } from './entities/article.entity';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
  ) {}

  async findAll(): Promise<Article[]> {
    return this.articlesRepository.find({ order: { readCount: 'DESC' } });
  }

  async findByTimeRange(days: number): Promise<Article[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.articlesRepository.find({
      where: {
        publishTime: MoreThanOrEqual(startDate)
      },
      order: { readCount: 'DESC' }
    });
  }

  async create(article: Partial<Article>): Promise<Article> {
    const newArticle = this.articlesRepository.create(article);
    return this.articlesRepository.save(newArticle);
  }

  async batchCreate(articles: Partial<Article>[]): Promise<Article[]> {
    return this.articlesRepository.save(articles);
  }

  async clearAll(): Promise<void> {
    await this.articlesRepository.clear();
  }

  // 爬取今日头条热门文章
  async crawlToutiaoHotArticles(days: number = 7): Promise<number> {
    try {
      this.logger.log(`开始爬取今日头条热门文章（${days}天内）`);
      
      // 清空现有文章
      await this.clearAll();
      
      const articles: Partial<Article>[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // 构建请求URL（今日头条热门文章）
      const url = 'https://www.toutiao.com';
      
      // 发送请求
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3'
        },
        timeout: 10000
      });
      
      // 解析HTML
      const $ = cheerio.load(response.data);
      
      // 提取文章信息
      // 注意：今日头条的DOM结构可能会变化，需要根据实际情况调整选择器
      $('.feed-card').each((index, element) => {
        try {
          const titleElement = $(element).find('a.title');
          const title = titleElement.text().trim();
          const url = titleElement.attr('href');
          
          if (title && url) {
            // 构建完整URL
            const fullUrl = url.startsWith('http') ? url : `https://www.toutiao.com${url}`;
            
            // 提取阅读量
            const readCountText = $(element).find('.read-count').text().trim();
            let readCount = 0;
            
            if (readCountText) {
              // 解析阅读量
              const match = readCountText.match(/(\d+(?:\.\d+)?)\s*(万|亿)?/);
              if (match) {
                let count = parseFloat(match[1]);
                const unit = match[2];
                
                if (unit === '万') {
                  count *= 10000;
                } else if (unit === '亿') {
                  count *= 100000000;
                }
                
                readCount = Math.floor(count);
              }
            }
            
            // 提取作者
            const author = $(element).find('.name').text().trim();
            
            // 提取发布时间
            const timeText = $(element).find('.time').text().trim();
            let publishTime: Date | null = null;
            
            if (timeText) {
              publishTime = this.parsePublishTime(timeText);
            }
            
            // 只添加指定时间范围内的文章
            if (!publishTime || publishTime >= startDate) {
              articles.push({
                title,
                url: fullUrl,
                readCount,
                publishTime: publishTime || new Date(),
                author: author || '未知',
                source: '今日头条'
              });
            }
          }
        } catch (error) {
          this.logger.error(`解析文章失败: ${error.message}`);
        }
      });
      
      // 按阅读量排序
      articles.sort((a, b) => (b.readCount || 0) - (a.readCount || 0));
      
      // 保存到数据库
      if (articles.length > 0) {
        await this.batchCreate(articles);
        this.logger.log(`成功爬取并保存了 ${articles.length} 篇文章`);
      } else {
        this.logger.warn('未爬取到文章');
      }
      
      return articles.length;
    } catch (error) {
      this.logger.error(`爬取失败: ${error.message}`);
      throw error;
    }
  }

  // 解析发布时间
  private parsePublishTime(timeText: string): Date {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    
    if (timeText.includes('分钟前')) {
      const minutes = parseInt(timeText);
      const result = new Date();
      result.setMinutes(result.getMinutes() - minutes);
      return result;
    } else if (timeText.includes('小时前')) {
      const hours = parseInt(timeText);
      const result = new Date();
      result.setHours(result.getHours() - hours);
      return result;
    } else if (timeText.includes('天前')) {
      const days = parseInt(timeText);
      const result = new Date();
      result.setDate(result.getDate() - days);
      return result;
    } else if (timeText.includes('-')) {
      // 格式：2024-01-01
      return new Date(timeText);
    } else if (timeText.includes('/')) {
      // 格式：01/01
      const [month, day] = timeText.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    
    return now;
  }
}