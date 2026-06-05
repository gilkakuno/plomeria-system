import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post()
  create(@Body() dto: CreateMaterialDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  findAll(@Query('search') search?: string, @Query('category') category?: string) {
    return this.inventoryService.findAll(search, category);
  }

  @Get('alerts/low-stock')
  getLowStock() {
    return this.inventoryService.getLowStockAlerts();
  }

  @Get('categories')
  getCategories() {
    return this.inventoryService.getCategories();
  }

  @Get('stats/top-used')
  getTopUsed() {
    return this.inventoryService.getTopUsed();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.softDelete(id);
  }
}
