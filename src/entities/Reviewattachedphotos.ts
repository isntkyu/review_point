import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Reviews } from './Reviews';

@Index('review_id', ['reviewId'], {})
@Entity('reviewattachedphotos', { schema: 'triple_homework' })
export class Reviewattachedphotos {
  @Column('varchar', { name: 'review_id', length: 36 })
  reviewId: string;

  @Column('varchar', { primary: true, name: 'attached_photo_id', length: 36 })
  attachedPhotoId: string;

  // @DeleteDateColumn({ name: 'deleted_at' })
  // deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Reviews, (reviews) => reviews.reviewattachedphotos, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'review_id', referencedColumnName: 'reviewId' }])
  review: Reviews;
}
