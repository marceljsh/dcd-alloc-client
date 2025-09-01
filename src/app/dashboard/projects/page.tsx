"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem, // <-- Ditambahkan
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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Calendar, Users, Target, Clock, Copy, Filter } from "lucide-react" // <-- Filter Ditambahkan
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProjectRow } from "@/types/project"
import rawProjects from "@/data/projects.json"
import { ProjectCategory, ProjectPriority } from "@/types/common"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { AddProjectForm } from "@/components/project/AddProjectForm"
import ProjectTimeline from "@/components/ProjectTimeline"

const projects: ProjectRow[] = rawProjects as ProjectRow[]

// Opsi filter didefinisikan di sini
export const PROJECT_CATEGORY_OPTIONS = ['Small', 'Medium', 'Big'] as const;
export const PROJECT_PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'] as const;
export const TEAM_OPTIONS = ['DMA', 'NCM', 'CRM', 'CM', 'FRM', 'RRM'] as const;

// Helper function untuk warna kategori
const getCategoryColor = (category: ProjectCategory) => {
  switch (category) {
    case 'Small':   return 'bg-blue-100 text-blue-800'
    case 'Medium':  return 'bg-green-100 text-green-800'
    case 'Big':     return 'bg-yellow-100 text-yellow-800'
  }
}

// Helper function untuk warna prioritas
const getPriorityColor = (priority: ProjectPriority) => {
  switch (priority) {
    case 'Low':       return 'bg-green-100 text-green-800'
    case 'Medium':    return 'bg-yellow-100 text-yellow-800'
    case 'High':      return 'bg-orange-100 text-orange-800'
    case 'Critical':  return 'bg-red-100 text-red-800'
  }
}

// Tipe untuk state dialog
type ActiveDialog = 'add' | 'detail' | 'timeline' | null;

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null)
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  // State untuk filter <-- Ditambahkan
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // state sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof ProjectRow; direction: "asc" | "desc" } | null>(null);

  const handleSort = (key: keyof ProjectRow) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredProjects = projects.filter((project) => {
    // Filter search term
    const searchMatch = !searchTerm || [
      project.code,
      project.name,
      project.budgetCode,
    ].some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter Kategori, Prioritas, dan Tim <-- Logika diperbarui
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(project.category);
    const priorityMatch = selectedPriorities.length === 0 || selectedPriorities.includes(project.priority);
    const teamMatch = selectedTeams.length === 0 || selectedTeams.includes(project.team);

    return searchMatch && categoryMatch && priorityMatch && teamMatch;
  });

  // sorting diterapkan setelah filter
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const valA = a[key];
    const valB = b[key];

    if (typeof valA === "number" && typeof valB === "number") {
      return direction === "asc" ? valA - valB : valB - valA;
    }

    if (valA instanceof Date && valB instanceof Date) {
      return direction === "asc" ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
    }

    return direction === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Handler untuk filter <-- Ditambahkan
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string, checked: boolean) => {
    setter(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
  };
  
  const handleCategoryChange = handleFilterChange(setSelectedCategories);
  const handlePriorityChange = handleFilterChange(setSelectedPriorities);
  const handleTeamChange = handleFilterChange(setSelectedTeams);


  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const bigSizedRatio = projects.filter(p => p.category === 'Big').length / projects.length
  const criticalPriorityRatio = projects.filter(p => p.priority === 'Critical').length / projects.length

  const handleCloseDialog = () => {
    setActiveDialog(null);
    setSelectedProject(null);
  };

  return (
    <div className="space-y-6 mx-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and track their progress</p>
        </div>
        <Dialog open={activeDialog === 'add'} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setActiveDialog('add');
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setActiveDialog('add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>Create a new project to track progress and manage resources.</DialogDescription>
            </DialogHeader>
            <AddProjectForm onCancel={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="py-4 gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Things to Do</p>
          </CardContent>
        </Card>
        <Card className="py-4 gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready to Spend</p>
          </CardContent>
        </Card>
        <Card className="py-4 gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Big Sized Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(bigSizedRatio * 100)}%</div>
            <p className="text-xs text-muted-foreground">of All Projects</p>
          </CardContent>
        </Card>
        <Card className="py-4 gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(criticalPriorityRatio * 100)}%</div>
            <p className="text-xs text-muted-foreground">of All Projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="py-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Project Portfolio</CardTitle>
          <div className="flex items-center gap-2"> {/* <-- Container untuk filter & search */}
            {/* Filter Kategori */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Category
                  {selectedCategories.length > 0 && <Badge variant="secondary" className="rounded-full px-2">{selectedCategories.length}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {PROJECT_CATEGORY_OPTIONS.map(cat => (
                  <DropdownMenuCheckboxItem key={cat} checked={selectedCategories.includes(cat)} onCheckedChange={(checked) => handleCategoryChange(cat, !!checked)}>
                    {cat}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Prioritas */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Priority
                  {selectedPriorities.length > 0 && <Badge variant="secondary" className="rounded-full px-2">{selectedPriorities.length}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {PROJECT_PRIORITY_OPTIONS.map(pri => (
                  <DropdownMenuCheckboxItem key={pri} checked={selectedPriorities.includes(pri)} onCheckedChange={(checked) => handlePriorityChange(pri, !!checked)}>
                    {pri}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Filter Tim */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Team
                  {selectedTeams.length > 0 && <Badge variant="secondary" className="rounded-full px-2">{selectedTeams.length}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {TEAM_OPTIONS.map(team => (
                  <DropdownMenuCheckboxItem key={team} checked={selectedTeams.includes(team)} onCheckedChange={(checked) => handleTeamChange(team, !!checked)}>
                    {team}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
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
                  {[
                    { key: "code", label: "Project Code" },
                    { key: "name", label: "Name" },
                    { key: "team", label: "Team" },
                    { key: "category", label: "Category" },
                    { key: "priority", label: "Priority" },
                    { key: "crew", label: "Crew" },
                    { key: "budgetCode", label: "Budget Code" },
                    { key: "budget", label: "Budget" },
                    { key: "startDate", label: "Start Date" },
                    { key: "endDate", label: "End Date" },
                  ].map(({ key, label }) => (
                    <TableHead
                      key={key}
                      onClick={() => handleSort(key as keyof ProjectRow)}
                      className="cursor-pointer select-none"
                    >
                      {label}{" "}
                      {sortConfig?.key === key && (sortConfig.direction === "asc" ? "▲" : "▼")}
                    </TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-mono">
                      <span>{project.code}</span>
                      <Copy className="inline h-4 w-4 ml-1 text-muted-foreground cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          navigator.clipboard.writeText(project.code)
                          toast(`${project.code} copied to clipboard`)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{project.team}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(project.category)}>
                        {project.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{project.crew}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      <span>{project.budgetCode}</span>
                      <Copy className="inline h-4 w-4 ml-1 text-muted-foreground cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          navigator.clipboard.writeText(project.budgetCode)
                          toast(`${project.budgetCode} copied to clipboard`)
                        }}
                      />
                    </TableCell>
                    <TableCell>${project.budget.toLocaleString()}</TableCell>
                    <TableCell>{new Date(project.startDate).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{new Date(project.endDate).toLocaleDateString('id-ID')}</TableCell>

                    {/* Action */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedProject(project);
                            setActiveDialog('detail');
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedProject(project);
                            setActiveDialog('timeline');
                          }}>
                            <Calendar className="mr-2 h-4 w-4" />
                            View Timeline
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400">
                            <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                            Archive
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

      {/* Project Detail Dialog */}
      <Dialog open={activeDialog === 'detail'} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Badge variant="outline" className={`mt-1 ${getCategoryColor(selectedProject.category)}`}>
                      {selectedProject.category}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge variant="outline" className={`mt-1 ${getPriorityColor(selectedProject.priority)}`}>
                      {selectedProject.priority}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Start Date</Label>
                    <p className="text-sm mt-1">{new Date(selectedProject.startDate).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">End Date</Label>
                    <p className="text-sm mt-1">{new Date(selectedProject.endDate).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Crew</Label>
                    <p className="text-sm mt-1">{selectedProject.crew} members</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Budget</Label>
                    <p className="text-sm mt-1">${selectedProject.budget.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Assigned Team</Label>
                  <p className="text-sm mt-1">
                    {['DMA', 'NCM', 'CRM', 'CM', 'FRM', 'RRM'].at(Number(selectedProject.id) % 6)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>
                      13/20 tasks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div id="progress-bar" className="bg-blue-600 h-2 rounded-full w-[65%]" />
                  </div>
                  <p className="text-sm text-muted-foreground">65% complete</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
     
      {/* Timeline Dialog */}
      <Dialog open={activeDialog === 'timeline'} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-7xl">
          <DialogHeader>
            <DialogTitle>Timeline : {selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Visualisasi timeline
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 overflow-x-auto">
            {selectedProject && <ProjectTimeline project={selectedProject} />}
          </div>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" />
    </div>
  )
}