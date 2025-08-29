import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Disposer } from './disposer.entity';
import { Waste } from './waste.entity';
import { Uom } from './uom.entity';
import { Currency } from './currency.entity';
import { PriceHistory } from './price-history.entity';

/**
 * Entidad que representa la relación muchos-a-muchos entre Disposers y Wastes
 * Define qué residuos procesa cada dispositor y bajo qué condiciones
 */
@Entity('disposer_wastes')
@Unique(['disposer_id', 'waste_id'])
export class DisposerWaste {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  disposer_id!: number;

  @Column({ type: 'int' })
  waste_id!: number;

  @Column({ type: 'int' })
  uom_id!: number;

  @Column({ type: 'int' })
  currency_id!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  min_lot?: number;

  @Column({ type: 'int', nullable: true })
  lead_time_days?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Disposer, (disposer) => disposer.disposerWastes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'disposer_id' })
  disposer!: Disposer;

  @ManyToOne(() => Waste, (waste) => waste.disposerWastes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'waste_id' })
  waste!: Waste;

  @ManyToOne(() => Uom, { eager: true })
  @JoinColumn({ name: 'uom_id' })
  uom!: Uom;

  @ManyToOne(() => Currency, { eager: true })
  @JoinColumn({ name: 'currency_id' })
  currency!: Currency;

  @OneToMany(() => PriceHistory, (priceHistory) => priceHistory.disposerWaste)
  priceHistory!: PriceHistory[];
}
