import { Users } from 'src/entities/Users';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlacesModule } from './places/places.module';

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
      synchronize: false, // 코드 -> 디비로 싱크
      logging: true, // 개발시
      keepConnectionAlive: true, // 서버 재시작시 커넥션 안끊김
    }),
    ReviewsModule,
    UsersModule,
    PlacesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
