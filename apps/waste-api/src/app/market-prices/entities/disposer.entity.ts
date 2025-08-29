import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DisposerContact } from './disposer-contact.entity';
import { DisposerWaste } from './disposer-waste.entity';

/**
 * Entidad que representa a un dispositor de residuos
 * Un dispositor es una empresa que recibe y procesa residuos de otros
 */
@Entity('disposers')
export class Disposer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  legal_name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  trade_name?: string;

  @Column({ type: 'varchar', length: 12, unique: true })
  rut!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relaciones
  @OneToMany(() => DisposerContact, (contact) => contact.disposer, {
    cascade: true,
  })
  contacts!: DisposerContact[];

  @OneToMany(() => DisposerWaste, (disposerWaste) => disposerWaste.disposer)
  disposerWastes!: DisposerWaste[];
}
