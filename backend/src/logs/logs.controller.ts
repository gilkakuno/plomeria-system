import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('api/logs')
export class LogsController {
  constructor(private logsService: LogsService) {}

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 50) {
    return this.logsService.findAll(+page, +limit);
  }

  @Get('user/:userId')
  findByUser(@Query('userId') userId: string) {
    return this.logsService.findByUser(userId);
  }
}
