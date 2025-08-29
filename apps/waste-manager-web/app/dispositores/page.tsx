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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Search, Edit, Trash2, Phone, Mail, AlertCircle, Database } from "lucide-react"
import { useDisposers, useSeeds } from "@/lib/hooks/use-market-prices"
import { Disposer, CreateDisposerDto } from "@/lib/types/market-prices"
import { toast } from "sonner"

export default function DispositoresPage() {
  const { disposers, isLoading, error, refetch, createDisposer } = useDisposers()
  const { runSeeds, isRunning: isSeedsRunning } = useSeeds()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDispositor, setEditingDispositor] = useState<Disposer | null>(null)
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    legal_name: "",
    trade_name: "",
    rut: "",
    website: "",
    contact_name: "",
    email: "",
    phone: "",
    role: "",
  })

  const filteredDispositores = disposers.filter(
    (dispositor) =>
      dispositor.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispositor.trade_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispositor.rut.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      legal_name: "",
      trade_name: "",
      rut: "",
      website: "",
      contact_name: "",
      email: "",
      phone: "",
      role: "",
    })
  }

  const handleDialogOpen = (dispositor?: Disposer) => {
    if (dispositor) {
      setEditingDispositor(dispositor)
      const primaryContact = dispositor.contacts.find(c => c.is_primary) || dispositor.contacts[0]
      setFormData({
        legal_name: dispositor.legal_name,
        trade_name: dispositor.trade_name || "",
        rut: dispositor.rut,
        website: dispositor.website || "",
        contact_name: primaryContact?.contact_name || "",
        email: primaryContact?.email || "",
        phone: primaryContact?.phone || "",
        role: primaryContact?.role || "",
      })
    } else {
      setEditingDispositor(null)
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const disposerData: CreateDisposerDto = {
        legal_name: formData.legal_name,
        trade_name: formData.trade_name || undefined,
        rut: formData.rut,
        website: formData.website || undefined,
        contacts: formData.contact_name ? [{
          contact_name: formData.contact_name,
          email: formData.email,
          phone: formData.phone || undefined,
          role: formData.role || undefined,
          is_primary: true,
        }] : undefined,
      }

      if (editingDispositor) {
        // TODO: Implementar actualización
        toast.error("Actualización no implementada aún")
      } else {
        await createDisposer(disposerData)
        toast.success("Dispositor creado exitosamente")
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar")
    }
  }

  const handleRunSeeds = async () => {
    try {
      await runSeeds()
      toast.success("Seeds ejecutados exitosamente")
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error ejecutando seeds")
    }
  }

  const getEstadoBadge = (isActive: boolean) => {
    return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Activo" : "Inactivo"}</Badge>
  }

  const handleEdit = (dispositor: Disposer) => {
    handleDialogOpen(dispositor)
  }

  const handleDelete = () => {
    // TODO: Implementar eliminación
    toast.error("Eliminación no implementada aún")
  }

  if (error) {
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error cargando datos: {error}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={refetch} variant="outline">
              Reintentar
            </Button>
            <Button onClick={handleRunSeeds} disabled={isSeedsRunning}>
              {isSeedsRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Database className="mr-2 h-4 w-4" />
              Ejecutar Seeds
            </Button>
          </div>
        </div>
      </SidebarInset>
    )
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
              <div className="flex gap-2">
                {disposers.length === 0 && (
                  <Button 
                    onClick={handleRunSeeds} 
                    disabled={isSeedsRunning}
                    variant="outline"
                  >
                    {isSeedsRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Database className="mr-2 h-4 w-4" />
                    Cargar Datos de Ejemplo
                  </Button>
                )}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-primary" onClick={() => handleDialogOpen()}>
                      <Plus className="mr-2 h-4 w-4 icon-hover" />
                      Nuevo Dispositor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="dialog-enhanced sm:max-w-[600px]">
                    <form onSubmit={handleSubmit}>
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
                          <Label htmlFor="legal_name" className="text-right">
                            Razón Social *
                          </Label>
                          <Input 
                            id="legal_name" 
                            placeholder="Razón social completa" 
                            className="col-span-3"
                            value={formData.legal_name}
                            onChange={(e) => setFormData(prev => ({...prev, legal_name: e.target.value}))}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="trade_name" className="text-right">
                            Nombre Comercial
                          </Label>
                          <Input 
                            id="trade_name" 
                            placeholder="Nombre comercial o marca" 
                            className="col-span-3"
                            value={formData.trade_name}
                            onChange={(e) => setFormData(prev => ({...prev, trade_name: e.target.value}))}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="rut" className="text-right">
                            RUT *
                          </Label>
                          <Input 
                            id="rut" 
                            placeholder="12.345.678-9" 
                            className="col-span-3"
                            value={formData.rut}
                            onChange={(e) => setFormData(prev => ({...prev, rut: e.target.value}))}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="website" className="text-right">
                            Sitio Web
                          </Label>
                          <Input 
                            id="website" 
                            placeholder="https://empresa.com" 
                            className="col-span-3"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="contact_name" className="text-right">
                            Contacto
                          </Label>
                          <Input 
                            id="contact_name" 
                            placeholder="Nombre del contacto" 
                            className="col-span-3"
                            value={formData.contact_name}
                            onChange={(e) => setFormData(prev => ({...prev, contact_name: e.target.value}))}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="contacto@empresa.com" 
                            className="col-span-3"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                            Teléfono
                          </Label>
                          <Input 
                            id="phone" 
                            placeholder="+56912345678" 
                            className="col-span-3"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right">
                            Cargo
                          </Label>
                          <Input 
                            id="role" 
                            placeholder="Gerente Comercial" 
                            className="col-span-3"
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">{editingDispositor ? "Actualizar" : "Crear"}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Búsqueda */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, razón social o RUT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-enhanced pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando dispositores...</span>
              </div>
            )}

            {/* Tabla de dispositores */}
            {!isLoading && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Razón Social</TableHead>
                      <TableHead>Nombre Comercial</TableHead>
                      <TableHead>RUT</TableHead>
                      <TableHead>Contacto Principal</TableHead>
                      <TableHead>Sitio Web</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDispositores.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {disposers.length === 0 ? "No hay dispositores registrados" : "No se encontraron resultados"}
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredDispositores.map((dispositor) => {
                      const primaryContact = dispositor.contacts.find(c => c.is_primary) || dispositor.contacts[0]
                      return (
                        <TableRow key={dispositor.id} className="table-row">
                          <TableCell className="font-medium">{dispositor.legal_name}</TableCell>
                          <TableCell>{dispositor.trade_name || "-"}</TableCell>
                          <TableCell>{dispositor.rut}</TableCell>
                          <TableCell>
                            {primaryContact ? (
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{primaryContact.contact_name}</div>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs">{primaryContact.email}</span>
                                </div>
                                {primaryContact.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs">{primaryContact.phone}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Sin contacto</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {dispositor.website ? (
                              <a 
                                href={dispositor.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                {dispositor.website}
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{getEstadoBadge(dispositor.is_active)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(dispositor)}>
                                <Edit className="h-4 w-4 icon-hover" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 icon-hover" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
