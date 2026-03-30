import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { DownloadsModule } from './downloads/downloads.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    DownloadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {};
