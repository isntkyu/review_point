import { Reviewpointincreaselogs } from './../entities/Reviewpointincreaselogs';
import { Reviewattachedphotos } from './../entities/Reviewattachedphotos';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private dataSource: DataSource,
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
    if (!eventRequestData.attachedPhotoIds.length) {
      // 배열 is empty 사용
      point += 1;
    }
    await this.reviewsRepository.insert(eventRequestData);
    const photos = eventRequestData.attachedPhotoIds.map((id) => {
      return {
        reviewId: eventRequestData.reviewId,
        attachedPhotoId: id,
      };
    });
    await this.reviewAttachedPhotosRepository.insert(photos);
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
    let point = 0;

    const reviewPhotos = await this.reviewAttachedPhotosRepository.find({
      where: { reviewId: eventRequestData.reviewId },
    });
    if (!reviewPhotos.length && eventRequestData.attachedPhotoIds.length) {
      point += 1;
    }
    if (reviewPhotos.length && !eventRequestData.attachedPhotoIds.length) {
      point -= 1;
    }

    const newPhotos = eventRequestData.attachedPhotoIds.map((id) => {
      return {
        reviewId: eventRequestData.reviewId,
        attachedPhotoId: id,
      };
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const review = await this.reviewsRepository.findOne({
      where: { reviewId: eventRequestData.reviewId },
    });
    try {
      review.content = eventRequestData.content;
      await this.reviewsRepository.save(review);

      // 사진
      const photos = await this.reviewAttachedPhotosRepository.find({
        where: {
          reviewId: eventRequestData.reviewId,
        },
      });
      await this.reviewAttachedPhotosRepository.softRemove(photos);
      await this.reviewAttachedPhotosRepository.insert(newPhotos);

      await this.usersService.updateUserPoint(eventRequestData.userId, point);
      const logs = {
        userId: eventRequestData.userId,
        reviewId: eventRequestData.reviewId,
        pointIncrease: point,
      };
      await this.reviewPointIncreaseLogsRepository.insert(logs);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return `This action returns a #review`;
  }

  async deleteReview(eventRequestData) {
    let point = -1;
    const hasPhotos =
      (await this.reviewAttachedPhotosRepository.find({
        where: { reviewId: eventRequestData.reviewId },
      })) !== null
        ? true
        : false;
    const isFirstReview =
      (await this.reviewsRepository.count({
        where: { placeId: eventRequestData.placeId },
      })) === 1
        ? true
        : false;

    if (hasPhotos) point -= 1;
    if (isFirstReview) point -= 1;

    await this.usersService.updateUserPoint(eventRequestData.userId, point);

    await this.reviewsRepository.softDelete(eventRequestData.reviewId);
    const returned = await this.reviewAttachedPhotosRepository.find({
      where: {
        reviewId: eventRequestData.reviewId,
      },
    });
    await this.reviewAttachedPhotosRepository.softRemove(returned);
    const logs = {
      userId: eventRequestData.userId,
      reviewId: eventRequestData.reviewId,
      pointIncrease: point,
    };
    await this.reviewPointIncreaseLogsRepository.insert(logs);

    return `This action updates a # review`;
  }
}
