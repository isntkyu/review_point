import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Repository, EntityNotFoundError, QueryFailedError } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async findOne(userId: string): Promise<Users> {
    try {
      const user = await this.usersRepository.findOneBy({ userId: userId });
      if (!user) {
        throw new EntityNotFoundError(Users, userId);
      }
      return user;
    } catch (error) {
      return error;
    }
  }

  async updateUserPoint(userId: string, pointIncrease: number) {
    try {
      const result = await this.usersRepository.increment(
        { userId: userId },
        'point',
        pointIncrease,
      );
      if (result.affected === 0) {
        throw new EntityNotFoundError(Users, userId);
      }
      return result;
    } catch (error) {
      if (error.code === 'ER_DATA_OUT_OF_RANGE') {
        return new Error('point cannot be negative');
      }
      return error;
    }
  }
}
