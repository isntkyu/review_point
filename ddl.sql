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