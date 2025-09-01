"use client"

import { useState } from "react"
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
  ArrowUp,
  ArrowDown,
  Filter,
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
import { EmploymentStatus, Role } from "@/types/common"
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

// Tipe untuk kunci yang bisa diurutkan, agar lebih aman
type SortKey = keyof EmployeeRow

const getRoleColor = (role: Role) => {
  switch (role) {
    case "System Analyst":
      return "bg-blue-100 text-blue-800"
    case "Data Engineer":
      return "bg-green-100 text-green-800"
    case "Software Engineer":
      return "bg-purple-100 text-purple-800"
  }
}

const getStatusColor = (status: EmploymentStatus) => {
  switch (status) {
    case "Permanent":
      return "bg-green-100 text-green-800"
    case "Contract":
      return "bg-yellow-100 text-yellow-800"
  }
}

const createEmployee = ({
  status,
  ...data
}: AddEmployeeFormValues): EmployeeRow => {
  const now = new Date().toISOString()
  const base = {
    id: Math.floor(Math.random() * 1000000),
    createdAt: now,
    updatedAt: now,
    status,
  }

  switch (status) {
    case "Permanent":
      return {
        ...base,
        ...data,
        code: `ORG-${Math.floor(Math.random() * 1000000)}`,
      } as PermanentEmployee

    case "Contract":
      return {
        ...base,
        ...data,
        status: "Contract",
        code: `CR-${Math.floor(Math.random() * 10000000)}`,
      } as ContractEmployee

    default:
      throw new Error("Invalid employee status")
  }
}

const initialEmployees: EmployeeRow[] = rawEmployees.map(
  ({ status, ...data }: any) => {
    switch (status) {
      case "Permanent":
        return { status, ...data } as PermanentEmployee
      case "Contract":
        return { status, ...data } as ContractEmployee

      default:
        throw new Error("Invalid employee status")
    }
  }
)

export default function ResourcesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>(initialEmployees)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(
    null
  )
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRow | null>(
    null
  )
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // State baru untuk filter
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]) // <-- Ditambahkan

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const matchWithSearch = (employee: EmployeeRow) => {
    if (!searchTerm) return true
    const searchableFields = [
      employee.name,
      employee.email,
      employee.code,
      employee.team,
    ].map((field) => field.toLowerCase())
    const lwcSearch = searchTerm.toLowerCase()
    return searchableFields.some((field) => field.includes(lwcSearch))
  }

  // Logika untuk filter dan sorting diperbarui
  const filteredAndSortedEmployees = employees
    .filter((employee) => {
      const searchMatch = matchWithSearch(employee)
      const roleMatch =
        selectedRoles.length === 0 || selectedRoles.includes(employee.role)
      const levelMatch =
        selectedLevels.length === 0 || selectedLevels.includes(employee.level)
      const statusMatch = // <-- Ditambahkan
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(employee.status)
      return searchMatch && roleMatch && levelMatch && statusMatch // <-- Ditambahkan
    })
    .sort((a, b) => {
      const valA = a[sortKey]
      const valB = b[sortKey]
      const strA = String(valA).toLowerCase()
      const strB = String(valB).toLowerCase()
      if (strA < strB) return sortDirection === "asc" ? -1 : 1
      if (strA > strB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleAddEmployee = (data: AddEmployeeFormValues) => {
    const employee = createEmployee(data)
    setEmployees([...employees, employee])
    setIsAddDialogOpen(false)
    toast(`${employee.name} has been added to the team.`)
  }

  const handleDeleteEmployee = (employee: EmployeeRow) => {
    setEmployees(employees.filter((emp) => emp.id !== employee.id))
    setEmployeeToDelete(null)
    toast.success(`${employee.name} has been removed.`)
  }

  // Handler untuk mengubah filter role
  const handleRoleFilterChange = (role: string, checked: boolean) => {
    setSelectedRoles((prev) =>
      checked ? [...prev, role] : prev.filter((r) => r !== role)
    )
  }

  // Handler untuk mengubah filter level
  const handleLevelFilterChange = (level: string, checked: boolean) => {
    setSelectedLevels((prev) =>
      checked ? [...prev, level] : prev.filter((l) => l !== level)
    )
  }

  // Handler untuk mengubah filter status <-- Ditambahkan
  const handleStatusFilterChange = (status: string, checked: boolean) => {
    setSelectedStatuses((prev) =>
      checked ? [...prev, status] : prev.filter((s) => s !== status)
    )
  }

  const SortableTableHeader = ({
    sortKeyName,
    children,
  }: {
    sortKeyName: SortKey
    children: React.ReactNode
  }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSort(sortKeyName)}
        className="px-2"
      >
        {children}
        {sortKey === sortKeyName &&
          (sortDirection === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
          ))}
      </Button>
    </TableHead>
  )

  return (
    <div className="space-y-6 mx-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">
            Manage your team members and their assignments
          </p>
        </div>
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
              <DialogDescription>
                Add a member to your domain.
              </DialogDescription>
            </DialogHeader>
            <AddEmployeeForm
              onSubmit={handleAddEmployee}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="py-4 gap-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Contract Resources
            </CardTitle>
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
            <CardTitle className="text-sm font-medium">
              Software Engineer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {
                employees.filter((emp) => emp.role === "Software Engineer")
                  .length
              }
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
            <CardTitle className="text-sm font-medium">
              System Analyst
            </CardTitle>
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
        {/* Search and Filters */}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Team Members</CardTitle>
          {/* <-- Container untuk filter dan search --> */}
          <div className="flex items-center gap-2">
            {/* Filter Roles */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Role
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
                {["Data Engineer", "Software Engineer", "System Analyst"].map(
                  (role) => (
                    <DropdownMenuCheckboxItem
                      key={role}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={(checked) =>
                        handleRoleFilterChange(role, !!checked)
                      }
                    >
                      {role}
                    </DropdownMenuCheckboxItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Level */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Level
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
                {["Junior", "Middle", "Senior"].map((level) => (
                  <DropdownMenuCheckboxItem
                    key={level}
                    checked={selectedLevels.includes(level)}
                    onCheckedChange={(checked) =>
                      handleLevelFilterChange(level, !!checked)
                    }
                  >
                    {level}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Status -- Ditambahkan */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Status
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
                {["Contract", "Permanent"].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={(checked) =>
                      handleStatusFilterChange(status, !!checked)
                    }
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                <TableRow className="hover:bg-white">
                  <SortableTableHeader sortKeyName="name">
                    Resource
                  </SortableTableHeader>
                  <SortableTableHeader sortKeyName="code">
                    NIP
                  </SortableTableHeader>
                  <SortableTableHeader sortKeyName="role">
                    Role
                  </SortableTableHeader>
                  <SortableTableHeader sortKeyName="level">
                    Level
                  </SortableTableHeader>
                  <SortableTableHeader sortKeyName="team">
                    Team
                  </SortableTableHeader>
                  <SortableTableHeader sortKeyName="status">
                    Status
                  </SortableTableHeader>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedEmployees.map((employee, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback
                            className={`font-mono text-background ${getRoleColor(
                              employee.role
                            )}`}
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
                    </TableCell>
                    <TableCell className="font-mono">
                      <span>{employee.code}</span>
                      <Copy
                        className="inline h-4 w-4 ml-1 text-muted-foreground cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          navigator.clipboard.writeText(employee.code)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getRoleColor(employee.role)}
                      >
                        {employee.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.level}</TableCell>
                    <TableCell>{employee.team}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(employee.status)}
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setSelectedEmployee(employee)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast.success(`Sent email to ${employee.email}`)
                            }
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-400"
                            onClick={() => setEmployeeToDelete(employee)}
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Employee Detail Dialog */}
      <Dialog
        open={!!selectedEmployee}
        onOpenChange={() => setSelectedEmployee(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback
                      className={`font-mono text-background ${getRoleColor(
                        selectedEmployee.role
                      )}`}
                    >
                      {initials(selectedEmployee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{selectedEmployee.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {selectedEmployee.role}
                    </div>
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
                  <span className="text-sm">
                    {selectedEmployee.location || "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined{" "}
                    {new Date(selectedEmployee.joinDate).toLocaleDateString(
                      "id-ID"
                    )}
                  </span>
                </div>
                {selectedEmployee.status === "Contract" && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-md font-semibold">Contract Details</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Start
                        </Label>
                        <p className="text-sm">
                          {selectedEmployee.contractStartDate}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          End
                        </Label>
                        <p className="text-sm">
                          {selectedEmployee.contractEndDate}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Contract Document
                      </Label>
                      <div className="mt-1">
                        {selectedEmployee.contractFilePath ? (
                          selectedEmployee.contractFilePath
                            .toLowerCase()
                            .endsWith(".pdf") ? (
                            <iframe
                              src={selectedEmployee.contractFilePath}
                              className="w-full h-40 rounded border"
                            />
                          ) : (
                            <div className="h-40 w-full rounded border flex items-center justify-between px-3">
                              <span className="text-sm text-muted-foreground">
                                Preview not available. Open the document to
                                view.
                              </span>
                              <a
                                href={selectedEmployee.contractFilePath}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm">Open</Button>
                              </a>
                            </div>
                          )
                        ) : (
                          <div className="h-40 w-full rounded border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
                            No contract document uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation dialog */}
      <AlertDialog
        open={!!employeeToDelete}
        onOpenChange={() => setEmployeeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove{" "}
              <strong>{employeeToDelete?.name}</strong> from your team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                employeeToDelete && handleDeleteEmployee(employeeToDelete)
              }
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