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
import { Upload, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react"

interface UploadResult {
  fileName: string
  totalRows: number
  successRows: number
  errorRows: number
  errors: string[]
  status: "processing" | "completed" | "error"
}

export default function CargaMasivaPage() {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simular proceso de carga
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)

          // Simular resultado de carga
          const result: UploadResult = {
            fileName: file.name,
            totalRows: 150,
            successRows: 142,
            errorRows: 8,
            errors: [
              "Fila 15: Tipo de residuo no válido",
              "Fila 23: Cantidad debe ser mayor a 0",
              "Fila 45: Dispositor no encontrado",
              "Fila 67: Precio de venta inválido",
              "Fila 89: Fecha en formato incorrecto",
              "Fila 102: Campo obligatorio vacío",
              "Fila 134: Duplicado encontrado",
              "Fila 147: Valor fuera de rango",
            ],
            status: "completed",
          }

          setUploadResults((prev) => [result, ...prev])
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const downloadTemplate = () => {
    // Simular descarga de plantilla
    console.log("Descargando plantilla...")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <SidebarInset>
      <header className="page-header flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Carga Masiva de Datos</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Instrucciones y plantilla */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="card">
            <CardHeader>
              <CardTitle>Instrucciones de Carga</CardTitle>
              <CardDescription>Sigue estos pasos para cargar datos masivamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Descarga la plantilla</h4>
                <p className="text-sm text-muted-foreground">
                  Utiliza nuestra plantilla Excel/CSV con el formato correcto
                </p>
                <Button variant="outline" className="btn-secondary bg-transparent" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4 icon-hover" />
                  Descargar Plantilla
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">2. Completa los datos</h4>
                <p className="text-sm text-muted-foreground">Llena la plantilla con la información de tus residuos</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">3. Sube el archivo</h4>
                <p className="text-sm text-muted-foreground">Formatos soportados: .xlsx, .xls, .csv</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle>Formato Requerido</CardTitle>
              <CardDescription>Campos obligatorios en tu archivo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Tipo de Residuo</span>
                  <span className="text-muted-foreground">Texto</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Nombre Específico</span>
                  <span className="text-muted-foreground">Texto</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Cantidad (kg)</span>
                  <span className="text-muted-foreground">Número</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Dispositor</span>
                  <span className="text-muted-foreground">Texto</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Precio Venta</span>
                  <span className="text-muted-foreground">Número</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Precio Recepción</span>
                  <span className="text-muted-foreground">Número</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Fecha</span>
                  <span className="text-muted-foreground">DD/MM/YYYY</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Área de carga */}
        <Card className="card">
          <CardHeader>
            <CardTitle>Subir Archivo</CardTitle>
            <CardDescription>Selecciona tu archivo Excel o CSV para procesar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300/60 rounded-xl cursor-pointer bg-gradient-to-br from-slate-50/80 to-blue-50/80 hover:from-blue-50/80 hover:to-indigo-50/80 backdrop-blur-sm transition-all duration-300 hover:border-blue-400/60 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-gray-500">Excel (.xlsx, .xls) o CSV</p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Procesando archivo...</span>
                    <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resultados de carga */}
        {uploadResults.length > 0 && (
          <Card className="card">
            <CardHeader>
              <CardTitle>Historial de Cargas</CardTitle>
              <CardDescription>Resultados de las cargas masivas realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadResults.map((result, index) => (
                  <div
                    key={index}
                    className="border border-slate-200/60 rounded-xl p-4 bg-gradient-to-r from-white/90 to-slate-50/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.fileName}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.successRows}/{result.totalRows} registros procesados
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{result.successRows}</div>
                        <div className="text-xs text-muted-foreground">Exitosos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{result.errorRows}</div>
                        <div className="text-xs text-muted-foreground">Errores</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{result.totalRows}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>

                    {result.errorRows > 0 && (
                      <Alert className="alert-enhanced">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <details className="mt-2">
                            <summary className="cursor-pointer font-medium">
                              Ver {result.errorRows} errores encontrados
                            </summary>
                            <div className="mt-2 space-y-1">
                              {result.errors.map((error, errorIndex) => (
                                <div key={errorIndex} className="text-sm text-red-600">
                                  • {error}
                                </div>
                              ))}
                            </div>
                          </details>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validaciones y reglas */}
        <Card className="card">
          <CardHeader>
            <CardTitle>Reglas de Validación</CardTitle>
            <CardDescription>Criterios que debe cumplir tu archivo para ser procesado correctamente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✓ Datos Válidos</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Tipos de residuo: Plástico, Cartón, Metal, Orgánico, Vidrio</li>
                  <li>• Cantidades mayores a 0</li>
                  <li>• Precios en formato numérico (ej: 2.50)</li>
                  <li>• Fechas en formato DD/MM/YYYY</li>
                  <li>• Dispositores registrados en el sistema</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-red-600">✗ Errores Comunes</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Campos obligatorios vacíos</li>
                  <li>• Tipos de residuo no reconocidos</li>
                  <li>• Cantidades negativas o cero</li>
                  <li>• Formatos de fecha incorrectos</li>
                  <li>• Dispositores inexistentes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
