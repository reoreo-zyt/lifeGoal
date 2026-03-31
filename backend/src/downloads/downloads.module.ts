import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '60s' },
    }),
    UsersModule,
  ],
  providers: [DownloadsService],
  controllers: [DownloadsController],
  exports: [DownloadsService],
})
export class DownloadsModule {};
