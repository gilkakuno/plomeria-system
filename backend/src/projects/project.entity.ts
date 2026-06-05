import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Client } from '../clients/client.entity';
import { ProjectMaterial } from './project-material.entity';

export enum ProjectStatus {
  PRESUPUESTO = 'presupuesto',
  APROBADO = 'aprobado',
  EN_PROCESO = 'en_proceso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.projects)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.PRESUPUESTO })
  status: ProjectStatus;

  @Column({ nullable: true })
  address: string; // Dirección del trabajo

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  laborCost: number; // Costo de mano de obra

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalMaterials: number; // Total materiales

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number; // Total presupuesto

  @Column({ nullable: true })
  startDate: string;

  @Column({ nullable: true })
  endDate: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'text' })
  contractTerms: string;

  @OneToMany(() => ProjectMaterial, (pm) => pm.project, { cascade: true })
  materials: ProjectMaterial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  deletedAt: Date;
}
