"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const menuItems = [
  { title: "Dashboard", url: "/dashboard" },
  { title: "Resources", url: "/dashboard/resources" },
  { title: "Projects", url: "/dashboard/projects" },
  { title: "New Project", url: "/dashboard/projects/new" },
  { title: "Timeline", url: "/dashboard/timeline" },
  { title: "History", url: "/dashboard/history" },
];

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const getBreadcrumbItems = () => {
    const items = [];
    const segments = pathname.split("/").filter(Boolean);
    const currentPath = [];

    // Always start with Dashboard
    items.push(
      <BreadcrumbItem key="dashboard">
        {segments.length <= 1 ? (
          <span
            className={`text-foreground font-normal transition-opacity ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          >
            Dashboard
          </span>
        ) : (
          <a
            href="/dashboard"
            className={`hover:text-foreground transition-opacity ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          >
            Dashboard
          </a>
        )}
      </BreadcrumbItem>
    );

    // Add remaining segments
    for (let i = 1; i < segments.length; i++) {
      currentPath.push(segments[i]);
      const fullPath = `/dashboard/${currentPath.join("/")}`;
      const menuItem = menuItems.find((item) => item.url === fullPath);

      if (menuItem) {
        items.push(
          <BreadcrumbSeparator key={`sep${i}`} />,
          <BreadcrumbItem key={fullPath}>
            {i === segments.length - 1 ? (
              <span
                className={`text-foreground font-normal transition-opacity ${
                  ready ? "opacity-100" : "opacity-0"
                }`}
              >
                {menuItem.title}
              </span>
            ) : (
              <a
                href={fullPath}
                className={`hover:text-foreground transition-opacity ${
                  ready ? "opacity-100" : "opacity-0"
                }`}
              >
                {menuItem.title}
              </a>
            )}
          </BreadcrumbItem>
        );
      }
    }

    return items;
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>{getBreadcrumbItems()}</BreadcrumbList>
    </Breadcrumb>
  );
}
