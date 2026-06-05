import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { AiAgentService } from './ai-agent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryService } from '../inventory/inventory.service';

class AgentRequestDto {
  @IsString() @IsNotEmpty() description: string;
}

@ApiTags('ai-agent')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/ai-agent')
export class AiAgentController {
  constructor(
    private aiAgentService: AiAgentService,
    private inventoryService: InventoryService,
  ) {}

  @Post('analyze')
  async analyze(@Body() dto: AgentRequestDto) {
    const materials = await this.inventoryService.findAll();
    return this.aiAgentService.analyzeBudgetRequest(dto.description, materials);
  }
}
