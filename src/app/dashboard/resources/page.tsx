"use client";

import { ComponentType, ReactNode, useMemo, useState,useRef } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Mail, Phone, Calendar, MapPin, Filter, Table2, Grid3X3 } from "lucide-react"
import { initials } from "@/lib/strings"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { DateRangePicker } from "@/components/ui/date-range-picker"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { employeeLevels, EmployeeRole, employeeRoles, EmploymentStatus, employmentStatuses } from "@/types/common"
import rawEmployees from "@/data/employees.json"
import { ContractEmployee, EmployeeRow, PermanentEmployee } from "@/types/employee"
import { AddEmployeeFormValues, AddEmployeeForm } from "@/components/employee/AddEmployeeForm"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import EmployeeHeatmap from "@/components/employee/EmployeeHeatmap"

type ViewMode = "table" | "heatmap";

export default function ResourcesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>(initialEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(
    null,
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRow | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
      from: undefined,
      to: undefined,
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      if (globalFilter && !employee.name.toLowerCase().includes(globalFilter.toLowerCase())) {
        return false;
      }
      if (selectedRoles.length > 0 && !selectedRoles.includes(employee.role)) {
        return false;
      }
      if (selectedLevels.length > 0 && !selectedLevels.includes(employee.level)) {
        return false;
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(employee.status)) {
        return false;
      }
      return true;
    });
  }, [employees, globalFilter, selectedRoles, selectedLevels, selectedStatuses]);

  const scrollRef = useRef<HTMLDivElement>(null)

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    const startX = e.pageX - scrollRef.current.offsetLeft
    const scrollLeft = scrollRef.current.scrollLeft

    const onMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - scrollRef.current!.offsetLeft
      const walk = (x - startX) * 1.2
      scrollRef.current!.scrollLeft = scrollLeft - walk
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }



  const columns = useMemo<ColumnDef<EmployeeRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Resource",
        cell: ({ row }) => <IdentityCell employee={row.original} />,
      },
      {
        accessorKey: "code",
        header: "NIP",
        cell: ({ row }) => <div className="font-mono">{row.original.code}</div>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
        filterFn: "arrIncludesSome",
      },
      { accessorKey: "level", header: "Level", filterFn: "arrIncludesSome" },
      { accessorKey: "team", header: "Team" },
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
            onSendEmail={(employee) =>
              toast.success(`Sent email to ${employee.email}`)
            }
            onRemove={setEmployeeToDelete}
          />
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredEmployees,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      arrIncludesSome: (row, columnId, value) => {
        if (!value || value.length === 0) return true;
        return value.includes(row.getValue(columnId));
      },
    },
  });

    const allFilteredAndSortedRows = table.getSortedRowModel().rows
    const itemsPerPage = 10
    const totalPages = Math.ceil(allFilteredAndSortedRows.length / itemsPerPage)
    const paginatedRows = allFilteredAndSortedRows.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )

  // Fungsi untuk menangani navigasi halaman
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddEmployee = (data: AddEmployeeFormValues) => {
    const employee = createEmployee(data);
    setEmployees((prev) => [...prev, employee]);
    setIsAddDialogOpen(false);
    toast(`${employee.name} has been added to the team.`);
  };

  const handleDeleteEmployee = (employee: EmployeeRow) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
    setEmployeeToDelete(null);
    toast.success(`${employee.name} has been removed.`);
  };

  const handleDropdownFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => (value: string, checked: boolean) => {
    setter(prev =>
      checked ? [...prev, value] : prev.filter(item => item !== value)
    );
  };

  const handleRoleFilterChange = handleDropdownFilterChange(setSelectedRoles);
  const handleLevelFilterChange = handleDropdownFilterChange(setSelectedLevels);
  const handleStatusFilterChange = handleDropdownFilterChange(setSelectedStatuses);

  return (
    <div className="space-y-2 mx-10">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">
            Manage your team members and their assignments
          </p>
        </div>

        <AddEmployeeDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={handleAddEmployee}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Contract Resources"
          value={
            <>
            {filteredEmployees.filter((emp) => emp.status === "Contract").length}
            <span className="text-base font-normal">{` / ${filteredEmployees.length}`}</span>
            </>
          }
          description="Members"
        />
        <StatCard
          title="Software Engineer"
          value={filteredEmployees.filter((emp) => emp.role === 'Software Engineer').length}
          description="People"
        />
        <StatCard
          title="Data Engineer"
          value={filteredEmployees.filter((emp) => emp.role === 'Data Engineer').length}
          description="People"
        />
        <StatCard
          title="System Analyst"
          value={filteredEmployees.filter((emp) => emp.role === 'System Analyst').length}
          description="People"
        />
      </div>

      {/* Table */}
      <Card className="py-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl">Team Members</CardTitle>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(val) => val && setViewMode(val as ViewMode)}
            >
              <ToggleGroupItem value="table" aria-label="Table view">
                <Table2 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="heatmap" aria-label="Heatmap view">
                <Grid3X3 className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">


           {viewMode === "heatmap" ? (
               <DateRangePicker
                 dateRange={dateRange}
                 onDateRangeChange={setDateRange}
                 placeholder={<span className="font-semibold">Period</span>}
                 data-testid="date-range-picker"
               />
             ) : null}

            <FilterDropdown
              label="Role"
              options={employeeRoles}
              selected={selectedRoles}
              onChange={handleRoleFilterChange}
            />
            <FilterDropdown
              label="Level"
              options={employeeLevels}
              selected={selectedLevels}
              onChange={handleLevelFilterChange}
            />
            <FilterDropdown
              label="Status"
              options={employmentStatuses}
              selected={selectedStatuses}
              onChange={handleStatusFilterChange}
            />
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
              {viewMode === "heatmap" ? (
                <div className="relative rounded-md">
                  <EmployeeHeatmap 
                    employees={filteredEmployees.map(emp => ({
                      ...emp,
                      utilization: Math.random() * 100,
                      currentProjects: [],
                      hoursThisWeek: 0,
                    }))}
                  />
                </div>
              )  : (
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-white">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
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
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
        </CardContent>

        {viewMode === 'table' && (
          <div className="px-6 pb-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-disabled={currentPage === 1}
                    tabIndex={currentPage === 1 ? -1 : undefined}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
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
      </Card>
      <EmployeeDetailDialog
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        getRoleColor={getRoleColor}
        initials={initials}
      />
      <DeleteEmployeeDialog
        employee={employeeToDelete}
        isOpen={!!employeeToDelete}
        onOpenChange={() => setEmployeeToDelete(null)}
        onDelete={handleDeleteEmployee}
      />
      <Toaster theme="light" position="top-center" richColors />
    </div>
  );
}

const getRoleColor = (role: EmployeeRole): string => {
  switch (role) {
    case "System Analyst":
      return "bg-blue-100 text-blue-800";
    case "Data Engineer":
      return "bg-green-100 text-green-800";
    case "Software Engineer":
      return "bg-purple-100 text-purple-800";
  }
};

const getStatusColor = (status: EmploymentStatus): string => {
  switch (status) {
    case "Permanent":
      return "bg-green-100 text-green-800";
    case "Contract":
      return "bg-yellow-100 text-yellow-800";
  }
};

const createEmployee = ({
  status,
  ...data
}: AddEmployeeFormValues): EmployeeRow => {
  const now = new Date().toISOString();
  const base = {
    id: Math.floor(Math.random() * 1000000),
    createdAt: now,
    updatedAt: now,
    status,
  };

  switch (status) {
    case "Permanent":
      return {
        ...base,
        ...data,
        code: `ORG-${Math.floor(Math.random() * 1000000)}`,
      } as PermanentEmployee;
    case "Contract":
      return {
        ...base,
        ...data,
        status: "Contract",
        code: `CR-${Math.floor(Math.random() * 10000000)}`,
      } as ContractEmployee;
  }
};

const initialEmployees: EmployeeRow[] = rawEmployees.map(
  ({ status, ...data }: any) => {
    switch (status) {
      case "Permanent":
        return { status, ...data } as PermanentEmployee;
      case "Contract":
        return { status, ...data } as ContractEmployee;
      default:
        throw new Error("Invalid employee status");
    }
  },
);

const AddEmployeeDialog = ({
  isOpen,
  onOpenChange,
  onAdd,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: AddEmployeeFormValues) => void;
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
);

const StatCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: ReactNode;
  description: string;
}) => (
  <Card className="py-4 gap-0">
    <CardHeader>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const FilterDropdown = <T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly T[];
  selected: readonly T[];
  onChange: (option: T, checked: boolean) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="flex items-center gap-2">
        <Filter className="h-4 w-4" /> {label}
        {selected.length > 0 && (
          <Badge variant="secondary" className="rounded-full px-2">
            {selected.length}
          </Badge>
        )}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Filter by {label}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {options.map((opt) => (
        <DropdownMenuCheckboxItem
          key={opt}
          checked={selected.includes(opt)}
          onCheckedChange={(checked) => onChange(opt, !!checked)}
        >
          {opt}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const IdentityCell = ({ employee }: { employee: EmployeeRow }) => (
  <div className="flex items-center space-x-3">
    <Avatar>
      <AvatarFallback
        className={`font-mono text-background ${getRoleColor(employee.role)}`}
      >
        {initials(employee.name)}
      </AvatarFallback>
    </Avatar>
    <div>
      <div className="font-medium">{employee.name}</div>
      <div className="font-normal text-sm text-muted-foreground">
        {employee.email}
      </div>
    </div>
  </div>
);

const RoleBadge = ({ role }: { role: EmployeeRole }) => (
  <Badge variant="outline" className={getRoleColor(role)}>
    {role}
  </Badge>
);

const StatusBadge = ({ status }: { status: EmploymentStatus }) => (
  <Badge variant="outline" className={getStatusColor(status)}>
    {status}
  </Badge>
);

const ActionMenu = ({
  employee,
  onViewDetails,
  onSendEmail,
  onRemove,
}: {
  employee: EmployeeRow;
  onViewDetails: (employee: EmployeeRow) => void;
  onSendEmail: (employee: EmployeeRow) => void;
  onRemove: (employee: EmployeeRow) => void;
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

        <DropdownMenuItem
          className="text-red-400"
          onClick={() => onRemove(employee)}
        >
          <Trash2 className="mr-2 h-4 w-4 text-red-400" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

const DeleteEmployeeDialog = ({
  employee,
  isOpen,
  onOpenChange,
  onDelete,
}: {
  employee: EmployeeRow | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (employee: EmployeeRow) => void;
}) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently remove{" "}
          <strong>{employee?.name}</strong> from your team.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => employee && onDelete(employee)}
          className="bg-red-600 hover:bg-red-700"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const EmployeeDetailDialog = ({
  employee,
  onClose,
  getRoleColor,
  initials,
}: {
  employee: EmployeeRow | null;
  onClose: () => void;
  getRoleColor: (role: EmployeeRole) => string;
  initials: (name: string) => string;
}) => {
  if (!employee) return null;

  return (
    <Dialog open={!!employee} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback
                className={`font-mono text-background ${getRoleColor(employee.role)}`}
              >
                {initials(employee.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div>{employee.name}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {employee.role}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <DetailItem icon={Mail} value={employee.email} />
          <DetailItem icon={Phone} value={`+${employee.phone}`} />
          <DetailItem icon={MapPin} value={employee.location} />
          <DetailItem
            icon={Calendar}
            value={`Joined ${new Date(employee.joinDate).toLocaleDateString("id-ID")}`}
          />

          {employee.status === "Contract" && (
            <>
              <Separator className="my-4" />
              <ContractDetails employee={employee as ContractEmployee} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ContractDetails = ({ employee }: { employee: ContractEmployee }) => (
  <div>
    <p className="text-md font-semibold">Contract Details</p>
    <div className="grid grid-cols-2 gap-4">
      <ContractField label="Start" value={employee.contractStartDate} />
      <ContractField label="End" value={employee.contractEndDate} />

      <div className="col-span-2">
        <Label className="text-xs text-muted-foreground">Contract File</Label>

        {employee.contractFilePath ? (
          <div className="mt-2 border rounded overflow-hidden">
            <iframe
              src={employee.contractFilePath}
              title="Contract PDF"
              className="w-full h-48"
            />
          </div>
        ) : (
          <div className="mt-2">
            <div className="w-full h-48 rounded bg-slate-300/50 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  </div>
);

const DetailItem = ({
  icon: Icon,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
}) => (
  <div className="flex items-center space-x-2">
    <Icon className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm">{value}</span>
  </div>
);

const ContractField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <p className="text-sm">{value}</p>
  </div>
);
