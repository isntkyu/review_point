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

타입오알엠엔 매니투매니 버그가 좀 잇음

synchronize: true, // 코드 -> 디비로 싱크

---

- config .env 쓰기 > typeorm 커넥션 맺기 (제로초 강좌) 맨뒤부분

  - 비동기로 .env 가져오고 연결

- 404 처리 인터셉터

- create, update, delete 픽타입 중복

- \*\*\*DateColumn 데코레이터쓰면 왜 실제 컬럼을 createdAt -> created_at 으로 안바꿔줌?

InternalServerErrorException

사진 테이블도 소프트딜리트해야되나.
필요없을듯

PrimaryGeneratedColumn 필요한가
