"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Edit2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PillItemProps {
  item: string;
  isDragging: boolean;
  isDraggedOver: boolean;
  onDragStart: (item: string) => void;
  onDragOver: (e: React.DragEvent<HTMLSpanElement>, item: string) => void;
  onDrop: (e: React.DragEvent<HTMLSpanElement>) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

const PillItem = ({
  item,
  isDragging,
  isDraggedOver,
  onDragStart,
  onDragOver,
  onDrop,
  onRename,
  onDelete,
}: PillItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState(item);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (editingValue.trim() && editingValue.trim() !== item) {
      onRename(item, editingValue.trim());
    } else {
      setEditingValue(item); // Reset jika input kosong atau tidak berubah
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
    if (e.key === "Escape") {
      setEditingValue(item);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className="flex-1 w-full">
        <Input
          ref={inputRef}
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-8 px-2 py-1 bg-transparent border-gray-300 focus-visible:ring-0 text-gray-800"
        />
      </div>
    );
  }

  return (
    <Badge
      draggable
      onDragStart={() => onDragStart(item)}
      onDragOver={(e) => onDragOver(e, item)}
      onDrop={onDrop}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "group px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-grab",
        "flex items-center justify-between gap-2",
        "bg-sky-800 text-white hover:bg-sky-700",
        { "bg-sky-600": isDraggedOver },
        { "opacity-50": isDragging },
      )}
    >
      <span className="flex-1 truncate mr-2">{item}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 rounded-full p-0 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation(); // Mencegah onDoubleClick
            handleDoubleClick();
          }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 rounded-full p-0 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation(); // Mencegah onDoubleClick
            onDelete(item);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Badge>
  );
};

interface DnDPillsProps {
  pills: string[];
  onChange: (newPills: string[]) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

export function DnDPills({
  pills,
  onChange,
  onRename,
  onDelete,
}: DnDPillsProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedOverItem, setDraggedOverItem] = useState<string | null>(null);

  const handleDragStart = (item: string) => {
    setDraggedItem(item);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLSpanElement>,
    item: string,
  ) => {
    e.preventDefault();
    setDraggedOverItem(item);
  };

  const handleDrop = (e: React.DragEvent<HTMLSpanElement>) => {
    e.preventDefault();

    if (
      !pills ||
      !draggedItem ||
      !draggedOverItem ||
      draggedItem === draggedOverItem
    ) {
      return;
    }

    const newItems = [...pills];
    const draggedIndex = pills.indexOf(draggedItem);
    const dropIndex = pills.indexOf(draggedOverItem);

    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, removed);

    onChange(newItems);

    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  return (
    <div
      style={{ alignContent: "flex-start" }}
      className="flex flex-wrap items-start gap-1 p-2 bg-gray-100 rounded-lg"
    >
      {pills.map((item) => (
        <PillItem
          key={item}
          item={item}
          isDragging={draggedItem === item}
          isDraggedOver={draggedOverItem === item}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
