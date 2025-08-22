'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Calendar, User, Zap, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------
// Type Definitions
// ---------------------------
type Employee = { id: number; name: string; role: string }
type Task = { id: number; name: string; employeeId: number; startDate: string; endDate: string; storyPoints: number }
type Stage = { id: number; name: string; tasks: Task[] }
type Project = { id: number; name: string; stages: Stage[] }

// ---------------------------
// Sample Data
// ---------------------------
const employees: Employee[] = [
  { id: 1, name: 'Alice Johnson', role: 'System Analyst' },
  { id: 2, name: 'Bob Smith', role: 'Data Engineer' },
  { id: 3, name: 'Carol Davis', role: 'Software Engineer' },
]

const taskNamePool = [
  'UI Mockup', 'UX Research', 'API Integration', 'Frontend Implementation',
  'Backend Development', 'Unit Testing', 'UAT', 'Marketing Prep', 'Launch Event'
]

// ---------------------------
// Utility Functions
// ---------------------------
const getTaskColor = (index: number) =>
  ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][index % 5]

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

const getTaskPosition = (task: Task, dailyHeaders: Date[], dayWidth: number) => {
  const startIndex = dailyHeaders.findIndex(d => d.toDateString() === new Date(task.startDate).toDateString())
  const endIndex = dailyHeaders.findIndex(d => d.toDateString() === new Date(task.endDate).toDateString())
  const left = (startIndex >= 0 ? startIndex : 0) * dayWidth
  const width = ((endIndex >= 0 ? endIndex : dailyHeaders.length - 1) - (startIndex >= 0 ? startIndex : 0) + 1) * dayWidth
  return { left: `${left}px`, width: `${width}px` }
}

const getTaskLevels = (tasks: Task[]) => {
  const levels: { [id: number]: number } = {}
  const sorted = [...tasks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  sorted.forEach(task => {
    let level = 0
    while (true) {
      const overlap = sorted.some(other => {
        if (other.id === task.id || levels[other.id] !== level) return false
        const s = new Date(task.startDate), e = new Date(task.endDate)
        const os = new Date(other.startDate), oe = new Date(other.endDate)
        return s <= oe && e >= os
      })
      if (!overlap) break
      level++
    }
    levels[task.id] = level
  })
  return levels
}

// ---------------------------
// Dummy Project Generator
// ---------------------------
const generateDummyProject = (): Project => {
  const stageNames = ['Design', 'Development', 'Testing', 'Market Launch']
  let taskId = 1
  const startProject = new Date()
  const stages: Stage[] = stageNames.map((stageName, stageIndex) => {
    const numTasks = 2 + Math.floor(Math.random() * 4)
    const tasks: Task[] = Array.from({ length: numTasks }, (_, i) => {
      const taskLength = 2 + Math.floor(Math.random() * 9)
      const startOffset = stageIndex * 7 + Math.floor(Math.random() * 6) + i
      const startDate = new Date(startProject)
      startDate.setDate(startDate.getDate() + startOffset)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + taskLength - 1)
      const employee = employees[Math.floor(Math.random() * employees.length)]
      const storyPoints = [3, 5, 8, 13][Math.floor(Math.random() * 4)]
      const taskName = taskNamePool[Math.floor(Math.random() * taskNamePool.length)]
      return {
        id: taskId++,
        name: taskName,
        employeeId: employee.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        storyPoints
      }
    })
    return { id: stageIndex + 1, name: stageName, tasks }
  })
  return { id: 1, name: 'Project Alpha', stages }
}

// ---------------------------
// Main Component
// ---------------------------
export default function ProjectTimeline() {
  const [project, setProject] = useState<Project>(generateDummyProject)
  const dayWidth = 32
  const tasks = project.stages.flatMap(s => s.tasks)

  // ---------------------------
  // Drag State
  // ---------------------------
  const [draggingTask, setDraggingTask] = useState<Task | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null)
  const [dragOverStage, setDragOverStage] = useState<number | null>(null)

  const handleMouseDown = (task: Task, e: React.MouseEvent) => {
    setDraggingTask(task)
    setDragStartX(e.clientX)
    setDragStartDate(new Date(task.startDate))
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingTask || !dragStartDate) return
    const deltaX = e.clientX - dragStartX
    const daysMoved = Math.round(deltaX / dayWidth)
    if (daysMoved !== 0) {
      setProject(prev => {
        const newStages = prev.stages.map(stage => ({
          ...stage,
          tasks: stage.tasks.map(t => {
            if (t.id === draggingTask.id) {
              const newStart = new Date(dragStartDate)
              newStart.setDate(newStart.getDate() + daysMoved)
              const duration = (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / (1000*60*60*24)
              const newEnd = new Date(newStart)
              newEnd.setDate(newEnd.getDate() + duration)
              return { ...t, startDate: newStart.toISOString().split('T')[0], endDate: newEnd.toISOString().split('T')[0] }
            }
            return t
          })
        }))
        return { ...prev, stages: newStages }
      })
    }
  }

  const handleMouseUp = () => {
    setDraggingTask(null)
    setDragStartDate(null)
  }

  const handleDropToStage = (stageId: number) => {
    if (!draggingTask) return
    setProject(prev => {
      const newStages = prev.stages.map(stage => {
        const filteredTasks = stage.tasks.filter(t => t.id !== draggingTask.id)
        if (stage.id === stageId) {
          return { ...stage, tasks: [...filteredTasks, draggingTask] }
        }
        return { ...stage, tasks: filteredTasks }
      })
      return { ...prev, stages: newStages }
    })
    setDraggingTask(null)
    setDragStartDate(null)
    setDragOverStage(null)
  }

  // ---------------------------
  // Calculate Project Date Range
  // ---------------------------
  const { startDate, endDate } = useMemo(() => {
    if (!tasks.length) return { startDate: new Date(), endDate: new Date() }
    const sDates = tasks.map(t => new Date(t.startDate))
    const eDates = tasks.map(t => new Date(t.endDate))
    return {
      startDate: new Date(Math.min(...sDates.map(d => d.getTime()))),
      endDate: new Date(Math.max(...eDates.map(d => d.getTime()))),
    }
  }, [tasks])

  // ---------------------------
  // Daily Headers
  // ---------------------------
  const dailyHeaders = useMemo(() => {
    const headers: Date[] = []
    const current = new Date(startDate)
    current.setDate(current.getDate() - 4)
    const end = new Date(endDate)
    end.setDate(end.getDate() + 4)
    while (current <= end) {
      headers.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return headers
  }, [startDate, endDate])

  // ---------------------------
  // Month Headers
  // ---------------------------
  const monthHeaders = useMemo(() => {
    const months: { name: string; span: number }[] = []
    dailyHeaders.forEach(d => {
      const lastMonth = months[months.length - 1]
      const currentMonthName = d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      if (!lastMonth || lastMonth.name !== currentMonthName) {
        months.push({ name: currentMonthName, span: 1 })
      } else {
        lastMonth.span++
      }
    })
    return months
  }, [dailyHeaders])

  // ---------------------------
  // Truncate Task Name
  // ---------------------------
  const truncateName = (name: string, widthPx: number) => {
    const charWidth = 8
    const maxChars = Math.floor(widthPx / charWidth)
    return name.length > maxChars ? name.slice(0, maxChars - 1) + '…' : name
  }

  return (
    <Card
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="cursor-grab"
    >
      <CardContent className="p-0 relative">
        <div className="min-w-fit">
          {/* Month & Daily Headers */}
          <div className="sticky top-0 z-30 bg-white">
            <div className="flex">
              {/* Stage / Task Column */}
              <div className="w-64 p-3 font-semibold border-r border-b bg-gray-100 sticky left-0 top-0 z-40 truncate">
                Stage / Task
              </div>

              {/* Timeline Header */}
              <div className="flex-grow">
                {/* Month Row */}
                <div className="flex border-b">
                  {monthHeaders.map((m, i) => (
                    <div
                      key={i}
                      className="text-center text-xs font-medium border-r flex items-center justify-center bg-gray-200"
                      style={{ width: `${m.span * dayWidth}px`, height: '48px' }}
                    >
                      {m.name}
                    </div>
                  ))}
                </div>

                {/* Daily Row */}
                <div className="flex border-b">
                  {dailyHeaders.map((d, i) => (
                    <div
                      key={i}
                      className={cn(
                        'p-1 text-center text-xs border-r flex flex-col justify-center sticky top-[48px] z-20',
                        isWeekend(d) ? 'bg-gray-50' : 'bg-white'
                      )}
                      style={{ width: `${dayWidth}px`, height: '48px' }}
                    >
                      <div className="font-medium truncate">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-gray-600">{d.getDate()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stages & Tasks */}
          <TooltipProvider>
            {project.stages.map(stage => {
              const taskLevels = getTaskLevels(stage.tasks)
              const rowHeight = Math.max(64, (Math.max(...Object.values(taskLevels), 0) + 1) * 36 + 16)

              return (
                <div
                  key={stage.id}
                  style={{ minHeight: `${rowHeight}px` }}
                  className={cn(
                    "flex border-b relative",
                    dragOverStage === stage.id ? "bg-blue-50" : ""
                  )}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverStage(stage.id)
                  }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={() => handleDropToStage(stage.id)}
                >
                  {/* Stage Column */}
                  <div className="w-64 px-4 py-3 border-r bg-white sticky left-0 z-20 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold truncate max-w-[180px]">{stage.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">{stage.tasks.length} tasks</span>
                  </div>

                  {/* Task Bars */}
                  <div className="flex-1 relative">
                    {/* Background Grid */}
                    <div className="absolute inset-0 flex">
                      {dailyHeaders.map((d, i) => (
                        <div
                          key={i}
                          className={`border-r ${isWeekend(d) ? 'bg-gray-50' : 'bg-white'}`}
                          style={{ width: `${dayWidth}px` }}
                        />
                      ))}
                    </div>

                    {/* Drop indicator */}
                    {dragOverStage === stage.id && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}

                    {/* Task Elements */}
                    <div className="relative p-2">
                      {stage.tasks.map((task, index) => {
                        const pos = getTaskPosition(task, dailyHeaders, dayWidth)
                        const level = taskLevels[task.id]
                        const topOffset = level * 36 + 6
                        const employee = employees.find(e => e.id === task.employeeId)

                        return (
                          <Tooltip key={task.id}>
                            <TooltipTrigger asChild> 
                              <div
                                draggable
                                onMouseDown={(e) => handleMouseDown(task, e)}
                                onDragStart={() => setDraggingTask(task)}
                                onDragEnd={() => {
                                  setDraggingTask(null)
                                  setDragOverStage(null)
                                }}
                                className={cn(
                                  "absolute h-8 flex items-center text-white text-xs font-medium cursor-grab rounded shadow-sm transition hover:shadow-md hover:opacity-90",
                                  getTaskColor(index)
                                )}
                                style={{
                                  left: pos.left,
                                  top: `${topOffset}px`,
                                  width: pos.width,
                                  maxWidth: pos.width,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  padding: '0 6px',
                                  lineHeight: '1.5rem',
                                  borderRadius: '4px'
                                }}
                                title={task.name}
                              >
                                {truncateName(task.name, parseInt(pos.width))}
                              </div>
                            </TooltipTrigger>

                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-1">
                                <div className="font-semibold">{task.name}</div>
                                <div className="text-sm flex gap-2 items-center">
                                  <Calendar className="h-3 w-3" /> {task.startDate} - {task.endDate}
                                </div>
                                <div className="text-sm flex gap-2 items-center">
                                  <User className="h-3 w-3" /> {employee?.name} • {employee?.role}
                                </div>
                                <div className="text-sm flex gap-2 items-center">
                                  <Zap className="h-3 w-3" /> {task.storyPoints} story points
                                </div>
                                <div className="text-sm text-gray-500">Stage: {stage.name}</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}
