"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, CheckCircle, XCircle, AlertTriangle, Download, FileSpreadsheet } from "lucide-react"
import { API_CONFIG } from "@/lib/config/api"

interface BulkUploadResult {
  success: boolean
  totalRows: number
  processed: number
  created: {
    wasteTypes: number
    wasteCategories: number
    wastes: number
  }
  errors: Array<{
    row: number
    field?: string
    message: string
    data?: Record<string, unknown>
  }>
  duplicates: Array<{
    row: number
    type: string
    code: string
    message: string
  }>
  summary: string
}

interface TemplateResponse {
  message: string
  template: Array<{
    tipo_codigo: string
    tipo_nombre: string
    categoria_codigo: string
    categoria_nombre: string
    producto_codigo: string
    producto_nombre: string
    subproducto?: string
    descripcion?: string
    clase_peligro?: string
    especificaciones_tecnicas?: string
  }>
  instructions: string[]
}

export default function CargaMasivaPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<BulkUploadResult | null>(null)
  const [template, setTemplate] = useState<TemplateResponse | null>(null)
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null) // Limpiar resultados anteriores
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                        droppedFile.type === 'application/vnd.ms-excel' ||
                        droppedFile.name.endsWith('.xlsx') || 
                        droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile)
      setResult(null)
    } else {
      alert('Por favor, selecciona un archivo Excel (.xlsx o .xls)')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(API_CONFIG.ENDPOINTS.BULK_UPLOAD_EXCEL, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error uploading file')
      }

      const uploadResult: BulkUploadResult = await response.json()
      setResult(uploadResult)
    } catch (error) {
      console.error('Upload error:', error)
      setResult({
        success: false,
        totalRows: 0,
        processed: 0,
        created: { wasteTypes: 0, wasteCategories: 0, wastes: 0 },
        errors: [{ row: 0, message: error instanceof Error ? error.message : 'Error desconocido' }],
        duplicates: [],
        summary: 'Error en la carga'
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = async () => {
    setLoadingTemplate(true)
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.BULK_UPLOAD_TEMPLATE, {
        method: 'POST',
      })

      if (response.ok) {
        const templateData: TemplateResponse = await response.json()
        setTemplate(templateData)

        // Convertir template a CSV para descarga
        const csvContent = convertToCSV(templateData.template)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'plantilla_carga_masiva.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error downloading template:', error)
    } finally {
      setLoadingTemplate(false)
    }
  }

  const convertToCSV = (data: Record<string, unknown>[]): string => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n')
    
    return `${headers}\n${rows}`
  }

  const getSuccessRate = (): number => {
    if (!result || result.totalRows === 0) return 0
    return (result.processed / result.totalRows) * 100
  }

  return (
    <SidebarInset>
      <header className="page-header flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Carga Masiva de Residuos</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Cards de instrucciones y carga */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Card de carga */}
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Subir Archivo
              </CardTitle>
              <CardDescription>
                Selecciona un archivo Excel (.xlsx, .xls) con los datos de residuos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer backdrop-blur-sm transition-all duration-300 ${
                    isDragOver 
                      ? 'border-blue-500 bg-gradient-to-br from-blue-100/80 to-indigo-100/80 shadow-lg' 
                      : 'border-slate-300/60 bg-gradient-to-br from-slate-50/80 to-blue-50/80 hover:from-blue-50/80 hover:to-indigo-50/80 hover:border-blue-400/60 hover:shadow-lg'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className={`w-8 h-8 mb-4 transition-colors ${isDragOver ? 'text-blue-600' : 'text-gray-500'}`} />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">
                        {isDragOver ? 'Suelta tu archivo aquí' : 'Haz clic para subir'}
                      </span> 
                      {!isDragOver && ' o arrastra y suelta'}
                    </p>
                    <p className="text-xs text-gray-500">Excel (.xlsx, .xls)</p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </label>
              </div>

              {file && (
                <Alert>
                  <FileSpreadsheet className="h-4 w-4" />
                  <AlertDescription>
                    Archivo seleccionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? 'Procesando...' : 'Cargar Datos'}
              </Button>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={50} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Procesando archivo...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de plantilla */}
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Plantilla Excel
              </CardTitle>
              <CardDescription>
                Descarga la plantilla con el formato requerido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={downloadTemplate}
                disabled={loadingTemplate}
                variant="outline"
                className="w-full"
              >
                {loadingTemplate ? 'Generando...' : 'Descargar Plantilla'}
              </Button>

              {template && (
                <div className="space-y-2">
                  <h4 className="font-medium">Instrucciones:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {template.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        {result && (
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Resultados de la Carga
              </CardTitle>
              <CardDescription>{result.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="summary">Resumen</TabsTrigger>
                  <TabsTrigger value="created">Creados</TabsTrigger>
                  <TabsTrigger value="errors">Errores</TabsTrigger>
                  <TabsTrigger value="duplicates">Duplicados</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{result.totalRows}</div>
                        <p className="text-xs text-muted-foreground">Total filas</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{result.processed}</div>
                        <p className="text-xs text-muted-foreground">Procesadas</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {getSuccessRate().toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Tasa de éxito</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Progress value={getSuccessRate()} className="w-full" />
                </TabsContent>

                <TabsContent value="created" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{result.created.wasteTypes}</Badge>
                      <span className="text-sm">Tipos de residuo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{result.created.wasteCategories}</Badge>
                      <span className="text-sm">Categorías</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{result.created.wastes}</Badge>
                      <span className="text-sm">Productos</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="errors">
                  {result.errors.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fila</TableHead>
                          <TableHead>Campo</TableHead>
                          <TableHead>Mensaje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.errors.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>{error.row}</TableCell>
                            <TableCell>{error.field || '-'}</TableCell>
                            <TableCell>{error.message}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                      <p>No hay errores</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="duplicates">
                  {result.duplicates.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fila</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Mensaje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.duplicates.map((duplicate, index) => (
                          <TableRow key={index}>
                            <TableCell>{duplicate.row}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{duplicate.type}</Badge>
                            </TableCell>
                            <TableCell className="font-mono">{duplicate.code}</TableCell>
                            <TableCell>{duplicate.message}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                      <p>No hay duplicados</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Formato requerido */}
        <Card className="card">
          <CardHeader>
            <CardTitle>Formato de Excel Requerido</CardTitle>
            <CardDescription>Estructura que debe tener tu archivo Excel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✓ Columnas Requeridas</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <strong>tipo_codigo:</strong> Código único del tipo (máx 20 caracteres)</li>
                  <li>• <strong>tipo_nombre:</strong> Nombre del tipo de residuo</li>
                  <li>• <strong>categoria_codigo:</strong> Código de categoría (máx 50 caracteres)</li>
                  <li>• <strong>categoria_nombre:</strong> Nombre de la categoría</li>
                  <li>• <strong>producto_codigo:</strong> Código del producto (máx 50 caracteres)</li>
                  <li>• <strong>producto_nombre:</strong> Nombre del producto</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-blue-600">○ Columnas Opcionales</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <strong>subproducto:</strong> Nombre del subproducto</li>
                  <li>• <strong>descripcion:</strong> Descripción detallada</li>
                  <li>• <strong>clase_peligro:</strong> Clasificación de peligrosidad</li>
                  <li>• <strong>especificaciones_tecnicas:</strong> JSON con especificaciones</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
