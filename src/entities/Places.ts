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
import { Reviews } from './Reviews';

@Index('place_id', ['placeId'], {})
@Entity('places', { schema: 'triple_homework' })
export class Places {
  @Column('varchar', { primary: true, name: 'place_id', length: 36 })
  placeId: string;

  @Column('text')
  name: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Reviews, (reviews) => reviews.place, {
    cascade: true,
  })
  reviews: Reviews[];
}
