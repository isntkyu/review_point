import { Reviewpointincreaselogs } from './../entities/Reviewpointincreaselogs';
import { Reviewattachedphotos } from './../entities/Reviewattachedphotos';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reviews } from '../entities/Reviews';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PlacesService } from 'src/places/places.service';

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
    // 1. placeId validation
    // 2. userId validation
    // 3. 이 유저가 이 장소에 이미 리뷰를 남겻는지 확인.
    const existReview = await this.reviewsRepository.findOne({
      where: {
        userId: eventRequestData.userId,
        placeId: eventRequestData.placeId,
      },
    });

    if (existReview) {
      return '이미 리뷰가 존재한다.';
    }
    // 4. 포인트 계산
    let point = 1;
    // 첫리뷰 체크
    const countPlaceReviews = await this.reviewsRepository.count({
      where: { placeId: eventRequestData.placeId },
    });
    if (countPlaceReviews === 0) {
      point += 1;
    }
    // 사진이 있는지 체크
    let insertPhotoIds = [];
    if (eventRequestData.attachedPhotoIds.length > 0) {
      point += 1;
      // 있으면 insert할 배열 생성
      insertPhotoIds = eventRequestData.attachedPhotoIds.map((id) => {
        return {
          reviewId: eventRequestData.reviewId,
          attachedPhotoId: id,
        };
      });
    }

    // 트랜잭션
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 리뷰 insert
      await this.reviewsRepository.insert(eventRequestData);
      // 사진 insert
      if (insertPhotoIds.length) {
        await this.reviewAttachedPhotosRepository.insert(insertPhotoIds);
      }
      // 포인트 업데이트
      await this.usersService.updateUserPoint(eventRequestData.userId, point);
      // 로그
      const logs = {
        userId: eventRequestData.userId,
        reviewId: eventRequestData.reviewId,
        pointIncrease: point,
      };
      await this.reviewPointIncreaseLogsRepository.insert(logs);
      await queryRunner.commitTransaction();
    } catch (error) {
      // return error
      console.log(error);
      queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    // 결과 포인트 리턴
    return await this.usersService.findOne(eventRequestData.userId);
  }

  async modReview(eventRequestData) {
    // 1. 리뷰 찾기
    const review = await this.reviewsRepository.findOneBy({
      reviewId: eventRequestData.reviewId,
    });
    if (!review) {
      // return error
      return '없는 리뷰아이디';
    }

    // join vs where
    // 사진 이 있엇는지
    const reviewPhotos = await this.reviewAttachedPhotosRepository.count({
      where: { reviewId: eventRequestData.reviewId },
    });

    let point = 0;
    let insertPhotoIds = [];
    if (reviewPhotos === 0 && eventRequestData.attachedPhotoIds.length) {
      point += 1;
      insertPhotoIds = eventRequestData.attachedPhotoIds.map((id) => {
        return {
          reviewId: eventRequestData.reviewId,
          attachedPhotoId: id,
        };
      });
    }
    if (reviewPhotos > 0 && !eventRequestData.attachedPhotoIds.length) {
      point -= 1;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 리뷰 내용 저장
      review.content = eventRequestData.content;
      await this.reviewsRepository.save(review);
      // 사진 삭제
      const photos = await this.reviewAttachedPhotosRepository.find({
        where: {
          reviewId: eventRequestData.reviewId,
        },
      });
      await this.reviewAttachedPhotosRepository.softRemove(photos);
      // 사진 추가
      if (insertPhotoIds.length > 0) {
        await this.reviewAttachedPhotosRepository.insert(insertPhotoIds);
      }
      // 포인트 업데이트
      if (point !== 0) {
        await this.usersService.updateUserPoint(eventRequestData.userId, point);
      }
      // 이력 로그
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

    // 결과 포인트 확인.
    return await this.usersService.findOne(eventRequestData.userId);
  }

  async deleteReview(eventRequestData) {
    let point = -1;
    // 사진있나
    const hasPhotos: Boolean =
      (await this.reviewAttachedPhotosRepository.find({
        where: { reviewId: eventRequestData.reviewId },
      })) !== null
        ? true
        : false;
    // 첫리뷰였나
    const isFirstReview: Boolean =
      (await this.reviewsRepository.count({
        where: { placeId: eventRequestData.placeId },
      })) === 1
        ? true
        : false;

    if (hasPhotos) point -= 1;
    if (isFirstReview) point -= 1;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 리뷰 삭제
      await this.reviewsRepository.softDelete(eventRequestData.reviewId);
      // 사진 삭제
      const returned = await this.reviewAttachedPhotosRepository.find({
        where: {
          reviewId: eventRequestData.reviewId,
        },
      });
      await this.reviewAttachedPhotosRepository.softRemove(returned);
      // 포인트 업뎃
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

    // 결과 포인트 리턴
    return await this.usersService.findOne(eventRequestData.userId);
  }
}
