"use client";

import { useMemo, useState, useEffect, useCallback } from "react"
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
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ProjectCategory, projectCategoryOpt, ProjectPriority, projectPriorityOpt } from "@/types/common"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import ProjectTimeline from "@/components/ProjectTimeline"
import { useRouter } from "next/navigation"
import { Team } from "@/types/common";
import { ApiResponse, Paging } from "@/types/api";
import { Project as ProjectType } from "@/types/projects";
import { formatCategory, formatPriority } from "@/lib/strings";

/** Colors & utils (kept as original) **/
const getCategoryColor = (category: ProjectCategory) => {
  switch (category) {
    case "SM": return "bg-blue-100 text-blue-800";
    case "MD": return "bg-green-100 text-green-800";
    case "LG": return "bg-yellow-100 text-yellow-800";
  }
};

const getPriorityColor = (priority: ProjectPriority) => {
  switch (priority) {
    case "LOW":      return "bg-green-100 text-green-800";
    case "MEDIUM":   return "bg-yellow-100 text-yellow-800";
    case "HIGH":     return "bg-orange-100 text-orange-800";
    case "CRITICAL": return "bg-red-100 text-red-800";
  }
};

const colors = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
  "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500",
]

const formatRupiah = (n: number) => {
  if (n >= 1_000_000_000) {
    return `Rp ${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} Bilion`;
  }
  if (n >= 1_000_000) {
    return `Rp ${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")} Milion`;
  }
  return `Rp ${n.toLocaleString("id-ID")}`;
};

type ActiveDialog = "add" | "detail" | "timeline" | null;

/**
 * NOTE:
 * - This page fetches from: {NEXT_PUBLIC_API_URL ?? 'http://localhost'}/api/my/projects
 * - Query params: status=ACTIVE, page (0-based), size, sort=field,asc (repeatable)
 * - Response expected: ApiResponse<Paging<...>> as you specified
 */

export default function ProjectsPage() {
  const router = useRouter();
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const [projects, setProjects] = useState<ProjectType[]>([])

  // table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  // server pagination state
  const [pageIndex, setPageIndex] = useState<number>(0) // 0-based
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [teams, setTeams] = useState<Team[]>([])
  useEffect(() => {
    const fetchTeams = async () => {
      const token = localStorage.getItem('token')
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my/teams/as-dropdown`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch teams');

        const fetched: ApiResponse<Team[]> = await res.json();
        if (!fetched.success || !fetched.data) throw new Error(fetched.message || 'Failed to fetch teams');

        setTeams(fetched.data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error('Error fetching teams:', err)
        toast.error(err instanceof Error ? err.message : 'An error occurred while fetching teams')
      }
    }
    fetchTeams()
  }, [])

  const handleArchive = useCallback(
    (project: ProjectType) => {
      const stored = JSON.parse(
        localStorage.getItem("archivedProjects") || "[]"
      );
      localStorage.setItem(
        "archivedProjects",
        JSON.stringify([...stored, project])
      );

      setProjects((prev) => prev.filter((p) => p.code !== project.code));

      toast.success(`Project "${project.name}" has been archived.`);
      router.push("/dashboard/archive");
    },
    [router, setProjects]
  );

  // Table column definitions (keep existing shape) - accessor keys expect ProjectType fields:
  const columns = useMemo<ColumnDef<ProjectType>[]>(() => [
    { accessorKey: "code", header: "Project Code", enableGlobalFilter: true,
      cell: ({ row }) => <div className="font-mono">{row.getValue("code")}</div> },
    { accessorKey: "name", header: "Name", enableGlobalFilter: true,
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div> },
    { accessorKey: "team", header: "Team", filterFn: "arrIncludesSome", cell: ({ row }) => row.original.team.name},
    { accessorKey: "category", header: "Category",
      cell: ({ row }) => <Badge variant="outline" className={getCategoryColor(row.getValue("category"))}>{formatCategory(row.original.category)}</Badge>,
      filterFn: "arrIncludesSome" },
    { accessorKey: "priority", header: "Priority",
      cell: ({ row }) => <Badge variant="outline" className={getPriorityColor(row.getValue("priority"))}>{formatPriority(row.original.priority)}</Badge>,
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
                    setSelectedProject(project);
                    setActiveDialog("timeline");
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>View Timeline</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="archive" className="text-red-400" onClick={() => handleArchive(project)}>
                  <Trash2 className="mr-2 h-4 w-4 text-red-400" /> Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleArchive]
  );

  // Table instance (client-side sorting/filtering on the returned page)
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
        if (!value || value.length === 0) return true;
        return value.includes(row.getValue(columnId));
      },
    },
  })

  // We will use server-supplied pages (table.getRowModel().rows is the rows in current page)
  const paginatedRows = table.getRowModel().rows

  // Handlers for dropdown filters (keeps behavior)
  const handleFilterChange =
    (
      columnId: string,
      currentSelection: string[],
      setter: React.Dispatch<React.SetStateAction<string[]>>
    ) =>
    (value: string, checked: boolean) => {
      const newSelection = checked
        ? [...currentSelection, value]
        : currentSelection.filter((item) => item !== value);

      setter(newSelection);
      table
        .getColumn(columnId)
        ?.setFilterValue(newSelection.length > 0 ? newSelection : undefined);

      // reset to first server page
      setPageIndex(0);
    };

  const handleCategoryChange = handleFilterChange(
    "category",
    selectedCategories,
    setSelectedCategories
  );
  const handlePriorityChange = handleFilterChange(
    "priority",
    selectedPriorities,
    setSelectedPriorities
  );
  const handleTeamChange = handleFilterChange(
    "team",
    selectedTeams,
    setSelectedTeams
  );

  const handleAddProject: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    router.push("projects/new");
  };

  const handleCloseDialog = () => {
    setActiveDialog(null);
    setSelectedProject(null);
  };

  // Stats: use server totalItems for total projects to reflect whole dataset
  const stats = useMemo(
    () => ({
      totalProjects: totalItems,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget ?? 0), 0),
      bigSizedRatio: totalItems
        ? (projects.filter((p) => p.category === "LG").length / projects.length) // this is page-local ratio
        : 0,
      criticalPriorityRatio: totalItems
        ? (projects.filter((p) => p.priority === "CRITICAL").length / (projects.length || 1))
        : 0,
    }),
    [projects, totalItems]
  );

  // --- SERVER FETCH: get projects page from backend ---
  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();

    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token') ?? '';
        const base = `${process.env.NEXT_PUBLIC_API_URL}/my/projects`

        const params = new URLSearchParams();
        params.set("status", "ACTIVE");
        params.set("page", String(pageIndex)); // spring pageable: 0-based
        params.set("size", String(pageSize));

        // include sorting if present
        for (const s of sorting) {
          params.append("sort", `${s.id},${s.desc ? "desc" : "asc"}`);
        }

        // optional: include globalFilter as keyword param if provided
        if (globalFilter && globalFilter.trim()) {
          params.set("keyword", globalFilter.trim());
        }

        // optional: include selected dropdowns as repeatable params (if backend supports)
        selectedCategories.forEach(c => params.append("category", c));
        selectedPriorities.forEach(p => params.append("priority", p));
        selectedTeams.forEach(t => params.append("team", t));

        const url = `${base}?${params.toString()}`;

        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: ac.signal,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `HTTP ${res.status}`);
        }

        const json: ApiResponse<Paging<any>> | any = await res.json().catch(() => null);

        if (!mounted) return;

        // Parse ApiResponse<Paging<T>> shape (your provided shape)
        if (json && typeof json === "object" && json.success === true && json.data) {
          const paging: Paging<any> = json.data;
          const items = Array.isArray(paging.items) ? paging.items : [];
          const meta = paging.meta ?? { page: 0, size: items.length, totalPages: 1, totalItems: items.length };

          // map API items to ProjectType expected by UI
          const mapped: ProjectType[] = items.map((it: any) => ({
            // attempt to use fields from API; adjust if your ProjectType expects different names
            id: it.id,
            code: it.projectCode ?? it.code ?? String(it.id),
            name: it.name,
            team: it.team ?? { id: it.team?.id ?? null, name: it.team?.name ?? "Unknown" },
            category: it.category,
            priority: it.priority,
            crew: it.crewSize ?? it.crew ?? 0,
            totalCrew: it.crewSize ?? it.crew ?? 0,
            budgetCode: it.budgetCode,
            budget: it.budget ?? 0,
            startDate: it.startDate,
            endDate: it.endDate,
            // keep any extra fields your UI might expect
            ...(it as any),
          }));

          setProjects(mapped);
          setTotalItems(Number.isFinite(meta.totalItems) ? meta.totalItems : mapped.length);
          setTotalPages(Number.isFinite(meta.totalPages) ? meta.totalPages : (mapped.length ? 1 : 0));
        } else if (Array.isArray(json)) {
          // fallback: array body + X-Total-Count header
          const headerTotal = res.headers.get("X-Total-Count");
          const parsed = headerTotal ? Number(headerTotal) : json.length;
          const mapped = json.map((it: any) => ({
            id: it.id,
            code: it.projectCode ?? it.code ?? String(it.id),
            name: it.name,
            team: it.team ?? {},
            category: it.category,
            priority: it.priority,
            crew: it.crewSize ?? it.crew ?? 0,
            totalCrew: it.crewSize ?? it.crew ?? 0,
            budgetCode: it.budgetCode,
            budget: it.budget ?? 0,
            startDate: it.startDate,
            endDate: it.endDate,
            ...(it as any),
          }));
          setProjects(mapped);
          setTotalItems(Number.isFinite(parsed) ? parsed : mapped.length);
          setTotalPages(Math.ceil((Number.isFinite(parsed) ? parsed : mapped.length) / pageSize));
        } else {
          // unknown shape - clear
          setProjects([]);
          setTotalItems(0);
          setTotalPages(0);
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          // ignore
        } else {
          console.error("Failed to fetch projects:", err);
          toast.error(err instanceof Error ? err.message : "Failed to fetch projects");
          setProjects([]);
          setTotalItems(0);
          setTotalPages(0);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchPage();

    return () => {
      mounted = false;
      ac.abort();
    };
    // dependencies: pageIndex, pageSize, sorting, globalFilter, selected filters
  }, [pageIndex, pageSize, JSON.stringify(sorting), globalFilter, selectedCategories.join(","), selectedPriorities.join(","), selectedTeams.join(",")]);

  // Pagination UI helpers
  const handlePageChange = (oneBasedPage: number) => {
    const newIndex = Math.max(0, oneBasedPage - 1);
    if (newIndex !== pageIndex) setPageIndex(newIndex);
  }

  // Render
  return (
    <div className="space-y-6 mx-10">
      <PageHeader onAddProject={handleAddProject} />
      <StatCards stats={stats} />

      <Card className="py-4">
        <TableToolbar
          globalFilter={globalFilter}
          setGlobalFilter={(v) => { setGlobalFilter(v); setPageIndex(0); }}
          filters={{
            categories: {
              options: projectCategoryOpt,
              selected: selectedCategories,
              onChange: handleCategoryChange,
            },
            priorities: {
              options: projectPriorityOpt,
              selected: selectedPriorities,
              onChange: handlePriorityChange,
            },
            teams: {
              options: teams,
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
                  <PaginationItem>
                    <PaginationPrevious
                        onClick={() => handlePageChange((pageIndex + 1) - 1)}
                        aria-disabled={pageIndex === 0}
                        tabIndex={pageIndex === 0 ? -1 : undefined}
                        className={pageIndex === 0 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={(pageIndex === i)}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                    onClick={() => handlePageChange((pageIndex + 1) + 1)}
                    aria-disabled={pageIndex + 1 === totalPages || totalPages === 0}
                    tabIndex={pageIndex + 1 === totalPages ? -1 : undefined}
                    className={pageIndex + 1 === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedProject && (
        <ProjectDetailDialog project={selectedProject} isOpen={activeDialog === 'detail'} onClose={handleCloseDialog} />
      )}
      <Toaster position="top-center" />
    </div>
  );
}

/* ---------- Helper / subcomponents (unchanged) ---------- */

const PageHeader = ({ onAddProject }: { onAddProject: React.MouseEventHandler<HTMLButtonElement> }) => (
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
);

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
        <div className="text-2xl font-bold">
          {formatRupiah(stats.totalBudget)}
        </div>
        <p className="text-xs text-muted-foreground">Ready to Spend</p>
      </CardContent>
    </Card>
    <Card className="py-4 gap-0" data-testid="stat-big-projects">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Big Sized Projects
        </CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {Math.round(stats.bigSizedRatio * 100)}%
        </div>
        <p className="text-xs text-muted-foreground">of All Projects</p>
      </CardContent>
    </Card>
    <Card className="py-4 gap-0" data-testid="stat-critical-projects">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Critical Projects</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {Math.round(stats.criticalPriorityRatio * 100)}%
        </div>
        <p className="text-xs text-muted-foreground">of All Projects</p>
      </CardContent>
    </Card>
  </div>
);

const FilterDropdown = ({ title, filter }: { title: string; filter: any }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className="flex items-center gap-2 bg-transparent"
      >
        <Filter className="h-4 w-4" /> {title}
        {filter.selected.length > 0 && (
          <Badge variant="secondary" className="rounded-full px-2">
            {filter.selected.length}
          </Badge>
        )}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {filter.options.map((option: any) => (
        <DropdownMenuCheckboxItem
          key={option.id ?? option}
          checked={filter.selected.includes(option.id ?? option)}
          onCheckedChange={(checked) => filter.onChange(option.id ?? option, !!checked)}
        >
          {option.name ?? option}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const TableToolbar = ({
  globalFilter,
  setGlobalFilter,
  filters,
}: {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  filters: any;
}) => (
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
);

const ProjectsDataTable = ({ table, columns, paginatedRows }: { table: any; columns: any[]; paginatedRows: any[] }) => (
  <ScrollArea className="h-[500px]">
    <Table data-testid="project-table">
      <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
        {table.getHeaderGroups().map((headerGroup: any) => (
          <TableRow key={headerGroup.id} className="hover:bg-white">
            {headerGroup.headers.map((header: any) => (
              <TableHead
                key={header.id}
                className={
                  header.column.getCanSort() ? "cursor-pointer select-none" : ""
                }
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex items-center gap-2">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{ asc: "▲", desc: "▼" }[
                    header.column.getIsSorted() as string
                  ] ?? null}
                </div>
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {paginatedRows?.length ? (
          paginatedRows.map((row: any) => (
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
            <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </ScrollArea>
)

const ProjectDetailDialog = ({ project, isOpen, onClose }: { project: ProjectType, isOpen: boolean, onClose: () => void }) => {
  const workloadData = {
    totalEstimated: 2400,
    allocatedFTE: 2050,
    workloadGap: -350,
    budgetUsed: 350,
    budgetAvailable: project.budget - 350,
  };

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
          <DialogTitle className="text-xl font-semibold">
            {project.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Category
              </Label>
              <div>
                <Badge
                  variant="outline"
                  className={getCategoryColor(project.category)}
                >
                  {project.category}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Priority
              </Label>
              <div>
                <Badge
                  variant="outline"
                  className={getPriorityColor(project.priority)}
                >
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
              <Label className="text-sm font-medium text-muted-foreground">
                Crew
              </Label>
              <p className="text-sm">{project.crew} members</p>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Budget
              </Label>
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
            <Label className="text-sm font-medium text-muted-foreground">
              Assigned Team
            </Label>
            <p className="text-sm">{project.team.name}</p>
          </div>

          {/* ... the rest unchanged for detail layout ... */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
