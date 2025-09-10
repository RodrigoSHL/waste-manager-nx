'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { 
  SidebarInset, 
  SidebarTrigger 
} from '@/components/ui/sidebar'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Search,
  Edit,
  Plus,
  TrendingUp,
  History,
  Loader2,
  TrendingDown
} from 'lucide-react'
import { usePricesOverview, usePriceHistory } from '@/hooks/use-market-prices'
import type { PriceOverview } from '@/lib/types/market-prices'

interface PriceFormData {
  price: number
  source: string
  notes: string
}

export default function ValorizacionPage() {
  const { overview, isLoading, error, refetch, updatePrice } = usePricesOverview()
  const { history, isLoading: isLoadingHistory, error: historyError, fetchHistory, clearHistory } = usePriceHistory()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PriceOverview | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [priceForm, setPriceForm] = useState<PriceFormData>({
    price: 0,
    source: '',
    notes: '',
  })

  const resetForm = () => {
    setPriceForm({
      price: 0,
      source: '',
      notes: '',
    })
  }

  const handleUpdatePrice = (item: PriceOverview) => {
    setSelectedItem(item)
    setPriceForm({
      price: item.price,
      source: item.source || '',
      notes: '',
    })
    setIsUpdateDialogOpen(true)
  }

  const handleViewHistory = async (item: PriceOverview) => {
    setSelectedItem(item)
    setIsHistoryDialogOpen(true)
    
    // Debug: Log para ver qué datos estamos obteniendo
    console.log('🔍 Fetching history for:', {
      disposer_id: item.disposer_id,
      waste_id: item.waste_id,
      current_price: item.price,
      disposer: item.disposer_legal_name,
      waste: item.waste_name
    })
    
    await fetchHistory(item.disposer_id, item.waste_id)
  }

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    if (priceForm.price <= 0) {
      toast.error('El precio debe ser mayor a 0')
      return
    }

    setIsSubmitting(true)
    try {
      await updatePrice(selectedItem.disposer_id, selectedItem.waste_id, {
        price: priceForm.price,
        source: priceForm.source || undefined,
        notes: priceForm.notes || undefined,
      })
      toast.success('Precio actualizado exitosamente')
      setIsUpdateDialogOpen(false)
      setSelectedItem(null)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error actualizando precio')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtrar precios por término de búsqueda
  const filteredOverview = overview.filter((item: PriceOverview) =>
    item.waste_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.waste_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.disposer_legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.disposer_trade_name && item.disposer_trade_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Calcular estadísticas
  const totalRelations = overview.length
  const avgPrice = overview.length > 0 ? overview.reduce((sum: number, item: PriceOverview) => sum + item.price, 0) / overview.length : 0
  const uniqueWastes = new Set(overview.map((item: PriceOverview) => item.waste_id)).size
  const uniqueDisposers = new Set(overview.map((item: PriceOverview) => item.disposer_id)).size

  // Determinar si un precio está actualizado (menos de 30 días)
  const isPriceRecent = (dateString: string) => {
    const priceDate = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - priceDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30
  }

  const getPriceStatusBadge = (dateString: string) => {
    const isRecent = isPriceRecent(dateString)
    return (
      <Badge variant={isRecent ? "default" : "destructive"}>
        {isRecent ? "Actualizado" : "Desactualizado"}
      </Badge>
    )
  }

  if (error) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">Gestión de Valorización</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-destructive mb-4">Error cargando datos: {error}</p>
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
          <h1 className="text-lg font-semibold">Gestión de Valorización</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Estadísticas de Resumen */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relaciones Activas</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRelations}</div>
              <p className="text-xs text-muted-foreground">
                {uniqueDisposers} dispositores × {uniqueWastes} residuos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgPrice.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">por unidad de medida</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precios Actualizados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.filter((item: PriceOverview) => isPriceRecent(item.price_created_at)).length}
              </div>
              <p className="text-xs text-muted-foreground">últimos 30 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dispositores Únicos</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueDisposers}</div>
              <p className="text-xs text-muted-foreground">activos en el sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Valorización */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Matriz de Valorización</CardTitle>
                <CardDescription>
                  Precios actuales de residuos por dispositor
                </CardDescription>
              </div>
              <Button onClick={refetch} variant="outline">
                <History className="mr-2 h-4 w-4" />
                Actualizar Datos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por residuo, código o dispositor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando datos de valorización...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Residuo</TableHead>
                    <TableHead>Dispositor</TableHead>
                    <TableHead>Precio Actual</TableHead>
                    <TableHead>UoM</TableHead>
                    <TableHead>Lote Mínimo</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOverview.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        {searchTerm ? 'No se encontraron resultados que coincidan con la búsqueda' : 'No hay relaciones activas entre dispositores y residuos'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOverview.map((item: PriceOverview) => (
                      <TableRow key={`${item.disposer_id}-${item.waste_id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.waste_name}</div>
                            <div className="text-sm text-muted-foreground">{item.waste_code}</div>
                            {item.hazard_class && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Clase {item.hazard_class}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.disposer_legal_name}</div>
                            {item.disposer_trade_name && (
                              <div className="text-sm text-muted-foreground">{item.disposer_trade_name}</div>
                            )}
                            <div className="text-xs text-muted-foreground">{item.disposer_rut}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-lg">
                            {item.currency_symbol}{typeof item.price === 'number' ? item.price.toFixed(item.currency_decimals) : '0.00'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.uom_code}</div>
                            <div className="text-sm text-muted-foreground">{item.uom_description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.min_lot ? `${item.min_lot} ${item.uom_code}` : '-'}
                        </TableCell>
                        <TableCell>
                          {item.lead_time_days ? `${item.lead_time_days} días` : '-'}
                        </TableCell>
                        <TableCell>
                          {getPriceStatusBadge(item.price_created_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{new Date(item.price_created_at).toLocaleDateString()}</div>
                            {item.source && (
                              <div className="text-xs text-muted-foreground">Fuente: {item.source}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewHistory(item)}
                              title="Ver historial de precios"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdatePrice(item)}
                              title="Actualizar precio"
                            >
                              <Edit className="h-4 w-4" />
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

        {/* Dialog para Actualizar Precio */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Actualizar Precio</DialogTitle>
              <DialogDescription>
                {selectedItem && (
                  <>
                    Actualizar precio para <strong>{selectedItem.waste_name}</strong> del dispositor{' '}
                    <strong>{selectedItem.disposer_legal_name}</strong>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitUpdate}>
              <div className="grid gap-4 py-4">
                {selectedItem && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Precio Actual</Label>
                    <div className="col-span-3 p-3 bg-muted rounded">
                      <span className="text-lg font-bold">
                        {selectedItem.currency_symbol}{typeof selectedItem.price === 'number' ? selectedItem.price.toFixed(selectedItem.currency_decimals) : '0.00'} / {selectedItem.uom_code}
                      </span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Nuevo Precio *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={priceForm.price}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="source" className="text-right">
                    Fuente
                  </Label>
                  <Input
                    id="source"
                    value={priceForm.source}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, source: e.target.value }))}
                    className="col-span-3"
                    placeholder="ej: Cotización, Mercado, etc."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notas
                  </Label>
                  <Textarea
                    id="notes"
                    value={priceForm.notes}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="col-span-3"
                    placeholder="Comentarios adicionales sobre la actualización..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Actualizar Precio
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de Historial de Precios */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={(open) => {
          setIsHistoryDialogOpen(open)
          if (!open) {
            clearHistory()
            setSelectedItem(null)
          }
        }}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Precios
              </DialogTitle>
              <DialogDescription>
                {selectedItem && (
                  <>
                    Historial de precios para <strong>{selectedItem.waste_name}</strong> ({selectedItem.waste_code}) 
                    del dispositor <strong>{selectedItem.disposer_legal_name}</strong>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto">
              {historyError ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className="text-destructive mb-2">Error: {historyError}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => selectedItem && fetchHistory(selectedItem.disposer_id, selectedItem.waste_id)}
                    >
                      Reintentar
                    </Button>
                  </div>
                </div>
              ) : isLoadingHistory ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Cargando historial...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No hay historial de precios disponible</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Resumen estadístico */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Resumen Estadístico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Precio Actual</p>
                          <p className="text-lg font-bold text-blue-600">
                            {selectedItem?.currency_symbol}{typeof selectedItem?.price === 'number' ? selectedItem.price.toFixed(2) : '0.00'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Precio Máximo</p>
                          <p className="text-lg font-bold text-green-600">
                            {selectedItem?.currency_symbol}{
                              history.length > 0 
                                ? Math.max(...history.map(h => Number(h.price) || 0)).toFixed(2)
                                : '0.00'
                            }
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Precio Mínimo</p>
                          <p className="text-lg font-bold text-red-600">
                            {selectedItem?.currency_symbol}{
                              history.length > 0 
                                ? Math.min(...history.map(h => Number(h.price) || 0)).toFixed(2)
                                : '0.00'
                            }
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Promedio</p>
                          <p className="text-lg font-bold text-purple-600">
                            {selectedItem?.currency_symbol}{
                              history.length > 0 
                                ? (history.reduce((sum, h) => sum + (Number(h.price) || 0), 0) / history.length).toFixed(2)
                                : '0.00'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tabla de historial */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Historial Detallado</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Período</TableHead>
                            <TableHead>Fuente</TableHead>
                            <TableHead>Notas</TableHead>
                            <TableHead>Tendencia</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {history.map((item, index) => {
                            const currentPrice = Number(item.price) || 0
                            const prevPrice = index < history.length - 1 ? Number(history[index + 1].price) || 0 : currentPrice
                            const priceChange = currentPrice - prevPrice
                            const percentageChange = prevPrice !== 0 ? (priceChange / prevPrice) * 100 : 0
                            
                            return (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(item.created_at).toLocaleTimeString()}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-bold text-lg">
                                    {selectedItem?.currency_symbol}{currentPrice.toFixed(2)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {item.price_period}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {item.source || '-'}
                                </TableCell>
                                <TableCell>
                                  {item.notes || '-'}
                                </TableCell>
                                <TableCell>
                                  {index < history.length - 1 && (
                                    <div className="flex items-center gap-1">
                                      {priceChange > 0 ? (
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                      ) : priceChange < 0 ? (
                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                      ) : (
                                        <div className="h-4 w-4" />
                                      )}
                                      <span className={`text-sm ${
                                        priceChange > 0 ? 'text-green-600' : 
                                        priceChange < 0 ? 'text-red-600' : 
                                        'text-gray-600'
                                      }`}>
                                        {priceChange !== 0 && (
                                          <>
                                            {priceChange > 0 ? '+' : ''}{selectedItem?.currency_symbol}{Math.abs(priceChange).toFixed(2)}
                                            {' '}({percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%)
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarInset>
  )
}