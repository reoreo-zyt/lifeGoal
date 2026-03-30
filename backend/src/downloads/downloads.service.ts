import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';
import { Download } from './entities/download.entity';

@Injectable()
export class DownloadsService {
  constructor(
    @InjectRepository(Download)
    private downloadsRepository: Repository<Download>,
  ) {}

  // 检查用户下载限制
  async checkDownloadLimit(userId: number | null, ipAddress: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let downloadCount: number;
    
    if (userId) {
      // 登录用户，按用户ID统计
      downloadCount = await this.downloadsRepository.count({
        where: {
          userId,
          createdAt: MoreThanOrEqual(today),
        },
      });
    } else {
      // 未登录用户，按IP地址统计
      // 注意：这里需要在控制器中传递IP地址
      // 实际生产环境中，可能需要使用Redis存储IP下载记录
      // 这里简化处理，使用数据库存储
      downloadCount = await this.downloadsRepository.count({
        where: {
          userId: 0, // 用0表示未登录用户
          bookId: ipAddress, // 临时使用bookId字段存储IP地址
          createdAt: MoreThanOrEqual(today),
        },
      });
    }

    // 未登录用户每天最多下载3本
    return downloadCount < 3;
  }

  // 记录下载
  async recordDownload(userId: number | null, bookId: string, bookTitle: string, format: string, ipAddress: string): Promise<Download> {
    const download = this.downloadsRepository.create({
      userId: userId || 0,
      bookId: userId ? bookId : ipAddress,
      bookTitle,
      format,
    });
    return this.downloadsRepository.save(download);
  }

  // 获取用户今日下载次数
  async getTodayDownloadCount(userId: number | null, ipAddress: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (userId) {
      return this.downloadsRepository.count({
        where: {
          userId,
          createdAt: MoreThanOrEqual(today),
        },
      });
    } else {
      return this.downloadsRepository.count({
        where: {
          userId: 0,
          bookId: ipAddress,
          createdAt: MoreThanOrEqual(today),
        },
      });
    }
  }
}
