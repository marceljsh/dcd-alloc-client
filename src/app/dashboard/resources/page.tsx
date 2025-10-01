'use client'

import { ComponentType, ReactNode, useEffect, useMemo, useState } from "react"
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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Mail, Phone, Calendar, MapPin, Filter, Table2 } from "lucide-react"
import { initials, formatEmploymentStatus, formatRole, formatLevel } from "@/lib/strings"
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
import { employeeLevelOpt, EmployeeRole, employeeRoleOpt, EmploymentStatus, employmentStatusOpt } from "@/types/common"
import { Contract, Employee, EmployeeDetail, RawEmployee, RawEmployeeDetails } from "@/types/employee"
import { AddEmployeeFormValues, AddEmployeeForm } from "@/components/employee/AddEmployeeForm"
import { Separator } from "@/components/ui/separator"
import { mapRawToEmployee, mapRawToEmployeeDetails } from "@/lib/mapper"
import { ApiResponse, Paging } from "@/types/api"

export default function ResourcesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)

  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Resource",
        cell: ({ row }) => <IdentityCell employee={row.original} />,
      },
      {
        accessorKey: "nip",
        header: "NIP",
        cell: ({ row }) => <div className="font-mono">{row.original.nip}</div>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
        filterFn: "arrIncludesSome",
      },
      { accessorKey: "level", header: "Level", filterFn: "arrIncludesSome", cell: ({ row }) => formatLevel(row.original.level) },
      { accessorKey: "team", header: "Team", cell: ({ row }) => row.original.team.name },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        filterFn: "arrIncludesSome",
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <ActionMenu
            employee={row.original}
            onViewDetails={setSelectedEmployee}
            onSendEmail={(employee) => toast.success(`Sent email to ${employee.email}`)}
            onRemove={setEmployeeToDelete}
          />
        ),
      },
    ],
    [],
  )

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
        if (!value || value.length === 0) return true
        return value.includes(row.getValue(columnId))
      },
    },
  })

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('You are not authenticated')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Failed to fetch employees')
      }

      const fetched: ApiResponse<Paging<RawEmployee>> = await res.json()
      if (!fetched.success || !fetched.data) {
        throw new Error(fetched.message || 'Failed to fetch employees')
      }

      const mapped: Employee[] = fetched.data.items.map(mapRawToEmployee)
      setEmployees(mapped)
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load employees')
    }
  }

  const handleAddEmployee = async (data: AddEmployeeFormValues) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('You are not authenticated')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Failed to add employee')
      }

      const response: ApiResponse<RawEmployee> = await res.json()
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to add employee')
      }

      setIsAddDialogOpen(false)
      toast.success(`${data.name} has been added`)

      await fetchEmployees()
    } catch (error) {
      console.error('Error adding employee:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add employee')
    }
  }

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('You are not authenticated')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/${employee.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `Failed to delete employee ${employee.name}`)
      }

      toast.success(`${employee.name} has been removed.`)
      setEmployeeToDelete(null)

      await fetchEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error(error instanceof Error ? error.message : `Failed to delete employee ${employee.name}`)
    }
  }

  const handleFilterChange =
    (
      columnId: string,
      currentSelection: string[],
      setter: React.Dispatch<React.SetStateAction<string[]>>,
    ) =>
    (value: string, checked: boolean) => {
      const newSelection = checked ? [...currentSelection, value] : currentSelection.filter((item) => item !== value)

      setter(newSelection)
      table.getColumn(columnId)?.setFilterValue(newSelection.length > 0 ? newSelection : undefined)
    }

  const handleRoleFilterChange = handleFilterChange('role', selectedRoles, setSelectedRoles)
  const handleLevelFilterChange = handleFilterChange('level', selectedLevels, setSelectedLevels)
  const handleStatusFilterChange = handleFilterChange('status', selectedStatuses, setSelectedStatuses)

  return (
    <div className="flex flex-col h-full space-y-6 mx-10">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">Manage your team members and their assignments</p>
        </div>
        <AddEmployeeDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAddEmployee} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Contract Resources"
          description="Members"
          value={
            <>
              {employees.filter((emp) => emp.status === "CR").length}
              <span className="text-base font-normal">{` / ${employees.length}`}</span>
            </>
          }
        />
        <StatCard
          title="Software Engineer"
          description="Skilled Coders"
          value={employees.filter((emp) => emp.role === "SWE").length}
        />
        <StatCard
          title="Data Engineer"
          description="Keen Minds"
          value={employees.filter((emp) => emp.role === "DTE").length}
        />
        <StatCard
          title="System Analyst"
          description="People"
          value={employees.filter((emp) => emp.role === "SLA").length}
        />
      </div>

      {/* Table */}
      <Card className="flex-1 flex flex-col py-4 min-h-0">
        <CardHeader className="flex flex-row items-center justify-between shrink-0">
          <CardTitle className="text-xl">Team Members</CardTitle>

          <div className="flex items-center gap-2">
            {/* Role Filter */}
            <FilterDropdown label="Role" options={employeeRoleOpt} selected={selectedRoles} onChange={handleRoleFilterChange} formatter={formatRole} />

            {/* Level Filter */}
            <FilterDropdown label="Level" options={employeeLevelOpt} selected={selectedLevels} onChange={handleLevelFilterChange} formatter={formatLevel} />

            {/* Status Filter */}
            <FilterDropdown label="Status" options={employmentStatusOpt} selected={selectedStatuses} onChange={handleStatusFilterChange} formatter={formatEmploymentStatus} />

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search resources..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-8" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-white">
                    {headerGroup.headers.map((header) => (
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedEmployee && <EmployeeDetailDialog employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />}
      {employeeToDelete && (
        <DeleteEmployeeDialog
          employee={employeeToDelete}
          isOpen={true}
          onOpenChange={() => setEmployeeToDelete(null)}
          onDelete={handleDeleteEmployee}
        />
      )}

      <Toaster theme="light" position="top-center" richColors />
    </div>
  )
}

const getRoleColor = (role: EmployeeRole): string => {
  switch (role) {
    case "SLA": return "bg-blue-100 text-blue-800"
    case "DTE": return "bg-green-100 text-green-800"
    case "SWE": return "bg-purple-100 text-purple-800"
  }
}

const getStatusColor = (status: EmploymentStatus): string => {
  switch (status) {
    case "OR": return "bg-green-100 text-green-800"
    case "CR": return "bg-yellow-100 text-yellow-800"
  }
}

const AddEmployeeDialog = ({ isOpen, onOpenChange, onAdd }: {
  isOpen: boolean,
  onOpenChange: (open: boolean) => void,
  onAdd: (data: AddEmployeeFormValues) => void
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
      <AddEmployeeForm onSubmit={onAdd} onCancel={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
)

const StatCard = ({ title, value, description }: { title: string, value: ReactNode, description: string }) => (
  <Card className="py-4 gap-0">
    <CardHeader>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

const FilterDropdown = <T extends string>({ label, options, selected, onChange, formatter }: {
  label: string,
  options: readonly T[],
  selected: readonly T[],
  onChange: (option: T, checked: boolean) => void,
  formatter?: (option: T) => string
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="flex items-center gap-2">
        <Filter className="h-4 w-4" /> {label}
        {selected.length > 0 && (
          <Badge variant="secondary" className="rounded-full px-2">{selected.length}</Badge>
        )}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Filter by {label}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {options.map((opt) => (
        <DropdownMenuCheckboxItem key={opt} checked={selected.includes(opt)} onCheckedChange={(checked) => onChange(opt, !!checked)}>
          {formatter ? formatter(opt) : opt}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

const IdentityCell = ({ employee }: { employee: Employee }) => (
  <div className="flex items-center space-x-3">
    <Avatar>
      <AvatarFallback className={`font-mono text-background ${getRoleColor(employee.role)}`}>{initials(employee.name)}</AvatarFallback>
    </Avatar>
    <div>
      <div className="font-medium">{employee.name}</div>
      <div className="font-normal text-sm text-muted-foreground">{employee.email}</div>
    </div>
  </div>
)

const RoleBadge = ({ role }: { role: EmployeeRole }) => (
  <Badge variant="outline" className={getRoleColor(role)}>
    {formatRole(role)}
  </Badge>
)

const StatusBadge = ({ status }: { status: EmploymentStatus }) => (
  <Badge variant="outline" className={getStatusColor(status)}>
    {formatEmploymentStatus(status)}
  </Badge>
)

const ActionMenu = ({ employee, onViewDetails, onSendEmail, onRemove }: {
  employee: Employee
  onViewDetails: (employee: Employee) => void
  onSendEmail: (employee: Employee) => void
  onRemove: (employee: Employee) => void
}) => (
  <div className="text-center">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => onViewDetails(employee)}>
          <Edit className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onSendEmail(employee)}>
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-red-400" onClick={() => onRemove(employee)}>
          <Trash2 className="mr-2 h-4 w-4 text-red-400" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)

const DeleteEmployeeDialog = ({ employee, isOpen, onOpenChange, onDelete }: {
  employee: Employee
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (employee: Employee) => void
}) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently remove <strong>{employee.name}</strong> from your team.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => onDelete(employee)} className="bg-red-600 hover:bg-red-700">
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

const EmployeeDetailDialog = ({ employee, onClose }: { employee: Employee | null, onClose: () => void }) => {
  const [details, setDetails] = useState<EmployeeDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!employee) return
    const fetchDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('You are not authenticated')

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/${employee.id}/detail`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(errText || 'Failed to fetch employee details')
        }

        const fetched: ApiResponse<RawEmployeeDetails> = await res.json()
        if (!fetched.success || !fetched.data) {
          throw new Error(fetched.message || 'No detail data')
        }

        const mapped = mapRawToEmployeeDetails(fetched.data)
        setDetails(mapped)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [employee])

  if (!employee) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className={`font-mono text-background ${getRoleColor(employee.role)}`}>
                {initials(employee.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div>{employee.name}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {formatRole(employee.role)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-sm text-red-500">Failed: {error}</p>
        )}
        {details && (
          <div className="grid gap-4 py-4">
            <DetailItem icon={Mail} value={employee.email} />
            <DetailItem icon={Phone} value={`+${details.phoneNumber}`} />
            <DetailItem icon={MapPin} value={details.address} />
            <DetailItem
              icon={Calendar}
              value={`Joined ${new Date(details.joinDate).toLocaleDateString("en-US")}`}
            />

            {employee.status === 'CR' && details.contract && (
              <>
                <Separator className="my-4" />
                <ContractDetails contract={details.contract} />
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

const ContractDetails = ({ contract }: { contract: Contract }) => (
  <div>
    <p className="text-md font-semibold">Contract Details</p>
    <div className="grid grid-cols-2 gap-4">
      <ContractField label="Start" value={contract.start} />
      <ContractField label="End" value={contract.end} />

      <div className="col-span-2">
        <Label className="text-xs text-muted-foreground">Contract File</Label>

        {contract.url ? (
          <div className="mt-2 border rounded overflow-hidden">
            <iframe src={contract.url} title="Contract PDF" className="w-full h-48" />
          </div>
        ) : (
          <div className="mt-2">
            <div className="w-full h-48 rounded bg-slate-300/50 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  </div>
)

const DetailItem = ({ icon: Icon, value }: { icon: ComponentType<{ className?: string }>, value: string }) => (
  <div className="flex items-center space-x-2">
    <Icon className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm">{value}</span>
  </div>
)

const ContractField = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <p className="text-sm">{value}</p>
  </div>
)
