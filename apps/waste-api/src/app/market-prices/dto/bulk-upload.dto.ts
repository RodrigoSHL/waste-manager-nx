// DTO para los datos que vienen del Excel
export interface ExcelWasteRowDto {
  // Jerarquía
  tipo_codigo: string;           // PLASTIC
  tipo_nombre: string;           // Plástico
  categoria_codigo: string;      // PET
  categoria_nombre: string;      // PET (Polietileno Tereftalato)
  
  // Producto específico
  producto_codigo: string;       // PET-BOTTLE-DRINK
  producto_nombre: string;       // Botella PET Bebida
  subproducto?: string;          // Botella de bebida
  descripcion?: string;          // Botellas PET transparentes de bebidas
  clase_peligro?: string;        // H3
  
  // Especificaciones técnicas (opcional, JSON como string)
  especificaciones_tecnicas?: string;  // {"density": "1.38-1.41", "melting_point": "250-260"}
  
  // Metadatos
  fila?: number;                 // Número de fila para errores
}

// DTO para el resultado del procesamiento
export interface BulkUploadResultDto {
  success: boolean;
  totalRows: number;
  processed: number;
  created: {
    wasteTypes: number;
    wasteCategories: number;
    wastes: number;
  };
  errors: Array<{
    row: number;
    field?: string;
    message: string;
    data?: Partial<ExcelWasteRowDto>;
  }>;
  duplicates: Array<{
    row: number;
    type: 'waste_type' | 'waste_category' | 'waste';
    code: string;
    message: string;
  }>;
  summary: string;
}

// DTO para validación
export interface ValidationErrorDto {
  row: number;
  field: string;
  value: unknown;
  message: string;
  severity: 'error' | 'warning';
}
