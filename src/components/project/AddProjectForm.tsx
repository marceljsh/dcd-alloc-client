"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  TEAM_OPTIONS,
  Team,
  PROJECT_CATEGORY_OPTIONS,
  ProjectCategory,
  PROJECT_PRIORITY_OPTIONS,
  ProjectPriority,
} from "@/types/common"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/DatePicker"
import { Separator } from "@/components/ui/separator"
import { DnDPills } from "../DnDPills"
import { useState } from "react"
import { useRouter } from "next/navigation"

const schema = z
  .object({
    name: z.string().min(1, 'Project name is required'),
    team: z.enum(TEAM_OPTIONS, 'Team is required'),
    category: z.enum(PROJECT_CATEGORY_OPTIONS, 'Category is required'),
    priority: z.enum(PROJECT_PRIORITY_OPTIONS, 'Priority is required'),
    budget: z.number().min(1, 'Budget is required'),
    startDate: z.string()
              .min(1, 'Start date is required')
              .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
    endDate: z.string()
              .min(1, 'End date is required')
              .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
    stages: z.array(z.string()),
  })
  .refine(
    (data) => Date.parse(data.endDate) > Date.parse(data.startDate),
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )

export type AddProjectFormValues = z.infer<typeof schema>

interface AddProjectFormProps {
  onCancel: () => void
}

export function AddProjectForm({ onCancel }: AddProjectFormProps) {
  const [inputStage, setInputStage] = useState<string>('')
  const form = useForm<AddProjectFormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      team: undefined,
      category: undefined,
      priority: undefined,
      budget: 0,
      startDate: '',
      endDate: '',
      stages: [],
    } as any,
  })

  const router = useRouter()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          const draftId = Math.floor(Date.now() / 1000)
          sessionStorage.setItem(`project-${draftId}`, JSON.stringify(data))
          router.push(`/dashboard/projects/new?ts=${draftId}`)
          form.reset()
        })}
        className="grid gap-4 py-4"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel>Name</FormLabel>
              <div className="col-span-3">
                <FormControl>
                  <Input {...field} onChange={(e) => field.onChange(e)} />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Team */}
        <FormField
          control={form.control}
          name="team"
          render={({ field, fieldState }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel>Team</FormLabel>
              <div className="col-span-3">
                <Select
                  onValueChange={(val) => field.onChange(val as Team)}
                  value={field.value}
                >
                  <SelectTrigger className={`col-span-3 ${fieldState.error ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_OPTIONS.map((team) => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field, fieldState }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel>Category</FormLabel>
              <div className="col-span-3">
                <Select
                  onValueChange={(val) => field.onChange(val as ProjectCategory)}
                  value={field.value}
                >
                  <SelectTrigger className={`col-span-3 ${fieldState.error ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field, fieldState }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel>Priority</FormLabel>
              <div className="col-span-3">
                <Select
                  onValueChange={(val) => field.onChange(val as ProjectPriority)}
                  value={field.value}
                >
                  <SelectTrigger className={`col-span-3 ${fieldState.error ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_PRIORITY_OPTIONS.map((priority) => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Budget */}
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel>Budget</FormLabel>
              <div className="col-span-3">
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-4 items-center gap-4">
          {/* Start Date */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-2">
                <FormLabel>Start Date</FormLabel>
                <div>
                  <DatePicker
                    value={field.value}
                    onDateChange={(date) => field.onChange(date)}
                    className={fieldState.error ? "border-red-500" : ""}
                  />
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-2">
                <FormLabel>End Date</FormLabel>
                <div>
                  <DatePicker
                    value={field.value}
                    onDateChange={(date) => field.onChange(date)}
                    className={fieldState.error ? "border-red-500" : ""}
                  />
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Stages */}
        <FormField
          control={form.control}
          name="stages"
          render={({ field }) => (
            <div className="space-y-2">
              <FormLabel>Project Stages (Optional)</FormLabel>
              <div className="space-y-3 p-3 border rounded-md">
                <div className="flex gap-2">
                  <Input
                    value={inputStage}
                    onChange={(e) => setInputStage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (inputStage.trim()) {
                          field.onChange([...(field.value ?? []), inputStage.trim()])
                          setInputStage("")
                        }
                      }
                    }}
                    placeholder="Enter stage name (e.g., Planning, Development, Testing)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const newStage = inputStage.trim()
                      if (newStage && !field.value.includes(newStage)) {
                        field.onChange([...field.value, newStage], setInputStage(''))
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>

                {/* DnD Pills */}
                {field.value.length > 0 && (
                  <DnDPills
                    pills={field.value}
                    onChange={(newOrder) => field.onChange(newOrder)}
                  />
                )}
              </div>
            </div>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  )
}
