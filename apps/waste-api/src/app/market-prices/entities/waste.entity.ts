import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { DisposerWaste } from './disposer-waste.entity';
import { WasteCategory } from './waste-category.entity';

/**
 * Entidad que representa un tipo de residuo
 * Define las características básicas de cada residuo que puede ser procesado
 */
@Entity('wastes')
@Index(['wasteCategoryId'])
@Index(['isActive'])
@Unique('uk_wastes_category_subproduct', ['wasteCategoryId', 'subproductName'])
export class Waste {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'waste_category_id', nullable: true })
  wasteCategoryId?: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ 
    name: 'subproduct_name', 
    type: 'varchar', 
    length: 200, 
    nullable: true,
    comment: 'Nombre específico del subproducto (ej: "Botella de bebida")'
  })
  subproductName?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'hazard_class', type: 'varchar', length: 10, nullable: true })
  hazardClass?: string;

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'Especificaciones particulares del residuo en formato JSON'
  })
  specifications?: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => WasteCategory, (wasteCategory) => wasteCategory.wastes, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'waste_category_id' })
  wasteCategory?: WasteCategory;

  @OneToMany(() => DisposerWaste, (disposerWaste) => disposerWaste.waste)
  disposerWastes!: DisposerWaste[];
}
