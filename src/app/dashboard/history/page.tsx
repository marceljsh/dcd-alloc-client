"use client"

import { useMemo, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Users, Filter } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ProjectRow } from "@/types/project"
import rawProjects from "@/data/projects.json"
import { ProjectCategory, ProjectPriority } from "@/types/common"

const allProjects: ProjectRow[] = rawProjects as ProjectRow[]
const initialHistory = allProjects // bisa pakai filter kalau history punya kriteria khusus

// Utils
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

const PageHeader = ({ onAddProject }: { onAddProject: () => void }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-3xl font-bold" data-testid="page-title">History</h1>
      <p className="text-muted-foreground">Manage your last projects and track their result</p>
    </div>
  </div>
)

export default function HistoryPage() {
  const [history] = useState<ProjectRow[]>(initialHistory)

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo<ColumnDef<ProjectRow>[]>(() => [
    { accessorKey: "code", header: "Project Code", cell: ({ row }) => <div className="font-mono">{row.getValue("code")}</div> },
    { accessorKey: "name", header: "Name", cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div> },
    { accessorKey: "team", header: "Team" },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <Badge variant="outline" className={getCategoryColor(row.getValue("category"))}>{row.getValue("category")}</Badge> },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <Badge variant="outline" className={getPriorityColor(row.getValue("priority"))}>{row.getValue("priority")}</Badge> },
    { accessorKey: "crew", header: "Crew", cell: ({ row }) => <div className="flex items-center space-x-1"><Users className="h-4 w-4 text-muted-foreground" /><span>{row.getValue("crew")}</span></div> },
    { accessorKey: "budget", header: "Budget", cell: ({ row }) => `Rp${(row.getValue("budget") as number).toLocaleString("id-ID")}` },
    { accessorKey: "startDate", header: "Start Date", cell: ({ row }) => new Date(row.getValue("startDate")).toLocaleDateString("id-ID") },
    { accessorKey: "endDate", header: "End Date", cell: ({ row }) => new Date(row.getValue("endDate")).toLocaleDateString("id-ID") },
  ], [])

  const table = useReactTable({
    data: history,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      arrIncludesSome: (row, columnId, value) => {
        if (!value || value.length === 0) return true
        return value.includes(row.getValue(columnId))
      },
    },
  })

  const handleFilterChange =
    (columnId: string, currentSelection: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (value: string, checked: boolean) => {
      const newSelection = checked ? [...currentSelection, value] : currentSelection.filter((item) => item !== value)
      setter(newSelection)
      table.getColumn(columnId)?.setFilterValue(newSelection.length > 0 ? newSelection : undefined)
    }

  const allFilteredAndSortedRows = table.getSortedRowModel().rows
  const itemsPerPage = 10
  const totalPages = Math.ceil(allFilteredAndSortedRows.length / itemsPerPage)
  const paginatedRows = allFilteredAndSortedRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useMemo(() => setCurrentPage(1), [globalFilter, columnFilters, sorting])
  const handleCategoryChange = handleFilterChange("category", selectedCategories, setSelectedCategories)
  const handlePriorityChange = handleFilterChange("priority", selectedPriorities, setSelectedPriorities)
  const handleTeamChange = handleFilterChange("team", selectedTeams, setSelectedTeams)

  return (
    <div className="space-y-6 mx-10">
      <PageHeader onAddProject={() => {}} />
      <Card className="py-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl">History Projects</CardTitle>
          <div className="flex gap-2 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Category
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                {["Small", "Medium", "Big"].map((cat) => (
                  <DropdownMenuCheckboxItem
                    key={cat}
                    checked={selectedCategories.includes(cat)}
                    onCheckedChange={(checked) => handleCategoryChange(cat, checked)}
                  >
                    {cat}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Priority
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                {["Low", "Medium", "High", "Critical"].map((prio) => (
                  <DropdownMenuCheckboxItem
                    key={prio}
                    checked={selectedPriorities.includes(prio)}
                    onCheckedChange={(checked) => handlePriorityChange(prio, checked)}
                  >
                    {prio}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* --- Team Filter --- */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Team
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                {[...new Set(allProjects.map((p) => p.team))].map((team) => (
                  <DropdownMenuCheckboxItem
                    key={team}
                    checked={selectedTeams.includes(team)}
                    onCheckedChange={(checked) => handleTeamChange(team, checked)}
                  >
                    {team}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* --- Search --- */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history projects..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ProjectsDataTable table={table} rows={paginatedRows} />

          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const ProjectsDataTable = ({ table, rows }: { table: any; rows: any[] }) => (
  <ScrollArea className="h-[450px]">
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
        {rows?.length ? (
          rows.map((row: any) => {
            table.prepareRow?.(row)
            return (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )
          })
        ) : (
          <TableRow>
            <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
              No history projects.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </ScrollArea>
)
