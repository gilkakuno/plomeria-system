import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Project, ProjectStatus } from './project.entity';
import { ProjectMaterial } from './project-material.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { ClientsService } from '../clients/clients.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class ProjectsService implements OnModuleInit {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(ProjectMaterial) private pmRepo: Repository<ProjectMaterial>,
    private clientsService: ClientsService,
    private inventoryService: InventoryService,
  ) { }

  async onModuleInit() {
    // Wait a brief moment to let other services finish seeding
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const count = await this.projectRepo.count();
    if (count === 0) {
      console.log('Seeding default projects...');
      const clients = await this.clientsService.findAll();
      const materials = await this.inventoryService.findAll();

      if (clients.length > 0 && materials.length > 0) {
        const firstClient = clients[0];
        const secondClient = clients[1] || clients[0];

        // Seeding project 1
        await this.create({
          title: 'Instalación de Ducha y Mezcladora de Baño',
          clientId: firstClient.id,
          status: ProjectStatus.PRESUPUESTO,
          address: 'Av. Arce, Edificio Multicentro Piso 4',
          laborCost: 350.00,
          startDate: new Date().toISOString().split('T')[0],
          description: 'Instalación completa de red de agua fría/caliente and grifería mezcladora de ducha.',
          materials: [
            { materialId: materials.find(m => m.name === 'CAÑERIAS 1/2')?.id || materials[0].id, quantity: 4, unitPrice: Number(materials.find(m => m.name === 'CAÑERIAS 1/2')?.salePrice || 40.00) },
            { materialId: materials.find(m => m.name === 'MESCLADORA DE DUCHA')?.id || materials[0].id, quantity: 1, unitPrice: Number(materials.find(m => m.name === 'MESCLADORA DE DUCHA')?.salePrice || 900.00) },
            { materialId: materials.find(m => m.name === 'CODO FF')?.id || materials[0].id, quantity: 6, unitPrice: Number(materials.find(m => m.name === 'CODO FF')?.salePrice || 5.00) },
          ]
        });

        // Seeding project 2
        await this.create({
          title: 'Reparación de Fuga en Tubería Principal',
          clientId: secondClient.id,
          status: ProjectStatus.EN_PROCESO,
          address: 'Zona central, Calle Ayacucho #120',
          laborCost: 150.00,
          startDate: new Date().toISOString().split('T')[0],
          description: 'Detección de filtraciones y cambio de tramo dañado de cañería de 3/4.',
          materials: [
            { materialId: materials.find(m => m.name === 'CAÑERIAS 3/4')?.id || materials[0].id, quantity: 2, unitPrice: Number(materials.find(m => m.name === 'CAÑERIAS 3/4')?.salePrice || 60.00) },
            { materialId: materials.find(m => m.name === 'UNION UNIVERSAL')?.id || materials[0].id, quantity: 2, unitPrice: Number(materials.find(m => m.name === 'UNION UNIVERSAL')?.salePrice || 7.00) },
          ]
        });

        console.log('Projects seeded successfully.');
      }
    }
  }

  private calcTotals(materials: any[], laborCost = 0) {
    const safeLaborCost = Number(laborCost) || 0;
    const totalMaterials = materials.reduce(
      (sum, m) => sum + (Number(m.quantity) || 0) * (Number(m.unitPrice) || 0), 0
    );
    return {
      totalMaterials,
      totalAmount: totalMaterials + safeLaborCost,
    };
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    const { materials = [], ...rest } = dto;
    const totals = this.calcTotals(materials, dto.laborCost);

    const project = this.projectRepo.create({
      ...rest,
      ...totals,
    });
    const saved = await this.projectRepo.save(project);

    // Save materials
    if (materials.length > 0) {
      const pms = materials.map((m) =>
        this.pmRepo.create({
          projectId: saved.id,
          materialId: m.materialId,
          quantity: Number(m.quantity) || 0,
          unitPrice: Number(m.unitPrice) || 0,
          subtotal: (Number(m.quantity) || 0) * (Number(m.unitPrice) || 0),
        })
      );
      await this.pmRepo.save(pms);
    }

    return this.findOne(saved.id);
  }

  async findAll(status?: ProjectStatus, clientId?: string): Promise<Project[]> {
    const where: any = { deletedAt: IsNull() };
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    return this.projectRepo.find({
      where,
      relations: ['client', 'materials', 'materials.material'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['client', 'materials', 'materials.material'],
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    // 1. Verificamos que el proyecto realmente exista primero
    const project = await this.findOne(id);
    const { materials, ...rest } = dto;

    // Objeto contenedor para agrupar los datos planos finales que se van a actualizar
    const updateData: any = { ...rest };

    // 2. Si el cliente envió una lista de materiales para actualizar
    if (materials !== undefined) {
      // Borramos de forma atómica y manual los materiales existentes de este proyecto
      await this.pmRepo.delete({ projectId: id });

      if (materials.length > 0) {
        const pms = materials.map((m) =>
          this.pmRepo.create({
            projectId: id,
            materialId: m.materialId,
            quantity: Number(m.quantity) || 0,
            unitPrice: Number(m.unitPrice) || 0,
            subtotal: (Number(m.quantity) || 0) * (Number(m.unitPrice) || 0),
          })
        );
        await this.pmRepo.save(pms);
      }

      // Recalculamos totales con el nuevo set de materiales
      const totals = this.calcTotals(materials, dto.laborCost ?? project.laborCost);
      Object.assign(updateData, totals);
    } else if (dto.laborCost !== undefined) {
      // 3. Si solo cambia la mano de obra sin enviar materiales
      const currentMaterials = await this.pmRepo.find({ where: { projectId: id } });
      const totals = this.calcTotals(currentMaterials, dto.laborCost);
      updateData.totalAmount = totals.totalAmount;
    }

    // 4. Usamos projectRepo.update en lugar de .save(). Esto evita por completo 
    // que la cascada automática intente meterse con la tabla intermedia.
    await this.projectRepo.update(id, updateData);

    // 5. Retornamos el proyecto fresco y reconstruido de la base de datos
    return this.findOne(id);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    const project = await this.findOne(id);
    project.deletedAt = new Date();
    await this.projectRepo.save(project);
    return { message: 'Proyecto eliminado' };
  }

  async getStats(): Promise<any> {
    const total = await this.projectRepo.count({ where: { deletedAt: IsNull() } });

    const byStatus = await this.projectRepo
      .createQueryBuilder('p')
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('p.deletedAt IS NULL')
      .groupBy('p.status')
      .getRawMany();

    const monthlyRevenue = await this.projectRepo
      .createQueryBuilder('p')
      .select("TO_CHAR(p.createdAt, 'YYYY-MM')", 'month')
      .addSelect('SUM(p.laborCost)', 'laborRevenue')
      .addSelect('SUM(p.totalMaterials)', 'materialsRevenue')
      .addSelect('SUM(p.totalAmount)', 'totalRevenue')
      .where("p.deletedAt IS NULL AND p.status = 'completado'")
      .groupBy("TO_CHAR(p.createdAt, 'YYYY-MM')")
      .orderBy('month', 'DESC')
      .limit(6)
      .getRawMany();

    return { total, byStatus, monthlyRevenue };
  }
}