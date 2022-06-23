import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Entity,
  Index,
  OneToMany,
} from 'typeorm';
import { Reviewattachedphotos } from './Reviewattachedphotos';

@Index('place_id', ['placeId'], {})
@Entity('reviews', { schema: 'triple_homework' })
export class Reviews {
  @Column('varchar', { primary: true, name: 'review_id', length: 36 })
  reviewId: string;

  @Column('text', { name: 'content' })
  content: string;

  @Column('varchar', { name: 'user_id', length: 36 })
  userId: string;

  @Column('varchar', { name: 'place_id', length: 36 })
  placeId: string;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => Reviewattachedphotos,
    (reviewattachedphotos) => reviewattachedphotos.review,
  )
  reviewattachedphotos: Reviewattachedphotos[];
}
