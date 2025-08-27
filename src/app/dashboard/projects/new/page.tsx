'use client'

import { EmployeeList } from '@/components/employee/EmployeeList'
import { TaskList } from '@/components/TaskList'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toaster } from '@/components/ui/sonner'
import { Tabs, TabsContent } from '@/components/ui/tabs' // TabsList dihapus dari impor
import { datesOverlap } from '@/lib/dates'
import { Employee } from '@/types/employee'
import { ProjectData, ProjectDraft, ProjectStage, Task } from '@/types/project'
import { Edit2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import employeesData from '@/data/employees.json'
import { updateRecordKey } from '@/lib/containers'
import * as Strings from '@/lib/strings'
import { useSearchParams } from 'next/navigation'
import { DnDPills } from '@/components/DnDPills' // Mengimpor komponen DnDPills

const uniqueRoles = ['all', 'System Analyst', 'Data Engineer', 'Software Engineer']

export default function AllocatorPage() {
  const [employees, setEmployees] = useState<Employee[]>(employeesData as Employee[])
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([])
  const [projectData, setProjectData] = useState<ProjectData>({})
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<string | undefined>(projectStages[0]?.id ?? undefined)

  // Dialog states
  const [showAddStageDialog, setShowAddStageDialog] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [deleteStageDialog, setDeleteStageDialog] = useState<string | null>(null)
  const [editingStage, setEditingStage] = useState<string | null>(null)
  const [newStageName, setNewStageName] = useState('')
  const [newTaskName, setNewTaskName] = useState('')
  const [editStageValue, setEditStageValue] = useState('')

  const draftId = useSearchParams().get('ts')

  useEffect(() => {
    if (draftId) {
      const rawDraft = sessionStorage.getItem(`project-${draftId}`)
      if (rawDraft) {
        const draft: ProjectDraft = JSON.parse(rawDraft)
        setProjectStages(draft.stages.map(stage => ({ id: Strings.toKebab(stage), label: stage })))
        setProjectData(
          draft.stages.reduce((acc, stage) => {
            acc[Strings.toKebab(stage)] = []
            return acc
          }, {} as ProjectData),
        )
        setActiveTab(Strings.toKebab(draft.stages[0]))
      }
    }
  }, [])

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }
  const handleMouseLeave = () => setIsDragging(false)
  const handleMouseUp = () => setIsDragging(false)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const [touchStartX, setTouchStartX] = useState(0)
  const [touchScrollLeft, setTouchScrollLeft] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setTouchStartX(e.touches[0].pageX - scrollRef.current.offsetLeft)
    setTouchScrollLeft(scrollRef.current.scrollLeft)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft
    const walk = (x - touchStartX) * 1.5
    scrollRef.current.scrollLeft = touchScrollLeft - walk
  }

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  const getAvailableEmployees = (taskId: string): Employee[] => {
    if (!selectedTaskId || selectedTaskId !== taskId) {
      return employees.filter(employee => roleFilter === 'all' || employee.role === roleFilter)
    }

    if (!activeTab || !projectData[activeTab]) {
      return employees.filter(employee => roleFilter === 'all' || employee.role === roleFilter)
    }

    const selectedTask = projectData[activeTab].find(task => task.id === taskId)
    if (!selectedTask) {
      return employees.filter(employee => roleFilter === 'all' || employee.role === roleFilter)
    }

    return employees.filter(employee => {
      const isAssignedToSelectedTask = selectedTask.assignedEmployees.some(emp => emp.id === employee.id)
      if (isAssignedToSelectedTask) return false

      const isConflicted = Object.values(projectData)
        .flat()
        .some(task => {
          if (task.id === taskId) return false // skip the current task

          const isAssigned = task.assignedEmployees.some(emp => emp.id === employee.id)
          if (!isAssigned || !task.startDate || !task.endDate) return false

          return datesOverlap(selectedTask.startDate, selectedTask.endDate, task.startDate, task.endDate)
        })

      const roleMatches = roleFilter === 'all' || employee.role === roleFilter

      return !isConflicted && roleMatches
    })
  }

  const handleAddStage = () => {
    if (!newStageName.trim()) return

    const newStageId = Strings.toKebab(newStageName)
    const newStage: ProjectStage = {
      id: newStageId,
      label: newStageName.trim(),
    }

    setProjectStages(prev => [...prev, newStage])
    setProjectData(prev => ({ ...prev, [newStageId]: [] }))
    setActiveTab(newStageId)

    toast.success(`Stage ${newStageName} successfully added`, { richColors: true })

    setNewStageName('')
    setShowAddStageDialog(false)
  }

  const handleDeleteStage = (stageId: string) => {
    const stage = projectStages.find(stage => stage.id === stageId)
    if (!stage) return

    setProjectStages(prev => prev.filter(stage => stage.id !== stageId))
    setProjectData(prev => {
      delete prev[stageId]
      return { ...prev }
    })

    // if deleting active tab, switch to first available tab
    if (activeTab === stageId) {
      const remainingStages = projectStages.filter(stage => stage.id !== stageId)
      if (remainingStages.length > 0) {
        setActiveTab(remainingStages[0].id)
      }
    }

    setDeleteStageDialog(null)
    toast(`Stage ${stage.label} has been deleted`, { richColors: true })
  }

  const handleRenameStage = (stageId: string, newName: string) => {
    if (!newName.trim()) return

    const newId = Strings.toKebab(newName.trim())
    setProjectStages(prev => prev.map(stage => (stage.id === stageId ? { id: newId, label: newName.trim() } : stage)))

    setProjectData(prev => {
      const updatedData = updateRecordKey(prev, stageId, newId)
      updatedData[newId].forEach(task => {
        task.id = task.id.replace(new RegExp(`^${stageId}#`), `${newId}#`)
      })
      return updatedData
    })

    const isCurrentTab = activeTab === stageId
    if (isCurrentTab) {
      setActiveTab(newId)
    }
  }

  const handleStartEditStage = (stageId: string) => {
    const stage = projectStages.find(stage => stage.id === stageId)
    if (stage) {
      setEditingStage(stageId)
      setEditStageValue(stage.label)
    }
  }

  const handleFinishEditStage = (stageId: string) => {
    const stage = projectStages.find(stage => stage.id === stageId)
    if (!stage) return

    if (editStageValue.trim() && editStageValue.trim() !== stage.label) {
      handleRenameStage(stageId, editStageValue.trim())
    }
    setEditingStage(null)
    setEditStageValue('')
  }

  const handleCancelEditStage = () => {
    setEditingStage(null)
    setEditStageValue('')
  }

  const handleAddTask = () => {
    if (!activeTab) return
    if (!newTaskName.trim()) return

    const stage = projectStages.find(stage => stage.id === activeTab)
    if (!stage) return;

    if (projectData[activeTab]?.some(task => task.name === newTaskName.trim())) {
      toast.error('Oops!', {
        description: `Task named ${newTaskName} already exists in this stage!`,
        richColors: true,
      })
      setNewTaskName('')
      setShowAddTaskDialog(false)
      return
    }

    const newTaskId = `${activeTab}#${Strings.toKebab(newTaskName)}`
    const newTask: Task = {
      id: newTaskId,
      name: newTaskName.trim(),
      startDate: '',
      endDate: '',
      storyPoints: 0,
      assignedEmployees: [],
    }

    setProjectData(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), newTask],
    }))

    toast.success(`Task ${newTaskName} has been successfully added to ${stage.label}`, { richColors: true })

    setShowAddTaskDialog(false)
    setNewTaskName('')
  }

  const handleSelectTask = (taskId: string | null) => {
    setRoleFilter("all")

    setSelectedTaskId(prev => 
      prev === taskId ? null : taskId
    )
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setProjectData(prev => {
      const updatedData: ProjectData = { ...prev }
      Object.keys(updatedData).forEach(stage => {
        updatedData[stage] = updatedData[stage].map(task => (task.id === taskId ? { ...task, ...updates } : task))
      })
      return updatedData
    })
  }

  const handleDeleteTask = (taskId: string) => {
    if (!activeTab || !projectData[activeTab]) return

    const task = projectData[activeTab].find(task => task.id === taskId)
    if (!task) return

    setProjectData(prev => {
      prev[activeTab] = prev[activeTab].filter(task => task.id !== taskId)
      return { ...prev }
    })

    // clear selection if deleted task was selected
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null)
    }

    toast(`Task ${task.name} has been deleted`)
  }

  const handleRenameTask = (taskId: string, newName: string) => {
    if (!activeTab || !newName.trim()) return

    const task = projectData[activeTab].find(task => task.id === taskId)
    if (!task) return

    const newId = `${activeTab}#${Strings.toKebab(newName)}`
    handleUpdateTask(taskId, { id: newId, name: newName.trim() })

    toast.success(`Task ${task.name} has been successfully renamed to ${newName.trim()}`, { richColors: true })
  }

  const handleAssignEmployee = (taskId: string, employee: Employee) => {
    if (!activeTab || !projectData[activeTab]) return

    const currentTask = projectData[activeTab].find(task => task.id === taskId)
    if (!currentTask) return

    const isAlreadyAssigned = currentTask.assignedEmployees.some(emp => emp.id === employee.id)
    if (isAlreadyAssigned) {
      toast.warning(`${employee.name} has already been assigned to this task!`, { richColors: true })
      return
    }

    handleUpdateTask(taskId, {
      assignedEmployees: [...currentTask.assignedEmployees, employee],
    })
    toast(`${employee.name} has been successfully assigned to ${currentTask.name}`)
  }

  const handleSaveProject = () => {
    if (projectStages.length === 0) {
      toast.error('No stages yet', { richColors: true })
      return
    }

    const rawData = projectStages.map(stage => {
      return {
        id: (stage.id as any) instanceof String ? 'string' : null, // cek apa null bisa dikirim
        name: stage.label,
        tasks: projectData[stage.id].map(task => {
          // remove task.id and return the rest
          const { id, assignedEmployees, ...taskData } = task
          return {
            ...taskData,
            assignedEmployees: assignedEmployees.map(emp => Number(emp.id)),
          }
        })
      }
    })

    const data = JSON.stringify(rawData, null, 2)

    toast.promise(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          projectStages.forEach(stage => {
            projectData[stage.id].forEach(task => {
              if (!task.startDate || !task.endDate) {
                reject(`${task.name} @ ${stage.label} is missing start or end date.`)
                return
              }

              if (task.storyPoints === 0) {
                reject(`${task.name} @ ${stage.label} has no story points assigned.`)
                return
              }

              if (task.assignedEmployees.length === 0) {
                reject(`${task.name} @ ${stage.label} has no employees assigned.`)
                return
              }
            })
          })

          Math.random() > 0.8 ? reject('Failed to save project.') : resolve('Project saved successfully!')
        }, 1000)
      }),
      {
        loading: 'Saving project...',
        success: msg => <>{msg}</>,
        error: err => err,
        richColors: true,
      },
    )
  }
  
  // Fungsi untuk menangani perubahan urutan stage (tab)
  const handleStageOrderChange = (newLabels: string[]) => {
    // Cari objek stage berdasarkan label dan susun ulang
    const newStages = newLabels
      .map(label => projectStages.find(stage => stage.label === label))
      .filter(Boolean) as ProjectStage[];

    setProjectStages(newStages);

    // Pastikan data proyek juga mengikuti urutan stage yang baru
    const updatedProjectData: ProjectData = {};
    newStages.forEach(stage => {
      updatedProjectData[stage.id] = projectData[stage.id];
    });
    setProjectData(updatedProjectData);
  
    // Atur ulang tab aktif jika tab saat ini tidak ada di urutan baru
    if (activeTab && !newStages.some(s => s.id === activeTab)) {
      setActiveTab(newStages[0]?.id || undefined);
    }
  };

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setShowAddStageDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stage
            </Button>
            <Button onClick={handleSaveProject} size="lg">
              Save Project
            </Button>
          </div>
        </div>

<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <div className="flex items-center gap-2 mb-4">
    <Button
      variant="ghost"
      size="sm"
      className="p-1"
      onClick={() => scrollByAmount(-200)}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>

    {/* Container untuk scroll horizontal */}
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="flex-1 overflow-x-auto scrollbar-hide"
    >
      <div className="flex w-max items-center gap-2">
        <DnDPills
          pills={projectStages.map(stage => stage.label)}
          onChange={handleStageOrderChange}
        />
      </div>
    </div>

    <Button
      variant="ghost"
      size="sm"
      className="p-1"
      onClick={() => scrollByAmount(200)}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>

      {/* Konten tiap stage */}
      {projectStages.map((stage) => (
        <TabsContent key={stage.id} value={stage.id} className="mt-3">
          <div className="grid h-[calc(100vh-300px)] grid-cols-12 gap-6">
            <div className="col-span-4">
              <EmployeeList
                employees={getAvailableEmployees(selectedTaskId || "")}
                selectedTaskId={selectedTaskId}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                uniqueRoles={uniqueRoles}
                onAssignEmployee={handleAssignEmployee}
              />
            </div>

            {/* Right Side - Task List */}
            <div className="col-span-8 px-1">
              <div className="mb-4 w-full flex items-center justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddTaskDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>

              <TaskList
                stage={stage.id}
                tasks={projectData[stage.id] || []}
                onTaskUpdate={handleUpdateTask}
                onTaskSelection={handleSelectTask}
                onTaskDelete={handleDeleteTask}
                onTaskRename={handleRenameTask}
                selectedTaskId={selectedTaskId}
              />
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>

      </div>
      {/* Add Stage Dialog */}
      <Dialog open={showAddStageDialog} onOpenChange={setShowAddStageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stage</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-2">
            <div>
              <Label htmlFor="stage-name">Stage Name</Label>
              <Input
                id="stage-name"
                value={newStageName}
                placeholder="Enter stage name"
                className="mt-1"
                autoFocus
                onChange={e => setNewStageName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newStageName.trim()) {
                    e.preventDefault()
                    handleAddStage()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddStageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStage} disabled={!newStageName.trim()}>
                Add Stage
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add New Task to
              &ldquo;
              {projectStages.find(p => p.id === activeTab)?.label}
              &rdquo;
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div>
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                value={newTaskName}
                placeholder="Enter task name"
                className="mt-1"
                autoFocus
                onChange={e => setNewTaskName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newTaskName.trim()) {
                    e.preventDefault()
                    handleAddTask()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask} disabled={!newTaskName.trim()}>
                Add Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Stage Confirmation Dialog */}
      <AlertDialog open={!!deleteStageDialog} onOpenChange={() => setDeleteStageDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus &ldquo{projectStages.find(p => p.id === deleteStageDialog)?.label}&rdquo?</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Ini akan menghapus semua task, assigment, dan data untuk stage ini.</p>
              <p>Tindakan ini tidak dapat dibatalkan.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteStageDialog(null)}>Batalkan</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStageDialog && handleDeleteStage(deleteStageDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster theme="light" position="bottom-center" />
    </div>
  )
}