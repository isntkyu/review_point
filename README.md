## 실행 밥법

- 개발에 사용된 버전

  - node: v16.14.0
  - npm: 8.3.1

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
  `deleted_at` datetime(6) NULL,
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

한 사용자는 장소마다 리뷰를 1개만

- config .env 쓰기 > typeorm 커넥션 맺기 (제로초 강좌) 맨뒤부분

  - 비동기로 .env 가져오고 연결

- 404 처리 인터셉터

- create, update, delete 픽타입 중복

- \*\*\*DateColumn 데코레이터쓰면 왜 실제 컬럼을 createdAt -> created_at 으로 안바꿔줌?

InternalServerErrorException

사진 테이블도 소프트딜리트해야되나.
필요없을듯

PrimaryGeneratedColumn 필요한가

사진테이블에 엄데이트문이 필요한가

0점일때 삭제

포토아이디가 겹칠수잇나? (개념은 가능)

소프트딜리트의 cascade 직접구현

logger

user e2e

---

- TEST

  - user

    - find user
    - 포인트 업뎃
      - 포인트 0점인데 마이너스할 경우 에러
      - 포인트 업뎃 후 확인

  - app

    - /events 존재
    - /events 404 뱉는지

  - review

    - 한명당 한 장소에 리뷰 한개
    - 1점 포인트가 쌓이는가

      - 사진이 있으면 1점이 추가되는가
        - 첫리뷰일 때 1점이 추가되는가

    - 삭제시 포인트 회수

      - 사진이 있었는지
      - 첫리뷰 엿는지

    - 수정시 사진이 없다가 추가

      - 사진이 있다가 삭제

    - 첫리뷰였던 A가 삭제진행이 완료되기 이전에 B 리뷰가 작성되면 B 리뷰는 추가점수가 없다.

---

남은 것

- user e2e
<!-- - review unit testing -->
- db 점검
- review e2e
<!-- - user dto -->
- seed 데이터 추가
- 코드 리팩토링 (함수로 뺴기)
- 엔티티나 디티오 겹치는것들 뺼 수 있음 빼기
- 함수 리턴값, 객체 다루기, 타입스크립트 리팩토링 (enhancinglanguage)
- 전체 테스트
- **8.  서비스 운영을 고려한 예외처리와 로그가 있으면 견고한 프로젝트가 될 수 있을것 같습니다.**

현재 과제에서는 try catch를 비롯해 에러로그 등이 잘 다뤄지진 않는데요.

어떤 부분에서 로그를 남길지,

로그를 남긴다면 **어떤 파라미터, 어떤 가공된 값을 사용했더니 어떤 함수에서 에러가 발생했다**를 상세하게 남긴다면 실제 운영 환경에서 많은 문제를 쉽게 해결할 수 있습니다.

이 부분을 조금더 신경써주신다면 견고한 프로젝트가 될 수 있을것 같습니다.

https://velog.io/@dev_leewoooo/TypeORM-Transaction%EC%9D%84-Test%ED%95%98%EA%B8%B0-with-queryRunner

logs : 타입

---

막날. 배포과정 정리
서버실행 방법 정리
설계 끝까지검토

포토아이디가 절대 겹칠수 없다는 가정.
