import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../project.entity';

export class ProjectMaterialDto {
  @IsString() @IsNotEmpty() materialId: string;
  @Type(() => Number) @IsNumber() @Min(1) quantity: number;
  @Type(() => Number) @IsNumber() @Min(0) unitPrice: number;
}

export class CreateProjectDto {
  @ApiProperty()
  @IsString() @IsNotEmpty() title: string;

  @IsOptional() @IsString() description?: string;

  @ApiProperty()
  @IsString() @IsNotEmpty() clientId: string;

  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;

  @IsOptional() @IsString() address?: string;

  @Type(() => Number) @IsNumber() @Min(0) @IsOptional() laborCost?: number;

  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() contractTerms?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectMaterialDto)
  materials?: ProjectMaterialDto[];
}

export class UpdateProjectDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() clientId?: string;
  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) laborCost?: number;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() contractTerms?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProjectMaterialDto) materials?: ProjectMaterialDto[];
}
