import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index('user_id', ['userId'], {})
@Entity('reviewpointincreaselogs', { schema: 'triple_homework' })
export class Reviewpointincreaselogs {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'review_id', length: 36 })
  reviewId: string;

  @Column('varchar', { name: 'user_id', length: 36 })
  userId: string;

  @Column('int', { name: 'point_increase' })
  pointIncrease: number;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
