import { Module, OnModuleInit } from '@nestjs/common'; // <-- Agregado Module de forma limpia
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Importaciones de tus módulos del sistema
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/user.entity';
import { InventoryModule } from './inventory/inventory.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { LogsModule } from './logs/logs.module';
import { ReportsModule } from './reports/reports.module';
import { AiAgentModule } from './ai-agent/ai-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', '123456'), // Tu contraseña correcta
        database: configService.get('DB_NAME', 'plomeria_db'),
        autoLoadEntities: true,
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    InventoryModule,
    ClientsModule,
    ProjectsModule,
    LogsModule,
    ReportsModule,
    AiAgentModule,
  ],
})
export class AppModule implements OnModuleInit {
  // Inyectamos el servicio de usuarios aquí de forma limpia para que actúe como tu seeder automático
  constructor(private readonly usersService: UsersService) { }

  async onModuleInit() {
    try {
      const admin = await this.usersService.findByUsername('admin');
      if (!admin) {
        await this.usersService.create({
          username: 'admin',
          email: 'admin@plomeria.com',
          password: 'Admin123!', // Tu contraseña que querías usar en la web
          fullName: 'Administrador Sistema',
          role: UserRole.ADMIN,
        });
        console.log('✅ Admin user created automatically');
      }
    } catch (e) {
      console.error('Error creating admin user', e);
    }
  }
}