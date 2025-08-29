import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DisposerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('disposers')
export class Disposer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'simple-array' })
  wasteTypes!: string[];

  @Column({ type: 'text' })
  location!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  plasticRate!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cardboardRate!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  metalRate!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  organicRate!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  glassRate!: number;

  @Column({
    type: 'enum',
    enum: DisposerStatus,
    default: DisposerStatus.ACTIVE,
  })
  status!: DisposerStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
