"use client"

import { useMemo, useState,useEffect } from "react"
import type React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Calendar, Users, Target, Clock, Filter } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ProjectRow } from "@/types/project"
import rawProjects from "@/data/projects.json"
import type { ProjectCategory, ProjectPriority } from "@/types/common"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { AddProjectForm } from "@/components/project/AddProjectForm"
import ProjectTimeline from "@/components/ProjectTimeline"
import { useRouter } from "next/navigation"

const projectsData: ProjectRow[] = rawProjects as ProjectRow[]

export const PROJECT_CATEGORY_OPTIONS = ["Small", "Medium", "Big"] as const
export const PROJECT_PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"] as const
export const TEAM_OPTIONS = ["DMA", "NCM", "CRM", "CM", "FRM", "RRM"] as const

const getCategoryColor = (category: ProjectCategory) => {
  switch (category) {
    case "Small":
      return "bg-blue-100 text-blue-800"
    case "Medium":
      return "bg-green-100 text-green-800"
    case "Big":
      return "bg-yellow-100 text-yellow-800"
  }
}

const getPriorityColor = (priority: ProjectPriority) => {
  switch (priority) {
    case "Low":
      return "bg-green-100 text-green-800"
    case "Medium":
      return "bg-yellow-100 text-yellow-800"
    case "High":
      return "bg-orange-100 text-orange-800"
    case "Critical":
      return "bg-red-100 text-red-800"
  }
}

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
]

const formatRupiah = (n: number) => {
  if (n >= 1_000_000_000) {
    return `Rp ${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} Bilion`
  }
  if (n >= 1_000_000) {
    return `Rp ${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")} Milion`
  }
  return `Rp ${n.toLocaleString("id-ID")}`
}

type ActiveDialog = "add" | "detail" | "timeline" | null

export default function ProjectsPage() {
  const router = useRouter()
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null)

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  const [projects, setProjects] = useState<ProjectRow[]>(() => rawProjects as ProjectRow[])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1);

  const handleArchive = (project: ProjectRow) => {
    const stored = JSON.parse(localStorage.getItem("archivedProjects") || "[]")
    localStorage.setItem("archivedProjects", JSON.stringify([...stored, project]))

    setProjects((prev) => prev.filter((p) => p.code !== project.code))

    toast.success(`Project "${project.name}" has been archived.`)
    router.push("/dashboard/archive")
  }

  const columns = useMemo<ColumnDef<ProjectRow>[]>(() => [
    { accessorKey: "code", header: "Project Code", enableGlobalFilter: true,
      cell: ({ row }) => <div className="font-mono">{row.getValue("code")}</div> },
    { accessorKey: "name", header: "Name", enableGlobalFilter: true,
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div> },
    { accessorKey: "team", header: "Team", filterFn: "arrIncludesSome" },
    { accessorKey: "category", header: "Category",
      cell: ({ row }) => <Badge variant="outline" className={getCategoryColor(row.getValue("category"))}>{row.getValue("category")}</Badge>,
      filterFn: "arrIncludesSome" },
    { accessorKey: "priority", header: "Priority",
      cell: ({ row }) => <Badge variant="outline" className={getPriorityColor(row.getValue("priority"))}>{row.getValue("priority")}</Badge>,
      filterFn: "arrIncludesSome" },
    { accessorKey: "crew", header: "Crew",
      cell: ({ row }) => <div className="flex items-center space-x-1"><Users className="h-4 w-4 text-muted-foreground" /><span>{row.getValue("crew")}</span></div> },
    { accessorKey: "budgetCode", header: "Budget Code", enableGlobalFilter: true,
      cell: ({ row }) => <div className="font-mono">{row.getValue("budgetCode")}</div> },
    { accessorKey: "budget", header: "Budget",
      cell: ({ row }) => `$${(row.getValue("budget") as number).toLocaleString()}` },
    { accessorKey: "startDate", header: "Start Date",
      cell: ({ row }) => new Date(row.getValue("startDate")).toLocaleDateString("id-ID") },
    { accessorKey: "endDate", header: "End Date",
      cell: ({ row }) => new Date(row.getValue("endDate")).toLocaleDateString("id-ID") },
    {
      id: "actions",
      cell: ({ row }) => {
        const project = row.original
        const openDialog = (dialog: ActiveDialog) => {
          setSelectedProject(project)
          setActiveDialog(dialog)
        }
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild >
                <Button data-testid={`menu-button-${project.code}`} variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem data-testid="view-details-project" onClick={() => openDialog("detail")}>
                  <Edit className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-testid="view-details-timeline"
                  role="menuitem"
                  onClick={() => {
                    setSelectedProject(project);   // pilih project yang ingin ditampilkan
                    setActiveDialog("timeline");   // buka dialog timeline
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>View Timeline</span> {/* teks utuh agar query byText berhasil */}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="archive" className="text-red-400" onClick={() => handleArchive(project)}>
                  <Trash2 className="mr-2 h-4 w-4 text-red-400" /> Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [],
  )

  const table = useReactTable({
    data: projects,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      const searchable = ["code", "name", "budgetCode"]
      return searchable.some((key) =>
        String(row.getValue(key)).toLowerCase().includes(filterValue.toLowerCase())
      )
    },
    filterFns: {
      arrIncludesSome: (row, columnId, value) => {
        if (!value || value.length === 0) return true
        return value.includes(row.getValue(columnId))
      },
    },
  })

  const allFilteredAndSortedRows = table.getSortedRowModel().rows
  const itemsPerPage = 10
  const totalPages = Math.ceil(allFilteredAndSortedRows.length / itemsPerPage)
  const paginatedRows = allFilteredAndSortedRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => { setCurrentPage(1) }, [globalFilter, columnFilters])

  // --- EVENT HANDLERS ---
  const handleFilterChange =
    (columnId: string, currentSelection: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (value: string, checked: boolean) => {
      const newSelection = checked ? [...currentSelection, value] : currentSelection.filter((item) => item !== value)

      setter(newSelection)
      table.getColumn(columnId)?.setFilterValue(newSelection.length > 0 ? newSelection : undefined)
    }

  const handleCategoryChange = handleFilterChange("category", selectedCategories, setSelectedCategories)
  const handlePriorityChange = handleFilterChange("priority", selectedPriorities, setSelectedPriorities)
  const handleTeamChange = handleFilterChange("team", selectedTeams, setSelectedTeams)

  const handleCloseDialog = () => {
    setActiveDialog(null)
    setSelectedProject(null)
  }

  const stats = useMemo(
    () => ({
      totalProjects: projects.length,
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      bigSizedRatio: projects.length ? projects.filter((p) => p.category === "Big").length / projects.length : 0,
      criticalPriorityRatio: projects.length
        ? projects.filter((p) => p.priority === "Critical").length / projects.length
        : 0,
    }),
    [projects],
  )

  // --- RENDER ---
  return (
    <div className="space-y-2 mx-10" data-testid="projects-page">
      <PageHeader onAddProject={() => setActiveDialog("add")} />
      <StatCards stats={stats} />

      <Card className="py-4">
        <TableToolbar
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          filters={{
            categories: {
              options: PROJECT_CATEGORY_OPTIONS,
              selected: selectedCategories,
              onChange: handleCategoryChange,
            },
            priorities: {
              options: PROJECT_PRIORITY_OPTIONS,
              selected: selectedPriorities,
              onChange: handlePriorityChange,
            },
            teams: {
              options: TEAM_OPTIONS,
              selected: selectedTeams,
              onChange: handleTeamChange,
            },
          }}
        />
      <CardContent>
          <ProjectsDataTable table={table} columns={columns} paginatedRows={paginatedRows} />
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent>
                  {/* Previous disabled saat halaman pertama */}
                  <PaginationItem>
                    <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : undefined}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {/* Nomor halaman */}
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {/* Next disabled saat halaman terakhir */}
                  <PaginationItem>
                    <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-disabled={currentPage === totalPages}
                    tabIndex={currentPage === totalPages ? -1 : undefined}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProjectDetailDialog project={selectedProject} isOpen={activeDialog === "detail"} onClose={handleCloseDialog} />
      <ProjectTimelineDialog
        project={selectedProject}
        isOpen={activeDialog === "timeline"}
        onClose={() => setActiveDialog(null)}
      />
      <AddProjectDialog isOpen={activeDialog === "add"} onClose={handleCloseDialog} />

      <Toaster position="top-center" />
    </div>
  )
}

const PageHeader = ({ onAddProject }: { onAddProject: () => void }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold" data-testid="page-title">Projects</h1>
      <p className="text-muted-foreground">Manage your projects and track their progress</p>
    </div>
    <Button onClick={onAddProject} data-testid="add-project-button">
      <Plus className="h-4 w-4 mr-2" />
      Add Project
    </Button>
  </div>
)

const StatCards = ({ stats }: { stats: any }) => (
  <div className="grid gap-3 md:grid-cols-4">
    <Card className="py-4 gap-0" data-testid="stat-total-projects">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.totalProjects}</div>
        <p className="text-xs text-muted-foreground">Things to Do</p>
      </CardContent>
    </Card>
    <Card className="py-4 gap-0" data-testid="stat-total-budget">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatRupiah(stats.totalBudget)}</div>
        <p className="text-xs text-muted-foreground">Ready to Spend</p>
      </CardContent>
    </Card>
    <Card className="py-4 gap-0" data-testid="stat-big-projects">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Big Sized Projects</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{Math.round(stats.bigSizedRatio * 100)}%</div>
        <p className="text-xs text-muted-foreground">of All Projects</p>
      </CardContent>
    </Card>
    <Card className="py-4 gap-0" data-testid="stat-critical-projects">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Critical Projects</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{Math.round(stats.criticalPriorityRatio * 100)}%</div>
        <p className="text-xs text-muted-foreground">of All Projects</p>
      </CardContent>
    </Card>
  </div>
)

const FilterDropdown = ({ title, filter }: { title: string; filter: any }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="flex items-center gap-2 bg-transparent">
        <Filter className="h-4 w-4" /> {title}
        {filter.selected.length > 0 && (
          <Badge variant="secondary" className="rounded-full px-2">
            {filter.selected.length}
          </Badge>
        )}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {filter.options.map((option: string) => (
        <DropdownMenuCheckboxItem
          key={option}
          checked={filter.selected.includes(option)}
          onCheckedChange={(checked) => filter.onChange(option, !!checked)}
        >
          {option}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

const TableToolbar = ({
  globalFilter,
  setGlobalFilter,
  filters,
}: { globalFilter: string; setGlobalFilter: (value: string) => void; filters: any }) => (
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle className="text-xl">Project Portfolio</CardTitle>
    <div className="flex items-center gap-2">
      <FilterDropdown title="Category" filter={filters.categories} data-testid="filter-category" />
      <FilterDropdown title="Priority" filter={filters.priorities} data-testid="filter-priority" />
      <FilterDropdown title="Team" filter={filters.teams} data-testid="filter-team"/>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          data-testid="search-input"
          placeholder="Search projects..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  </CardHeader>
)

const ProjectsDataTable = ({ table, columns, paginatedRows }: { table: any; columns: any[]; paginatedRows: any[] }) => (
  <ScrollArea className="h-[500px]">
    <Table data-testid="project-table">
      <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
        {table.getHeaderGroups().map((headerGroup: any) => (
          <TableRow key={headerGroup.id} className="hover:bg-white">
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
        {paginatedRows?.length ? (
          paginatedRows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </ScrollArea>
)

const AddProjectDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="sm:max-w-[425px]" data-testid="add-project-dialog">
      <DialogHeader>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogDescription>Create a new project to track progress and manage resources.</DialogDescription>
      </DialogHeader>
      <AddProjectForm onCancel={onClose} />
    </DialogContent>
  </Dialog>
)

const ProjectDetailDialog = ({
  project,
  isOpen,
  onClose,
}: { project: ProjectRow | null; isOpen: boolean; onClose: () => void }) => {
  if (!project) return null

  const workloadData = {
    totalEstimated: 2400,
    allocatedFTE: 2050,
    workloadGap: -350,
    budgetUsed: 350,
    budgetAvailable: project.budget - 350,
  }

  const subactivities = [
  {
    name: "UI Design",
    role: "System Analyst",
    workload: 120,
    employees: [
      { name: "Alice", imageUrl: "" },
      { name: "Bob", imageUrl: "" },
      { name: "Charlie", imageUrl: "" },
      { name: "Diana", imageUrl: "" },
    ],
    fte: "0.8x",
    startDate: "15/02/25",
    endDate: "28/02/25",
    status: "In Progress",
  },
  {
    name: "API Dev",
    role: "Data Engineer",
    workload: 200,
    employees: [{ name: "Charlie", imageUrl: "" }],
    fte: "1.2x",
    startDate: "15/03/25",
    endDate: "29/03/25",
    status: "Pending",
  },
]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" data-testid="project-detail-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{project.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Category</Label>
              <div>
                <Badge variant="outline" className={getCategoryColor(project.category)}>
                  {project.category}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
              <div>
                <Badge variant="outline" className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
              <p className="text-sm">
                {new Date(project.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Crew</Label>
              <p className="text-sm">{project.crew} members</p>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Budget</Label>
              <p className="text-sm">${project.budget.toLocaleString()}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
              <p className="text-sm">
                {new Date(project.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">Assigned Team</Label>
            <p className="text-sm">{project.team}</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Overall Progress</Label>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: "65%" }} data-testid="progress-bar"/>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-muted-foreground">Budget</Label>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Used</span>
                  <span>Available</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(workloadData.budgetUsed / project.budget) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Estimated Workload</span>
                <span className="text-sm font-medium">{workloadData.totalEstimated.toLocaleString()} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Allocated FTE (adjusted)</span>
                <span className="text-sm font-medium">{workloadData.allocatedFTE.toLocaleString()} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Workload Gap / Surplus</span>
                <span className="text-sm font-medium">{workloadData.workloadGap} hrs</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Used</span>
                <span className="text-sm font-medium">-{workloadData.budgetUsed} hrs</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="overflow-x-auto">
              <Table data-testid="subactivities-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Subactivity</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Duration</TableHead>
                    <TableHead className="text-xs">Assigned</TableHead>
                    <TableHead className="text-xs">Adjusted FTE</TableHead>
                    <TableHead className="text-xs">Start Date</TableHead>
                    <TableHead className="text-xs">End Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {subactivities.map((activity, index) => (
                  <TableRow key={index} data-testid={`subactivity-row-${index}`}>
                    <TableCell className="text-sm">{activity.name}</TableCell>
                    <TableCell className="text-sm">{activity.role}</TableCell>
                    <TableCell className="text-sm">{activity.workload} hrs</TableCell>
                    <TableCell>
                      <div className="flex -space-x-1">
                        {activity.employees.slice(0, 2).map((emp, i) => {
                          const colorClass = colors[i % colors.length]
                          return (
                            <Avatar
                              key={i}
                              className="h-6 w-6 border-2 border-white shadow-sm hover:scale-105 transition-transform duration-150"
                            >
                              <AvatarImage src={emp.imageUrl || ""} alt={emp.name} />
                              <AvatarFallback className={`${colorClass} text-white text-xs font-semibold`}>
                                {emp.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          )
                        })}

                        {activity.employees.length > 2 && (
                          <Avatar className="h-6 w-6 border-2 border-white bg-gray-300 shadow-sm hover:scale-105 transition-transform duration-150">
                            <AvatarFallback className="text-[10px] text-gray-700 font-medium">
                              +{activity.employees.length - 2}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm">{activity.fte}</TableCell>
                    <TableCell className="text-sm">{activity.startDate}</TableCell>
                    <TableCell className="text-sm">{activity.endDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const ProjectTimelineDialog = ({ project, isOpen, onClose }: { project: ProjectRow, isOpen: boolean, onClose: () => void }) => {
  if (!project) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-7xl" data-testid="project-timeline-dialog">
        <DialogHeader>
          <DialogTitle>Timeline: {project.name}</DialogTitle>
          <DialogDescription>Visualisasi timeline</DialogDescription>
        </DialogHeader>
        <div className="py-4 overflow-x-auto">
          <ProjectTimeline project={project} />
        </div>
      </DialogContent>
    </Dialog>
  )
}