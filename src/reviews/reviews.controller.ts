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

  async postReview(eventRequstData) {
    const requestMethod = eventRequstData.action;
    switch (requestMethod) {
      case 'ADD':
        return await this.reviewsService.addReview();
      case 'MOD':
        return await this.reviewsService.modReview();
      case 'DELETE':
        return await this.reviewsService.deleteReview();
      default:
        throw new BadRequestException();
    }
  }
}
