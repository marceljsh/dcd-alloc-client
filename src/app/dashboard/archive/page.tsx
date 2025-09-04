"use client"

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------
import { useMemo, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Trash2, RotateCcw, Users } from "lucide-react"

import { ProjectRow } from "@/types/project"
import rawProjects from "@/data/projects.json"
import { ProjectCategory, ProjectPriority } from "@/types/common"

// -----------------------------------------------------------------------------
// Data (contoh: filter hanya project yang diarchive)
// -----------------------------------------------------------------------------
const allProjects: ProjectRow[] = rawProjects as ProjectRow[]

// Dummy rule: project dianggap archived kalau priority = "Critical"
const initialArchived = allProjects.filter(p => p.priority === "Critical")

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------
const getCategoryColor = (category: ProjectCategory) => {
  switch (category) {
    case "Small": return "bg-blue-100 text-blue-800"
    case "Medium": return "bg-green-100 text-green-800"
    case "Big": return "bg-yellow-100 text-yellow-800"
  }
}

const getPriorityColor = (priority: ProjectPriority) => {
  switch (priority) {
    case "Low": return "bg-green-100 text-green-800"
    case "Medium": return "bg-yellow-100 text-yellow-800"
    case "High": return "bg-orange-100 text-orange-800"
    case "Critical": return "bg-red-100 text-red-800"
  }
}

// -----------------------------------------------------------------------------
// Main Page
// -----------------------------------------------------------------------------
export default function ArchivePage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [archived, setArchived] = useState<ProjectRow[]>(initialArchived)

  // Handlers
  const handleRestore = (project: ProjectRow) => {
    setArchived(prev => prev.filter(p => p.code !== project.code))
    // NOTE: di sini bisa ditambahkan logika untuk kirim ke "active projects"
  }

  const handleDelete = (project: ProjectRow) => {
    setArchived(prev => prev.filter(p => p.code !== project.code))
  }

  const columns = useMemo<ColumnDef<ProjectRow>[]>(() => [
    { accessorKey: "code", header: "Project Code", cell: ({ row }) => <div className="font-mono">{row.getValue("code")}</div> },
    { accessorKey: "name", header: "Name", cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div> },
    { accessorKey: "team", header: "Team" },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <Badge variant="outline" className={getCategoryColor(row.getValue("category"))}>{row.getValue("category")}</Badge> },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <Badge variant="outline" className={getPriorityColor(row.getValue("priority"))}>{row.getValue("priority")}</Badge> },
    { accessorKey: "crew", header: "Crew", cell: ({ row }) => <div className="flex items-center space-x-1"><Users className="h-4 w-4 text-muted-foreground" /><span>{row.getValue("crew")}</span></div> },
    { accessorKey: "budget", header: "Budget", cell: ({ row }) => `$${(row.getValue("budget") as number).toLocaleString()}` },
    { accessorKey: 'startDate', header: 'Start Date', cell: ({ row }) => new Date(row.getValue('startDate')).toLocaleDateString('id-ID') },
    { accessorKey: 'endDate', header: 'End Date', cell: ({ row }) => new Date(row.getValue('endDate')).toLocaleDateString('id-ID') },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleRestore(project)}>
              <RotateCcw className="h-4 w-4 mr-1" /> Restore
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(project)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        )
      },
    },
  ], [archived])

  const table = useReactTable({
    data: archived,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-6 mx-10">
      <PageHeader />
      <Card className="py-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl">Archived Projects</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search archived projects..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ProjectsDataTable table={table} columns={columns} />
        </CardContent>
      </Card>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Internal Components
// -----------------------------------------------------------------------------
const PageHeader = () => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold">Archive</h1>
      <p className="text-muted-foreground">View and manage archived projects</p>
    </div>
  </div>
)

const ProjectsDataTable = ({ table, columns }: { table: any, columns: any[] }) => (
  <ScrollArea className="h-[500px]">
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
        {table.getHeaderGroups().map((headerGroup: any) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header: any) => (
              <TableHead
                key={header.id}
                className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex items-center gap-2">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: "▲", desc: "▼" }[header.column.getIsSorted() as string] ?? null}
                </div>
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row: any) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell: any) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No archived projects.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </ScrollArea>
)
