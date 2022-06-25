import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository, EntityNotFoundError, QueryFailedError } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}
  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  // async findAll() {
  //   return await this.usersRepository.find({ where: {} });
  // }

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
      // console.log(
      //   '--------------------------',
      //   await this.usersRepository.increment(
      //     { userId: userId },
      //     'point',
      //     -12356,
      //   ),
      // );
      const returned = await this.usersRepository.increment(
        { userId: userId },
        'point',
        pointIncrease,
      );
      // console.log('returned.affected', returned.affected);
      if (returned.affected === 0) {
        throw new EntityNotFoundError(Users, userId);
      }
      return returned;
    } catch (error) {
      if (error.code === 'ER_DATA_OUT_OF_RANGE') {
        return new Error('point cannot be negative');
      }
      return error;
    }
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
