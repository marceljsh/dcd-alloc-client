import type { Metadata } from "next";
import "@/app/globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardBreadcrumb } from "@/components/DashboardBreadcrumb";

export const metadata: Metadata = {
  title: {
    template: "DCD | %s",
    default: "Dashboard",
  },
  description: "Created by and for BMRI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="layout-dashboard" className="flex h-screen">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
            <DashboardBreadcrumb />
          </header>
          <main className="flex-1 overflow-y-auto px-4 pt-4">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
