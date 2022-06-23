import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';

@Entity('users', { schema: 'triple_homework' })
export class Users {
  @Column('varchar', { primary: true, name: 'user_id', length: 36 })
  userId: string;

  @Column('int', {
    name: 'point',
    nullable: true,
    unsigned: true,
    default: () => "'0'",
  })
  point: number | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
