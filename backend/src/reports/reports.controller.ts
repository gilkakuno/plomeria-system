import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('contract/:projectId')
  async getContract(@Param('projectId') projectId: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.reportsService.generateContractPdf(projectId);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contrato-${projectId}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: 'Error generando PDF', error: error.message });
    }
  }

  @Get('statistics')
  getStatistics() {
    return this.reportsService.getStatistics();
  }
}
