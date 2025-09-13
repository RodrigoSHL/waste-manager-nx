"use client"

import type * as React from "react"
import { BarChart3, Building2, Home, Package, Settings, TrendingUp, Upload } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Gestión de Residuos",
      url: "/residuos",
      icon: Package,
    },
    {
      title: "Dispositores",
      url: "/dispositores",
      icon: Building2,
    },
    {
      title: "Valorización",
      url: "/valorizacion",
      icon: TrendingUp,
    },
    {
      title: "Reportes",
      url: "/reportes",
      icon: BarChart3,
    },
    {
      title: "Carga Masiva",
      url: "/carga-masiva",
      icon: Upload,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" className="sidebar" {...props}>
      <SidebarHeader className="bg-gradient-to-r from-white/90 to-slate-50/90 backdrop-blur-sm border-b border-slate-200/50">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-primary-foreground shadow-lg shadow-blue-500/30">
            <Package className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">EcoGestión</span>
            <span className="truncate text-xs text-muted-foreground">Residuos Pro</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 transition-all duration-200 hover:shadow-sm"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-gradient-to-r from-slate-50/90 to-white/90 backdrop-blur-sm border-t border-slate-200/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 transition-all duration-200 hover:shadow-sm"
            >
              <Link href="/configuracion">
                <Settings />
                <span>Configuración</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
