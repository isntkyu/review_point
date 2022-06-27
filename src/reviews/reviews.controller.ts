import { Controller, BadRequestException } from '@nestjs/common';
import { PostEventDto } from '../common/dto/post.event.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  async postReview(postEventDto: PostEventDto) {
    const requestMethod = postEventDto.action;
    switch (requestMethod) {
      case 'ADD':
        return await this.reviewsService.addReview(postEventDto);
      case 'MOD':
        return await this.reviewsService.modReview(postEventDto);
      case 'DELETE':
        return await this.reviewsService.deleteReview(postEventDto);
      default:
        throw new BadRequestException();
    }
  }
}
