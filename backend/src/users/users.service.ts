import { Injectable, ConflictException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, PasswordStrength } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.userRepo.count();
    if (count === 0) {
      console.log('Seeding default Admin user...');
      const strength = this.evaluatePasswordStrength('AdminPassword123!');
      const hashed = await bcrypt.hash('AdminPassword123!', 12);
      const user = this.userRepo.create({
        username: 'admin',
        email: 'admin@plomeria.com',
        password: hashed,
        fullName: 'Administrador Sistema',
        role: UserRole.ADMIN,
        passwordStrength: strength,
        isActive: true,
      });
      await this.userRepo.save(user);
      console.log('Default Admin user seeded successfully.');
    }
  }

  evaluatePasswordStrength(password: string): PasswordStrength {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLong = password.length >= 10;

    const score = [hasUpper, hasLower, hasNumber, hasSpecial, isLong].filter(Boolean).length;

    if (score <= 2) return PasswordStrength.WEAK;
    if (score <= 3) return PasswordStrength.MEDIUM;
    return PasswordStrength.STRONG;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (existing) throw new ConflictException('Usuario o email ya existe');

    const strength = this.evaluatePasswordStrength(dto.password);
    const hashed = await bcrypt.hash(dto.password, 12);

    const user = this.userRepo.create({
      ...dto,
      password: hashed,
      passwordStrength: strength,
    });
    return this.userRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ where: { deletedAt: IsNull() } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepo.update(id, { lastLogin: new Date() });
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.deletedAt = new Date();
    await this.userRepo.save(user);
  }

  async getStats(): Promise<any> {
    const total = await this.userRepo.count({ where: { deletedAt: IsNull() } });
    const admins = await this.userRepo.count({ where: { role: UserRole.ADMIN, deletedAt: IsNull() } });
    const tecnicos = await this.userRepo.count({ where: { role: UserRole.TECNICO, deletedAt: IsNull() } });
    return { total, admins, tecnicos };
  }
}
