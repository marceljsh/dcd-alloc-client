import type { Metadata } from 'next'
import '@/app/globals.css'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

export const metadata: Metadata = {
  title: {
    template: 'DCD | %s',
    default: 'Dashboard',
  },
  description: 'Created by and for BMRI',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div id="layout-dashboard" className="flex">
      <SidebarProvider>
        <AppSidebar />
        {/* <SidebarInset> */}
        <div id="wrapped-dashboard-child" className="flex flex-1 flex-col gap-4 overflow-hidden bg-background">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Current Page</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <main>{children}</main>
        </div>
      </SidebarProvider>
    </div>
  )
}
