import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';

// 内存存储下载记录
let downloads: Array<{
  id: number;
  userId: number;
  bookId: string;
  bookTitle: string;
  format: string;
  createdAt: Date;
}> = [];
let nextId = 1;

@Injectable()
export class DownloadsService {
  // 检查用户下载限制
  async checkDownloadLimit(userId: number | null, ipAddress: string): Promise<boolean> {
    // 登录用户无限制
    if (userId) {
      return true;
    }

    // 未登录用户，按IP地址统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const downloadCount = downloads.filter(download => 
      download.userId === 0 && 
      download.bookId === ipAddress && 
      download.createdAt >= today
    ).length;

    // 未登录用户每天最多下载3本
    return downloadCount < 3;
  }

  // 记录下载
  async recordDownload(userId: number | null, bookId: string, bookTitle: string, format: string, ipAddress: string): Promise<any> {
    const download = {
      id: nextId++,
      userId: userId || 0,
      bookId: userId ? bookId : ipAddress,
      bookTitle,
      format,
      createdAt: new Date(),
    };
    downloads.push(download);
    return download;
  }

  // 获取用户今日下载次数
  async getTodayDownloadCount(userId: number | null, ipAddress: string): Promise<number> {
    // 登录用户无限制，返回0
    if (userId) {
      return 0;
    }

    // 未登录用户，按IP地址统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return downloads.filter(download => 
      download.userId === 0 && 
      download.bookId === ipAddress && 
      download.createdAt >= today
    ).length;
  }
}
