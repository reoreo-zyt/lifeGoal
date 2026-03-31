import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';

// 内存存储下载记录
let downloads: Array<{
  id: number;
  userId: number;
  bookId: string;
  ipAddress: string;
  bookTitle: string;
  format: string;
  createdAt: Date;
}> = [];
let nextId = 1;

@Injectable()
export class DownloadsService {
  // 检查用户下载限制
  async checkDownloadLimit(userId: number | null, ipAddress: string): Promise<boolean> {
    console.log('Check download limit - User ID:', userId, 'IP:', ipAddress);
    // 登录用户无限制
    if (userId) {
      console.log('登录用户，无下载限制', userId);
      return true;
    }

    // 未登录用户，按IP地址统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const downloadCount = downloads.filter(download => 
      download.userId === 0 && 
      download.ipAddress === ipAddress && 
      download.createdAt >= today
    ).length;

    // 未登录用户每天最多下载3本
    console.log('未登录用户，下载次数:', downloadCount);
    return downloadCount < 3;
  }

  // 记录下载
  async recordDownload(userId: number | null, bookId: string, bookTitle: string, format: string, ipAddress: string): Promise<any> {
    const download = {
      id: nextId++,
      userId: userId || 0,
      bookId: bookId,
      ipAddress: ipAddress,
      bookTitle,
      format,
      createdAt: new Date(),
    };
    downloads.push(download);
    return download;
  }

  // 获取用户今日下载次数
  async getTodayDownloadCount(userId: number | null, ipAddress: string): Promise<number> {
    console.log('Get today download count - User ID:', userId, 'IP:', ipAddress);
    // 登录用户无限制，返回0
    if (userId) {
      console.log('登录用户，返回0');
      return 0;
    }

    // 未登录用户，按IP地址统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = downloads.filter(download => 
      download.userId === 0 && 
      download.ipAddress === ipAddress && 
      download.createdAt >= today
    ).length;
    console.log('未登录用户，下载次数:', count);
    return count;
  }
}
