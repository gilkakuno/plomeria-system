import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike } from 'typeorm';
import { Material, MaterialUnit } from './material.entity';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';

@Injectable()
export class InventoryService implements OnModuleInit {
  constructor(
    @InjectRepository(Material) private materialRepo: Repository<Material>,
  ) {}

  async onModuleInit() {
    const count = await this.materialRepo.count();
    if (count === 0) {
      console.log('Seeding materials into database...');
      const seedMaterials = [
        // Materiales
        { name: 'CAÑERIAS 1/2', code: 'CAN-12', unit: MaterialUnit.METRO, purchasePrice: 30.00, salePrice: 40.00, stock: 100, minStock: 10, category: 'Materiales' },
        { name: 'CAÑERIAS 3/4', code: 'CAN-34', unit: MaterialUnit.METRO, purchasePrice: 45.00, salePrice: 60.00, stock: 80, minStock: 10, category: 'Materiales' },
        { name: 'CAÑERIAS 1', code: 'CAN-1', unit: MaterialUnit.METRO, purchasePrice: 60.00, salePrice: 80.00, stock: 50, minStock: 10, category: 'Materiales' },
        { name: 'CAÑERIA DE 1/2 HIDRO 3', code: 'CAN-H12', unit: MaterialUnit.METRO, purchasePrice: 60.00, salePrice: 80.00, stock: 120, minStock: 10, category: 'Materiales' },
        { name: 'CAÑERIA DE 3/4 HIDRO 3', code: 'CAN-H34', unit: MaterialUnit.METRO, purchasePrice: 90.00, salePrice: 120.00, stock: 90, minStock: 10, category: 'Materiales' },
        { name: 'CAÑERIA DE 1 HIDRO 3', code: 'CAN-H1', unit: MaterialUnit.METRO, purchasePrice: 110.00, salePrice: 150.00, stock: 60, minStock: 10, category: 'Materiales' },
        { name: '"T" FF', code: 'T-FF', unit: MaterialUnit.UNIDAD, purchasePrice: 4.50, salePrice: 6.00, stock: 150, minStock: 15, category: 'Materiales' },
        { name: 'CODO FF', code: 'COD-FF', unit: MaterialUnit.UNIDAD, purchasePrice: 3.50, salePrice: 5.00, stock: 200, minStock: 15, category: 'Materiales' },
        { name: 'CODO PAVCO', code: 'COD-PAV', unit: MaterialUnit.UNIDAD, purchasePrice: 2.80, salePrice: 4.00, stock: 300, minStock: 20, category: 'Materiales' },
        { name: '"T" PAVCO', code: 'T-PAV', unit: MaterialUnit.UNIDAD, purchasePrice: 3.50, salePrice: 5.00, stock: 250, minStock: 20, category: 'Materiales' },
        { name: 'NIPLES', code: 'NIP', unit: MaterialUnit.UNIDAD, purchasePrice: 2.00, salePrice: 3.00, stock: 400, minStock: 25, category: 'Materiales' },
        { name: 'UNION UNIVERSAL', code: 'UNI-UNI', unit: MaterialUnit.UNIDAD, purchasePrice: 5.00, salePrice: 7.00, stock: 150, minStock: 15, category: 'Materiales' },
        { name: 'LLAVE DE PASO', code: 'LLA-PAS', unit: MaterialUnit.UNIDAD, purchasePrice: 100.00, salePrice: 140.00, stock: 50, minStock: 5, category: 'Materiales' },
        { name: 'MESCLADORA DE DUCHA', code: 'MIX-DOU', unit: MaterialUnit.UNIDAD, purchasePrice: 700.00, salePrice: 900.00, stock: 30, minStock: 5, category: 'Materiales' },
        { name: 'REDUCCION 1 1/2', code: 'RED-15', unit: MaterialUnit.UNIDAD, purchasePrice: 4.50, salePrice: 6.00, stock: 100, minStock: 10, category: 'Materiales' },
        { name: 'REDUCCION 3/4 - 1/2', code: 'RED-34-12', unit: MaterialUnit.UNIDAD, purchasePrice: 3.80, salePrice: 5.00, stock: 120, minStock: 10, category: 'Materiales' },
        { name: 'REDUCCION 1 1/2 - 1', code: 'RED-15-1', unit: MaterialUnit.UNIDAD, purchasePrice: 4.50, salePrice: 6.00, stock: 100, minStock: 10, category: 'Materiales' },
        { name: 'REDUCCION 1 1/2 - 1/2', code: 'RED-15-12', unit: MaterialUnit.UNIDAD, purchasePrice: 6.00, salePrice: 8.00, stock: 100, minStock: 10, category: 'Materiales' },
        { name: 'REDUCCION 1 1/2 - 3/4', code: 'RED-15-34', unit: MaterialUnit.UNIDAD, purchasePrice: 7.50, salePrice: 10.00, stock: 100, minStock: 10, category: 'Materiales' },
        { name: 'CODO CON METAL DE 1/2', code: 'COD-MET-12', unit: MaterialUnit.UNIDAD, purchasePrice: 18.00, salePrice: 24.00, stock: 150, minStock: 15, category: 'Materiales' },
        { name: '"T" CON METAL', code: 'T-MET', unit: MaterialUnit.UNIDAD, purchasePrice: 18.50, salePrice: 25.00, stock: 120, minStock: 15, category: 'Materiales' },

        // Sanitarios
        { name: '"Y" CODO 4X4', code: 'Y-COD-44', unit: MaterialUnit.UNIDAD, purchasePrice: 22.00, salePrice: 30.00, stock: 80, minStock: 8, category: 'Sanitarios' },
        { name: '"Y" CODO 4X2 1/2', code: 'Y-COD-425', unit: MaterialUnit.UNIDAD, purchasePrice: 20.00, salePrice: 28.00, stock: 90, minStock: 8, category: 'Sanitarios' },
        { name: '"Y" 4X2 1/2', code: 'Y-425', unit: MaterialUnit.UNIDAD, purchasePrice: 15.00, salePrice: 20.00, stock: 100, minStock: 10, category: 'Sanitarios' },
        { name: 'CODO 4 SDR', code: 'COD-4-SDR', unit: MaterialUnit.UNIDAD, purchasePrice: 10.00, salePrice: 14.00, stock: 120, minStock: 10, category: 'Sanitarios' },
        { name: 'CODO DE 1/2 C9', code: 'COD-12-C9', unit: MaterialUnit.UNIDAD, purchasePrice: 3.50, salePrice: 5.00, stock: 200, minStock: 15, category: 'Sanitarios' },
        { name: 'CODO DE 2 C9', code: 'COD-2-C9', unit: MaterialUnit.UNIDAD, purchasePrice: 4.50, salePrice: 6.00, stock: 180, minStock: 15, category: 'Sanitarios' },
        { name: 'CODO 2X45 C9', code: 'COD-245-C9', unit: MaterialUnit.UNIDAD, purchasePrice: 4.50, salePrice: 6.00, stock: 150, minStock: 15, category: 'Sanitarios' },
        { name: 'CAJA DE INSPECCION 40X6', code: 'BOX-INS-406', unit: MaterialUnit.UNIDAD, purchasePrice: 45.00, salePrice: 60.00, stock: 40, minStock: 5, category: 'Sanitarios' },
        { name: 'CODO DE 4X45', code: 'COD-445', unit: MaterialUnit.UNIDAD, purchasePrice: 10.00, salePrice: 14.00, stock: 110, minStock: 10, category: 'Sanitarios' }
      ];

      for (const mat of seedMaterials) {
        const material = this.materialRepo.create(mat);
        await this.materialRepo.save(material);
      }
      console.log('Materials seeded successfully.');
    }
  }

  async create(dto: CreateMaterialDto): Promise<Material> {
    const material = this.materialRepo.create(dto);
    return this.materialRepo.save(material);
  }

  async findAll(search?: string, category?: string): Promise<Material[]> {
    const where: any = { deletedAt: IsNull() };
    if (search) where.name = ILike(`%${search}%`);
    if (category) where.category = category;
    return this.materialRepo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Material> {
    const material = await this.materialRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!material) throw new NotFoundException('Material no encontrado');
    return material;
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<Material> {
    const material = await this.findOne(id);
    Object.assign(material, dto);
    return this.materialRepo.save(material);
  }

  // Eliminación LÓGICA - no borra de la base de datos
  async softDelete(id: string): Promise<{ message: string }> {
    const material = await this.findOne(id);
    material.deletedAt = new Date();
    await this.materialRepo.save(material);
    return { message: 'Material eliminado correctamente' };
  }

  async getLowStockAlerts(): Promise<Material[]> {
    return this.materialRepo
      .createQueryBuilder('m')
      .where('m.deletedAt IS NULL')
      .andWhere('m.stock <= m.minStock')
      .getMany();
  }

  async getCategories(): Promise<string[]> {
    const result = await this.materialRepo
      .createQueryBuilder('m')
      .select('DISTINCT m.category', 'category')
      .where('m.deletedAt IS NULL AND m.category IS NOT NULL')
      .getRawMany();
    return result.map((r) => r.category);
  }

  async updateStock(id: string, quantity: number): Promise<Material> {
    const material = await this.findOne(id);
    material.stock = Math.max(0, material.stock - quantity);
    return this.materialRepo.save(material);
  }

  async getTopUsed(): Promise<any[]> {
    // Returns materials sorted by usage in projects
    return this.materialRepo
      .createQueryBuilder('m')
      .leftJoin('project_materials', 'pm', 'pm.materialId = m.id')
      .select(['m.id', 'm.name', 'm.category'])
      .addSelect('SUM(pm.quantity)', 'totalUsed')
      .where('m.deletedAt IS NULL')
      .groupBy('m.id')
      .orderBy('"totalUsed"', 'DESC')
      .limit(5)
      .getRawMany();
  }
}
