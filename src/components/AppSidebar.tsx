"use client"

import { ChartGantt, FolderCheck, FolderOpen, LayoutDashboard, Users } from "lucide-react"
import { Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Resources', url: '/dashboard/resources', icon: Users },
  { title: 'Projects', url: '/dashboard/projects', icon: FolderOpen },
  { title: 'Timeline', url: '/dashboard/timeline', icon: ChartGantt },
  { title: 'History', url: '/dashboard/history', icon: FolderCheck },
];

export function AppSidebar() {
  const path = usePathname().substring(1)
  const { open } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background" variant="inset">
      <SidebarHeader className="border-b border-border h-14">
        <div className="flex items-baseline justify-between">
          <div className="group-data-[collapsible=icon]:hidden px-2">
            <Image src="/bmri.svg" alt="BMRI Logo" width={0} height={0} className="h-8 w-auto" />
          </div>
          <div className="px-1">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2 py-5 gap-3">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url} className="w-full">
                <SidebarMenuButton
                  isActive={path === item.url.substring(1)}
                  className="w-full px-4 py-6 flex gap-2"
                >
                  <item.icon className="h-5 w-5 inline" />
                  {open && <span>{item.title}</span>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
