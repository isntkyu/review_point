import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';

@Entity('reviewpointincreaselogs', { schema: 'triple_homework' })
export class Reviewpointincreaselogs {
  @Column('varchar', { primary: true, name: 'user_id', length: 36 })
  userId: string;

  @Column('int', { name: 'point_increase' })
  pointIncrease: number;

  @Column('varchar', { name: 'review_id', length: 36 })
  reviewId: string;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
