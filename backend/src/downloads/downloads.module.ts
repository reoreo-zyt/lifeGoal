import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Download } from './entities/download.entity';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Download])],
  providers: [DownloadsService],
  controllers: [DownloadsController],
  exports: [DownloadsService],
})
export class DownloadsModule {};
