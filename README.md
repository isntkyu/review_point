# review_point

create table Reviews (
review_id varchar(36) not null,
content text not null,
user_id varchar(36) not null,
place_id varchar(36) not null,
deleted_at DATETIME default null,
created_at DATETIME default current_timestamp() not null,
updated_at DATETIME default current_timestamp() not null,
index (place_id),
primary key (review_id)
);

create table ReviewAttachedPhotos (
id int unsigned not null auto_increment,
review_id varchar(36) not null,
attached_photo_id varchar(36) not null,
deleted_at DATETIME default null,
created_at DATETIME default current_timestamp() not null,
updated_at DATETIME default current_timestamp() not null,
index (review_id),
foreign key (review_id) references Reviews(review_id) on delete cascade,
primary key (id)
);

create table Users (
user_id varchar(36) not null,
point int unsigned default 0,
deleted_at DATETIME default null,
created_at DATETIME default current_timestamp() not null,
updated_at DATETIME default current_timestamp() not null,
primary key (user_id)
);

create table ReviewPointIncreaseLogs (
review_id varchar(36) not null,
user_id varchar(36) not null,
point_increase int not null,
deleted_at DATETIME default null,
created_at DATETIME default current_timestamp() not null,
updated_at DATETIME default current_timestamp() not null,
index (user_id)
primary key (review_id)
);

---

EATE TABLE `users` (`user_id` varchar(36) NOT NULL, `point` int UNSIGNED NULL DEFAULT '0', `deleted_at` datetime(6) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`user_id`)) ENGINE=InnoDB
query: CREATE TABLE `reviewpointincreaselogs` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `review_id` varchar(36) NOT NULL, `user_id` varchar(36) NOT NULL, `point_increase` int NOT NULL, `deleted_at` datetime(6) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX `user_id` (`user_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `reviews` (`review_id` varchar(36) NOT NULL, `content` text NOT NULL, `user_id` varchar(36) NOT NULL, `place_id` varchar(36) NOT NULL, `deleted_at` datetime(6) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX `place_id` (`place_id`), PRIMARY KEY (`review_id`)) ENGINE=InnoDB
query: CREATE TABLE `reviewattachedphotos` (`review_id` varchar(36) NOT NULL, `attached_photo_id` varchar(36) NOT NULL, `deleted_at` datetime(6) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX `review_id` (`review_id`), PRIMARY KEY (`attached_photo_id`)) ENGINE=InnoDB
query: ALTER TABLE `reviewattachedphotos` ADD CONSTRAINT `FK_6387d4b514101481136345dafbc` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`review_id`) ON DELETE CASCADE ON UPDATE NO ACTION

---

타입오알엠엔 매니투매니 버그가 좀 잇음

synchronize: true, // 코드 -> 디비로 싱크

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
