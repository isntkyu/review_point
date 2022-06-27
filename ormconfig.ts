import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Places } from './src/entities/Places';
import { Reviewattachedphotos } from './src/entities/Reviewattachedphotos';
import { Reviewpointincreaselogs } from './src/entities/Reviewpointincreaselogs';
import { Reviews } from './src/entities/Reviews';
import { Users } from './src/entities/Users';

dotenv.config();
const config: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    Users,
    Reviews,
    Reviewattachedphotos,
    Reviewpointincreaselogs,
    Places,
  ],
  synchronize: false, // 코드 -> 디비로 싱크
  logging: true, // 개발시
  keepConnectionAlive: true, // 서버 재시작시 커넥션 안끊김
};

export = config;
