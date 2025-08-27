"use client";
import { Task } from "@/types/project";
import React, { useState } from "react";

const [projectData, setProjectData] = useState<{ [key: string]: Task[] }>({});
const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

function handleUpdateTask(
  taskId: string,
  updates: Partial<Task>,
  activeTab: string // Add activeTab as a parameter
) {
  if (!activeTab) return;

  setProjectData(prev => ({
    ...prev,
    [activeTab]: (prev[activeTab] || []).map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ),
  }));

  // If the task id is being updated (renamed), update selectedTaskId if needed
  if (updates.id && selectedTaskId === taskId) {
    setSelectedTaskId(updates.id);
  }
}

