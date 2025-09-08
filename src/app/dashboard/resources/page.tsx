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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Copy,
  Filter,
  TableIcon,
  Grid3X3,
} from "lucide-react"
import { initials } from "@/lib/strings"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EMPLOYMENT_STATUS_OPTIONS, EmploymentStatus, Role, ROLE_LEVEL_OPTIONS, ROLE_OPTIONS } from "@/types/common"
import rawEmployees from "@/data/employees.json"
import {
  ContractEmployee,
  EmployeeRow,
  PermanentEmployee,
} from "@/types/employee"
import {
  AddEmployeeFormValues,
  AddEmployeeForm,
} from "@/components/employee/AddEmployeeForm"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import EmployeeHeatmap from "@/components/employee/EmployeeHeatmap"

type ViewMode = 'table' | 'heatmap'

const getRoleColor = (role: Role) => {
  switch (role) {
    case "System Analyst":      return "bg-blue-100 text-blue-800"
    case "Data Engineer":       return "bg-green-100 text-green-800"
    case "Software Engineer":   return "bg-purple-100 text-purple-800"
  }
}

const getStatusColor = (status: EmploymentStatus) => {
  switch (status) {
    case "Permanent": return "bg-green-100 text-green-800"
    case "Contract":  return "bg-yellow-100 text-yellow-800"
  }
}

const createEmployee = ({ status, ...data }: AddEmployeeFormValues): EmployeeRow => {
  const now = new Date().toISOString()
  const base = {
    id: Math.floor(Math.random() * 1000000),
    createdAt: now,
    updatedAt: now,
    status,
  }

  switch (status) {
    case "Permanent":
      return { ...base, ...data, code: `ORG-${Math.floor(Math.random() * 1000000)}` } as PermanentEmployee
    case "Contract":
      return { ...base, ...data, status: "Contract", code: `CR-${Math.floor(Math.random() * 10000000)}` } as ContractEmployee
    default:
      throw new Error("Invalid employee status")
  }
}

const initialEmployees: EmployeeRow[] = rawEmployees.map(
  ({ status, ...data }: any) => {
    switch (status) {
      case "Permanent": return { status, ...data } as PermanentEmployee
      case "Contract": return { status, ...data } as ContractEmployee
      default: throw new Error("Invalid employee status")
    }
  }
)

export default function ResourcesPage() {
  // --- STATE MANAGEMENT ---
  const [employees, setEmployees] = useState<EmployeeRow[]>(initialEmployees)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRow | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<EmployeeRow>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Resource',
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className={`font-mono text-background ${getRoleColor(employee.role)}`}>
                {initials(employee.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{employee.name}</div>
              <div className="font-normal text-sm text-muted-foreground">{employee.email}</div>
            </div>
          </div>
        )
      }
    },
    { accessorKey: 'code', header: 'NIP', cell: ({ row }) => <div className="font-mono">{row.getValue('code')}</div> },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => <Badge variant="outline" className={getRoleColor(row.getValue('role'))}>{row.getValue('role')}</Badge>, filterFn: 'arrIncludesSome' },
    { accessorKey: 'level', header: 'Level', filterFn: 'arrIncludesSome' },
    { accessorKey: 'team', header: 'Team' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant="outline" className={getStatusColor(row.getValue('status'))}>{row.getValue('status')}</Badge>, filterFn: 'arrIncludesSome' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSelectedEmployee(employee)}><Edit className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success(`Sent email to ${employee.email}`)}><Mail className="mr-2 h-4 w-4" /> Send Email</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400" onClick={() => setEmployeeToDelete(employee)}><Trash2 className="mr-2 h-4 w-4 text-red-400" /> Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ], []);

  // --- TABLE INSTANCE ---
  const table = useReactTable({
    data: employees,
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
    },
  });

  // --- EVENT HANDLERS ---
  const handleAddEmployee = (data: AddEmployeeFormValues) => {
    const employee = createEmployee(data);
    setEmployees(prev => [...prev, employee]);
    setIsAddDialogOpen(false);
    toast(`${employee.name} has been added to the team.`);
  }

  const handleDeleteEmployee = (employee: EmployeeRow) => {
    setEmployees(prev => prev.filter((emp) => emp.id !== employee.id));
    setEmployeeToDelete(null);
    toast.success(`${employee.name} has been removed.`);
  }

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

  const handleRoleFilterChange = handleFilterChange('role', selectedRoles, setSelectedRoles);
  const handleLevelFilterChange = handleFilterChange('level', selectedLevels, setSelectedLevels);
  const handleStatusFilterChange = handleFilterChange('status', selectedStatuses, setSelectedStatuses);

  return (
    <div className="space-y-6 mx-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">Manage your team members and their assignments</p>
        </div>

        {/* Add Employee Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>Add a member to your domain.</DialogDescription>
            </DialogHeader>
            <AddEmployeeForm onSubmit={handleAddEmployee} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="py-4 gap-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Contract Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <span className="text-2xl font-bold">
                {employees.filter((emp) => emp.status === "Contract").length}
              </span>
              {` / ${employees.length}`}
            </p>
            <p className="text-xs text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        <Card className="py-4 gap-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Software Engineer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {employees.filter((emp) => emp.role === "Software Engineer").length}
            </p>
            <p className="text-xs text-muted-foreground">Skilled Coders</p>
          </CardContent>
        </Card>
        <Card className="py-4 gap-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Data Engineer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {employees.filter((emp) => emp.role === "Data Engineer").length}
            </p>
            <p className="text-xs text-muted-foreground">Keen Minds</p>
          </CardContent>
        </Card>
        <Card className="py-4 gap-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">System Analyst</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {employees.filter((emp) => emp.role === "System Analyst").length}
            </p>
            <p className="text-xs text-muted-foreground">People</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="py-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl">Team Members</CardTitle>
            <ToggleGroup type="single" value={viewMode} onValueChange={(val) => val && setViewMode(val as ViewMode)}>
              <ToggleGroupItem value="table" aria-label="Table view">
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="heatmap" aria-label="Heatmap view">
                <Grid3X3 className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            {/* Role Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Role
                    {selectedRoles.length > 0 && (
                      <Badge variant="secondary" className="rounded-full px-2">
                        {selectedRoles.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ROLE_OPTIONS.map((role) => (
                      <DropdownMenuCheckboxItem
                        key={role}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={(checked) => handleRoleFilterChange(role, !!checked)}
                      >
                        {role}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Level Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Level
                    {selectedLevels.length > 0 && (
                      <Badge variant="secondary" className="rounded-full px-2">
                        {selectedLevels.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Level</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ROLE_LEVEL_OPTIONS.map((level) => (
                      <DropdownMenuCheckboxItem
                        key={level}
                        checked={selectedLevels.includes(level)}
                        onCheckedChange={(checked) => handleLevelFilterChange(level, !!checked)}
                      >
                        {level}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Status
                    {selectedStatuses.length > 0 && (
                      <Badge variant="secondary" className="rounded-full px-2">
                        {selectedStatuses.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {EMPLOYMENT_STATUS_OPTIONS.map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={(checked) => handleStatusFilterChange(status, !!checked)}
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8"
              />
            </div>

          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[500px]">
            {viewMode === 'heatmap' ? (
              <EmployeeHeatmap employees={employees.map((emp) => {
                return {
                  ...emp,
                  utilization: Math.random() * 100,
                  currentProjects: [],
                  hoursThisWeek: 0,
                }
              })} />
            ) : (
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id} className="hover:bg-white">
                      {headerGroup.headers.map(header => (
                        <TableHead
                          key={header.id}
                          className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
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
                    table.getRowModel().rows.map(row => (
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
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Employee Details Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedEmployee && (
            <>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className={`font-mono text-background ${getRoleColor(selectedEmployee.role)}`}>
                    {initials(selectedEmployee.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div>{selectedEmployee.name}</div>
                  <div className="text-sm text-muted-foreground font-normal">{selectedEmployee.role}</div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedEmployee.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">+{selectedEmployee.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedEmployee.location || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Joined {new Date(selectedEmployee.joinDate).toLocaleDateString("id-ID")}</span>
              </div>

              {selectedEmployee.status === "Contract" && (
                <>
                  <Separator className="my-4" />
                  <p className="text-md font-semibold">Contract Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Start</Label>
                      <p className="text-sm">{selectedEmployee.contractStartDate}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">End</Label>
                      <p className="text-sm">{selectedEmployee.contractEndDate}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Employee Confirmation */}
      <AlertDialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove <strong>{employeeToDelete?.name}</strong> from your team.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => employeeToDelete && handleDeleteEmployee(employeeToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster theme="light" position="top-center" richColors />
    </div>
  )
}
