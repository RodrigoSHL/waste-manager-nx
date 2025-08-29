import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Disposer } from './disposer.entity';

/**
 * Entidad que representa los contactos de un dispositor
 * Cada dispositor puede tener múltiples contactos con diferentes roles
 */
@Entity('disposer_contacts')
export class DisposerContact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  disposer_id!: number;

  @Column({ type: 'varchar', length: 255 })
  contact_name!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  role?: string;

  @Column({ type: 'boolean', default: false })
  is_primary!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  // Relaciones
  @ManyToOne(() => Disposer, (disposer) => disposer.contacts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'disposer_id' })
  disposer!: Disposer;
}
