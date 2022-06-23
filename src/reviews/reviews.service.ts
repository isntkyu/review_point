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
  ) {}

  //createReviewDto: CreateReviewDto
  async addReview() {
    return 'This action adds a new review';
  }

  async modReview() {
    return `This action returns a #review`;
  }

  //id: number, updateReviewDto: UpdateReviewDto
  async deleteReview() {
    return `This action updates a # review`;
  }
}
