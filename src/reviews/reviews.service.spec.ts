import { ReviewCrudDto } from './dto/event-review.dto';
import { Users } from '../entities/Users';
import { UsersModule } from './../users/users.module';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reviewpointincreaselogs } from './../entities/Reviewpointincreaselogs';
import { Reviewattachedphotos } from './../entities/Reviewattachedphotos';
import { Reviews } from './../entities/Reviews';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { ReviewsService } from './reviews.service';
import { UnauthorizedException } from '@nestjs/common';

const mockReviewsRepository = () => ({
  findOne: jest.fn(),
  count: jest.fn(),
  insert: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
});

const mockReviewsPointIncreaseLogsRepository = () => ({
  insert: jest.fn(),
});

const mockReviewsAttachedPhotosRepository = () => ({
  find: jest.fn(),
  count: jest.fn(),
  insert: jest.fn(),
  softRemove: jest.fn(),
});

const qr = {
  manager: {},
} as QueryRunner;

class DatasourceMock {
  createQueryRunner(mode?: 'master' | 'slave'): QueryRunner {
    return qr;
  }
}

const mockUsersRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  softDelete: jest.fn(),
  increment: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ReviewsService', () => {
  let service: ReviewsService;
  let usersService: UsersService;
  let datasource: DataSource;
  let reviewsRepository: MockRepository<Reviews>;
  let userRepository: MockRepository<Users>;
  let reviewAttachedPhotosRepository: MockRepository<Reviewattachedphotos>;
  let reviewPointIncreaseLogsRepository: MockRepository<Reviewpointincreaselogs>;

  beforeEach(async () => {
    Object.assign(qr.manager, { insert: jest.fn() });

    qr.startTransaction = jest.fn();
    qr.connect = jest.fn();
    qr.commitTransaction = jest.fn();
    qr.rollbackTransaction = jest.fn();
    qr.release = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        UsersModule,
        UsersService,
        {
          provide: getRepositoryToken(Reviews),
          useValue: mockReviewsRepository(),
        },
        {
          provide: getRepositoryToken(Reviewpointincreaselogs),
          useValue: mockReviewsPointIncreaseLogsRepository(),
        },
        {
          provide: getRepositoryToken(Reviewattachedphotos),
          useValue: mockReviewsAttachedPhotosRepository(),
        },
        {
          provide: DataSource,
          useClass: DatasourceMock,
        },
        {
          provide: getRepositoryToken(Users),
          useValue: mockUsersRepository(),
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    usersService = module.get<UsersService>(UsersService);
    reviewsRepository = module.get<MockRepository<Reviews>>(
      getRepositoryToken(Reviews),
    );
    reviewAttachedPhotosRepository = module.get<
      MockRepository<Reviewattachedphotos>
    >(getRepositoryToken(Reviewattachedphotos));
    userRepository = module.get<MockRepository<Users>>(
      getRepositoryToken(Users),
    );
    datasource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('ADD Review', () => {
    const beforeUser = {
      userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
      point: 10,
    };
    const addReviewData = {
      type: 'REVIEW',
      action: 'ADD',
      reviewId: '240a0658-dc5f-4878-9381-ebb7b2667772',
      content: '좋아요!',
      attachedPhotoIds: [
        'e4d1a64e-a531-46de-88d0-ff0ed70c0bb8',
        'afb0cef2-851d-4a50-bb07-9cc15cbdc332',
      ],
      userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
      placeId: '2e4baf1c-5acb-4efb-a1af-eddada31b00f',
    };

    it('한 장소에 한 명당 리뷰는 1개까지여야 한다.', async () => {
      reviewsRepository.findOne.mockResolvedValue(new Reviews());

      const result = await service.addReview(addReviewData);

      expect(reviewsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(reviewsRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: addReviewData.userId,
          placeId: addReviewData.placeId,
        },
      });

      expect(result).toEqual(
        new UnauthorizedException('이미 리뷰가 존재합니다.'),
      );
    });

    it('리뷰가 저장될 때 기본 +1 포인트', async () => {
      const afterUser = {
        userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
        point: 11,
      };
      reviewsRepository.findOne.mockResolvedValue(null);
      userRepository.findOneBy.mockResolvedValue(afterUser);
      userRepository.increment.mockResolvedValue(beforeUser);

      addReviewData.attachedPhotoIds = [];
      const result = await service.addReview(addReviewData);

      expect(result).toEqual(afterUser);
    });

    it('리뷰가 저장될 때 사진이 있다면 +1 포인트', async () => {
      const afterUser = {
        userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
        point: 12,
      };
      reviewsRepository.findOne.mockResolvedValue(null);
      userRepository.findOneBy.mockResolvedValue(afterUser);
      userRepository.increment.mockResolvedValue(beforeUser);

      const result = await service.addReview(addReviewData);

      expect(result).toEqual(afterUser);
    });
    it('리뷰가 저장될 때 첫 리뷰라면  +1 포인트', async () => {
      const afterUser = {
        userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
        point: 13,
      };
      reviewsRepository.findOne.mockResolvedValue(null);
      userRepository.findOneBy.mockResolvedValue(afterUser);
      userRepository.increment.mockResolvedValue(beforeUser);
      reviewsRepository.count.mockResolvedValue(0);

      const result = await service.addReview(addReviewData);

      expect(result).toEqual(afterUser);
    });
  });

  describe('MOD Review', () => {
    const beforeUser = {
      userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
      point: 10,
    };
    const modReviewData = {
      type: 'REVIEW',
      action: 'MOD',
      reviewId: '240a0658-dc5f-4878-9381-ebb7b2667772',
      content: '시러요!',
      attachedPhotoIds: ['a', 'b'],
      userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
      placeId: '2e4baf1c-5acb-4efb-a1af-eddada31b00f',
    };
    it('없는 리뷰ID 로 요청했을 때', async () => {
      reviewsRepository.findOneBy.mockResolvedValue(null);

      const result = await service.modReview(modReviewData);

      expect(result).toEqual(
        new UnauthorizedException('존재하지 않는 reviewId 입니다.'),
      );
    });

    it('사진이 있던 리뷰에 사진을 삭제하면 -1 포인트', async () => {
      const afterUser = {
        userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
        point: 9,
      };
      reviewsRepository.findOneBy.mockResolvedValue(new Reviews());
      reviewAttachedPhotosRepository.count.mockResolvedValue(3);
      modReviewData.attachedPhotoIds = [];
      reviewAttachedPhotosRepository.find.mockResolvedValue(['c', 'd', 'e']);
      reviewAttachedPhotosRepository.softRemove.mockResolvedValue([]);
      reviewAttachedPhotosRepository.insert.mockResolvedValue([]);
      userRepository.increment.mockResolvedValue(beforeUser);
      userRepository.findOneBy.mockResolvedValue(afterUser);

      const result = await service.modReview(modReviewData);

      expect(result).toEqual(afterUser);
    });
    it('사진이 없던 리뷰에 사진을 추가하면 +1 포인트', async () => {
      const afterUser = {
        userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
        point: 10,
      };
      reviewsRepository.findOneBy.mockResolvedValue(new Reviews());
      reviewAttachedPhotosRepository.count.mockResolvedValue(3);
      reviewAttachedPhotosRepository.find.mockResolvedValue([]);
      reviewAttachedPhotosRepository.softRemove.mockResolvedValue([]);
      reviewAttachedPhotosRepository.insert.mockResolvedValue(['a', 'b']);
      userRepository.increment.mockResolvedValue(beforeUser);
      userRepository.findOneBy.mockResolvedValue(afterUser);

      const result = await service.modReview(modReviewData);

      expect(result).toEqual(afterUser);
    });
  });

  describe('DELETE Review', () => {
    const beforeUser = {
      userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
      point: 10,
    };
    const deleteReviewData = {
      type: 'REVIEW',
      action: 'MOD',
      reviewId: '240a0658-dc5f-4878-9381-ebb7b2667772',
      content: '시러요!',
      attachedPhotoIds: ['a', 'b'],
      userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
      placeId: '2e4baf1c-5acb-4efb-a1af-eddada31b00f',
    };

    it('삭제시 기본 -1 포인트', async () => {
      const afterUser = {
        userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
        point: 9,
      };
      reviewsRepository.findOneBy.mockResolvedValue(deleteReviewData);
      reviewAttachedPhotosRepository.find.mockResolvedValue(null);
      reviewsRepository.count(50);
      userRepository.increment.mockResolvedValue(beforeUser);
      userRepository.findOneBy.mockResolvedValue(afterUser);

      const result = await service.deleteReview(deleteReviewData);

      expect(result).toEqual(afterUser);
    });

    it('사진이 있었으면 추가 -1 포인트', async () => {
      const afterUser = {
        userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
        point: 8,
      };
      reviewsRepository.findOneBy.mockResolvedValue(deleteReviewData);
      reviewAttachedPhotosRepository.find.mockResolvedValue(!null);
      reviewsRepository.count(50);
      userRepository.increment.mockResolvedValue(beforeUser);
      userRepository.findOneBy.mockResolvedValue(afterUser);

      const result = await service.deleteReview(deleteReviewData);

      expect(result).toEqual(afterUser);
    });

    it('첫 리뷰였으면 추가 -1 포인트', async () => {
      const afterUser = {
        userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
        point: 7,
      };
      reviewsRepository.findOneBy.mockResolvedValue(deleteReviewData);
      reviewAttachedPhotosRepository.find.mockResolvedValue(!null);
      reviewsRepository.count(1);
      userRepository.increment.mockResolvedValue(beforeUser);
      userRepository.findOneBy.mockResolvedValue(afterUser);

      const result = await service.deleteReview(deleteReviewData);

      expect(result).toEqual(afterUser);
    });

    it('없는 리뷰ID 로 요청했을 때', async () => {
      reviewsRepository.findOneBy.mockResolvedValue(null);

      const result = await service.deleteReview(deleteReviewData);

      expect(result).toEqual(
        new UnauthorizedException('존재하지 않는 reviewId 입니다.'),
      );
    });
  });
});
