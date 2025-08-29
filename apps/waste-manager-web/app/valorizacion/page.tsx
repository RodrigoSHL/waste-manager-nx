"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Edit, History, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Precio {
  id: string
  tipo: string
  subcategoria: string
  precioActual: number
  precioAnterior: number
  fechaActualizacion: string
  tendencia: "subida" | "bajada" | "estable"
}

const preciosData: Precio[] = [
  {
    id: "1",
    tipo: "Plástico",
    subcategoria: "PET Transparente",
    precioActual: 2.5,
    precioAnterior: 2.3,
    fechaActualizacion: "2024-01-15",
    tendencia: "subida",
  },
  {
    id: "2",
    tipo: "Plástico",
    subcategoria: "PET Color",
    precioActual: 2.0,
    precioAnterior: 2.2,
    fechaActualizacion: "2024-01-15",
    tendencia: "bajada",
  },
  {
    id: "3",
    tipo: "Cartón",
    subcategoria: "Cartón Corrugado",
    precioActual: 1.8,
    precioAnterior: 1.8,
    fechaActualizacion: "2024-01-10",
    tendencia: "estable",
  },
  {
    id: "4",
    tipo: "Metal",
    subcategoria: "Aluminio",
    precioActual: 5.0,
    precioAnterior: 4.8,
    fechaActualizacion: "2024-01-12",
    tendencia: "subida",
  },
  {
    id: "5",
    tipo: "Metal",
    subcategoria: "Acero",
    precioActual: 3.2,
    precioAnterior: 3.5,
    fechaActualizacion: "2024-01-14",
    tendencia: "bajada",
  },
]

export default function ValorizacionPage() {
  const [precios, setPrecios] = useState<Precio[]>(preciosData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [editingPrecio, setEditingPrecio] = useState<Precio | null>(null)

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case "subida":
        return <TrendingUp className="h-4 w-4 text-green-600 icon-hover" />
      case "bajada":
        return <TrendingDown className="h-4 w-4 text-red-600 icon-hover" />
      default:
        return <Minus className="h-4 w-4 text-gray-600 icon-hover" />
    }
  }

  const getTendenciaBadge = (tendencia: string) => {
    const variants = {
      subida: "default",
      bajada: "destructive",
      estable: "secondary",
    } as const

    return <Badge variant={variants[tendencia as keyof typeof variants]}>{tendencia}</Badge>
  }

  const handleEdit = (precio: Precio) => {
    setEditingPrecio(precio)
    setIsDialogOpen(true)
  }

  const handleMassiveUpdate = () => {
    // Lógica para actualización masiva
    console.log("Actualización masiva de precios")
  }

  return (
    <SidebarInset>
      <header className="page-header flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Gestión de Valorización</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Resumen de precios */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground icon-hover" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.90</div>
              <p className="text-xs text-muted-foreground">+5.2% desde la última actualización</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías Activas</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground icon-hover" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 tipos principales</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
              <History className="h-4 w-4 text-muted-foreground icon-hover" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Hoy</div>
              <p className="text-xs text-muted-foreground">15 de Enero, 2024</p>
            </CardContent>
          </Card>
        </div>

        <Card className="card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Precios por Categoría</CardTitle>
                <CardDescription>
                  Gestiona los precios de valorización por tipo y subcategoría de residuo
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="btn-secondary bg-transparent" onClick={handleMassiveUpdate}>
                  Actualización Masiva
                </Button>
                <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <History className="mr-2 h-4 w-4 icon-hover" />
                      Historial
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Historial de Precios</DialogTitle>
                      <DialogDescription>Consulta el historial de cambios de precios por período</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">Funcionalidad de historial en desarrollo...</p>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-primary" onClick={() => setEditingPrecio(null)}>
                      <Plus className="mr-2 h-4 w-4 icon-hover" />
                      Nuevo Precio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="dialog-enhanced sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{editingPrecio ? "Editar Precio" : "Nuevo Precio"}</DialogTitle>
                      <DialogDescription>
                        {editingPrecio
                          ? "Modifica el precio de valorización"
                          : "Ingresa un nuevo precio de valorización"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tipo" className="text-right">
                          Tipo
                        </Label>
                        <Select>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plastico">Plástico</SelectItem>
                            <SelectItem value="carton">Cartón</SelectItem>
                            <SelectItem value="metal">Metal</SelectItem>
                            <SelectItem value="organico">Orgánico</SelectItem>
                            <SelectItem value="vidrio">Vidrio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subcategoria" className="text-right">
                          Subcategoría
                        </Label>
                        <Input id="subcategoria" placeholder="Ej: PET Transparente" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="precio" className="text-right">
                          Precio ($/kg)
                        </Label>
                        <Input id="precio" type="number" step="0.01" placeholder="0.00" className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingPrecio ? "Actualizar" : "Crear"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabla de precios */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Subcategoría</TableHead>
                    <TableHead>Precio Actual</TableHead>
                    <TableHead>Precio Anterior</TableHead>
                    <TableHead>Cambio</TableHead>
                    <TableHead>Tendencia</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {precios.map((precio) => (
                    <TableRow key={precio.id} className="table-row">
                      <TableCell className="font-medium">{precio.tipo}</TableCell>
                      <TableCell>{precio.subcategoria}</TableCell>
                      <TableCell className="font-bold">${precio.precioActual.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">${precio.precioAnterior.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTendenciaIcon(precio.tendencia)}
                          <span
                            className={`text-sm ${
                              precio.tendencia === "subida"
                                ? "text-green-600"
                                : precio.tendencia === "bajada"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            ${Math.abs(precio.precioActual - precio.precioAnterior).toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getTendenciaBadge(precio.tendencia)}</TableCell>
                      <TableCell>{precio.fechaActualizacion}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(precio)}>
                          <Edit className="h-4 w-4 icon-hover" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
