import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from './entities/article.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ArticleCrawlTask } from './article-crawl.task';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    forwardRef(() => AuthModule),
    UsersModule
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticleCrawlTask],
  exports: [ArticlesService]
})
export class ArticlesModule {}
