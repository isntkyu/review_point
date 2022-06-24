import { Users } from 'src/entities/Users';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'dkxhvl!12',
      database: 'triple_homework',
      entities: [__dirname + '/entities/*.{js,ts}'],
      // entities: [Users],
      // autoLoadEntities: true,
      synchronize: true, // 코드 -> 디비로 싱크
      logging: true, // 개발시
      keepConnectionAlive: true, // 서버 재시작시 커넥션 안끊김
    }),
    ReviewsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
