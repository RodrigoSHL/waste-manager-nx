"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { AlertTriangle, TrendingUp, Package, DollarSign, Building2 } from "lucide-react"

const wasteData = [
  { name: "Plástico", cantidad: 1200, margen: 2400 },
  { name: "Cartón", cantidad: 800, margen: 1600 },
  { name: "Metal", cantidad: 600, margen: 3000 },
  { name: "Orgánico", cantidad: 2000, margen: 800 },
  { name: "Vidrio", cantidad: 400, margen: 600 },
]

const pieData = [
  { name: "Plástico", value: 30, color: "#0088FE" },
  { name: "Orgánico", value: 40, color: "#00C49F" },
  { name: "Metal", value: 15, color: "#FFBB28" },
  { name: "Cartón", value: 10, color: "#FF8042" },
  { name: "Vidrio", value: 5, color: "#8884D8" },
]

export default function Dashboard() {
  return (
    <SidebarInset>
      <header className="page-header flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Dashboard Principal</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 fade-in">
        {/* Métricas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Residuos (mes)</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,000 kg</div>
              <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margen Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,400</div>
              <p className="text-xs text-muted-foreground">+15.3% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dispositores Activos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 nuevos este mes</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">+2.1% desde el mes pasado</p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        <Alert className="alert-enhanced">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>3 residuos</strong> sin valorización asignada requieren atención inmediata.
          </AlertDescription>
        </Alert>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="chart-container">
            <CardHeader>
              <CardTitle>Residuos por Tipo (kg)</CardTitle>
              <CardDescription>Distribución mensual de residuos gestionados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={wasteData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="chart-container">
            <CardHeader>
              <CardTitle>Distribución por Tipo</CardTitle>
              <CardDescription>Porcentaje de cada tipo de residuo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Dispositores más utilizados */}
        <Card>
          <CardHeader>
            <CardTitle>Dispositores Más Utilizados</CardTitle>
            <CardDescription>Ranking de empresas receptoras por volumen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "EcoRecicla S.A.", volume: "1,200 kg", badge: "Top 1" },
                { name: "Verde Limpio", volume: "980 kg", badge: "Top 2" },
                { name: "Residuos Pro", volume: "750 kg", badge: "Top 3" },
                { name: "Circular Corp", volume: "650 kg", badge: "Top 4" },
              ].map((dispositor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="badge-enhanced">
                      {dispositor.badge}
                    </Badge>
                    <span className="font-medium">{dispositor.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{dispositor.volume}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
