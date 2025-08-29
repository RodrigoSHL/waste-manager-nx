import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entidad que representa las monedas
 * Define las monedas en las que se pueden expresar los precios
 */
@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 5, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 10 })
  symbol!: string;

  @Column({ type: 'int', default: 2 })
  decimals!: number;
}
