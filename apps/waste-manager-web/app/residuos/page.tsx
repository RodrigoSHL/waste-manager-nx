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
import { Plus, Search, Edit, Trash2, Filter, Download } from "lucide-react"

interface Residuo {
  id: string
  tipo: string
  nombre: string
  cantidad: number
  dispositor: string
  precioVenta: number
  precioRecepcion: number
  margen: number
  fecha: string
  estado: "procesado" | "pendiente" | "enviado"
}

const residuosData: Residuo[] = [
  {
    id: "1",
    tipo: "Plástico",
    nombre: "PET Transparente",
    cantidad: 150,
    dispositor: "EcoRecicla S.A.",
    precioVenta: 2.5,
    precioRecepcion: 1.2,
    margen: 195,
    fecha: "2024-01-15",
    estado: "procesado",
  },
  {
    id: "2",
    tipo: "Cartón",
    nombre: "Cartón Corrugado",
    cantidad: 200,
    dispositor: "Verde Limpio",
    precioVenta: 1.8,
    precioRecepcion: 0.8,
    margen: 200,
    fecha: "2024-01-14",
    estado: "enviado",
  },
  {
    id: "3",
    tipo: "Metal",
    nombre: "Aluminio",
    cantidad: 80,
    dispositor: "Residuos Pro",
    precioVenta: 5.0,
    precioRecepcion: 2.0,
    margen: 240,
    fecha: "2024-01-13",
    estado: "pendiente",
  },
]

export default function ResiduosPage() {
  const [residuos, setResiduos] = useState<Residuo[]>(residuosData)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState("todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResiduo, setEditingResiduo] = useState<Residuo | null>(null)

  const filteredResiduos = residuos.filter((residuo) => {
    const matchesSearch =
      residuo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residuo.dispositor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterTipo === "todos" || residuo.tipo === filterTipo
    return matchesSearch && matchesFilter
  })

  const getEstadoBadge = (estado: string) => {
    const variants = {
      procesado: "default",
      pendiente: "secondary",
      enviado: "outline",
    } as const

    return <Badge variant={variants[estado as keyof typeof variants]}>{estado}</Badge>
  }

  const handleEdit = (residuo: Residuo) => {
    setEditingResiduo(residuo)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setResiduos(residuos.filter((r) => r.id !== id))
  }

  return (
    <SidebarInset>
      <header className="page-header flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Gestión de Residuos</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Registro de Residuos</CardTitle>
                <CardDescription>Gestiona todos los residuos procesados por la empresa</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary" onClick={() => setEditingResiduo(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Residuo
                  </Button>
                </DialogTrigger>
                <DialogContent className="dialog-enhanced sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingResiduo ? "Editar Residuo" : "Nuevo Residuo"}</DialogTitle>
                    <DialogDescription>
                      {editingResiduo ? "Modifica los datos del residuo" : "Ingresa los datos del nuevo residuo"}
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
                      <Label htmlFor="nombre" className="text-right">
                        Nombre
                      </Label>
                      <Input id="nombre" placeholder="Ej: PET Transparente" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cantidad" className="text-right">
                        Cantidad (kg)
                      </Label>
                      <Input id="cantidad" type="number" placeholder="0" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dispositor" className="text-right">
                        Dispositor
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccionar dispositor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ecorecicla">EcoRecicla S.A.</SelectItem>
                          <SelectItem value="verde">Verde Limpio</SelectItem>
                          <SelectItem value="residuos">Residuos Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="precio-venta" className="text-right">
                        Precio Venta
                      </Label>
                      <Input id="precio-venta" type="number" step="0.01" placeholder="0.00" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingResiduo ? "Actualizar" : "Crear"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros y búsqueda */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o dispositor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-enhanced pl-8"
                  />
                </div>
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="Plástico">Plástico</SelectItem>
                  <SelectItem value="Cartón">Cartón</SelectItem>
                  <SelectItem value="Metal">Metal</SelectItem>
                  <SelectItem value="Orgánico">Orgánico</SelectItem>
                  <SelectItem value="Vidrio">Vidrio</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>

            {/* Tabla de residuos */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cantidad (kg)</TableHead>
                    <TableHead>Dispositor</TableHead>
                    <TableHead>P. Venta</TableHead>
                    <TableHead>P. Recepción</TableHead>
                    <TableHead>Margen</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResiduos.map((residuo) => (
                    <TableRow key={residuo.id} className="table-row">
                      <TableCell className="font-medium">{residuo.tipo}</TableCell>
                      <TableCell>{residuo.nombre}</TableCell>
                      <TableCell>{residuo.cantidad}</TableCell>
                      <TableCell>{residuo.dispositor}</TableCell>
                      <TableCell>${residuo.precioVenta}</TableCell>
                      <TableCell>${residuo.precioRecepcion}</TableCell>
                      <TableCell className="font-medium text-green-600">${residuo.margen}</TableCell>
                      <TableCell>{residuo.fecha}</TableCell>
                      <TableCell>{getEstadoBadge(residuo.estado)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(residuo)}>
                            <Edit className="h-4 w-4 icon-hover" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(residuo.id)}>
                            <Trash2 className="h-4 w-4 icon-hover" />
                          </Button>
                        </div>
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
