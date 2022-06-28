import { ReviewsController } from './reviews/reviews.controller';
import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { PostEventDto } from './common/dto/post.event.dto';

@Controller()
export class AppController {
  constructor(private readonly reviewsController: ReviewsController) {}

  @Post('/events')
  async event(@Body() eventRequestData: PostEventDto) {
    const domain = eventRequestData.type;
    switch (domain) {
      case 'REVIEW':
        return await this.reviewsController.postReview(eventRequestData);
      default:
        throw new NotFoundException();
    }
  }
}
