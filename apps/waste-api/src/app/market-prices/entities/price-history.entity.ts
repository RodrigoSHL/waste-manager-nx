import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DisposerWaste } from './disposer-waste.entity';

/**
 * Entidad que representa el historial de precios
 * Almacena los precios históricos con períodos de validez para cada combinación dispositor-residuo
 */
@Entity('price_history')
export class PriceHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  disposer_waste_id!: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  price!: number;

  @Column({ type: 'tstzrange' })
  price_period!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at!: Date;

  // Relaciones
  @ManyToOne(() => DisposerWaste, (disposerWaste) => disposerWaste.priceHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'disposer_waste_id' })
  disposerWaste!: DisposerWaste;
}
