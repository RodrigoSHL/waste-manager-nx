import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entidad que representa las unidades de medida
 * Define las unidades en las que se pueden medir los residuos (kg, ton, etc.)
 */
@Entity('uoms')
export class Uom {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;
}
