"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react"
import { useWastes } from "@/hooks/use-market-prices"
import { CreateWasteDto, UpdateWasteDto, Waste } from "@/lib/types/market-prices"
import { WasteHierarchySelector } from "@/components/waste-hierarchy-selector"
import { toast } from "sonner"

export default function ResiduosPage() {
  const { wastes, isLoading, error, refetch, createWaste, updateWaste, deleteWaste } = useWastes()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingWaste, setEditingWaste] = useState<Waste | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para jerarquía
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>()
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>()

  // Formulario para crear/editar (actualizado para jerarquía)
  const [formData, setFormData] = useState<CreateWasteDto>({
    wasteCategoryId: 0, // Se actualizará con selectedCategoryId
    code: '',
    name: '',
    subproductName: '',
    description: '',
    hazardClass: '',
    specifications: {},
  })

  const resetForm = () => {
    setFormData({
      wasteCategoryId: 0,
      code: '',
      name: '',
      subproductName: '',
      description: '',
      hazardClass: '',
      specifications: {},
    })
    setSelectedTypeId(undefined)
    setSelectedCategoryId(undefined)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code.trim() || !formData.name.trim() || !selectedCategoryId) {
      toast.error('El código, nombre y categoría son obligatorios')
      return
    }

    setIsSubmitting(true)
    try {
      await createWaste({
        wasteCategoryId: selectedCategoryId,
        code: formData.code.trim(),
        name: formData.name.trim(),
        subproductName: formData.subproductName?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        hazardClass: formData.hazardClass?.trim() || undefined,
        specifications: Object.keys(formData.specifications || {}).length > 0 ? formData.specifications : undefined,
      })
      toast.success('Residuo creado exitosamente')
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error creando residuo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (waste: Waste) => {
    setEditingWaste(waste)
    setFormData({
      wasteCategoryId: waste.wasteCategoryId,
      code: waste.code,
      name: waste.name,
      subproductName: waste.subproductName || '',
      description: waste.description || '',
      hazardClass: waste.hazardClass || '',
      specifications: waste.specifications || {},
    })
    // Buscar el tipo de la categoría para preseleccionar
    setSelectedCategoryId(waste.wasteCategoryId)
    // Aquí necesitarías obtener el tipo de la categoría, por ahora lo dejamos sin definir
    setSelectedTypeId(undefined)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingWaste || !selectedCategoryId) return

    setIsSubmitting(true)
    try {
      const updateData: UpdateWasteDto = {}
      
      if (selectedCategoryId !== editingWaste.wasteCategoryId) {
        updateData.wasteCategoryId = selectedCategoryId
      }
      if (formData.code.trim() !== editingWaste.code) {
        updateData.code = formData.code.trim()
      }
      if (formData.name.trim() !== editingWaste.name) {
        updateData.name = formData.name.trim()
      }
      if (formData.subproductName?.trim() !== (editingWaste.subproductName || '')) {
        updateData.subproductName = formData.subproductName?.trim() || undefined
      }
      if (formData.description?.trim() !== (editingWaste.description || '')) {
        updateData.description = formData.description?.trim() || undefined
      }
      if (formData.hazardClass?.trim() !== (editingWaste.hazardClass || '')) {
        updateData.hazardClass = formData.hazardClass?.trim() || undefined
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('No hay cambios para guardar')
        setIsEditDialogOpen(false)
        return
      }

      await updateWaste(editingWaste.id, updateData)
      toast.success('Residuo actualizado exitosamente')
      setIsEditDialogOpen(false)
      setEditingWaste(null)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error actualizando residuo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (waste: Waste) => {
    if (!confirm(`¿Está seguro de que desea eliminar el residuo "${waste.name}"?`)) {
      return
    }

    try {
      await deleteWaste(waste.id)
      toast.success('Residuo eliminado exitosamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error eliminando residuo')
    }
  }

  // Filtrar residuos por término de búsqueda
  const filteredWastes = wastes.filter(waste =>
    waste.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    waste.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (waste.description && waste.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (error) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">Gestión de Residuos</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-destructive mb-4">Error cargando residuos: {error}</p>
                <Button onClick={refetch}>Reintentar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Gestión de Residuos</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Estadísticas */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Residuos</CardDescription>
              <CardTitle className="text-4xl">{wastes.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Con Clasificación de Peligro</CardDescription>
              <CardTitle className="text-4xl">
                {wastes.filter(w => w.hazardClass).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Con Descripción</CardDescription>
              <CardTitle className="text-4xl">
                {wastes.filter(w => w.description).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Controles y Lista */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Residuos</CardTitle>
                <CardDescription>
                  Gestiona los tipos de residuos del sistema
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Residuo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Residuo</DialogTitle>
                    <DialogDescription>
                      Ingresa los datos del nuevo tipo de residuo
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreate}>
                    <div className="grid gap-4 py-4">
                      {/* Selector de Jerarquía */}
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right mt-2">
                          Jerarquía *
                        </Label>
                        <div className="col-span-3">
                          <WasteHierarchySelector
                            selectedTypeId={selectedTypeId}
                            selectedCategoryId={selectedCategoryId}
                            onTypeChange={setSelectedTypeId}
                            onCategoryChange={setSelectedCategoryId}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code" className="text-right">
                          Código *
                        </Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                          className="col-span-3"
                          placeholder="ej: PET-BOTTLE-DRINK"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nombre *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="col-span-3"
                          placeholder="ej: Botella PET Bebida"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subproduct" className="text-right">
                          Subproducto
                        </Label>
                        <Input
                          id="subproduct"
                          value={formData.subproductName}
                          onChange={(e) => setFormData(prev => ({ ...prev, subproductName: e.target.value }))}
                          className="col-span-3"
                          placeholder="ej: Botella de bebida"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Descripción
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="col-span-3"
                          placeholder="Descripción detallada del residuo"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="hazard_class" className="text-right">
                          Clase Peligro
                        </Label>
                        <Input
                          id="hazard_class"
                          value={formData.hazardClass}
                          onChange={(e) => setFormData(prev => ({ ...prev, hazardClass: e.target.value }))}
                          className="col-span-3"
                          placeholder="ej: H3, H4.1, etc."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear Residuo
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando residuos...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Subproducto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Clase Peligro</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWastes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        {searchTerm ? 'No se encontraron residuos que coincidan con la búsqueda' : 'No hay residuos registrados'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWastes.map((waste) => (
                      <TableRow key={waste.id}>
                        <TableCell className="font-medium">{waste.code}</TableCell>
                        <TableCell>{waste.name}</TableCell>
                        <TableCell>
                          {waste.subproductName ? (
                            <span className="text-sm">{waste.subproductName}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            ID: {waste.wasteCategoryId}
                          </span>
                        </TableCell>
                        <TableCell>
                          {waste.description ? (
                            <span className="text-sm text-muted-foreground">
                              {waste.description.length > 30 
                                ? `${waste.description.substring(0, 30)}...` 
                                : waste.description}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Sin descripción</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {waste.hazardClass ? (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                              {waste.hazardClass}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(waste.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(waste)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(waste)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Residuo</DialogTitle>
              <DialogDescription>
                Modifica los datos del residuo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate}>
              <div className="grid gap-4 py-4">
                {/* Selector de Jerarquía para Edición */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">
                    Jerarquía *
                  </Label>
                  <div className="col-span-3">
                    <WasteHierarchySelector
                      selectedTypeId={selectedTypeId}
                      selectedCategoryId={selectedCategoryId}
                      onTypeChange={setSelectedTypeId}
                      onCategoryChange={setSelectedCategoryId}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-code" className="text-right">
                    Código *
                  </Label>
                  <Input
                    id="edit-code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nombre *
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-subproduct" className="text-right">
                    Subproducto
                  </Label>
                  <Input
                    id="edit-subproduct"
                    value={formData.subproductName}
                    onChange={(e) => setFormData(prev => ({ ...prev, subproductName: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-hazard_class" className="text-right">
                    Clase Peligro
                  </Label>
                  <Input
                    id="edit-hazard_class"
                    value={formData.hazardClass}
                    onChange={(e) => setFormData(prev => ({ ...prev, hazardClass: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarInset>
  )
}
