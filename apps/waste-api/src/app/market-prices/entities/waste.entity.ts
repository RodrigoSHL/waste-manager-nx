import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { DisposerWaste } from './disposer-waste.entity';

/**
 * Entidad que representa un tipo de residuo
 * Define las características básicas de cada residuo que puede ser procesado
 */
@Entity('wastes')
export class Waste {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  hazard_class?: string;

  @CreateDateColumn()
  created_at!: Date;

  // Relaciones
  @OneToMany(() => DisposerWaste, (disposerWaste) => disposerWaste.waste)
  disposerWastes!: DisposerWaste[];
}
