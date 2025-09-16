"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, DollarSign, Clock, TrendingUp, Folder,CheckCircle } from "lucide-react"

interface ProjectData {
  totalFTE: number
  totalBudget: number
  duration: number
  teamCount: number
  activities: ActivitySummary[]
  teamAllocation: TeamAllocation[]
  projectCategory: string
}

interface ActivitySummary {
  name: string
  startDate: string
  endDate: string
  duration: string
  fte: number
  budget: number
  role: string
}

interface TeamAllocation {
  role: string
  senior: { count: number; fte: number; budget: number }
  middle: { count: number; fte: number; budget: number }
  junior: { count: number; fte: number; budget: number }
}

export default function ProjectCreation() {
  const [currentStep, setCurrentStep] = useState(3) 

  const projectData: ProjectData = {
    totalFTE: 8.3,
    totalBudget: 2850000000,
    duration: 6,
    teamCount: 12,
    projectCategory: "Medium",
    activities: [
  {
    "name": "Design",
    "startDate": "2025-09-01",
    "endDate": "2025-09-08",
    "duration": "48 jam",
    "fte": 1.8,
    "budget": 432000000,
    "role": "SA"
  },
  {
    "name": "Wireframing",
    "startDate": "2025-09-01",
    "endDate": "2025-09-02",
    "duration": "16 jam",
    "fte": 0.8,
    "budget": 144000000,
    "role": "SE"
  },
  {
    "name": "Prototyping",
    "startDate": "2025-09-03",
    "endDate": "2025-09-08",
    "duration": "32 jam",
    "fte": 1.2,
    "budget": 288000000,
    "role": "DE"
  },
  {
    "name": "Development",
    "startDate": "2025-09-06",
    "endDate": "2025-09-12",
    "duration": "36 jam",
    "fte": 3.5,
    "budget": 1260000000,
    "role": "SA"
  },
  {
    "name": "Testing",
    "startDate": "2025-09-21",
    "endDate": "2025-09-24",
    "duration": "24 jam",
    "fte": 1.0,
    "budget": 360000000,
    "role": "SE"
  },
  {
    "name": "Deployment",
    "startDate": "2025-09-28",
    "endDate": "2025-10-02",
    "duration": "30 jam",
    "fte": 0.8,
    "budget": 288000000,
    "role": "DE"
  }
],
    teamAllocation: [
      {
        role: "Data Engineer",
        senior: { count: 1, fte: 1.7, budget: 918000000 },
        middle: { count: 1, fte: 1.0, budget: 504000000 },
        junior: { count: 0, fte: 0, budget: 0 },
      },
      {
        role: "Software Engineer",
        senior: { count: 2, fte: 1.8, budget: 972000000 },
        middle: { count: 2, fte: 3.5, budget: 1386000000 },
        junior: { count: 1, fte: 1.0, budget: 384000000 },
      },
      {
        role: "System Analyst",
        senior: { count: 1, fte: 1.3, budget: 702000000 },
        middle: { count: 1, fte: 1.0, budget: 480000000 },
        junior: { count: 0, fte: 0, budget: 0 },
      },
    ],
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatBudgetShort = (amount: number, currencySymbol = "Rp") => {
  if (amount >= 1e12) {
    return `${currencySymbol} ${(amount / 1e12).toFixed(2)} T`;
  }
  if (amount >= 1e9) {
    return `${currencySymbol} ${(amount / 1e9).toFixed(2)} M`;
  }
  if (amount >= 1e6) {
    return `${currencySymbol} ${(amount / 1e6).toFixed(2)} Jt`;
  }
  return `${currencySymbol} ${amount.toLocaleString('id-ID')}`;
  };

  const roleFullNames: Record<"SE" | "DE" | "SA", string> = {
  SE: "Software Engineer",
  SA: "System Analyst",
  DE: "Data Engineer",
};

  const roleColors: Record<"SE" | "DE" | "SA", string> = {
  SE: "bg-blue-100 text-blue-800",
  DE: "bg-green-100 text-green-800",
  SA: "bg-purple-100 text-purple-800",
  };

  const levelColors: Record<"junior" | "middle" | "senior", string> = {
  junior: "bg-blue-100 text-blue-800",
  middle: "bg-yellow-100 text-yellow-800",
  senior: "bg-red-100 text-red-800",
};

  const steps = [
    { id: 1, name: "Project Input", active: false, completed: true },
    { id: 2, name: "Role & Level", active: false, completed: true },
    { id: 3, name: "Results", active: true, completed: false },
    { id: 4, name: "Simulation", active: false, completed: false },
  ]

  const totalWorkload = projectData.activities.reduce((sum, activity) => {
    const hours = parseInt(activity.duration.split(' ')[0], 10);
    return sum + hours;
}, 0);

  // Menghitung beban kerja dalam bulan, dengan asumsi 160 jam/bulan per orang
    const workloadInMonths = (totalWorkload / 160).toFixed(1);
    
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Project</h1>
            <p className="text-gray-600 mt-1">Estimate team size and resource allocation</p>
          </div>

          <div className="flex items-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.active
                        ? "bg-gray-900 text-white"
                        : step.completed
                          ? "bg-gray-300 text-gray-600"
                          : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step.completed ? <CheckCircle className="w-4 h-4" /> : step.id}
                  </div>
                  <span className={`text-sm font-medium ${step.active ? "text-gray-900" : "text-gray-500"}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && <div className="w-16 h-px bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 mt-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <div className="text-2xl font-bold text-gray-900">{formatBudgetShort(projectData.totalBudget)}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>{formatCurrency(projectData.totalBudget)}</p>
                    </TooltipContent>
                </Tooltip>
                </TooltipProvider>
                <p className="mb-3 text-xs text-gray-500">For {projectData.duration} months</p>
            </CardContent>
            </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 mt-3">
              <CardTitle className="text-sm font-medium text-gray-600">Duration</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{projectData.duration}</div>
              <p className="text-xs text-gray-500 mb-3">Months</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 mt-">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 mt-3">
              <CardTitle className="text-sm font-medium text-gray-600">Team Size</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{projectData.teamCount}</div>
              <p className="text-xs text-gray-500 mb-3">Team members</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 mt-3">
        <CardTitle className="text-sm font-medium text-gray-600">Total Workload</CardTitle>
        <TrendingUp className="h-4 w-4 text-cyan-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{totalWorkload} jam</div>
        <p className="mb-3 text-xs text-gray-500">Total Project Hours</p>
      </CardContent>
    </Card>

    <Card className="bg-white border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 mt-3">
        <CardTitle className="text-sm font-medium text-gray-600">Category Project</CardTitle>
        <Folder className="h-4 w-4 text-indigo-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{projectData.projectCategory}</div>
        <p className="mb-3 text-xs text-gray-500">Project Type</p>
      </CardContent>
    </Card>
        </div>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex items-start gap-4">
            <div className="flex flex-col">
                <CardTitle className="text-xl font-semibold text-gray-900 mt-3">
                Team Allocation Summary
                </CardTitle>
                <p className="text-sm text-gray-500">
                This summary shows how your team is distributed by role and experience level.
                </p>
            </div>
            </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-3 mt-3">
                {projectData.teamAllocation.map((team) => (
                <div key={team.role} className="space-y-3">
                    <h3 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-2">{team.role}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(["junior", "middle", "senior"] as const).map((level) => {
                        const levelData = team[level];
                        if (levelData.count === 0) return null;

                        return (
                        <div key={level} className="rounded-lg p-4 border border-black-600">
                            <div className="flex items-center justify-between">
                            <Badge className={`text-xs capitalize ${levelColors[level]}`}>
                            {level}
                            </Badge>
                            <span className="text-sm font-medium text-gray-600">{levelData.count} people</span>
                            </div>
                            <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Budget:</span>
                                <span className="font-medium text-black">{formatCurrency(levelData.budget)}</span>
                            </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </div>
                ))}
            </div>
            </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
            <CardHeader className="flex items-start gap-4 mb-3">
            <div className="flex flex-col">
                <CardTitle className="text-xl font-semibold text-gray-900 mt-3">
                Project Timeline & Resource Allocation
                </CardTitle>
                <p className="text-sm text-gray-500">
                This table provides a detailed schedule for each activity, including dates, duration, and assigned roles
                </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-background shadow-sm">
                        <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 text-sm font-bold text-gray-900 text-left">Activity</th>
                        <th className="py-3 px-4 text-sm font-bold text-gray-900 text-left">Start Date</th>
                        <th className="py-3 px-4 text-sm font-bold text-gray-900 text-left">End Date</th>
                        <th className="py-3 px-4 text-sm font-bold text-gray-900 text-left">Duration</th>
                        <th className="py-3 px-4 text-sm font-bold text-gray-900 text-left">Budget</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projectData.activities.map((activity, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">
                            <div className="flex items-center space-x-2">
                                <span>{activity.name}</span>
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <Badge className={`text-xs ${roleColors[activity.role as "SE" | "DE" | "SA"]}`}>
                                        {activity.role}
                                    </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                    <p>{roleFullNames[activity.role as "SE" | "DE" | "SA"]}</p>
                                    </TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                            </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-left">{activity.startDate}</td>
                            <td className="py-3 px-4 text-gray-600 text-left">{activity.endDate}</td>
                            <td className="py-3 px-4 text-gray-600 text-left">{activity.duration}</td>
                            <td className="py-3 px-4 font-medium text-black">{formatCurrency(activity.budget)}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            Previous
          </Button>
          <Button onClick={() => setCurrentStep(4)} className="bg-black">
            Continue to Simulation
          </Button>
        </div>
      </div>
    </div>
  )
}