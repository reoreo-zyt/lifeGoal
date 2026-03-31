import { Controller, Get, Post, Body, Request, Ip } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DownloadsService } from './downloads.service';
import { UsersService } from '../users/users.service';

@Controller('downloads')
export class DownloadsController {
  constructor(
    private readonly downloadsService: DownloadsService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  // 检查下载限制
  @Get('check-limit')
  async checkDownloadLimit(@Request() req, @Ip() ipAddress) {
    let userId = null;
    
    console.log('=== Check Download Limit ===');
    console.log('Request headers:', req.headers);
    
    // 手动验证token
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('Token:', token);
      
      try {
        console.log('Verifying token...');
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'secret',
        });
        console.log('Token payload:', payload);
        
        console.log('Finding user by ID:', payload.sub);
        const user = await this.usersService.findOneById(payload.sub);
        console.log('Found user:', user);
        
        if (user) {
          userId = user.id;
          console.log('Set userId:', userId);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }
    
    console.log('Final userId:', userId);
    
    // 登录用户无限制
    if (userId) {
      console.log('Login user, return canDownload: true');
      return {
        canDownload: true,
        downloadCount: 0,
        limit: 3,
      };
    }
    
    // 未登录用户，按IP地址统计
    console.log('Guest user, checking download limit');
    const canDownload = await this.downloadsService.checkDownloadLimit(userId, ipAddress);
    const downloadCount = await this.downloadsService.getTodayDownloadCount(userId, ipAddress);
    
    console.log('Guest user result:', { canDownload, downloadCount });
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
    let userId = null;
    
    // 手动验证token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'secret',
        });
        const user = await this.usersService.findOneById(payload.sub);
        if (user) {
          userId = user.id;
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }
    
    // 登录用户无限制
    if (userId) {
      // 记录下载
      await this.downloadsService.recordDownload(userId, bookId, bookTitle, format, ipAddress);
      return {
        success: true,
        message: '下载记录成功',
      };
    }
    
    // 未登录用户，检查下载限制
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
