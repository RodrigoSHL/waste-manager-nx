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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Ruler, Package2, Database } from "lucide-react"

interface TipoResiduo {
  id: string
  nombre: string
  categoria: string
  descripcion: string
  activo: boolean
}

interface UnidadMedida {
  id: string
  nombre: string
  simbolo: string
  tipo: "peso" | "volumen" | "longitud"
  factorConversion: number
  activo: boolean
}

const tiposResiduoData: TipoResiduo[] = [
  {
    id: "1",
    nombre: "PET Transparente",
    categoria: "Plástico",
    descripcion: "Botellas de plástico transparente",
    activo: true,
  },
  {
    id: "2",
    nombre: "Cartón Corrugado",
    categoria: "Cartón",
    descripcion: "Cajas de cartón ondulado",
    activo: true,
  },
  {
    id: "3",
    nombre: "Aluminio",
    categoria: "Metal",
    descripcion: "Latas y envases de aluminio",
    activo: true,
  },
  {
    id: "4",
    nombre: "Vidrio Verde",
    categoria: "Vidrio",
    descripcion: "Botellas de vidrio color verde",
    activo: false,
  },
]

const unidadesMedidaData: UnidadMedida[] = [
  {
    id: "1",
    nombre: "Kilogramo",
    simbolo: "kg",
    tipo: "peso",
    factorConversion: 1,
    activo: true,
  },
  {
    id: "2",
    nombre: "Tonelada",
    simbolo: "t",
    tipo: "peso",
    factorConversion: 1000,
    activo: true,
  },
  {
    id: "3",
    nombre: "Gramo",
    simbolo: "g",
    tipo: "peso",
    factorConversion: 0.001,
    activo: true,
  },
  {
    id: "4",
    nombre: "Metro Cúbico",
    simbolo: "m³",
    tipo: "volumen",
    factorConversion: 1,
    activo: true,
  },
]

export default function ConfiguracionPage() {
  const [tiposResiduo, setTiposResiduo] = useState<TipoResiduo[]>(tiposResiduoData)
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>(unidadesMedidaData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUnidadDialogOpen, setIsUnidadDialogOpen] = useState(false)
  const [editingTipo, setEditingTipo] = useState<TipoResiduo | null>(null)
  const [editingUnidad, setEditingUnidad] = useState<UnidadMedida | null>(null)

  const handleEditTipo = (tipo: TipoResiduo) => {
    setEditingTipo(tipo)
    setIsDialogOpen(true)
  }

  const handleDeleteTipo = (id: string) => {
    setTiposResiduo(tiposResiduo.filter((t) => t.id !== id))
  }

  const handleEditUnidad = (unidad: UnidadMedida) => {
    setEditingUnidad(unidad)
    setIsUnidadDialogOpen(true)
  }

  const handleDeleteUnidad = (id: string) => {
    setUnidadesMedida(unidadesMedida.filter((u) => u.id !== id))
  }

  const toggleTipoActivo = (id: string) => {
    setTiposResiduo(tiposResiduo.map((tipo) => (tipo.id === id ? { ...tipo, activo: !tipo.activo } : tipo)))
  }

  const toggleUnidadActiva = (id: string) => {
    setUnidadesMedida(
      unidadesMedida.map((unidad) => (unidad.id === id ? { ...unidad, activo: !unidad.activo } : unidad)),
    )
  }

  return (
    <SidebarInset>
      <header className="page-header flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Configuración del Sistema</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 fade-in">
        {/* Configuraciones generales */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipos de Residuo</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground icon-hover" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tiposResiduo.filter((t) => t.activo).length}</div>
              <p className="text-xs text-muted-foreground">Activos de {tiposResiduo.length} totales</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unidades de Medida</CardTitle>
              <Ruler className="h-4 w-4 text-muted-foreground icon-hover" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unidadesMedida.filter((u) => u.activo).length}</div>
              <p className="text-xs text-muted-foreground">Configuradas en el sistema</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mantenedores</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground icon-hover" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Módulos configurables</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tipos-residuo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tipos-residuo">Tipos de Residuo</TabsTrigger>
            <TabsTrigger value="unidades-medida">Unidades de Medida</TabsTrigger>
            <TabsTrigger value="configuracion-general">Configuración General</TabsTrigger>
          </TabsList>

          {/* Tab Tipos de Residuo */}
          <TabsContent value="tipos-residuo">
            <Card className="card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Tipos de Residuo</CardTitle>
                    <CardDescription>Administra los tipos y categorías de residuos del sistema</CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-primary" onClick={() => setEditingTipo(null)}>
                        <Plus className="mr-2 h-4 w-4 icon-hover" />
                        Nuevo Tipo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="dialog-enhanced sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{editingTipo ? "Editar Tipo de Residuo" : "Nuevo Tipo de Residuo"}</DialogTitle>
                        <DialogDescription>
                          {editingTipo ? "Modifica los datos del tipo de residuo" : "Ingresa los datos del nuevo tipo"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="nombre" className="text-right">
                            Nombre
                          </Label>
                          <Input id="nombre" placeholder="Ej: PET Transparente" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="categoria" className="text-right">
                            Categoría
                          </Label>
                          <Select>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Seleccionar categoría" />
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
                          <Label htmlFor="descripcion" className="text-right">
                            Descripción
                          </Label>
                          <Textarea
                            id="descripcion"
                            placeholder="Descripción del tipo de residuo"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">{editingTipo ? "Actualizar" : "Crear"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tiposResiduo.map((tipo) => (
                        <TableRow key={tipo.id} className="table-row">
                          <TableCell className="font-medium">{tipo.nombre}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{tipo.categoria}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{tipo.descripcion}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch checked={tipo.activo} onCheckedChange={() => toggleTipoActivo(tipo.id)} />
                              <span className="text-sm">{tipo.activo ? "Activo" : "Inactivo"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditTipo(tipo)}>
                                <Edit className="h-4 w-4 icon-hover" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteTipo(tipo.id)}>
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
          </TabsContent>

          {/* Tab Unidades de Medida */}
          <TabsContent value="unidades-medida">
            <Card className="card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Unidades de Medida</CardTitle>
                    <CardDescription>Configura las unidades de medida utilizadas en el sistema</CardDescription>
                  </div>
                  <Dialog open={isUnidadDialogOpen} onOpenChange={setIsUnidadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-primary" onClick={() => setEditingUnidad(null)}>
                        <Plus className="mr-2 h-4 w-4 icon-hover" />
                        Nueva Unidad
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="dialog-enhanced sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingUnidad ? "Editar Unidad de Medida" : "Nueva Unidad de Medida"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingUnidad ? "Modifica los datos de la unidad" : "Ingresa los datos de la nueva unidad"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="nombre-unidad" className="text-right">
                            Nombre
                          </Label>
                          <Input id="nombre-unidad" placeholder="Ej: Kilogramo" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="simbolo" className="text-right">
                            Símbolo
                          </Label>
                          <Input id="simbolo" placeholder="Ej: kg" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="tipo-unidad" className="text-right">
                            Tipo
                          </Label>
                          <Select>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="peso">Peso</SelectItem>
                              <SelectItem value="volumen">Volumen</SelectItem>
                              <SelectItem value="longitud">Longitud</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="factor" className="text-right">
                            Factor de Conversión
                          </Label>
                          <Input id="factor" type="number" step="0.001" placeholder="1.0" className="col-span-3" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">{editingUnidad ? "Actualizar" : "Crear"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Símbolo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Factor de Conversión</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unidadesMedida.map((unidad) => (
                        <TableRow key={unidad.id} className="table-row">
                          <TableCell className="font-medium">{unidad.nombre}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{unidad.simbolo}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{unidad.tipo}</TableCell>
                          <TableCell>{unidad.factorConversion}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch checked={unidad.activo} onCheckedChange={() => toggleUnidadActiva(unidad.id)} />
                              <span className="text-sm">{unidad.activo ? "Activo" : "Inactivo"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditUnidad(unidad)}>
                                <Edit className="h-4 w-4 icon-hover" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteUnidad(unidad.id)}>
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
          </TabsContent>

          {/* Tab Configuración General */}
          <TabsContent value="configuracion-general">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="card">
                <CardHeader>
                  <CardTitle>Configuraciones del Sistema</CardTitle>
                  <CardDescription>Ajustes generales de la aplicación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">Recibir alertas por correo electrónico</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Cálculo Automático de Márgenes</Label>
                      <p className="text-sm text-muted-foreground">Calcular márgenes automáticamente</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Validación Estricta</Label>
                      <p className="text-sm text-muted-foreground">Validar datos con reglas estrictas</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">Respaldo automático diario</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="card">
                <CardHeader>
                  <CardTitle>Configuraciones de Reportes</CardTitle>
                  <CardDescription>Ajustes para la generación de reportes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="formato-fecha">Formato de Fecha</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="DD/MM/YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moneda">Moneda</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="USD ($)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="clp">CLP ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decimales">Decimales</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="2" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
