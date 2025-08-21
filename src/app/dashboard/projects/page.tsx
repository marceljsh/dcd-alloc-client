"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Calendar, Users, Target, Clock, Copy } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProjectRow } from "@/types/project"
import rawProjects from "@/data/projects.json"
import { ProjectCategory, ProjectPriority } from "@/types/common"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { AddProjectForm } from "@/components/project/AddProjectForm"

// ✅ OriGantt
import ProjectTimeline from "@/components/ProjectTimeline"

const projects: ProjectRow[] = rawProjects as ProjectRow[]

const getCategoryColor = (category: ProjectCategory) => {
  switch (category) {
    case 'Small':   return 'bg-blue-100 text-blue-800'
    case 'Medium':  return 'bg-green-100 text-green-800'
    case 'Big':     return 'bg-yellow-100 text-yellow-800'
  }
}

const getPriorityColor = (priority: ProjectPriority) => {
  switch (priority) {
    case 'Low':      return 'bg-green-100 text-green-800'
    case 'Medium':   return 'bg-yellow-100 text-yellow-800'
    case 'High':     return 'bg-orange-100 text-orange-800'
    case 'Critical': return 'bg-red-100 text-red-800'
  }
}

// Demo projects untuk timeline
type Employee = { id: number, name: string, role: string }
type Task = { id: number, name: string, employeeId: number, startDate: string, endDate: string, storyPoints: number }
type Stage = { id: number, name: string, tasks: Task[] }
type Project = { id: number, name: string, stages: Stage[] }

const demoProjects: Project[] = [
  {
    id: 1,
    name: 'Project Alpha',
    stages: [
      {
        id: 1,
        name: 'Analysis',
        tasks: [
          { id: 1, name: 'Requirements', employeeId: 1, startDate: '2024-01-01', endDate: '2024-01-05', storyPoints: 8 },
        ]
      },
      {
        id: 2,
        name: 'Development',
        tasks: [
          { id: 2, name: 'API', employeeId: 2, startDate: '2024-01-06', endDate: '2024-01-15', storyPoints: 13 },
        ]
      },
    ]
  },
  {
    id: 2,
    name: 'Project Beta',
    stages: [
      {
        id: 3,
        name: 'Planning',
        tasks: [
          { id: 3, name: 'Planning Task', employeeId: 1, startDate: '2024-01-03', endDate: '2024-01-08', storyPoints: 5 },
        ]
      }
    ]
  }
]

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredProjects = projects.filter((project) => {
    if (!searchTerm) return true
    const searchableFields = [project.code, project.name, project.budgetCode].map(f => f.toLowerCase())
    return searchableFields.some(field => field.includes(searchTerm.toLowerCase()))
  })

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const bigSizedRatio = projects.filter(p => p.category === 'Big').length / projects.length
  const criticalPriorityRatio = projects.filter(p => p.priority === 'Critical').length / projects.length

  // Handler untuk menutup dialog apapun
  const handleCloseDialog = () => {
    setShowTimeline(false)
    setSelectedProject(null)
  }

  return (
    <div className="space-y-6 mx-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and track their progress</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Create a new project to track progress and manage resources.</p>
            </DialogHeader>
            <AddProjectForm onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="py-4 gap-0">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Things to Do</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-0">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready to Spend</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-0">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Big Sized Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(bigSizedRatio * 100)}%</div>
            <p className="text-xs text-muted-foreground">of All Projects</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-0">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(criticalPriorityRatio * 100)}%</div>
            <p className="text-xs text-muted-foreground">of All Projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Table */}
      <Card className="py-4">
        <CardHeader className="flex justify-between">
          <CardTitle className="text-xl">Project Portfolio</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                <TableRow className="hover:bg-white">
                  <TableHead>Project Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Crew</TableHead>
                  <TableHead>Budget Code</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProjects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell className="font-mono">
                      {project.code}
                      <Copy
                        className="inline h-4 w-4 ml-1 text-muted-foreground cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          navigator.clipboard.writeText(project.code)
                          toast(`${project.code} copied to clipboard`)
                        }}
                      />
                    </TableCell>
                    <TableCell>{project.name}</TableCell>
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
                    <TableCell className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{project.crew}</span>
                    </TableCell>
                    <TableCell className="font-mono">
                      {project.budgetCode}
                      <Copy
                        className="inline h-4 w-4 ml-1 text-muted-foreground cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          navigator.clipboard.writeText(project.budgetCode)
                          toast(`${project.budgetCode} copied to clipboard`)
                        }}
                      />
                    </TableCell>
                    <TableCell>${project.budget.toLocaleString()}</TableCell>
                    <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>

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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProject(project)
                              setShowTimeline(false)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProject(project)
                              setShowTimeline(true)
                            }}
                          >
                            <Calendar className="mr-2 h-4 w-4" /> View Timeline
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400">
                            <Trash2 className="mr-2 h-4 w-4 text-red-400" /> Archive
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
      <Dialog open={!!selectedProject && !showTimeline} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Badge variant="outline" className={`mt-1 ${getCategoryColor(selectedProject.category)}`}>
                      {selectedProject.category}
                    </Badge>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge variant="outline" className={`mt-1 ${getPriorityColor(selectedProject.priority)}`}>
                      {selectedProject.priority}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <p className="mt-1">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <p className="mt-1">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Crew</Label>
                    <p className="mt-1">{selectedProject.crew} members</p>
                  </div>
                  <div>
                    <Label>Budget</Label>
                    <p className="mt-1">${selectedProject.budget.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <Label>Assigned Team</Label>
                  <p className="mt-1">{['DMA','NCM','CRM','CM','FRM','RRM'].at(Number(selectedProject.id) % 6)}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Project Timeline Dialog */}
      <Dialog open={!!selectedProject && showTimeline} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[1200px] p-0">
          {selectedProject && (
            <>
              <DialogHeader className="px-4 py-2">
                <DialogTitle>{selectedProject.name} - Timeline</DialogTitle>
              </DialogHeader>

              {/* Scrollable container */}
              <div className="overflow-x-auto">
                <div style={{ minWidth: '1600px', padding: '16px' }}>
                  <ProjectTimeline
                    project={demoProjects.find(p => p.id === selectedProject.id) ?? demoProjects[0]}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>


      <Toaster position="top-center" />
    </div>
  )
}
