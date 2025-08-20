'use client'

import { Box, FolderOpen, LayoutDashboard, UserRound } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Resources',
    url: '/dashboard/resources',
    icon: UserRound,
  },
  {
    title: 'Projects',
    url: '/dashboard/projects',
    icon: FolderOpen,
  },
  {
    title: 'Timeline',
    url: '/dashboard/gantt',
    icon: Box,
  },
]

export function AppSidebar() {
  const currentPath = usePathname().substring(1) // remove leading slash
  const fragments = currentPath.split('/')

  const tab = fragments.length > 1 ? fragments.slice(0, 2).join('/') : fragments[0]

  return (
    <Sidebar className="pl-5">
      <SidebarHeader className="pl-5">
        <Link href="/">
          <span className="flex items-center text-lg font-bold">
            <Image className="h-[35px] w-auto" src="/bmri.svg" alt="LOGO" height={0} width={0} priority />
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.url.substring(1) === tab}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
