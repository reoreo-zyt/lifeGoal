import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { UsersModule } from '../users/users.module';
import { Download } from './entities/download.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Download]),
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
