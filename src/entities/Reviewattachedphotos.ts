import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reviews } from './Reviews';

@Index('review_id', ['reviewId'], {})
@Entity('reviewattachedphotos', { schema: 'triple_homework' })
export class Reviewattachedphotos {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'review_id', length: 36 })
  reviewId: string;

  @Column('varchar', { name: 'attached_photo_id', length: 36 })
  attachedPhotoId: string;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Reviews, (reviews) => reviews.reviewattachedphotos, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'review_id', referencedColumnName: 'reviewId' }])
  review: Reviews;
}
