"use client"

import { /* DragEvent, */ useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DnDPillsProps {
  pills: string[] | undefined
  onChange: (newPills: string[]) => void
}

export function DnDPills({ pills, onChange }: DnDPillsProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [draggedOverItem, setDraggedOverItem] = useState<string | null>(null)

  const handleDragStart = (/* e: DragEvent<HTMLSpanElement>, */ item: string) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent<HTMLSpanElement>, item: string) => {
    e.preventDefault()
    setDraggedOverItem(item)
  }

  const handleDrop = (e: React.DragEvent<HTMLSpanElement>) => {
    e.preventDefault()

    if (!pills || !draggedItem || !draggedOverItem || draggedItem === draggedOverItem) {
      return
    }

    const newItems = [...pills]
    const draggedIndex = pills.indexOf(draggedItem)
    const dropIndex = pills.indexOf(draggedOverItem)

    // Remove and insert
    const [removed] = newItems.splice(draggedIndex, 1)
    newItems.splice(dropIndex, 0, removed)

    onChange(newItems) // send update to parent

    setDraggedItem(null)
    setDraggedOverItem(null)
  }

  return (
    <div
      style={{ alignContent: 'flex-start' }}
      className="flex flex-wrap items-start gap-1 p-2 bg-gray-100 rounded-lg"
    >
      {pills && pills.map(item => (
        <Badge
          key={item}
          draggable
          onDragStart={() => handleDragStart(item)}
          onDragOver={e => handleDragOver(e, item)}
          onDrop={handleDrop}
          // style={{ width: item.width }}
          className={cn(
              'px-2 py-1 rounded-md text-white cursor-grab',
              'flex items-center justify-center bg-sky-800',
              'transition-colors whitespace-nowrap',
              { 'bg-gray-600': draggedOverItem === item },
              { 'opacity-50': draggedItem === item }
          )}
        >
          {item}
        </Badge>
      ))}
    </div>
  )
}
