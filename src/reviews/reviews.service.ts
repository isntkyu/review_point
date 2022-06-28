import { Reviewpointincreaselogs } from './../entities/Reviewpointincreaselogs';
import { Reviewattachedphotos } from './../entities/Reviewattachedphotos';
import { UsersService } from './../users/users.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reviews } from '../entities/Reviews';
import { ReviewCrudDto } from './dto/event-review.dto';
import { Users } from '../entities/Users';

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

  async addReview(reviewCrudDto: ReviewCrudDto): Promise<Users> {
    try {
      const alreadyReviewed = await this.fetchReview(reviewCrudDto);
      if (alreadyReviewed) {
        throw new UnauthorizedException('이미 리뷰가 존재합니다.');
      }

      const { insertPhotos, point } = await this.getAddReviewPointAndPhotos(
        reviewCrudDto,
      );

      return await this.insertTransaction(reviewCrudDto, insertPhotos, point);
    } catch (error) {
      return error;
    }
  }

  async modReview(reviewCrudDto: ReviewCrudDto): Promise<Users> {
    try {
      const review = await this.fetchReviewOrNotThrowExp(reviewCrudDto);

      const { insertPhotos, point } = await this.getModReviewPointAndPhotos(
        reviewCrudDto,
      );

      return await this.updateTransaction(
        review,
        reviewCrudDto,
        insertPhotos,
        point,
      );
    } catch (error) {
      return error;
    }
  }

  async deleteReview(reviewCrudDto: ReviewCrudDto): Promise<Users> {
    try {
      await this.fetchReviewOrNotThrowExp(reviewCrudDto);

      let point = await this.getDeleteReviewPoint(reviewCrudDto);

      return await this.deleteTransaction(reviewCrudDto, point);
    } catch (error) {
      return error;
    }
  }

  private async insertTransaction(
    reviewCrudDto: ReviewCrudDto,
    insertPhotos: any[],
    point: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 리뷰 insert
      await this.reviewsRepository.insert(reviewCrudDto);
      // 사진 insert
      if (insertPhotos.length) {
        await this.reviewAttachedPhotosRepository.insert(insertPhotos);
      }
      await this.usersService.updateUserPoint(reviewCrudDto.userId, point);
      // await this.pointIncreaseLogging(reviewCrudDto, point);
      const log = {
        userId: reviewCrudDto.userId,
        reviewId: reviewCrudDto.reviewId,
        pointIncrease: point,
        getFirstReviewPoint: false,
      };
      if (
        (point === 2 && reviewCrudDto.attachedPhotoIds.length === 0) ||
        point === 3
      ) {
        log.getFirstReviewPoint = true;
      }
      await this.reviewPointIncreaseLogsRepository.insert(log);
      await queryRunner.commitTransaction();
    } catch (error) {
      queryRunner.rollbackTransaction();
    } finally {
      const user = await this.usersService.findOne(reviewCrudDto.userId);
      await queryRunner.release();
      return user;
    }
  }

  private async updateTransaction(
    review: Reviews,
    reviewCrudDto: ReviewCrudDto,
    insertPhotos: any[],
    point: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      review.content = reviewCrudDto.content;
      await this.reviewsRepository.save(review);

      const photos = await this.reviewAttachedPhotosRepository.find({
        where: {
          reviewId: reviewCrudDto.reviewId,
        },
      });
      await this.reviewAttachedPhotosRepository.remove(photos);

      if (insertPhotos.length > 0) {
        await this.reviewAttachedPhotosRepository.insert(insertPhotos);
      }

      if (point !== 0) {
        await this.usersService.updateUserPoint(reviewCrudDto.userId, point);
      }
      await this.pointIncreaseLogging(reviewCrudDto, point);
      await queryRunner.commitTransaction();
    } catch (error) {
      queryRunner.rollbackTransaction();
    } finally {
      const user = await this.usersService.findOne(reviewCrudDto.userId);
      await queryRunner.release();
      return user;
    }
  }

  private async deleteTransaction(reviewCrudDto: ReviewCrudDto, point: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.reviewsRepository.softDelete(reviewCrudDto.reviewId);
      const returned = await this.reviewAttachedPhotosRepository.find({
        where: {
          reviewId: reviewCrudDto.reviewId,
        },
      });
      await this.reviewAttachedPhotosRepository.remove(returned);
      await this.usersService.updateUserPoint(reviewCrudDto.userId, point);
      await this.pointIncreaseLogging(reviewCrudDto, point);
      await queryRunner.commitTransaction();
    } catch (error) {
      queryRunner.rollbackTransaction();
    } finally {
      const user = await this.usersService.findOne(reviewCrudDto.userId);
      await queryRunner.release();
      return user;
    }
  }

  private async pointIncreaseLogging(
    reviewCrudDto: ReviewCrudDto,
    point: number,
  ) {
    const log = {
      userId: reviewCrudDto.userId,
      reviewId: reviewCrudDto.reviewId,
      pointIncrease: point,
    };
    await this.reviewPointIncreaseLogsRepository.insert(log);
  }

  private async getAddReviewPointAndPhotos(reviewCrudDto: ReviewCrudDto) {
    let point = 1;
    point = await this.calulatePointByIsFirstReview(reviewCrudDto, point);
    let insertPhotos = [];
    ({ point, insertPhotos } = this.plusPointByExistPhoto(
      reviewCrudDto,
      point,
      insertPhotos,
    ));
    return { insertPhotos, point };
  }

  private async getModReviewPointAndPhotos(reviewCrudDto: ReviewCrudDto) {
    const reviewPhotos = await this.reviewAttachedPhotosRepository.count({
      where: { reviewId: reviewCrudDto.reviewId },
    });

    let point = 0;
    let insertPhotos = [];

    if (reviewCrudDto.attachedPhotoIds.length > 0) {
      insertPhotos = this.mappingInsertArr(reviewCrudDto);
    }
    if (reviewPhotos > 0 && reviewCrudDto.attachedPhotoIds.length === 0) {
      point -= 1;
    }
    if (reviewPhotos === 0 && reviewCrudDto.attachedPhotoIds.length > 0) {
      point += 1;
    }

    return { insertPhotos, point };
  }

  private async getDeleteReviewPoint(reviewCrudDto: ReviewCrudDto) {
    let point = -1;
    point = await this.minusPointByHadPhotos(reviewCrudDto, point);
    point = await this.gotFirstReviewPoint(reviewCrudDto, point);
    return point;
  }

  private async gotFirstReviewPoint(
    reviewCrudDto: ReviewCrudDto,
    point: number,
  ) {
    if (
      (await this.reviewPointIncreaseLogsRepository.findOne({
        where: {
          reviewId: reviewCrudDto.reviewId,
          getFirstReviewPoint: true,
        },
      })) !== null
    ) {
      point -= 1;
    }
    return point;
  }

  private async calulatePointByIsFirstReview(
    reviewCrudDto: ReviewCrudDto,
    point: number,
  ): Promise<number> {
    const countReviewed = await this.firstReviewCheckByCount(reviewCrudDto);
    if (countReviewed === 0) {
      point += 1;
      // return point;
    }
    // if (countReviewed === 1) {
    //   point -= 1;
    //   return point;
    // }
    return point;
  }

  private async minusPointByHadPhotos(
    reviewCrudDto: ReviewCrudDto,
    point: number,
  ) {
    const hasPhotos: Boolean =
      (await this.reviewAttachedPhotosRepository.count({
        where: { reviewId: reviewCrudDto.reviewId },
      })) !== 0
        ? true
        : false;
    if (hasPhotos) point -= 1;
    return point;
  }

  private plusPointByExistPhoto(
    reviewCrudDto: ReviewCrudDto,
    point: number,
    insertPhotos: any[],
  ) {
    if (reviewCrudDto.attachedPhotoIds.length > 0) {
      point += 1;
      insertPhotos = this.mappingInsertArr(reviewCrudDto);
    }
    return { point, insertPhotos };
  }

  private async firstReviewCheckByCount(
    reviewCrudDto: ReviewCrudDto,
  ): Promise<number> {
    return await this.reviewsRepository.count({
      where: { placeId: reviewCrudDto.placeId },
    });
  }

  private mappingInsertArr(reviewCrudDto: ReviewCrudDto): Object[] {
    return reviewCrudDto.attachedPhotoIds.map((id) => {
      return {
        reviewId: reviewCrudDto.reviewId,
        attachedPhotoId: id,
      };
    });
  }

  private async fetchReviewOrNotThrowExp(reviewCrudDto: ReviewCrudDto) {
    const review = await this.reviewsRepository.findOneBy({
      reviewId: reviewCrudDto.reviewId,
    });
    if (!review) {
      throw new UnauthorizedException('존재하지 않는 reviewId 입니다.');
    }
    return review;
  }

  private async fetchReview(reviewCrudDto: ReviewCrudDto) {
    return await this.reviewsRepository.findOne({
      where: {
        userId: reviewCrudDto.userId,
        placeId: reviewCrudDto.placeId,
      },
    });
  }
}
