import { Controller, Get, Post, Body, Request, Ip } from '@nestjs/common';
import { DownloadsService } from './downloads.service';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  // 检查下载限制
  @Get('check-limit')
  async checkDownloadLimit(@Request() req, @Ip() ipAddress) {
    const userId = req.user?.id || null;
    const canDownload = await this.downloadsService.checkDownloadLimit(userId, ipAddress);
    const downloadCount = await this.downloadsService.getTodayDownloadCount(userId, ipAddress);
    
    return {
      canDownload,
      downloadCount,
      limit: 3,
    };
  }

  // 记录下载
  @Post('record')
  async recordDownload(@Body() body, @Request() req, @Ip() ipAddress) {
    const { bookId, bookTitle, format } = body;
    const userId = req.user?.id || null;
    
    // 先检查下载限制
    const canDownload = await this.downloadsService.checkDownloadLimit(userId, ipAddress);
    if (!canDownload) {
      return {
        success: false,
        message: '您今天的下载次数已达上限，请登录后继续下载',
      };
    }
    
    // 记录下载
    await this.downloadsService.recordDownload(userId, bookId, bookTitle, format, ipAddress);
    
    return {
      success: true,
      message: '下载记录成功',
    };
  }
}
