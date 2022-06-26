import { ConfigService } from '@nestjs/config';

export class AppService {
  constructor(private configService: ConfigService) {}
}
