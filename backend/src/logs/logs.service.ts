import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './log.entity';

interface CreateLogDto {
  userId?: string;
  event: string;
  ip?: string;
  browser?: string;
  details?: string;
}

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log) private logRepo: Repository<Log>,
  ) {}

  async createLog(data: CreateLogDto): Promise<Log> {
    const log = this.logRepo.create(data);
    return this.logRepo.save(log);
  }

  async findAll(page = 1, limit = 50): Promise<{ data: Log[]; total: number }> {
    const [data, total] = await this.logRepo.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findByUser(userId: string): Promise<Log[]> {
    return this.logRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
