import { Reviewpointincreaselogs } from './../entities/Reviewpointincreaselogs';
import { Reviewattachedphotos } from './../entities/Reviewattachedphotos';
import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Reviews } from '../entities/Reviews';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reviews,
      Reviewattachedphotos,
      Reviewpointincreaselogs,
    ]),
    UsersModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsController],
  exports: [ReviewsController],
})
export class ReviewsModule {}
