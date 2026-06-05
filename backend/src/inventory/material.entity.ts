import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum MaterialUnit {
  UNIDAD = 'unidad',
  METRO = 'metro',
  ROLLO = 'rollo',
  CAJA = 'caja',
  KG = 'kg',
  LITRO = 'litro',
}

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  code: string; // Código de referencia

  @Column({ type: 'enum', enum: MaterialUnit, default: MaterialUnit.UNIDAD })
  unit: MaterialUnit;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchasePrice: number; // Precio de compra

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salePrice: number; // Precio de venta

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 5 })
  minStock: number; // Alerta de stock mínimo

  @Column({ nullable: true })
  category: string; // Tuberías, Conexiones, Herramientas, etc.

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  deletedAt: Date; // Eliminación lógica
}
