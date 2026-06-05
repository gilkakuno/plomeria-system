import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Log } from '../logs/log.entity';

export enum UserRole {
  ADMIN = 'admin',
  TECNICO = 'tecnico',
}

export enum PasswordStrength {
  WEAK = 'debil',
  MEDIUM = 'intermedio',
  STRONG = 'fuerte',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.TECNICO })
  role: UserRole;

  @Column({ type: 'enum', enum: PasswordStrength, default: PasswordStrength.WEAK })
  passwordStrength: PasswordStrength;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  deletedAt: Date;

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];
}
