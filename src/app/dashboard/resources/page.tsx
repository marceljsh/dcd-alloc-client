"use client";

import { ComponentType, ReactNode, useMemo, useState, useRef, useEffect } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import { formatEmploymentStatus, formatLevel, formatRole, initials } from "@/lib/strings"
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
import { EmployeeLevel, employeeLevelOpt, EmployeeRole, employeeRoleOpt, EmploymentStatus, employmentStatusOpt, ProjectCategory, ProjectPriority } from "@/types/common"
import rawEmployees from "@/data/employees.json"
import { Contract, Employee, EmployeeDetail, RawEmployee, RawEmployeeDetails } from "@/types/employee"
import { AddEmployeeFormValues, AddEmployeeForm } from "@/components/employee/AddEmployeeForm"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import EmployeeHeatmap from "@/components/employee/EmployeeHeatmap"
import { ApiResponse, Paging } from "@/types/api";
import { mapRawToEmployee, mapRawToEmployeeDetails } from "@/lib/mapper";

type ViewMode = "table" | "heatmap";
type EnumColumns =
| EmployeeRole
| EmployeeLevel
| EmploymentStatus
| ProjectCategory
| ProjectPriority;

/**
 * NOTE:
 * - This file implements server-side paging/sorting/filtering.
 * - Endpoint builder uses NEXT_PUBLIC_API_URL if set, else falls back to "http://localhost".
 * - Server query params: page (0-based), size, sort=field,asc (repeatable), keyword=<string>
 */

export default function ResourcesPage() {
  // main data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // UI filters (these drive the keyword for server)
  const [selectedRoles, setSelectedRoles] = useState<EmployeeRole[]>([])
  const [selectedLevels, setSelectedLevels] = useState<EmployeeLevel[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<EmploymentStatus[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
      from: undefined,
      to: undefined,
  })

  // --- Server-side table state (TanStack) ---
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageIndex, setPageIndex] = useState<number>(0) // 0-based for server
  const [pageSize, setPageSize] = useState<number>(10)

  // server response bookkeeping
  const [totalElements, setTotalElements] = useState<number>(0)
  const [pageCount, setPageCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // debounce + abort
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const SEARCH_DEBOUNCE_MS = 300;

  // helper: build keyword from globalFilter + dropdown filters
  const keyword = useMemo(() => {
    const parts: string[] = [];
    if (globalFilter && globalFilter.trim()) parts.push(globalFilter.trim());
    // compose role/level/status as field:value tokens
    selectedRoles.forEach(r => parts.push(`role:${r}`));
    selectedLevels.forEach(l => parts.push(`level:${l}`));
    selectedStatuses.forEach(s => parts.push(`status:${s}`));
    // dateRange if needed (optional, commented)
    // if (dateRange.from) parts.push(`from:${dateRange.from.toISOString().slice(0,10)}`);
    return parts.join(" ");
  }, [globalFilter, selectedRoles, selectedLevels, selectedStatuses]);

  // columns same as before
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

  // --- TanStack table: manual (server-side) mode ---
  const table = useReactTable({
    data: employees,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    pageCount,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: (next) => {
      setSorting(next);
      setPageIndex(0); // reset
    },
    onGlobalFilterChange: (v) => {
      setGlobalFilter(String(v ?? ""));
      setPageIndex(0);
    },
    onColumnFiltersChange: (next) => {
      setColumnFilters(next);
      setPageIndex(0);
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(next.pageIndex ?? 0);
      setPageSize(next.pageSize ?? pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      arrIncludesSome: (row, columnId, value) => {
        if (!value || value.length === 0) return true;
        return value.includes(row.getValue(columnId));
      },
    },
  });

  // --- Fetch logic (debounced + abort) ---
  // Builds URL with page (0-based), size, repeated sort, keyword
  function buildUrlForFetch({ pageIndex, pageSize, sorting, keyword }: {
    pageIndex: number;
    pageSize: number;
    sorting: SortingState;
    keyword: string;
  }) {
    // prefer NEXT_PUBLIC_API_URL if provided; otherwise use http://localhost
    const base = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/my/employees`
      : `http://localhost/api/my/employees`;

    const params = new URLSearchParams();
    params.set("page", String(pageIndex));
    params.set("size", String(pageSize));
    for (const s of sorting) {
      params.append("sort", `${s.id},${s.desc ? "desc" : "asc"}`);
    }
    if (keyword && keyword.trim()) params.set("keyword", keyword.trim());

    return `${base}?${params.toString()}`;
  }

  // The core fetch function (non-debounced). Returns mapped employees and total count.
  const fetchNow = async (opts?: { pageIndex?: number; pageSize?: number; sorting?: SortingState; keyword?: string }) => {
    const pIndex = opts?.pageIndex ?? pageIndex;
    const pSize = opts?.pageSize ?? pageSize;
    const s = opts?.sorting ?? sorting;
    const kw = opts?.keyword ?? keyword;

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('You are not authenticated')

      // abort previous immediate fetch if any
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setIsLoading(true);

      const url = buildUrlForFetch({ pageIndex: pIndex, pageSize: pSize, sorting: s, keyword: kw });

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: ac.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      const fetched: ApiResponse<Paging<RawEmployee>> = await res.json()
      if (!fetched.success || !fetched.data) {
        throw new Error(fetched.message || 'Failed to fetch employees')
      }

      const mapped: Employee[] = fetched.data.items.map((r: RawEmployee) => mapRawToEmployee(r));
      setEmployees(mapped);
      setTotalElements(fetched.data.meta.totalItems);
      setPageCount(fetched.data.meta.totalPages);
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // aborted, ignore
        return;
      }
      console.error("Error fetching employees (server-side):", err);
      toast.error(err instanceof Error ? err.message : "Failed to load employees");
      setEmployees([]);
      setTotalElements(0);
      setPageCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced effect so typing/filter/sort/paging triggers fetch with debounce
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      fetchNow({ pageIndex, pageSize, sorting, keyword });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // stringify sorting because it's array of objects
  }, [pageIndex, pageSize, JSON.stringify(sorting), keyword]);

  // initial load
  useEffect(() => {
    // immediate load on mount
    fetchNow({ pageIndex, pageSize, sorting, keyword });
    // cleanup abort when component unmounts
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // The old fetchEmployees is repurposed to trigger a refresh (immediate)
  const fetchEmployees = async () => {
    await fetchNow({ pageIndex: 0, pageSize, sorting, keyword });
    setPageIndex(0);
  }

  // Add / Delete still call API and then refresh
  const handleAddEmployee = async (data: AddEmployeeFormValues) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('You are not authenticated')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost'}/employees`, {
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

      // refresh from server (go to first page)
      setPageIndex(0);
      await fetchNow({ pageIndex: 0, pageSize, sorting, keyword });
    } catch (error) {
      console.error('Error adding employee:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add employee')
    }
  }

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('You are not authenticated')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost'}/employees/${employee.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `Failed to delete employee ${employee.name}`)
      }

      toast.success(`${employee.name} has been removed.`)
      setEmployeeToDelete(null)

      // refresh current page (ensure valid pageIndex)
      const newPageIndex = Math.min(pageIndex, Math.max(0, pageCount - 1));
      setPageIndex(newPageIndex)
      await fetchNow({ pageIndex: newPageIndex, pageSize, sorting, keyword })
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error(error instanceof Error ? error.message : `Failed to delete employee ${employee.name}`)
    }
  }

  // UI helper: dropdown filter setter
  function handleDropdownFilterChange<T extends string>(
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) {
    return (value: T, checked: boolean) => {
      setter((prev) =>
        checked ? [...prev, value] : prev.filter((item) => item !== value)
      );
      setPageIndex(0);
    };
  }

  // Pagination UI binding: display is 1-based
  const handlePageChange = (pageOneBased: number) => {
    const newIndex = Math.max(0, pageOneBased - 1);
    if (newIndex !== pageIndex) setPageIndex(newIndex);
  }

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
            {employees.filter((emp) => emp.status === 'CR').length}
            <span className="text-base font-normal">{` / ${totalElements}`}</span>
            </>
          }
          description="Members"
        />
        <StatCard
          title="Software Engineer"
          value={employees.filter((emp) => emp.role === 'SWE').length}
          description="People"
        />
        <StatCard
          title="Data Engineer"
          value={employees.filter((emp) => emp.role === 'DTE').length}
          description="People"
        />
        <StatCard
          title="System Analyst"
          value={employees.filter((emp) => emp.role === 'SLA').length}
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
                 placeholder="Period"
                 data-testid="date-range-picker"
               />
             ) : null}

            <FilterDropdown
              label="Role"
              options={employeeRoleOpt}
              selected={selectedRoles}
              onChange={handleDropdownFilterChange(setSelectedRoles)}
            />
            <FilterDropdown
              label="Level"
              options={employeeLevelOpt}
              selected={selectedLevels}
              onChange={handleDropdownFilterChange(setSelectedLevels)}
            />
            <FilterDropdown
              label="Status"
              options={employmentStatusOpt}
              selected={selectedStatuses}
              onChange={handleDropdownFilterChange(setSelectedStatuses)}
            />
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                }}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "heatmap" ? (
            <div className="relative rounded-md">
              <EmployeeHeatmap
                selectedStartDate={dateRange.from}
                selectedEndDate={dateRange.to}
                employees={employees.map(emp => ({
                  ...emp,
                  utilization: Math.random() * 100,
                  currentProjects: [],
                  hoursThisWeek: 0,
                }))}
              />
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">Loading…</TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
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
                    onClick={() => handlePageChange((pageIndex + 1) - 1)}
                    aria-disabled={pageIndex === 0}
                    tabIndex={pageIndex === 0 ? -1 : undefined}
                    className={pageIndex === 0 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === pageIndex + 1}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange((pageIndex + 1) + 1)}
                    aria-disabled={pageIndex + 1 === pageCount || pageCount === 0}
                    tabIndex={pageIndex + 1 === pageCount ? -1 : undefined}
                    className={pageIndex + 1 === pageCount ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="mt-2 text-sm text-muted-foreground">
              Showing page {pageIndex + 1} of {pageCount} — total {totalElements} items
            </div>
          </div>
        )}
      </Card>

      {selectedEmployee && (
        <EmployeeDetailDialog
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

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

/* ---------- helper components unchanged ---------- */

const getRoleColor = (role: EmployeeRole): string => {
  switch (role) {
    case "SLA": return "bg-blue-100 text-blue-800";
    case "DTE": return "bg-green-100 text-green-800";
    case "SWE": return "bg-purple-100 text-purple-800";
  }
};

const getStatusColor = (status: EmploymentStatus): string => {
  switch (status) {
    case "OR": return "bg-green-100 text-green-800";
    case "CR": return "bg-yellow-100 text-yellow-800";
  }
};

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

const IdentityCell = ({ employee }: { employee: Employee }) => (
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
    {formatRole(role)}
  </Badge>
);

const StatusBadge = ({ status }: { status: EmploymentStatus }) => (
  <Badge variant="outline" className={getStatusColor(status)}>
    {formatEmploymentStatus(status)}
  </Badge>
);

const ActionMenu = ({
  employee,
  onViewDetails,
  onSendEmail,
  onRemove,
}: {
  employee: Employee;
  onViewDetails: (employee: Employee) => void;
  onSendEmail: (employee: Employee) => void;
  onRemove: (employee: Employee) => void;
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
  employee: Employee | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (employee: Employee) => void;
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

const EmployeeDetailDialog = ({ employee, onClose }: { employee: Employee, onClose: () => void }) => {
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

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost'}/employees/${employee.id}/detail`, {
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
};

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
            <iframe
              src={contract.url}
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
