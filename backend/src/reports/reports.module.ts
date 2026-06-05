import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ProjectsModule } from '../projects/projects.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [ProjectsModule, InventoryModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
