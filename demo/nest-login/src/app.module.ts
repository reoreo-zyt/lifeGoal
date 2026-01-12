import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import envConfig from '../config/env';
import { PostsEntity } from './posts/entities/post.entity';
import { AuthEntity } from './auth/entities/auth.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './common/constants';
import JwtAuthStrategy from './auth/jwt-auth.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.grard';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局
      envFilePath: [envConfig.path],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', // 数据库类型
        entities: [PostsEntity, AuthEntity], // 数据表实体，synchronize为true时，自动创建表，生产环境建议关闭
        host: configService.get('DB_HOST'), // 主机，默认为localhost
        port: configService.get<number>('DB_PORT'), // 端口号
        username: configService.get('DB_USER'), // 用户名
        password: configService.get('DB_PASSWD'), // 密码
        database: configService.get('DB_DATABASE'), //数据库名
        timezone: '+08:00', //服务器上配置的时区
        synchronize: true, //根据实体自动创建数据库表， 生产环境建议关闭
      }),
    }),
    // JWT
    TypeOrmModule.forFeature([AuthEntity]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
    PostsModule,
    AuthModule,
  ],
  controllers: [AppController],
  // 注册为全局守卫
  providers: [
    AppService,
    JwtAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
