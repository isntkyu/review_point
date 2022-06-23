import { ReviewsController } from './reviews/reviews.controller';
import { Body, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly reviewsController: ReviewsController,
  ) {}

  @Post('/events')
  async event(@Body() eventRequstData) {
    const domain = eventRequstData.type;
    console.log(domain);
    switch (domain) {
      case 'REVIEW':
        return await this.reviewsController.postReview(eventRequstData);
      default:
        throw new NotFoundException();
    }
  }
}
