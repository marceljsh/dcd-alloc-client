"use client"

import { JSX, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Users, Crown, Medal, Star, Sparkles } from "lucide-react"

interface LevelConfig {
  enabled: boolean
  maxHeadcount: number
  workloadUnit?: number
}

interface RoleConfig {
  junior: LevelConfig
  middle: LevelConfig
  senior: LevelConfig
}

const initialRoleConfig: RoleConfig = {
  junior: { enabled: true, maxHeadcount: 2 },
  middle: { enabled: true, maxHeadcount: 3 },
  senior: { enabled: true, maxHeadcount: 3 },
}

const initialDataEngineerConfig: RoleConfig = {
  junior: { enabled: true, maxHeadcount: 2, workloadUnit: 0.8 },
  middle: { enabled: true, maxHeadcount: 3, workloadUnit: 1 },
  senior: { enabled: true, maxHeadcount: 3, workloadUnit: 1 },
}

export default function RoleAssignmentPage() {
  const [maxTeamSize, setMaxTeamSize] = useState(10)
  const [roles, setRoles] = useState({
    softwareEngineer: initialRoleConfig,
    dataEngineer: initialDataEngineerConfig,
    systemAnalyst: initialRoleConfig,
  })

  const updateRoleLevel = (
    role: keyof typeof roles,
    level: keyof RoleConfig,
    field: keyof LevelConfig,
    value: any
  ) => {
    setRoles((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [level]: {
          ...prev[role][level],
          [field]: value,
        },
      },
    }))
  }

  const handleNext = () => {
    console.log("Moving to next step with configuration:", { maxTeamSize, roles })
  }

  const ProgressStep = ({
    step,
    title,
    subtitle,
    isActive,
    isCompleted,
  }: {
    step: number
    title: string
    subtitle: string
    isActive?: boolean
    isCompleted?: boolean
  }) => (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
          ${
            isCompleted
              ? "bg-teal-600 border-teal-600 text-white"
              : isActive
              ? "bg-teal-600 border-teal-600 text-white"
              : "border-gray-300 text-gray-400"
          }`}
      >
        {isCompleted ? <CheckCircle className="w-4 h-4" /> : step}
      </div>
      <div className="flex flex-col">
        <span
          className={`font-medium ${isActive || isCompleted ? "text-gray-900" : "text-gray-400"}`}
        >
          {title}
        </span>
        <span className="text-xs text-gray-500">{subtitle}</span>
      </div>
    </div>
  )

  const RoleCard = ({
    title,
    roleKey,
  }: {
    title: string
    roleKey: keyof typeof roles
  }) => {
    const levelConfig: Record<
      keyof RoleConfig,
      { icon: JSX.Element }
    > = {
      senior: {
        icon: <Crown className="w-4 h-4 text-red-500" />,
      },
      middle: {
        icon: <Medal className="w-4 h-4 text-yellow-500" />,
      },
      junior: {
        icon: <Sparkles className="w-4 h-4 text-green-500" />,
      },
    }

    return (
      <Card className="shadow-sm mb-4">
        <CardHeader className="mt-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(["senior", "middle", "junior"] as const).map((level) => (
              <div
                key={level}
                className="rounded-lg p-3 border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${roleKey}-${level}`}
                      checked={roles[roleKey][level].enabled}
                      onCheckedChange={(checked) =>
                        updateRoleLevel(roleKey, level, "enabled", checked)
                      }
                    />
                    <Label
                      htmlFor={`${roleKey}-${level}`}
                      className="text-sm font-medium capitalize"
                    >
                      {level}
                    </Label>
                  </div>
                  {levelConfig[level].icon}
                </div>

                <div>
                  <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3" /> Max Headcount
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={roles[roleKey][level].maxHeadcount}
                    onChange={(e) =>
                      updateRoleLevel(
                        roleKey,
                        level,
                        "maxHeadcount",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className="w-20 h-8 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    disabled={!roles[roleKey][level].enabled}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen p-5">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-2">
          <ProgressStep step={1} title="Project Input" subtitle="Basic project information" isCompleted />
          <div className="flex-1 h-px bg-gray-300 mx-3" />
          <ProgressStep step={2} title="Role & Level" subtitle="Team configuration" isActive />
          <div className="flex-1 h-px bg-gray-300 mx-3" />
          <ProgressStep step={3} title="Results" subtitle="Resource estimation" />
          <div className="flex-1 h-px bg-gray-300 mx-3" />
          <ProgressStep step={4} title="Simulation" subtitle="What-if analysis" />
        </div>

        {/* Header */}
        <div className="space-y-1 mb-2 mt-7">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-semibold">Role & Level Selection</h1>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            Configure available team members and their leverage factors for Project 1
          </p>
        </div>

        {/* Team Size Constraints */}
        <Card className="shadow-sm w-[700px] mb-4">
          <CardHeader className="mt-3">
            <div className="flex flex-col space-y-1">
              <CardTitle className="text-base">Team Size Constraints</CardTitle>
              <span className="text-xs text-gray-500">
                Define the maximum number of team members allowed for this project.
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex items-center gap-3 pb-3">
            <Label htmlFor="maxTeamSize" className="text-sm font-medium">
              Max Size
            </Label>
            <Input
              id="maxTeamSize"
              type="number"
              min="1"
              value={maxTeamSize}
              onChange={(e) => setMaxTeamSize(Number.parseInt(e.target.value))}
              className="w-20 h-8 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </CardContent>
        </Card>

        {/* Role Sections */}
        <RoleCard title="Data Engineer" roleKey="dataEngineer" />
        <RoleCard title="Software Engineer" roleKey="softwareEngineer" />
        <RoleCard title="System Analyst" roleKey="systemAnalyst" />

        {/* Next Button */}
        <div className="flex justify-end mt-2">
          <Button onClick={handleNext} className="bg-black hover:bg-teal-700 text-white px-6 py-2">
            Continue to Results
          </Button>
        </div>
      </div>
    </div>
  )
}
