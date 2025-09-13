"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, Building2, DollarSign, FileText, BarChart3, Activity } from "lucide-react"

// Datos de ejemplo para reportes
const reporteDispositorData = [
  { dispositor: "EcoRecicla S.A.", enero: 1200, febrero: 1350, marzo: 1180, total: 3730 },
  { dispositor: "Verde Limpio", enero: 980, febrero: 1100, marzo: 1250, total: 3330 },
  { dispositor: "Residuos Pro", enero: 750, febrero: 820, marzo: 900, total: 2470 },
  { dispositor: "Circular Corp", enero: 650, febrero: 700, marzo: 680, total: 2030 },
]

const margenesSemanalesData = [
  { semana: "Sem 1", margen: 2400, costos: 1800, ingresos: 4200 },
  { semana: "Sem 2", margen: 2800, costos: 2100, ingresos: 4900 },
  { semana: "Sem 3", margen: 2200, costos: 1900, ingresos: 4100 },
  { semana: "Sem 4", margen: 3100, costos: 2300, ingresos: 5400 },
]

const eficienciaData = [
  { mes: "Ene", procesados: 95, pendientes: 5 },
  { mes: "Feb", procesados: 92, pendientes: 8 },
  { mes: "Mar", procesados: 97, pendientes: 3 },
  { mes: "Abr", procesados: 94, pendientes: 6 },
]

const tiposResiduoData = [
  { name: "Plástico", value: 35, color: "#0088FE" },
  { name: "Orgánico", value: 30, color: "#00C49F" },
  { name: "Metal", value: 20, color: "#FFBB28" },
  { name: "Cartón", value: 10, color: "#FF8042" },
  { name: "Vidrio", value: 5, color: "#8884D8" },
]

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [dispositorSeleccionado, setDispositorSeleccionado] = useState("todos")

  const exportarReporte = (tipo: string) => {
    console.log(`Exportando reporte: ${tipo}`)
  }

  return (
    <SidebarInset>
      <header className="page-header flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Reportes y Análisis</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 fade-in">
        {/* Métricas de reportes */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reportes Generados</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground icon-hover" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiencia Promedio</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground icon-hover" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.5%</div>
              <p className="text-xs text-muted-foreground">+2.1% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margen Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground icon-hover" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$10,500</div>
              <p className="text-xs text-muted-foreground">Último trimestre</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dispositores Activos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground icon-hover" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">En operación</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros globales */}
        <Card className="card">
          <CardHeader>
            <CardTitle>Filtros de Reportes</CardTitle>
            <CardDescription>Configura los parámetros para generar reportes personalizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
                <Input
                  id="fecha-inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="input-enhanced"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha-fin">Fecha Fin</Label>
                <Input
                  id="fecha-fin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="input-enhanced"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dispositor">Dispositor</Label>
                <Select value={dispositorSeleccionado} onValueChange={setDispositorSeleccionado}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los dispositores</SelectItem>
                    <SelectItem value="ecorecicla">EcoRecicla S.A.</SelectItem>
                    <SelectItem value="verde">Verde Limpio</SelectItem>
                    <SelectItem value="residuos">Residuos Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="btn-primary w-full">
                  <BarChart3 className="mr-2 h-4 w-4 icon-hover" />
                  Generar Reporte
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dispositores" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dispositores">Por Dispositor</TabsTrigger>
            <TabsTrigger value="margenes">Márgenes</TabsTrigger>
            <TabsTrigger value="eficiencia">Eficiencia</TabsTrigger>
            <TabsTrigger value="tipos">Tipos de Residuo</TabsTrigger>
            <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
          </TabsList>

          {/* Reporte por Dispositores */}
          <TabsContent value="dispositores">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="chart-container">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Volumen por Dispositor</CardTitle>
                      <CardDescription>Comparativo trimestral de volúmenes procesados</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => exportarReporte("dispositores")}>
                      <Download className="mr-2 h-4 w-4 icon-hover" />
                      Exportar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reporteDispositorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dispositor" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="enero" fill="#8884d8" name="Enero" />
                      <Bar dataKey="febrero" fill="#82ca9d" name="Febrero" />
                      <Bar dataKey="marzo" fill="#ffc658" name="Marzo" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="card">
                <CardHeader>
                  <CardTitle>Ranking de Dispositores</CardTitle>
                  <CardDescription>Volumen total procesado por empresa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posición</TableHead>
                          <TableHead>Dispositor</TableHead>
                          <TableHead>Total (kg)</TableHead>
                          <TableHead>Participación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reporteDispositorData
                          .sort((a, b) => b.total - a.total)
                          .map((dispositor, index) => (
                            <TableRow key={dispositor.dispositor} className="table-row">
                              <TableCell>
                                <Badge variant={index === 0 ? "default" : "secondary"}>#{index + 1}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">{dispositor.dispositor}</TableCell>
                              <TableCell>{dispositor.total.toLocaleString()}</TableCell>
                              <TableCell>
                                {(
                                  (dispositor.total / reporteDispositorData.reduce((sum, d) => sum + d.total, 0)) *
                                  100
                                ).toFixed(1)}
                                %
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reporte de Márgenes */}
          <TabsContent value="margenes">
            <Card className="chart-container">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Análisis de Márgenes Semanales</CardTitle>
                    <CardDescription>Evolución de ingresos, costos y márgenes</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => exportarReporte("margenes")}>
                    <Download className="mr-2 h-4 w-4 icon-hover" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={margenesSemanalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semana" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ingresos" stroke="#8884d8" name="Ingresos" strokeWidth={2} />
                    <Line type="monotone" dataKey="costos" stroke="#82ca9d" name="Costos" strokeWidth={2} />
                    <Line type="monotone" dataKey="margen" stroke="#ffc658" name="Margen" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reporte de Eficiencia */}
          <TabsContent value="eficiencia">
            <Card className="chart-container">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Eficiencia de Procesamiento</CardTitle>
                    <CardDescription>Porcentaje de residuos procesados vs pendientes</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => exportarReporte("eficiencia")}>
                    <Download className="mr-2 h-4 w-4 icon-hover" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={eficienciaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="procesados" stackId="a" fill="#00C49F" name="Procesados %" />
                    <Bar dataKey="pendientes" stackId="a" fill="#FF8042" name="Pendientes %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reporte por Tipos de Residuo */}
          <TabsContent value="tipos">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="chart-container">
                <CardHeader>
                  <CardTitle>Distribución por Tipo de Residuo</CardTitle>
                  <CardDescription>Porcentaje de cada tipo procesado</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={tiposResiduoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tiposResiduoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="card">
                <CardHeader>
                  <CardTitle>Detalle por Tipo</CardTitle>
                  <CardDescription>Volúmenes y valores por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tiposResiduoData.map((tipo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50/80 to-white/80 border border-slate-200/60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tipo.color }} />
                          <span className="font-medium">{tipo.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{tipo.value}%</div>
                          <div className="text-sm text-muted-foreground">{(tipo.value * 50).toLocaleString()} kg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reporte de Tendencias */}
          <TabsContent value="tendencias">
            <div className="grid gap-4">
              <Card className="chart-container">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tendencias de Crecimiento</CardTitle>
                      <CardDescription>Proyección de volúmenes y márgenes</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => exportarReporte("tendencias")}>
                      <Download className="mr-2 h-4 w-4 icon-hover" />
                      Exportar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={margenesSemanalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semana" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="margen"
                        stroke="#8884d8"
                        name="Margen Real"
                        strokeWidth={2}
                        dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="metric-card">
                  <CardHeader>
                    <CardTitle className="text-sm">Crecimiento Mensual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">+12.5%</div>
                    <p className="text-xs text-muted-foreground">Promedio últimos 3 meses</p>
                  </CardContent>
                </Card>

                <Card className="metric-card">
                  <CardHeader>
                    <CardTitle className="text-sm">Proyección Trimestral</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">$15,200</div>
                    <p className="text-xs text-muted-foreground">Margen estimado Q2</p>
                  </CardContent>
                </Card>

                <Card className="metric-card">
                  <CardHeader>
                    <CardTitle className="text-sm">Mejor Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">Metal</div>
                    <p className="text-xs text-muted-foreground">Mayor margen por kg</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
