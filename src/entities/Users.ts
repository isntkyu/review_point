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

  @DeleteDateColumn()
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
0;
