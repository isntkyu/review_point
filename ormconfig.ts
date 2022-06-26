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
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'dkxhvl!12',
  database: 'triple_homework',
  entities: [
    Users,
    Reviews,
    Reviewattachedphotos,
    Reviewpointincreaselogs,
    Places,
  ],
  // entities: [Users],
  // autoLoadEntities: true,
  synchronize: false, // 코드 -> 디비로 싱크
  logging: true, // 개발시
  keepConnectionAlive: true, // 서버 재시작시 커넥션 안끊김
};

export = config;
