import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  async postReview(eventRequestData) {
    const requestMethod = eventRequestData.action;
    switch (requestMethod) {
      case 'ADD':
        return await this.reviewsService.addReview(eventRequestData);
      case 'MOD':
        return await this.reviewsService.modReview(eventRequestData);
      case 'DELETE':
        return await this.reviewsService.deleteReview(eventRequestData);
      default:
        throw new BadRequestException();
    }
  }
}
