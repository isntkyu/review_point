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

  private async isFirstReviewCheckByCount(
    reviewCrudDto: ReviewCrudDto,
  ): Promise<number> {
    return await this.reviewsRepository.count({
      where: { placeId: reviewCrudDto.placeId },
    });
  }

  private mappingInsertArr(
    insertPhotoIds: Object[],
    reviewCrudDto: ReviewCrudDto,
  ): Object[] {
    insertPhotoIds = reviewCrudDto.attachedPhotoIds.map((id) => {
      return {
        reviewId: reviewCrudDto.reviewId,
        attachedPhotoId: id,
      };
    });
    return insertPhotoIds;
  }

  private async checkExistAndFindReview(reviewCrudDto: ReviewCrudDto) {
    const review = await this.reviewsRepository.findOneBy({
      reviewId: reviewCrudDto.reviewId,
    });
    if (!review) {
      throw new UnauthorizedException('존재하지 않는 reviewId 입니다.');
    }
    return review;
  }

  async addReview(reviewCrudDto: ReviewCrudDto): Promise<Users> {
    try {
      // 이 유저가 이 장소에 이미 리뷰를 남겻는지 확인.
      const existReview = await this.reviewsRepository.findOne({
        where: {
          userId: reviewCrudDto.userId,
          placeId: reviewCrudDto.placeId,
        },
      });
      if (existReview) {
        throw new UnauthorizedException('이미 리뷰가 존재합니다.');
      }

      // 포인트 계산
      let point = 1;
      const isFirstReview: Boolean =
        (await this.isFirstReviewCheckByCount(reviewCrudDto)) === 0
          ? true
          : false;
      if (isFirstReview) {
        point += 1;
      }

      let insertPhotoIds = [];
      if (reviewCrudDto.attachedPhotoIds.length > 0) {
        point += 1;
        insertPhotoIds = this.mappingInsertArr(insertPhotoIds, reviewCrudDto);
      }

      // startTranaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        // 리뷰 insert
        await this.reviewsRepository.insert(reviewCrudDto);
        // 사진 insert
        if (insertPhotoIds.length) {
          await this.reviewAttachedPhotosRepository.insert(insertPhotoIds);
        }
        // 포인트 업데이트
        await this.usersService.updateUserPoint(reviewCrudDto.userId, point);
        // 이력 로그
        const logs = {
          userId: reviewCrudDto.userId,
          reviewId: reviewCrudDto.reviewId,
          pointIncrease: point,
        };
        await this.reviewPointIncreaseLogsRepository.insert(logs);
        await queryRunner.commitTransaction();
      } catch (error) {
        console.log(error);
        queryRunner.rollbackTransaction();
      } finally {
        const user = await this.usersService.findOne(reviewCrudDto.userId);
        await queryRunner.release();
        return user;
      }
    } catch (error) {
      return error;
    }
  }

  async modReview(reviewCrudDto: ReviewCrudDto): Promise<Users> {
    try {
      //  리뷰 찾기
      const review = await this.checkExistAndFindReview(reviewCrudDto);

      const reviewPhotos = await this.reviewAttachedPhotosRepository.count({
        where: { reviewId: reviewCrudDto.reviewId },
      });

      let point = 0;
      let insertPhotoIds = [];
      if (reviewPhotos === 0 && reviewCrudDto.attachedPhotoIds.length) {
        point += 1;
        insertPhotoIds = this.mappingInsertArr(insertPhotoIds, reviewCrudDto);
      }
      if (reviewPhotos > 0 && !reviewCrudDto.attachedPhotoIds.length) {
        point -= 1;
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        // 리뷰 내용 저장
        review.content = reviewCrudDto.content;
        await this.reviewsRepository.save(review);
        // 사진 삭제
        const photos = await this.reviewAttachedPhotosRepository.find({
          where: {
            reviewId: reviewCrudDto.reviewId,
          },
        });
        await this.reviewAttachedPhotosRepository.softRemove(photos);
        // 사진 추가
        if (insertPhotoIds.length > 0) {
          await this.reviewAttachedPhotosRepository.insert(insertPhotoIds);
        }
        // 포인트 업데이트
        if (point !== 0) {
          await this.usersService.updateUserPoint(reviewCrudDto.userId, point);
        }
        const logs = {
          userId: reviewCrudDto.userId,
          reviewId: reviewCrudDto.reviewId,
          pointIncrease: point,
        };
        await this.reviewPointIncreaseLogsRepository.insert(logs);
        await queryRunner.commitTransaction();
      } catch (error) {
        console.log(error);
        queryRunner.rollbackTransaction();
      } finally {
        const user = await this.usersService.findOne(reviewCrudDto.userId);
        await queryRunner.release();
        return user;
      }
    } catch (error) {
      return error;
    }
  }

  async deleteReview(reviewCrudDto: ReviewCrudDto): Promise<Users> {
    try {
      await this.checkExistAndFindReview(reviewCrudDto);

      let point = -1;

      const hasPhotos: Boolean =
        (await this.reviewAttachedPhotosRepository.find({
          where: { reviewId: reviewCrudDto.reviewId },
        })) !== null
          ? true
          : false;

      const isFirstReview: Boolean =
        (await this.isFirstReviewCheckByCount(reviewCrudDto)) === 1
          ? true
          : false;

      if (hasPhotos) point -= 1;
      if (isFirstReview) point -= 1;

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
        await this.reviewAttachedPhotosRepository.softRemove(returned);
        await this.usersService.updateUserPoint(reviewCrudDto.userId, point);
        const logs = {
          userId: reviewCrudDto.userId,
          reviewId: reviewCrudDto.reviewId,
          pointIncrease: point,
        };
        await this.reviewPointIncreaseLogsRepository.insert(logs);
        await queryRunner.commitTransaction();
      } catch (error) {
        console.log(error);
        queryRunner.rollbackTransaction();
      } finally {
        const user = await this.usersService.findOne(reviewCrudDto.userId);
        await queryRunner.release();
        return user;
      }
    } catch (error) {
      return error;
    }
  }
}
