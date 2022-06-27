import { Users } from '../entities/Users';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { EntityNotFoundError, Repository, QueryFailedError } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

const mockUsersRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  softDelete: jest.fn(),
  increment: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<Users>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUsersRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<MockRepository<Users>>(
      getRepositoryToken(Users),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne()', () => {
    const findOneByArgs = { userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745' };
    it('should be findOne', async () => {
      const mockedUser = {
        userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
        point: 12,
      };

      userRepository.findOneBy.mockResolvedValue(mockedUser);

      const result = await service.findOne(findOneByArgs.userId);

      expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith(findOneByArgs);

      expect(result).toEqual(mockedUser);
    });

    it('should fail if no post is found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOne(findOneByArgs.userId);

      expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith(findOneByArgs);

      expect(result).toEqual(
        new EntityNotFoundError(Users, findOneByArgs.userId),
      );
    });

    it('should fail on findOne exception', async () => {
      userRepository.findOneBy.mockRejectedValue('find error');
      const result = await service.findOne(findOneByArgs.userId);
      expect(result).toEqual('find error');
    });
  });

  describe('updateUserPoint()', () => {
    const incrementArgs = { userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745' };
    const pointAdd = 10;
    const pointSub = -10;
    it('should be update ADD Point user', async () => {
      const afterAddUser = {
        userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
        point: 22,
      };

      userRepository.increment.mockResolvedValue(afterAddUser);

      const result = await service.updateUserPoint(
        incrementArgs.userId,
        pointAdd,
      );

      expect(userRepository.increment).toHaveBeenCalledTimes(1);
      expect(userRepository.increment).toHaveBeenCalledWith(
        incrementArgs,
        'point',
        pointAdd,
      );

      expect(result).toEqual(afterAddUser);
    });

    it('should be update SUB Point user', async () => {
      const afterSubUser = {
        userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
        point: 2,
      };

      userRepository.increment.mockResolvedValue(afterSubUser);

      const result = await service.updateUserPoint(
        incrementArgs.userId,
        pointSub,
      );

      expect(userRepository.increment).toHaveBeenCalledTimes(1);
      expect(userRepository.increment).toHaveBeenCalledWith(
        incrementArgs,
        'point',
        pointSub,
      );

      expect(result).toEqual(afterSubUser);
    });

    it('should fail if no post is found', async () => {
      userRepository.increment.mockResolvedValue({
        affected: 0,
      });

      const result = await service.updateUserPoint(
        incrementArgs.userId,
        pointSub,
      );

      expect(userRepository.increment).toHaveBeenCalledTimes(1);
      expect(userRepository.increment).toHaveBeenCalledWith(
        incrementArgs,
        'point',
        pointSub,
      );

      expect(result).toEqual(
        new EntityNotFoundError(Users, incrementArgs.userId),
      );
    });

    it('포인트가 0 미만 일 수는 없다.', async () => {
      userRepository.increment.mockRejectedValue({
        code: 'ER_DATA_OUT_OF_RANGE',
      });
      const result = await service.updateUserPoint(
        incrementArgs.userId,
        -999999999,
      );

      expect(userRepository.increment).toHaveBeenCalledTimes(1);
      expect(userRepository.increment).toHaveBeenCalledWith(
        incrementArgs,
        'point',
        -999999999,
      );

      expect(result).toEqual(new Error('point cannot be negative'));
    });
  });
});
