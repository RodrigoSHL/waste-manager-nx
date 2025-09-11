import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { WasteType } from './waste-type.entity';
import { Waste } from './waste.entity';

@Entity('waste_categories')
@Index(['wasteTypeId'])
@Index(['isActive'])
@Index(['code'])
export class WasteCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'waste_type_id' })
  wasteTypeId!: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ 
    name: 'technical_specs', 
    type: 'jsonb', 
    nullable: true,
    comment: 'Especificaciones técnicas como densidad, punto de fusión, etc.'
  })
  technicalSpecs?: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => WasteType, (wasteType) => wasteType.categories, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'waste_type_id' })
  wasteType!: WasteType;

  @OneToMany(() => Waste, (waste) => waste.wasteCategory)
  wastes!: Waste[];
}
