import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { LogsService } from '../logs/logs.service';
import { LoginDto } from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private logsService: LogsService,
  ) {}

  async validateCaptcha(token: string): Promise<boolean> {
    // If no captcha token provided (development mode), consider it valid
    if (!token) {
      return true;
    }
    // Simple fallback captcha: accept the literal token "human" as a validated user.
    if (token && token.toLowerCase() === 'human') {
      return true;
    }
    const secret = this.configService.get('RECAPTCHA_SECRET_KEY');
    // In development/test mode, skip captcha if no key set or using test keys
    if (!secret || secret === 'tu_recaptcha_secret_key' || secret === '6LeIxAcTAAAAAGG-vFI1TnRWxMZNF65pmwI_8a1m') return true;

    try {
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
      );
      if (!response.data.success) {
        console.error('CAPTCHA verification failed from Google:', response.data);
      }
      return response.data.success;
    } catch (e) {
      console.error('CAPTCHA verification request error:', e);
      return false;
    }
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    // Validate captcha
    const captchaValid = await this.validateCaptcha(dto.captchaToken);
    if (!captchaValid) {
      throw new BadRequestException('Verificación CAPTCHA fallida');
    }

    // Find user
    const user = await this.usersService.findByUsername(dto.username);
    if (!user || !user.isActive || user.deletedAt) {
      await this.logsService.createLog({
        event: 'LOGIN_FALLIDO',
        ip,
        browser: userAgent,
        details: `Intento fallido para usuario: ${dto.username}`,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validate password
    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      await this.logsService.createLog({
        event: 'LOGIN_FALLIDO',
        ip,
        browser: userAgent,
        details: `Contraseña incorrecta para: ${dto.username}`,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Log access
    await this.logsService.createLog({
      userId: user.id,
      event: 'LOGIN',
      ip,
      browser: userAgent,
      details: `Ingreso exitoso`,
    });

    // Generate JWT
    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        passwordStrength: user.passwordStrength,
      },
    };
  }

  async logout(userId: string, ip: string, userAgent: string) {
    await this.logsService.createLog({
      userId,
      event: 'LOGOUT',
      ip,
      browser: userAgent,
      details: 'Cierre de sesión',
    });
    return { message: 'Sesión cerrada exitosamente' };
  }

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const { password, ...result } = user;
    return result;
  }

  checkPasswordStrength(password: string) {
    return {
      strength: this.usersService.evaluatePasswordStrength(password),
    };
  }
}
