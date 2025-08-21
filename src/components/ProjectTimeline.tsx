'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Calendar, User, Zap, Layers, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

type Employee = { id: number, name: string, role: string }
type Task = { id: number, name: string, employeeId: number, startDate: string, endDate: string, storyPoints: number }
type Stage = { id: number, name: string, tasks: Task[] }
type Project = { id: number, name: string, stages: Stage[] }

const employees: Employee[] = [
  { id: 1, name: 'Alice Johnson', role: 'System Analyst' },
  { id: 2, name: 'Bob Smith', role: 'Data Engineer' },
  { id: 3, name: 'Carol Davis', role: 'Software Engineer' },
]

const taskNamePool = [
  "UI Mockup", "UX Research", "API Integration", "Frontend Implementation",
  "Backend Development", "Unit Testing", "UAT", "Marketing Prep", "Launch Event"
]

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

const generateDummyProject = (): Project => {
  const stageNames = ['Design', 'Development', 'Testing', 'Market Launch']
  let taskId = 1
  const startProject = new Date()
  const stages: Stage[] = stageNames.map((stageName, stageIndex) => {
    const numTasks = 2 + Math.floor(Math.random() * 4) // 2-5 tasks per stage
    const tasks: Task[] = Array.from({ length: numTasks }, (_, i) => {
      // Durasi task acak 2-10 hari
      const taskLength = 2 + Math.floor(Math.random() * 9)
      // Stagger start dengan offset acak 0-5 hari + stageIndex*7
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


export default function ProjectTimeline() {
  const [project, setProject] = useState<Project>(generateDummyProject)
  const dayWidth = 32
  const tasks = project.stages.flatMap(s => s.tasks)

  const { startDate, endDate } = useMemo(() => {
    if (!tasks.length) return { startDate: new Date(), endDate: new Date() }
    const sDates = tasks.map(t => new Date(t.startDate))
    const eDates = tasks.map(t => new Date(t.endDate))
    return {
      startDate: new Date(Math.min(...sDates.map(d => d.getTime()))),
      endDate: new Date(Math.max(...eDates.map(d => d.getTime()))),
    }
  }, [tasks])

  const dailyHeaders = useMemo(() => {
    const headers: Date[] = []
    const current = new Date(startDate)
    while (current <= endDate) {
      headers.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return headers
  }, [startDate, endDate])

  // ===== Group headers by month =====
  const monthHeaders = useMemo(() => {
    const months: { name: string, span: number }[] = []
    let currentMonth = dailyHeaders[0].getMonth()
    let count = 0
    dailyHeaders.forEach((d, i) => {
      if (d.getMonth() === currentMonth) {
        count++
      } else {
        months.push({ name: d.toLocaleString('en-US', { month: 'short' }), span: count })
        currentMonth = d.getMonth()
        count = 1
      }
      if (i === dailyHeaders.length - 1) months.push({ name: d.toLocaleString('en-US', { month: 'short' }), span: count })
    })
    return months
  }, [dailyHeaders])

  return (
    <Card>
      <CardContent className="p-0 overflow-auto">
        <div className="flex justify-between items-center p-2 border-b">
          <h2 className="font-semibold">{project.name} - Timeline</h2>
          <button
            onClick={() => setProject(generateDummyProject())}
            className="flex items-center gap-1 px-2 py-1 border rounded text-sm hover:bg-gray-100 transition"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh Project
          </button>
        </div>

        {/* Scrollable container */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${dailyHeaders.length * dayWidth + 220}px` }}>
            {/* Month Header */}
            <div className="flex border-b">
              <div className="w-56 border-r bg-gray-50"></div>
              {monthHeaders.map((m, i) => (
                <div
                  key={i}
                  className="text-center text-xs font-medium border-r flex items-center justify-center bg-gray-100"
                  style={{ width: `${m.span * dayWidth}px` }}
                >
                  {m.name}
                </div>
              ))}
            </div>

            {/* Weekly Header */}
            <div className="flex border-b">
              <div className="w-56 border-r bg-gray-50"></div>
              {dailyHeaders.reduce<{ start: Date, end: Date }[]>((weeks, day, idx) => {
                if (idx % 7 === 0) {
                  weeks.push({ start: day, end: dailyHeaders[Math.min(idx + 6, dailyHeaders.length - 1)] });
                }
                return weeks;
              }, []).map((week, i) => (
                <div
                  key={i}
                  className="text-center text-xs font-medium border-r flex flex-col justify-center bg-gray-200"
                  style={{ width: `${((new Date(week.end).getTime() - new Date(week.start).getTime()) / (1000 * 60 * 60 * 24) + 1) * dayWidth}px` }}
                >
                  <div>{week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div>{week.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              ))}
            </div>

            {/* Weekday + Date Header */}
            <div className="flex border-b">
              <div className="w-56 p-2 border-r font-semibold bg-gray-50 sticky left-0 z-10">Stage / Task</div>
              {dailyHeaders.map((d: Date) => (
                <div
                  key={d.toISOString()}
                  className={cn("p-1 text-center text-xs border-r flex flex-col justify-center",
                    isWeekend(d) ? 'bg-gray-100' : 'bg-white')}
                  style={{ width: `${dayWidth}px` }}
                >
                  <div className="font-medium">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-gray-600">{d.getDate()}</div>
                </div>
              ))}
            </div>

            {/* Stage + Tasks */}
            <div className="relative">
              {project.stages.map((stage) => {
                const stageTasks = stage.tasks
                const taskLevels = getTaskLevels(stageTasks)
                const rowHeight = Math.max(64, (Math.max(...Object.values(taskLevels), 0) + 1) * 32 + 20)

                return (
                  <div key={stage.id} style={{ minHeight: `${rowHeight}px` }} className="flex border-b relative">
                    {/* Stage Label */}
                    <div className="w-56 px-3 py-4 border-r bg-white sticky left-0 z-10 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold">{stage.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{stage.tasks.length} tasks</span>
                    </div>

                    {/* Task Bars */}
                    <div className="flex-1 relative">
                      {/* Grid background */}
                      <div className="absolute inset-0 flex">
                        {dailyHeaders.map((d, i) => (
                          <div key={i} className={`border-r ${isWeekend(d) ? 'bg-gray-50' : 'bg-white'}`} style={{ width: `${dayWidth}px` }} />
                        ))}
                      </div>

                      <div className="relative p-2">
                        {stageTasks.map((task, index) => {
                          const pos = getTaskPosition(task, dailyHeaders, dayWidth)
                          const level = taskLevels[task.id]
                          const topOffset = level * 32 + 8
                          const employee = employees.find(e => e.id === task.employeeId)
                          return (
                            <TooltipProvider key={task.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "absolute h-7 px-2 flex items-center text-white text-xs font-medium cursor-pointer rounded shadow-sm transition hover:shadow-md hover:opacity-90",
                                      getTaskColor(index)
                                    )}
                                    style={{ left: pos.left, width: pos.width, top: `${topOffset}px` }}
                                  >
                                    {task.name}
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
                            </TooltipProvider>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}