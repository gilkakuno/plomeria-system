import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.logs, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  event: string; // LOGIN, LOGOUT, LOGIN_FALLIDO, CREAR_PRESUPUESTO, etc.

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true, length: 500 })
  browser: string;

  @Column({ nullable: true, length: 1000 })
  details: string;

  @CreateDateColumn()
  createdAt: Date;
}
