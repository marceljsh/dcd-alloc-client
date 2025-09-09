"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const menuItems = [
  { title: "Dashboard", url: "/dashboard" },
  { title: "Resources", url: "/dashboard/resources" },
  { title: "Projects", url: "/dashboard/projects" },
  { title: "Timeline", url: "/dashboard/timeline" },
  { title: "History", url: "/dashboard/history" },
]

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  const current = menuItems.findLast((item) => pathname.startsWith(item.url))

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {!current || current.url === "/dashboard" ? (
          <BreadcrumbItem>
            <BreadcrumbPage className={ready ? "opacity-100" : "opacity-0"}>
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className={ready ? "opacity-100" : "opacity-0"}
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className={ready ? "opacity-100" : "opacity-0"}>
                {current.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
