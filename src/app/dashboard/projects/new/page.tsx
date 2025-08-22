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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { datesOverlap } from '@/lib/dates'
import { Employee } from '@/types/employee'
import { ProjectData, ProjectDraft, ProjectStage, Task } from '@/types/project'
<<<<<<< HEAD
import { Edit2, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
=======
import { Edit2, Plus, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
>>>>>>> d185057 (drag and drop stage in page new project)
import { toast } from 'sonner'
import employeesData from '@/data/employees.json'
import { updateRecordKey } from '@/lib/containers'
import * as Strings from '@/lib/strings'
import { useSearchParams } from 'next/navigation'
<<<<<<< HEAD
=======
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
>>>>>>> d185057 (drag and drop stage in page new project)

const uniqueRoles = ['all', 'System Analyst', 'Data Engineer', 'Software Engineer']

// -------------------------
// SortableStage Component
// -------------------------
type SortableStageProps = {
  stage: ProjectStage
  editingStage: string | null
  editStageValue: string
  handleStartEditStage: (id: string) => void
  handleFinishEditStage: (id: string) => void
  handleCancelEditStage: () => void
  onDeleteStage: (id: string) => void
  setEditStageValue: (v: string) => void
  activeTab?: string
}

function SortableStage({
  stage,
  editingStage,
  editStageValue,
  handleStartEditStage,
  handleFinishEditStage,
  handleCancelEditStage,
  onDeleteStage,
  setEditStageValue,
  activeTab,
}: SortableStageProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stage.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="inline-block">
      <TabsTrigger
        value={stage.id}
        onDoubleClick={() => handleStartEditStage(stage.id)}
        className="group"
      >
        <div className="flex items-center gap-1">
          {editingStage === stage.id ? (
            <input
              type="text"
              value={editStageValue}
              autoFocus
              onChange={(e) => setEditStageValue(e.target.value)}
              onBlur={() => handleFinishEditStage(stage.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFinishEditStage(stage.id)
                if (e.key === "Escape") handleCancelEditStage()
              }}
              className="px-1 py-0.5 text-sm rounded border focus:outline-none focus:ring"
            />
          ) : (
            <span className="whitespace-nowrap">{stage.label}</span>
          )}

          {/* Delete only on hover (keeps tab clean) */}
          {editingStage !== stage.id && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteStage(stage.id)

              }}
              className="hidden group-hover:flex text-red-500 hover:text-red-600 p-1 rounded"
              aria-label={`Delete stage ${stage.label}`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </TabsTrigger>
    </div>
  )
}

// -------------------------
// Main Page
// -------------------------
export default function AllocatorPage() {
  const [employees, setEmployees] = useState<Employee[]>(employeesData as Employee[])
  const [projectStages, setProjectStages] = useState<ProjectStage[]>([])
  const [projectData, setProjectData] = useState<ProjectData>({})
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)

  // Dialog states
  const [showAddStageDialog, setShowAddStageDialog] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [deleteStageDialog, setDeleteStageDialog] = useState<string | null>(null)
  const [editingStage, setEditingStage] = useState<string | null>(null)
  const [newStageName, setNewStageName] = useState('')
  const [newTaskName, setNewTaskName] = useState('')
  const [editStageValue, setEditStageValue] = useState('')

  const draftId = useSearchParams().get('ts')

  // initialize from draft if present
  useEffect(() => {
    if (draftId) {
      const rawDraft = sessionStorage.getItem(`project-${draftId}`)
      if (rawDraft) {
        const draft: ProjectDraft = JSON.parse(rawDraft)
        const stages = draft.stages.map(stage => ({ id: Strings.toKebab(stage), label: stage }))
        setProjectStages(stages)
        const data = stages.reduce((acc, stage) => {
          acc[stage.id] = []
          return acc
        }, {} as ProjectData)
        setProjectData(data)
        setActiveTab(stages[0]?.id)
      }
    }
  }, [draftId])

<<<<<<< HEAD
=======
  // ensure activeTab set when stages change
  useEffect(() => {
    if (!activeTab && projectStages.length > 0) {
      setActiveTab(projectStages[0].id)
    }
    if (projectStages.length === 0) {
      setActiveTab(undefined)
    }
  }, [projectStages, activeTab])

  // scroll dragging (for horizontal tabs)
  const scrollRef = useRef<HTMLDivElement | null>(null)
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

  // -------------------------
  // Handlers (kept as original)
  // -------------------------
>>>>>>> d185057 (drag and drop stage in page new project)
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
      const copy = { ...prev }
      delete copy[stageId]
      return copy
    })

    // if deleting active tab, switch to first available tab
    if (activeTab === stageId) {
      const remainingStages = projectStages.filter(stage => stage.id !== stageId)
      if (remainingStages.length > 0) {
        setActiveTab(remainingStages[0].id)
      } else {
        setActiveTab(undefined)
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
      if (updatedData[newId]) {
        updatedData[newId].forEach(task => {
          task.id = task.id.replace(new RegExp(`^${stageId}#`), `${newId}#`)
        })
      }
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
<<<<<<< HEAD
    setSelectedTaskId(taskId)
    setRoleFilter('all')
=======
    setRoleFilter("all")

    setSelectedTaskId(prev =>
      prev === taskId ? null : taskId
    )
>>>>>>> d185057 (drag and drop stage in page new project)
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
      const copy = { ...prev }
      copy[activeTab] = copy[activeTab].filter(task => task.id !== taskId)
      return copy
    })

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
        id: (stage.id as any) instanceof String ? 'string' : null,
        name: stage.label,
        tasks: (projectData[stage.id] || []).map(task => {
          const { id, assignedEmployees, ...taskData } = task
          return {
            ...taskData,
            assignedEmployees: assignedEmployees.map(emp => Number(emp.id)),
          }
        })
      }
    })

    toast.promise(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          projectStages.forEach(stage => {
            (projectData[stage.id] || []).forEach(task => {
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

  // -------------------------
  // DnD sensors & handlers
  // -------------------------
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setProjectStages(prev => {
        const oldIndex = prev.findIndex(s => s.id === active.id)
        const newIndex = prev.findIndex(s => s.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return prev
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const onDragStart = (_event: DragStartEvent) => {
    // optional: you could set a dragging state if you'd like to style
  }

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="bg-background min-h-fit mx-10">
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddStageDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Stage
              </Button>
            </div>

            <Button onClick={handleSaveProject} size="lg">
              Save Project
            </Button>
          </div>
        </div>

<<<<<<< HEAD
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4 flex items-center gap-2">
            <TabsList className="flex-1">
              {/* if no stages exist */}
              {projectStages.length === 0 && <span className="text-muted-foreground">No stages added yet</span>}

              {projectStages.map(stage => (
                <div key={stage.id} className="group relative flex-1">
                  <TabsTrigger value={stage.id} className="flex w-full items-center gap-2 text-center">
                    {editingStage === stage.id ? (
                      <Input
                        autoFocus
                        className="h-6 min-w-0 px-1 text-sm"
                        value={editStageValue}
                        onBlur={() => handleFinishEditStage(stage.id)}
                        onChange={(e) => setEditStageValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleFinishEditStage(stage.id)
                          } else if (e.key === 'Escape') {
                            handleCancelEditStage()
                          }
                        }}
                      />
                    ) : (
                      <>
                        <span className="truncate">{stage.label}</span>
                        <div
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={e => {
                            e.stopPropagation()
                            handleStartEditStage(stage.id)
                          }}
                        >
                          <Edit2 />
                        </div>
                      </>
                    )}
                  </TabsTrigger>
                  {projectStages.length > 1 && (
                    <button
                      className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 z-10 rounded-full p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => setDeleteStageDialog(stage.id)}
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </TabsList>
          </div>

          {projectStages.map(stage => (
=======
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="w-full">
          <div className="flex items-center gap-2 mb-4">
            {/* scrollable container */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full 
                        [&::-webkit-scrollbar-thumb]:bg-gray-400/70 [&::-webkit-scrollbar-track]:bg-transparent"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
                onDragStart={onDragStart}
              >
                <SortableContext
                  items={projectStages.map(s => s.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  <TabsList className="flex w-max gap-3">
                    {projectStages.map((stage) => (
                      <SortableStage
                        key={stage.id}
                        stage={stage}
                        editingStage={editingStage}
                        editStageValue={editStageValue}
                        handleStartEditStage={handleStartEditStage}
                        handleFinishEditStage={handleFinishEditStage}
                        handleCancelEditStage={handleCancelEditStage}
                        onDeleteStage={(id) => setDeleteStageDialog(id)}
                        setEditStageValue={setEditStageValue}
                        activeTab={activeTab}
                      />
                    ))}
                  </TabsList>
                </SortableContext>
              </DndContext>
            </div>
          </div>

          {/* Konten tiap stage */}
          {projectStages.map((stage) => (
>>>>>>> d185057 (drag and drop stage in page new project)
            <TabsContent key={stage.id} value={stage.id} className="mt-6">
              <div className="grid h-[calc(100vh-300px)] grid-cols-12 gap-6">
                {/* Left Side - Employee List */}
                <div className="col-span-4 overflow-y-auto pr-2">
                  <EmployeeList
<<<<<<< HEAD
                    employees={getAvailableEmployees(selectedTaskId || '')}
=======
                    employees={getAvailableEmployees(selectedTaskId || "")}
>>>>>>> d185057 (drag and drop stage in page new project)
                    selectedTaskId={selectedTaskId}
                    roleFilter={roleFilter}
                    onRoleFilterChange={setRoleFilter}
                    uniqueRoles={uniqueRoles}
                    onAssignEmployee={handleAssignEmployee}
                  />
                </div>

                {/* Right Side - Task List */}
<<<<<<< HEAD
                <div className="col-span-8 px-1">
                  <div className="mb-4 w-full flex items-center justify-end">
                    <Button variant="outline" size="sm" onClick={() => setShowAddTaskDialog(true)}>
=======
                <div className="col-span-8 overflow-y-auto px-1">
                  <div className="mb-4 w-full flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddTaskDialog(true)}
                    >
>>>>>>> d185057 (drag and drop stage in page new project)
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
          <div className="mt-2 space-y-4">
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
              Add New Task to &ldquo;{projectStages.find(p => p.id === activeTab)?.label}&rdquo;
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
{/* Dialog konfirmasi hapus stage */}
<AlertDialog open={!!deleteStageDialog} onOpenChange={() => setDeleteStageDialog(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        Hapus “{projectStages.find(p => p.id === deleteStageDialog)?.label}”?
      </AlertDialogTitle>
      <AlertDialogDescription>
        Semua task pada stage ini akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => setDeleteStageDialog(null)}>
        Batalkan
      </AlertDialogCancel>
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
