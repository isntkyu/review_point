## 실행 밥법

- 개발에 사용된 버전

  - node: v16.14.0
  - npm: 8.5.1

- database 생성

  - 접속할 데이터베이스 서버에 CREATE DATABASE `database명`; 을 실행해주세요

- .env 파일 작성

  - .env 파일에 연결할 DB 의 정보(host, port, password, database명)와 애플리케이션을 띄울 포트 번호(default 3000)를 입력해주세요.

- npm install

- 실행.

  - npm run start (npm run start:dev)

- 테이블 생성

  - typeorm의 synchronize: true 옵션을 통해 서버시작시 데이터베이스에 테이블이 생성됩니다. (/src/entities)

- npm run seed:run
  - places (장소) 테이블과 users (사용자) 테이블에 기본 데이터를 insert 하도록 했습니다.
  - 각 3개의 데이터가 들어가게 됩니다.

```js
[
  { userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745' },
  { userId: '92b7-4817-a5f3-0c575361f745-3ede0ef2' },
  { userId: '3ede0ef2-92b7-4817-a5f3-0c575361f777' },
],
  [
    { placeId: '2e4baf1c-5acb-4efb-a1af-eddada31b00f', name: 'suwon' },
    { placeId: '2e4baf1c-5acb-4efb-a1af-eddada31b00a', name: 'seoul' },
    { placeId: '2e4baf1c-5acb-4efb-a1af-eddada31b00b', name: 'busan' },
  ];
```

---

## 테스트

- npm run test
  - reviews.service.spec.ts
  - users.service.spec.ts
- npm run test:e2e
  - app.e2e.spec.ts 파일의 테스트

---

## API

- 포인트 조회 API (GET)

  - 유저 테이블에 유저마다 갖는 포인트를 기록하게 설계했기 때문에 포인트는 유저 조회를 통해 확인하도록 했습니다.
  - /users : 전체 유저 조회
  - /users/:userId : 한 유저 조회

- /events (POST)

  - type 값을 domain 으로 이해하고 없는 도메인 값으로 요청시 Not Found.
  - action 값으로 정의되지 않은 값이 오면 BadRequest.
  - reviews.controller 에서 ADD, MOD, DELETE 분기했습니다.

---

## 테이블

- places

  - API 요구사항과는 관계없지만 장소 placeId 를 사용하기에 테이블은 꼭 있어야할 것 같아 추가했습니다.
  - reviews 테이블과 1:n 관계입니다.

- reviews

  - 리뷰 테이블입니다.
  - reviewattachedphotos 테이블과 1:n 관계입니다.
  - 같은 리뷰 uuid 는 존재할 수 없도록 설계했습니다.

- users

  - 유저 테이블입니다.
  - userId 와 포인트를 기록하고 있습니다 포인트는 음수가 되지 않도록 설계했습니다.

- reviewattachedphotos

  - 리뷰에 대한 사진id 들을 담은 테이블입니다.
  - 사진마다 같은 uuid 를 가질 수는 없다고 가정했습니다.

- reviewpointincreaselogs

  - 포인트 변화 이력 테이블입니다.
  - 유저id, 리뷰id, 포인트 증감 컬럼으로 구성되어있습니다.
  - 포인트 증감은 음수, 양수로 표현됩니다.

---

## DDL

- ddl.sql 파일

```sql
CREATE TABLE `users` (
  `user_id` varchar(36) NOT NULL,
  `point` int UNSIGNED NULL DEFAULT '0',
  `deleted_at` datetime(6) NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `user_id` (`user_id`),
  PRIMARY KEY (`user_id`)
);

CREATE TABLE `reviewpointincreaselogs` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `review_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `point_increase` int NOT NULL,
  `get_first_review_point` tinyint NOT NULL DEFAULT false,
  `deleted_at` datetime(6) NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `user_id` (`user_id`),
  PRIMARY KEY (`id`)
);

CREATE TABLE `places` (
  `place_id` varchar(36) NOT NULL,
  `name` text NOT NULL,
  `deleted_at` datetime(6) NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `place_id` (`place_id`),
  PRIMARY KEY (`place_id`)
);

CREATE TABLE `reviews` (
  `review_id` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `place_id` varchar(36) NOT NULL,
  `deleted_at` datetime(6) NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `place_id` (`place_id`),
  INDEX `user_id` (`user_id`),
  INDEX `review_id` (`review_id`),
  PRIMARY KEY (`review_id`)
);

CREATE TABLE `reviewattachedphotos` (
  `review_id` varchar(36) NOT NULL,
  `attached_photo_id` varchar(36) NOT NULL,
  -- `deleted_at` datetime(6) NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `review_id` (`review_id`),
  PRIMARY KEY (`attached_photo_id`)
);

ALTER TABLE
  `reviews`
ADD
  CONSTRAINT `FK_d2616b72cb3787ad20b88a3aa67` FOREIGN KEY (`place_id`) REFERENCES `places`(`place_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE
  `reviewattachedphotos`
ADD
  CONSTRAINT `FK_6387d4b514101481136345dafbc` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`review_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
```

---
