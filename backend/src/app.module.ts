import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DownloadsModule } from './downloads/downloads.module';
import { CharactersModule } from './characters/characters.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    DownloadsModule,
    CharactersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {};
