import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // 타입 리뷰아니면 404. 액션 없으면 400
  it('/events (POST)', async () => {
    const response = await request(app.getHttpServer()).post('/events').send({
      type: 'REVIEW',
      action: 'MOD',
      reviewId: '240a0658-dc5f-4878-9381-ebb7b2661249',
      content: '좋아요!',
      attachedPhotoIds: [],
      userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745',
      placeId: '2e4baf1c-5acb-4efb-a1af-eddada31b00f',
    });

    expect(response.statusCode).toBe(201);
  });

  it('/events (POST) type: 없는 도메인이면 404', async () => {
    return await request(app.getHttpServer())
      .post('/events')
      .send({
        type: 'NOTREVIEW',
      })
      .expect(404)
      .expect('{"statusCode":404,"message":"Not Found"}');
  });

  it('/events (POST) REVIEW 타입의 action이 잘못되었으면 BadRequest', async () => {
    return await request(app.getHttpServer())
      .post('/events')
      .send({
        type: 'REVIEW',
        action: 'TEST',
      })
      .expect(400)
      .expect('{"statusCode":400,"message":"Bad Request"}');
  });

  afterAll(async () => {
    await app.close();
  });
});
