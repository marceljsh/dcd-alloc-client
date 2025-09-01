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
  ColumnFiltersState,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Calendar, Users, Target, Clock, Filter } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProjectRow } from "@/types/project"
import rawProjects from "@/data/projects.json"
import { ProjectCategory, ProjectPriority } from "@/types/common"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { AddProjectForm } from "@/components/project/AddProjectForm"
import ProjectTimeline from "@/components/ProjectTimeline"

// -----------------------------------------------------------------------------
// Data & Constants
// -----------------------------------------------------------------------------
const projectsData: ProjectRow[] = rawProjects as ProjectRow[]

export const PROJECT_CATEGORY_OPTIONS = ['Small', 'Medium', 'Big'] as const;
export const PROJECT_PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'] as const;
export const TEAM_OPTIONS = ['DMA', 'NCM', 'CRM', 'CM', 'FRM', 'RRM'] as const;

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------
const getCategoryColor = (category: ProjectCategory) => {
  switch (category) {
    case 'Small':   return 'bg-blue-100 text-blue-800'
    case 'Medium':  return 'bg-green-100 text-green-800'
    case 'Big':     return 'bg-yellow-100 text-yellow-800'
  }
}

const getPriorityColor = (priority: ProjectPriority) => {
  switch (priority) {
    case 'Low':       return 'bg-green-100 text-green-800'
    case 'Medium':    return 'bg-yellow-100 text-yellow-800'
    case 'High':      return 'bg-orange-100 text-orange-800'
    case 'Critical':  return 'bg-red-100 text-red-800'
  }
}

type ActiveDialog = 'add' | 'detail' | 'timeline' | null;

export default function ProjectsPage() {
  // --- STATE MANAGEMENT ---
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null);
  
  // State untuk UI checkbox filter
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // State untuk logic Tanstack Table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // --- COLUMN DEFINITIONS ---
  const columns = useMemo<ColumnDef<ProjectRow>[]>(() => [
    { accessorKey: 'code', header: 'Project Code', cell: ({ row }) => <div className="font-mono">{row.getValue('code')}</div> },
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div> },
    { accessorKey: 'team', header: 'Team', filterFn: 'arrIncludesSome' },
    { accessorKey: 'category', header: 'Category', cell: ({ row }) => <Badge variant="outline" className={getCategoryColor(row.getValue('category'))}>{row.getValue('category')}</Badge>, filterFn: 'arrIncludesSome' },
    { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => <Badge variant="outline" className={getPriorityColor(row.getValue('priority'))}>{row.getValue('priority')}</Badge>, filterFn: 'arrIncludesSome' },
    { accessorKey: 'crew', header: 'Crew', cell: ({ row }) => <div className="flex items-center space-x-1"><Users className="h-4 w-4 text-muted-foreground" /><span>{row.getValue('crew')}</span></div> },
    { accessorKey: 'budgetCode', header: 'Budget Code', cell: ({ row }) => <div className="font-mono">{row.getValue('budgetCode')}</div> },
    { accessorKey: 'budget', header: 'Budget', cell: ({ row }) => `$${(row.getValue('budget') as number).toLocaleString()}` },
    { accessorKey: 'startDate', header: 'Start Date', cell: ({ row }) => new Date(row.getValue('startDate')).toLocaleDateString('id-ID') },
    { accessorKey: 'endDate', header: 'End Date', cell: ({ row }) => new Date(row.getValue('endDate')).toLocaleDateString('id-ID') },
    {
      id: 'actions',
      cell: ({ row }) => {
        const project = row.original;
        const openDialog = (dialog: ActiveDialog) => {
          setSelectedProject(project);
          setActiveDialog(dialog);
        };
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openDialog('detail')}><Edit className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialog('timeline')}><Calendar className="mr-2 h-4 w-4" /> View Timeline</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-400"><Trash2 className="mr-2 h-4 w-4 text-red-400" /> Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ], []);

  // --- TABLE INSTANCE ---
  const table = useReactTable({
    data: projectsData,
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
        if (!value || value.length === 0) return true;
        return value.includes(row.getValue(columnId));
      }
    }
  });
  
  // --- EVENT HANDLERS ---
  const handleFilterChange = (
    columnId: string,
    currentSelection: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => (value: string, checked: boolean) => {
    const newSelection = checked
      ? [...currentSelection, value]
      : currentSelection.filter(item => item !== value);
    
    setter(newSelection);
    table.getColumn(columnId)?.setFilterValue(newSelection.length > 0 ? newSelection : undefined);
  };
  
  const handleCategoryChange = handleFilterChange('category', selectedCategories, setSelectedCategories);
  const handlePriorityChange = handleFilterChange('priority', selectedPriorities, setSelectedPriorities);
  const handleTeamChange = handleFilterChange('team', selectedTeams, setSelectedTeams);
  
  const handleCloseDialog = () => {
    setActiveDialog(null);
    setSelectedProject(null);
  };
  
  // --- MEMOIZED CALCULATIONS ---
  const stats = useMemo(() => ({
    totalProjects: projectsData.length,
    totalBudget: projectsData.reduce((sum, p) => sum + p.budget, 0),
    bigSizedRatio: projectsData.filter(p => p.category === 'Big').length / projectsData.length,
    criticalPriorityRatio: projectsData.filter(p => p.priority === 'Critical').length / projectsData.length,
  }), []);

  // --- RENDER ---
  return (
    <div className="space-y-6 mx-10">
      <PageHeader onAddProject={() => setActiveDialog('add')} />
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
          <ProjectsDataTable table={table} columns={columns} />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProjectDetailDialog 
        project={selectedProject} 
        isOpen={activeDialog === 'detail'} 
        onClose={handleCloseDialog} 
      />
      <ProjectTimelineDialog 
        project={selectedProject} 
        isOpen={activeDialog === 'timeline'} 
        onClose={handleCloseDialog} 
      />
      <AddProjectDialog 
        isOpen={activeDialog === 'add'} 
        onClose={handleCloseDialog} 
      />
      
      <Toaster position="top-center" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Internal Components for better structure
// -----------------------------------------------------------------------------

const PageHeader = ({ onAddProject }: { onAddProject: () => void }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold">Projects</h1>
      <p className="text-muted-foreground">Manage your projects and track their progress</p>
    </div>
    <Button onClick={onAddProject}><Plus className="h-4 w-4 mr-2" />Add Project</Button>
  </div>
);

const StatCards = ({ stats }: { stats: any }) => (
  <div className="grid gap-3 md:grid-cols-4">
    <Card className="py-4 gap-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">{stats.totalProjects}</div><p className="text-xs text-muted-foreground">Things to Do</p></CardContent></Card>
    <Card className="py-4 gap-0"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Budget</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div><p className="text-xs text-muted-foreground">Ready to Spend</p></CardContent></Card>
    <Card className="py-4 gap-0"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Big Sized Projects</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{Math.round(stats.bigSizedRatio * 100)}%</div><p className="text-xs text-muted-foreground">of All Projects</p></CardContent></Card>
    <Card className="py-4 gap-0"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Critical Projects</CardTitle><Target className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{Math.round(stats.criticalPriorityRatio * 100)}%</div><p className="text-xs text-muted-foreground">of All Projects</p></CardContent></Card>
  </div>
);

const FilterDropdown = ({ title, filter }: { title: string, filter: any }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="flex items-center gap-2">
        <Filter className="h-4 w-4" /> {title}
        {filter.selected.length > 0 && <Badge variant="secondary" className="rounded-full px-2">{filter.selected.length}</Badge>}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {filter.options.map((option: string) => (
        <DropdownMenuCheckboxItem key={option} checked={filter.selected.includes(option)} onCheckedChange={(checked) => filter.onChange(option, !!checked)}>
          {option}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const TableToolbar = ({ globalFilter, setGlobalFilter, filters }: { globalFilter: string, setGlobalFilter: (value: string) => void, filters: any }) => (
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle className="text-xl">Project Portfolio</CardTitle>
    <div className="flex items-center gap-2">
      <FilterDropdown title="Category" filter={filters.categories} />
      <FilterDropdown title="Priority" filter={filters.priorities} />
      <FilterDropdown title="Team" filter={filters.teams} />
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search projects..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-8" />
      </div>
    </div>
  </CardHeader>
);

const ProjectsDataTable = ({ table, columns }: { table: any, columns: any[] }) => (
  <ScrollArea className="h-[500px]">
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
        {table.getHeaderGroups().map((headerGroup: any) => (
          <TableRow key={headerGroup.id} className="hover:bg-white">
            {headerGroup.headers.map((header: any) => (
              <TableHead key={header.id} className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''} onClick={header.column.getToggleSortingHandler()}>
                <div className="flex items-center gap-2">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: '▲', desc: '▼' }[header.column.getIsSorted() as string] ?? null}
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
          <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  </ScrollArea>
);

// --- DIALOG COMPONENTS ---
const AddProjectDialog = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader><DialogTitle>Add New Project</DialogTitle><DialogDescription>Create a new project to track progress and manage resources.</DialogDescription></DialogHeader>
      <AddProjectForm onCancel={onClose} />
    </DialogContent>
  </Dialog>
);

const ProjectDetailDialog = ({ project, isOpen, onClose }: { project: ProjectRow | null, isOpen: boolean, onClose: () => void }) => {
  if (!project) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{project.name}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-medium">Category</Label><Badge variant="outline" className={`mt-1 ${getCategoryColor(project.category)}`}>{project.category}</Badge></div>
                <div><Label className="text-sm font-medium">Priority</Label><Badge variant="outline" className={`mt-1 ${getPriorityColor(project.priority)}`}>{project.priority}</Badge></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-medium">Start Date</Label><p className="text-sm mt-1">{new Date(project.startDate).toLocaleDateString('id-ID')}</p></div>
                <div><Label className="text-sm font-medium">End Date</Label><p className="text-sm mt-1">{new Date(project.endDate).toLocaleDateString('id-ID')}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-medium">Crew</Label><p className="text-sm mt-1">{project.crew} members</p></div>
                <div><Label className="text-sm font-medium">Budget</Label><p className="text-sm mt-1">${project.budget.toLocaleString()}</p></div>
            </div>
            <div><Label className="text-sm font-medium">Assigned Team</Label><p className="text-sm mt-1">{project.team}</p></div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Overall Progress</span><span>13/20 tasks</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full w-[65%]" /></div>
                <p className="text-sm text-muted-foreground">65% complete</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProjectTimelineDialog = ({ project, isOpen, onClose }: { project: ProjectRow | null, isOpen: boolean, onClose: () => void }) => {
  if (!project) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-7xl">
        <DialogHeader><DialogTitle>Timeline: {project.name}</DialogTitle><DialogDescription>Visualisasi timeline</DialogDescription></DialogHeader>
        <div className="py-4 overflow-x-auto"><ProjectTimeline project={project} /></div>
      </DialogContent>
    </Dialog>
  );
};