import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike } from 'typeorm';
import { Client } from './client.entity';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString() @IsNotEmpty() fullName: string;
  @IsOptional() @IsString() ci?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() notes?: string;
}

@Injectable()
export class ClientsService implements OnModuleInit {
  constructor(@InjectRepository(Client) private clientRepo: Repository<Client>) {}

  async onModuleInit() {
    const count = await this.clientRepo.count();
    if (count === 0) {
      console.log('Seeding default clients...');
      const seedClients = [
        { fullName: 'Juan Pérez', ci: '1234567 LP', phone: '76543210', email: 'juan.perez@email.com', address: 'Av. Arce 1234, Sopocachi', city: 'La Paz', notes: 'Cliente frecuente' },
        { fullName: 'María Rodriguez', ci: '7654321 CB', phone: '71234567', email: 'maria.rod@email.com', address: 'Calle España 456', city: 'Cochabamba', notes: 'Instalaciones domiciliarias' },
        { fullName: 'Carlos Condori', ci: '8765432 SC', phone: '67890123', email: 'carlos.c@email.com', address: 'Doble Vía La Guardia Km 6', city: 'Santa Cruz', notes: 'Mantenimiento preventivo' },
      ];
      for (const cl of seedClients) {
        const client = this.clientRepo.create(cl);
        await this.clientRepo.save(client);
      }
      console.log('Clients seeded successfully.');
    }
  }

  async create(dto: CreateClientDto): Promise<Client> {
    const client = this.clientRepo.create(dto);
    return this.clientRepo.save(client);
  }

  async findAll(search?: string): Promise<Client[]> {
    const where: any = { deletedAt: IsNull() };
    if (search) where.fullName = ILike(`%${search}%`);
    const clients = await this.clientRepo.find({ where, order: { fullName: 'ASC' }, relations: ['projects'] });
    return clients.map(c => ({
      ...c,
      projects: c.projects ? c.projects.filter(p => !p.deletedAt) : []
    }));
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['projects'],
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return client;
  }

  async update(id: string, dto: Partial<CreateClientDto>): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, dto);
    return this.clientRepo.save(client);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    const client = await this.findOne(id);
    client.deletedAt = new Date();
    await this.clientRepo.save(client);
    return { message: 'Cliente eliminado' };
  }

  async getStats(): Promise<any> {
    const total = await this.clientRepo.count({ where: { deletedAt: IsNull() } });
    return { total };
  }
}
