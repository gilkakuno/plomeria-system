import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { InventoryService } from '../inventory/inventory.service';
import PdfPrinter from 'pdfmake';

@Injectable()
export class ReportsService {
  private printer: any;

  constructor(
    private projectsService: ProjectsService,
    private inventoryService: InventoryService,
  ) {
    const fonts = {
      Roboto: {
        normal: 'fonts/Roboto-Regular.ttf',
        bold: 'fonts/Roboto-Bold.ttf',
        italics: 'fonts/Roboto-Italic.ttf',
        bolditalics: 'fonts/Roboto-BoldItalic.ttf',
      },
    };
    try {
      this.printer = new PdfPrinter(fonts);
    } catch (e) {
      // fallback
    }
  }

  async generateContractPdf(projectId: string): Promise<Buffer> {
    const project = await this.projectsService.findOne(projectId);

    const materialsRows = project.materials?.map((pm) => [
      { text: pm.material?.name || '', style: 'tableCell' },
      { text: pm.material?.unit || 'unidad', style: 'tableCell', alignment: 'center' },
      { text: pm.quantity.toString(), style: 'tableCell', alignment: 'center' },
      { text: `Bs. ${Number(pm.unitPrice).toFixed(2)}`, style: 'tableCell', alignment: 'right' },
      { text: `Bs. ${Number(pm.subtotal).toFixed(2)}`, style: 'tableCell', alignment: 'right' },
    ]) || [];

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Header
        {
          columns: [
            {
              stack: [
                { text: 'EMPRESA DE PLOMERÍA', style: 'companyName' },
                { text: 'Servicios Profesionales de Plomería', style: 'companySubtitle' },
                { text: 'Tel: +591 XXX-XXXX | La Paz, Bolivia', style: 'companyContact' },
              ],
            },
            {
              stack: [
                { text: 'PRESUPUESTO / CONTRATO', style: 'documentTitle' },
                { text: `N° ${project.id.substring(0, 8).toUpperCase()}`, style: 'documentNumber' },
                { text: `Fecha: ${new Date().toLocaleDateString('es-BO')}`, style: 'documentDate' },
              ],
              alignment: 'right',
            },
          ],
          margin: [0, 0, 0, 20],
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#1e40af' }] },
        { text: '', margin: [0, 10] },

        // Client info
        {
          style: 'sectionHeader',
          text: 'DATOS DEL CLIENTE',
        },
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [{ text: 'Cliente:', bold: true }, project.client?.fullName || ''],
              [{ text: 'CI:', bold: true }, project.client?.ci || '-'],
              [{ text: 'Teléfono:', bold: true }, project.client?.phone || '-'],
              [{ text: 'Dirección del trabajo:', bold: true }, project.address || project.client?.address || '-'],
            ],
          },
          layout: 'noBorders',
          margin: [0, 5, 0, 15],
        },

        // Work description
        { style: 'sectionHeader', text: 'DESCRIPCIÓN DEL TRABAJO' },
        { text: project.description || project.title, style: 'normalText', margin: [0, 5, 0, 15] },

        // Materials table
        { style: 'sectionHeader', text: 'LISTA DE MATERIALES' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Material', style: 'tableHeader' },
                { text: 'Unidad', style: 'tableHeader', alignment: 'center' },
                { text: 'Cant.', style: 'tableHeader', alignment: 'center' },
                { text: 'P. Unit.', style: 'tableHeader', alignment: 'right' },
                { text: 'Subtotal', style: 'tableHeader', alignment: 'right' },
              ],
              ...materialsRows,
            ],
          },
          margin: [0, 5, 0, 5],
        },

        // Totals
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [{ text: 'Total Materiales:', bold: true, alignment: 'right' }, { text: `Bs. ${Number(project.totalMaterials).toFixed(2)}`, alignment: 'right' }],
              [{ text: 'Mano de Obra:', bold: true, alignment: 'right' }, { text: `Bs. ${Number(project.laborCost).toFixed(2)}`, alignment: 'right' }],
              [{ text: 'TOTAL GENERAL:', bold: true, fontSize: 14, alignment: 'right', fillColor: '#1e40af', color: 'white' }, { text: `Bs. ${Number(project.totalAmount).toFixed(2)}`, bold: true, fontSize: 14, alignment: 'right', fillColor: '#1e40af', color: 'white' }],
            ],
          },
          layout: 'noBorders',
          margin: [0, 10, 0, 20],
        },

        // Terms
        { style: 'sectionHeader', text: 'TÉRMINOS Y CONDICIONES' },
        {
          text: project.contractTerms || '1. El presupuesto es válido por 15 días.\n2. Se requiere 50% de anticipo para iniciar el trabajo.\n3. El saldo se cancela al finalizar la obra.\n4. Garantía de 6 meses en mano de obra.',
          style: 'normalText',
          margin: [0, 5, 0, 30],
        },

        // Signatures
        {
          columns: [
            {
              stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
                { text: 'Empresa de Plomería', alignment: 'center', style: 'signatureLabel' },
              ],
            },
            {
              stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
                { text: project.client?.fullName || 'Cliente', alignment: 'center', style: 'signatureLabel' },
              ],
            },
          ],
        },
      ],
      styles: {
        companyName: { fontSize: 18, bold: true, color: '#1e40af' },
        companySubtitle: { fontSize: 10, color: '#6b7280' },
        companyContact: { fontSize: 9, color: '#6b7280' },
        documentTitle: { fontSize: 14, bold: true, color: '#1e40af' },
        documentNumber: { fontSize: 11, bold: true },
        documentDate: { fontSize: 10, color: '#6b7280' },
        sectionHeader: { fontSize: 12, bold: true, color: '#1e40af', margin: [0, 10, 0, 5] },
        tableHeader: { bold: true, fillColor: '#1e40af', color: 'white', padding: 6 },
        tableCell: { fontSize: 10 },
        normalText: { fontSize: 10, lineHeight: 1.5 },
        signatureLabel: { fontSize: 9, color: '#6b7280', margin: [0, 5, 0, 0] },
      },
      defaultStyle: { font: 'Roboto', fontSize: 10 },
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);
        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async getStatistics(): Promise<any> {
    const projectStats = await this.projectsService.getStats();
    const topMaterials = await this.inventoryService.getTopUsed();
    const lowStock = await this.inventoryService.getLowStockAlerts();

    return {
      projects: projectStats,
      topMaterials,
      lowStockAlerts: lowStock.length,
    };
  }
}
