import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { WasteType } from '../entities/waste-type.entity';
import { WasteCategory } from '../entities/waste-category.entity';
import { Waste } from '../entities/waste.entity';
import { 
  ExcelWasteRowDto, 
  BulkUploadResultDto, 
  ValidationErrorDto 
} from '../dto/bulk-upload.dto';

@Injectable()
export class BulkUploadService {
  constructor(
    @InjectRepository(WasteType)
    private readonly wasteTypeRepository: Repository<WasteType>,
    @InjectRepository(WasteCategory)
    private readonly wasteCategoryRepository: Repository<WasteCategory>,
    @InjectRepository(Waste)
    private readonly wasteRepository: Repository<Waste>,
  ) {}

  async processExcelFile(buffer: Buffer): Promise<BulkUploadResultDto> {
    try {
      // Leer el archivo Excel
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a JSON
      const rawData: unknown[] = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
      });

      if (rawData.length < 2) {
        throw new BadRequestException('El archivo debe contener al menos una fila de encabezados y una fila de datos');
      }

      // Obtener encabezados y datos
      const headers = rawData[0] as string[];
      const dataRows = rawData.slice(1) as string[][];

      // Validar encabezados requeridos
      this.validateHeaders(headers);

      // Convertir datos a DTOs
      const excelData = this.parseDataRows(headers, dataRows);

      // Validar datos
      const validationErrors = this.validateData(excelData);
      
      // Procesar datos válidos
      const result = await this.processValidData(excelData, validationErrors);

      return result;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`Error procesando archivo Excel: ${errorMessage}`);
    }
  }

  private validateHeaders(headers: string[]): void {
    const requiredHeaders = [
      'tipo_codigo',
      'tipo_nombre', 
      'categoria_codigo',
      'categoria_nombre',
      'producto_codigo',
      'producto_nombre'
    ];

    const missingHeaders = requiredHeaders.filter(header => 
      !headers.some(h => h.toLowerCase().trim() === header.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Faltan columnas requeridas: ${missingHeaders.join(', ')}`
      );
    }
  }

  private parseDataRows(headers: string[], dataRows: string[][]): ExcelWasteRowDto[] {
    return dataRows.map((row, index) => {
      const rowData: Partial<ExcelWasteRowDto> = { fila: index + 2 }; // +2 porque index 0 es headers
      
      headers.forEach((header, colIndex) => {
        const normalizedHeader = header.toLowerCase().trim();
        const cellValue = row[colIndex]?.toString().trim() || '';
        
        switch (normalizedHeader) {
          case 'tipo_codigo':
            rowData.tipo_codigo = cellValue;
            break;
          case 'tipo_nombre':
            rowData.tipo_nombre = cellValue;
            break;
          case 'categoria_codigo':
            rowData.categoria_codigo = cellValue;
            break;
          case 'categoria_nombre':
            rowData.categoria_nombre = cellValue;
            break;
          case 'producto_codigo':
            rowData.producto_codigo = cellValue;
            break;
          case 'producto_nombre':
            rowData.producto_nombre = cellValue;
            break;
          case 'subproducto':
            rowData.subproducto = cellValue || undefined;
            break;
          case 'descripcion':
            rowData.descripcion = cellValue || undefined;
            break;
          case 'clase_peligro':
            rowData.clase_peligro = cellValue || undefined;
            break;
          case 'especificaciones_tecnicas':
            rowData.especificaciones_tecnicas = cellValue || undefined;
            break;
        }
      });

      return rowData as ExcelWasteRowDto;
    });
  }

  private validateData(data: ExcelWasteRowDto[]): ValidationErrorDto[] {
    const errors: ValidationErrorDto[] = [];

    data.forEach((row) => {
      // Validar campos requeridos
      if (!row.tipo_codigo) {
        errors.push({
          row: row.fila || 0,
          field: 'tipo_codigo',
          value: row.tipo_codigo,
          message: 'Código de tipo es requerido',
          severity: 'error'
        });
      }

      if (!row.tipo_nombre) {
        errors.push({
          row: row.fila || 0,
          field: 'tipo_nombre',
          value: row.tipo_nombre,
          message: 'Nombre de tipo es requerido',
          severity: 'error'
        });
      }

      if (!row.categoria_codigo) {
        errors.push({
          row: row.fila || 0,
          field: 'categoria_codigo',
          value: row.categoria_codigo,
          message: 'Código de categoría es requerido',
          severity: 'error'
        });
      }

      if (!row.categoria_nombre) {
        errors.push({
          row: row.fila || 0,
          field: 'categoria_nombre',
          value: row.categoria_nombre,
          message: 'Nombre de categoría es requerido',
          severity: 'error'
        });
      }

      if (!row.producto_codigo) {
        errors.push({
          row: row.fila || 0,
          field: 'producto_codigo',
          value: row.producto_codigo,
          message: 'Código de producto es requerido',
          severity: 'error'
        });
      }

      if (!row.producto_nombre) {
        errors.push({
          row: row.fila || 0,
          field: 'producto_nombre',
          value: row.producto_nombre,
          message: 'Nombre de producto es requerido',
          severity: 'error'
        });
      }

      // Validar formato de especificaciones técnicas (debe ser JSON válido)
      if (row.especificaciones_tecnicas) {
        try {
          JSON.parse(row.especificaciones_tecnicas);
        } catch {
          errors.push({
            row: row.fila || 0,
            field: 'especificaciones_tecnicas',
            value: row.especificaciones_tecnicas,
            message: 'Especificaciones técnicas debe ser JSON válido',
            severity: 'warning'
          });
        }
      }

      // Validar longitud de códigos
      if (row.tipo_codigo && row.tipo_codigo.length > 20) {
        errors.push({
          row: row.fila || 0,
          field: 'tipo_codigo',
          value: row.tipo_codigo,
          message: 'Código de tipo no puede exceder 20 caracteres',
          severity: 'error'
        });
      }

      if (row.categoria_codigo && row.categoria_codigo.length > 50) {
        errors.push({
          row: row.fila || 0,
          field: 'categoria_codigo',
          value: row.categoria_codigo,
          message: 'Código de categoría no puede exceder 50 caracteres',
          severity: 'error'
        });
      }

      if (row.producto_codigo && row.producto_codigo.length > 50) {
        errors.push({
          row: row.fila || 0,
          field: 'producto_codigo',
          value: row.producto_codigo,
          message: 'Código de producto no puede exceder 50 caracteres',
          severity: 'error'
        });
      }
    });

    return errors;
  }

  private async processValidData(
    data: ExcelWasteRowDto[], 
    validationErrors: ValidationErrorDto[]
  ): Promise<BulkUploadResultDto> {
    const result: BulkUploadResultDto = {
      success: true,
      totalRows: data.length,
      processed: 0,
      created: { wasteTypes: 0, wasteCategories: 0, wastes: 0 },
      errors: [],
      duplicates: [],
      summary: ''
    };

    // Filtrar filas con errores críticos
    const errorRows = new Set(validationErrors
      .filter(error => error.severity === 'error')
      .map(error => error.row)
    );

    const validRows = data.filter(row => !errorRows.has(row.fila || 0));

    // Convertir errores de validación a formato de resultado
    result.errors = validationErrors.map(error => ({
      row: error.row,
      field: error.field,
      message: error.message
    }));

    // Procesar tipos de residuos únicos
    const uniqueTypes = this.getUniqueTypes(validRows);
    for (const typeData of uniqueTypes) {
      try {
        await this.createOrFindWasteType(typeData);
        result.created.wasteTypes++;
      } catch {
        result.duplicates.push({
          row: typeData.fila || 0,
          type: 'waste_type',
          code: typeData.tipo_codigo,
          message: `Tipo ya existe: ${typeData.tipo_codigo}`
        });
      }
    }

    // Procesar categorías únicas
    const uniqueCategories = this.getUniqueCategories(validRows);
    for (const categoryData of uniqueCategories) {
      try {
        await this.createOrFindWasteCategory(categoryData);
        result.created.wasteCategories++;
      } catch {
        result.duplicates.push({
          row: categoryData.fila || 0,
          type: 'waste_category',
          code: categoryData.categoria_codigo,
          message: `Categoría ya existe: ${categoryData.categoria_codigo}`
        });
      }
    }

    // Procesar productos
    for (const rowData of validRows) {
      try {
        await this.createWasteProduct(rowData);
        result.created.wastes++;
        result.processed++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        if (errorMessage.includes('duplicate')) {
          result.duplicates.push({
            row: rowData.fila || 0,
            type: 'waste',
            code: rowData.producto_codigo,
            message: `Producto ya existe: ${rowData.producto_codigo}`
          });
        } else {
          result.errors.push({
            row: rowData.fila || 0,
            message: `Error creando producto: ${errorMessage}`,
            data: rowData
          });
        }
      }
    }

    // Generar resumen
    result.summary = this.generateSummary(result);
    result.success = result.errors.length === 0;

    return result;
  }

  private getUniqueTypes(data: ExcelWasteRowDto[]): ExcelWasteRowDto[] {
    const seen = new Set<string>();
    return data.filter(row => {
      const key = row.tipo_codigo;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private getUniqueCategories(data: ExcelWasteRowDto[]): ExcelWasteRowDto[] {
    const seen = new Set<string>();
    return data.filter(row => {
      const key = `${row.tipo_codigo}:${row.categoria_codigo}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async createOrFindWasteType(data: ExcelWasteRowDto): Promise<WasteType> {
    let wasteType = await this.wasteTypeRepository.findOne({
      where: { code: data.tipo_codigo }
    });

    if (!wasteType) {
      wasteType = this.wasteTypeRepository.create({
        code: data.tipo_codigo,
        name: data.tipo_nombre,
        description: `Importado desde Excel - Fila ${data.fila}`,
        isActive: true
      });
      await this.wasteTypeRepository.save(wasteType);
    }

    return wasteType;
  }

  private async createOrFindWasteCategory(data: ExcelWasteRowDto): Promise<WasteCategory> {
    // Buscar el tipo padre
    const wasteType = await this.wasteTypeRepository.findOne({
      where: { code: data.tipo_codigo }
    });

    if (!wasteType) {
      throw new Error(`Tipo de residuo no encontrado: ${data.tipo_codigo}`);
    }

    let wasteCategory = await this.wasteCategoryRepository.findOne({
      where: { 
        code: data.categoria_codigo,
        wasteTypeId: wasteType.id 
      }
    });

    if (!wasteCategory) {
      // Parsear especificaciones técnicas si existen
      let technicalSpecs = undefined;
      if (data.especificaciones_tecnicas) {
        try {
          technicalSpecs = JSON.parse(data.especificaciones_tecnicas);
        } catch {
          // Ignorar si no es JSON válido
        }
      }

      wasteCategory = this.wasteCategoryRepository.create({
        wasteTypeId: wasteType.id,
        code: data.categoria_codigo,
        name: data.categoria_nombre,
        description: `Importado desde Excel - Fila ${data.fila}`,
        technicalSpecs,
        isActive: true
      });
      await this.wasteCategoryRepository.save(wasteCategory);
    }

    return wasteCategory;
  }

  private async createWasteProduct(data: ExcelWasteRowDto): Promise<Waste> {
    // Buscar la categoría padre
    const wasteType = await this.wasteTypeRepository.findOne({
      where: { code: data.tipo_codigo }
    });

    if (!wasteType) {
      throw new Error(`Tipo de residuo no encontrado: ${data.tipo_codigo}`);
    }

    const wasteCategory = await this.wasteCategoryRepository.findOne({
      where: { 
        code: data.categoria_codigo,
        wasteTypeId: wasteType.id 
      }
    });

    if (!wasteCategory) {
      throw new Error(`Categoría no encontrada: ${data.categoria_codigo}`);
    }

    // Verificar si el producto ya existe
    const existingWaste = await this.wasteRepository.findOne({
      where: { 
        code: data.producto_codigo,
        wasteCategoryId: wasteCategory.id 
      }
    });

    if (existingWaste) {
      throw new Error(`duplicate: Producto ya existe: ${data.producto_codigo}`);
    }

    // Parsear especificaciones si existen
    let specifications = undefined;
    if (data.especificaciones_tecnicas) {
      try {
        specifications = JSON.parse(data.especificaciones_tecnicas);
      } catch {
        // Ignorar si no es JSON válido
      }
    }

    const waste = this.wasteRepository.create({
      wasteCategoryId: wasteCategory.id,
      code: data.producto_codigo,
      name: data.producto_nombre,
      subproductName: data.subproducto,
      description: data.descripcion,
      hazardClass: data.clase_peligro,
      specifications,
      isActive: true
    });

    return await this.wasteRepository.save(waste);
  }

  private generateSummary(result: BulkUploadResultDto): string {
    const parts = [];
    
    parts.push(`Procesadas ${result.processed} de ${result.totalRows} filas`);
    
    if (result.created.wasteTypes > 0) {
      parts.push(`${result.created.wasteTypes} tipos creados`);
    }
    
    if (result.created.wasteCategories > 0) {
      parts.push(`${result.created.wasteCategories} categorías creadas`);
    }
    
    if (result.created.wastes > 0) {
      parts.push(`${result.created.wastes} productos creados`);
    }
    
    if (result.errors.length > 0) {
      parts.push(`${result.errors.length} errores`);
    }
    
    if (result.duplicates.length > 0) {
      parts.push(`${result.duplicates.length} duplicados`);
    }

    return parts.join(', ');
  }
}
