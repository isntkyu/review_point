import { Reviewpointincreaselogs } from './../entities/Reviewpointincreaselogs';
import { Reviewattachedphotos } from './../entities/Reviewattachedphotos';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reviews } from '../entities/Reviews';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Reviews)
    private reviewsRepository: Repository<Reviews>,
    @InjectRepository(Reviewattachedphotos)
    private reviewAttachedPhotosRepository: Repository<Reviewattachedphotos>,
    @InjectRepository(Reviewpointincreaselogs)
    private reviewPointIncreaseLogsRepository: Repository<Reviewpointincreaselogs>,
    private usersService: UsersService,
  ) {}

  //createReviewDto: CreateReviewDto
  async addReview(eventRequestData) {
    // const insertReview =
    console.log(eventRequestData.attachedPhotoIds.length);
    let point = 1;

    const countPlaceReview = await this.reviewsRepository.count({
      where: { placeId: eventRequestData.placeId },
    });
    if (countPlaceReview === 0) {
      point += 1;
    }
    if (eventRequestData.attachedPhotoIds.length !== 0) {
      // 배열 is empty 사용
      point += 1;
    }
    await this.reviewsRepository.insert(eventRequestData);
    console.log('point: ', point);
    await this.usersService.updateUserPoint(eventRequestData.userId, point);

    const logs = {
      userId: eventRequestData.userId,
      reviewId: eventRequestData.reviewId,
      pointIncrease: point,
    };
    await this.reviewPointIncreaseLogsRepository.insert(logs);

    return `This action returns a #review`;
  }

  async modReview(eventRequestData) {
    return `This action returns a #review`;
  }

  //id: number, updateReviewDto: UpdateReviewDto
  async deleteReview(eventRequestData) {
    return `This action updates a # review`;
  }
}
