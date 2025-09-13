import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BulkUploadService } from '../services/bulk-upload.service';
import { BulkUploadResultDto } from '../dto/bulk-upload.dto';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface TemplateRow {
  tipo_codigo: string;
  tipo_nombre: string;
  categoria_codigo: string;
  categoria_nombre: string;
  producto_codigo: string;
  producto_nombre: string;
  subproducto?: string;
  descripcion?: string;
  clase_peligro?: string;
  especificaciones_tecnicas?: string;
}

@Controller('bulk-upload')
export class BulkUploadController {
  constructor(private readonly bulkUploadService: BulkUploadService) {}

  @Post('excel')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB límite
    },
    fileFilter: (req, file, callback) => {
      // Validar tipo de archivo
      const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
      ];
      
      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException(
          'Solo se permiten archivos Excel (.xlsx, .xls)'
        ), false);
      }
    },
  }))
  async uploadExcel(
    @UploadedFile() file: UploadedFile
  ): Promise<BulkUploadResultDto> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    if (file.size === 0) {
      throw new BadRequestException('El archivo está vacío');
    }

    return this.bulkUploadService.processExcelFile(file.buffer);
  }

  @Post('template')
  @HttpCode(HttpStatus.OK)
  async downloadTemplate(): Promise<{ 
    message: string; 
    template: TemplateRow[];
    instructions: string[];
  }> {
    const template: TemplateRow[] = [
      {
        tipo_codigo: 'ORG',
        tipo_nombre: 'Orgánicos',
        categoria_codigo: 'ALI',
        categoria_nombre: 'Alimentarios',
        producto_codigo: 'VEG-001',
        producto_nombre: 'Residuos vegetales de cocina',
        subproducto: 'Cáscaras de frutas',
        descripcion: 'Residuos orgánicos provenientes de preparación de alimentos',
        clase_peligro: '',
        especificaciones_tecnicas: '{"humedad": "70-80%", "ph": "6.5-7.5"}'
      },
      {
        tipo_codigo: 'REC',
        tipo_nombre: 'Reciclables',
        categoria_codigo: 'PLA',
        categoria_nombre: 'Plásticos',
        producto_codigo: 'PET-001',
        producto_nombre: 'Botellas PET',
        subproducto: 'Botellas de bebidas',
        descripcion: 'Envases plásticos de bebidas gaseosas y agua',
        clase_peligro: '',
        especificaciones_tecnicas: '{"material": "PET", "color": "transparente", "capacidad": "500ml-2L"}'
      }
    ];

    const instructions = [
      '1. Las columnas requeridas son: tipo_codigo, tipo_nombre, categoria_codigo, categoria_nombre, producto_codigo, producto_nombre',
      '2. Las columnas opcionales son: subproducto, descripcion, clase_peligro, especificaciones_tecnicas',
      '3. Los códigos no deben exceder los límites de caracteres: tipo_codigo (20), categoria_codigo (50), producto_codigo (50)',
      '4. Las especificaciones_tecnicas deben estar en formato JSON válido',
      '5. El archivo debe estar en formato Excel (.xlsx o .xls)',
      '6. La primera fila debe contener los encabezados de las columnas',
      '7. Los tipos y categorías se crearán automáticamente si no existen',
      '8. Los productos duplicados (mismo código en la misma categoría) serán ignorados'
    ];

    return {
      message: 'Plantilla de ejemplo para carga masiva de residuos',
      template,
      instructions
    };
  }
}
