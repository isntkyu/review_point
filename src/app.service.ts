import { ConfigService } from '@nestjs/config';

export class AppService {
  constructor(private configService: ConfigService) {}
  getHello(): string {
    return this.configService.get('NAME'); // 제로초바보
  }
}
