import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { WasteCategory } from './waste-category.entity';

@Entity('waste_types')
@Index(['isActive'])
@Index(['code'])
export class WasteType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 7, nullable: true, comment: 'Color hexadecimal para UI' })
  color?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Nombre del icono para UI' })
  icon?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Relaciones
  @OneToMany(() => WasteCategory, (wasteCategory) => wasteCategory.wasteType)
  categories!: WasteCategory[];
}
