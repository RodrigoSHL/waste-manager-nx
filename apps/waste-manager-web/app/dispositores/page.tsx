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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, MapPin, Phone, Mail } from "lucide-react"

interface Dispositor {
  id: string
  nombre: string
  tiposResiduos: string[]
  ubicacion: string
  contacto: {
    telefono: string
    email: string
  }
  tarifas: {
    plastico: number
    carton: number
    metal: number
    organico: number
    vidrio: number
  }
  estado: "activo" | "inactivo"
}

const dispositoresData: Dispositor[] = [
  {
    id: "1",
    nombre: "EcoRecicla S.A.",
    tiposResiduos: ["Plástico", "Metal", "Vidrio"],
    ubicacion: "Zona Industrial Norte, Ciudad",
    contacto: {
      telefono: "+1234567890",
      email: "contacto@ecorecicla.com",
    },
    tarifas: {
      plastico: 2.5,
      carton: 0,
      metal: 5.0,
      organico: 0,
      vidrio: 1.8,
    },
    estado: "activo",
  },
  {
    id: "2",
    nombre: "Verde Limpio",
    tiposResiduos: ["Cartón", "Plástico"],
    ubicacion: "Av. Ecológica 123, Ciudad",
    contacto: {
      telefono: "+1234567891",
      email: "info@verdelimpio.com",
    },
    tarifas: {
      plastico: 2.2,
      carton: 1.8,
      metal: 0,
      organico: 0,
      vidrio: 0,
    },
    estado: "activo",
  },
  {
    id: "3",
    nombre: "Residuos Pro",
    tiposResiduos: ["Metal", "Orgánico"],
    ubicacion: "Parque Industrial Sur, Ciudad",
    contacto: {
      telefono: "+1234567892",
      email: "ventas@residuospro.com",
    },
    tarifas: {
      plastico: 0,
      carton: 0,
      metal: 4.8,
      organico: 0.5,
      vidrio: 0,
    },
    estado: "activo",
  },
]

export default function DispositoresPage() {
  const [dispositores, setDispositores] = useState<Dispositor[]>(dispositoresData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDispositor, setEditingDispositor] = useState<Dispositor | null>(null)

  const filteredDispositores = dispositores.filter(
    (dispositor) =>
      dispositor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispositor.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getEstadoBadge = (estado: string) => {
    return <Badge variant={estado === "activo" ? "default" : "secondary"}>{estado}</Badge>
  }

  const handleEdit = (dispositor: Dispositor) => {
    setEditingDispositor(dispositor)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDispositores(dispositores.filter((d) => d.id !== id))
  }

  return (
    <SidebarInset>
      <header className="page-header flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Gestión de Dispositores</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Empresas Receptoras</CardTitle>
                <CardDescription>Administra las empresas que reciben y procesan residuos</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary" onClick={() => setEditingDispositor(null)}>
                    <Plus className="mr-2 h-4 w-4 icon-hover" />
                    Nuevo Dispositor
                  </Button>
                </DialogTrigger>
                <DialogContent className="dialog-enhanced sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{editingDispositor ? "Editar Dispositor" : "Nuevo Dispositor"}</DialogTitle>
                    <DialogDescription>
                      {editingDispositor
                        ? "Modifica los datos del dispositor"
                        : "Ingresa los datos del nuevo dispositor"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nombre" className="text-right">
                        Nombre
                      </Label>
                      <Input id="nombre" placeholder="Nombre de la empresa" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ubicacion" className="text-right">
                        Ubicación
                      </Label>
                      <Textarea id="ubicacion" placeholder="Dirección completa" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="telefono" className="text-right">
                        Teléfono
                      </Label>
                      <Input id="telefono" placeholder="+1234567890" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input id="email" type="email" placeholder="contacto@empresa.com" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right mt-2">Tarifas ($/kg)</Label>
                      <div className="col-span-3 grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="tarifa-plastico" className="text-sm">
                            Plástico
                          </Label>
                          <Input id="tarifa-plastico" type="number" step="0.01" placeholder="0.00" />
                        </div>
                        <div>
                          <Label htmlFor="tarifa-carton" className="text-sm">
                            Cartón
                          </Label>
                          <Input id="tarifa-carton" type="number" step="0.01" placeholder="0.00" />
                        </div>
                        <div>
                          <Label htmlFor="tarifa-metal" className="text-sm">
                            Metal
                          </Label>
                          <Input id="tarifa-metal" type="number" step="0.01" placeholder="0.00" />
                        </div>
                        <div>
                          <Label htmlFor="tarifa-organico" className="text-sm">
                            Orgánico
                          </Label>
                          <Input id="tarifa-organico" type="number" step="0.01" placeholder="0.00" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingDispositor ? "Actualizar" : "Crear"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Búsqueda */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-enhanced pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Tabla de dispositores */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipos de Residuos</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Tarifas Principales</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDispositores.map((dispositor) => (
                    <TableRow key={dispositor.id} className="table-row">
                      <TableCell className="font-medium">{dispositor.nombre}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {dispositor.tiposResiduos.map((tipo, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tipo}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground icon-hover" />
                          <span className="text-sm">{dispositor.ubicacion}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground icon-hover" />
                            <span className="text-xs">{dispositor.contacto.telefono}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground icon-hover" />
                            <span className="text-xs">{dispositor.contacto.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {dispositor.tarifas.plastico > 0 && <div>Plástico: ${dispositor.tarifas.plastico}</div>}
                          {dispositor.tarifas.metal > 0 && <div>Metal: ${dispositor.tarifas.metal}</div>}
                          {dispositor.tarifas.carton > 0 && <div>Cartón: ${dispositor.tarifas.carton}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(dispositor.estado)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(dispositor)}>
                            <Edit className="h-4 w-4 icon-hover" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(dispositor.id)}>
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
