"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

interface DateRangePickerProps {
  dateRange: { from: Date | undefined; to: Date | undefined }
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void
  placeholder?: string
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "Select start and end dates",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined
    onDateRangeChange({ from: date, to: dateRange.to })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined
    onDateRangeChange({ from: dateRange.from, to: date })
  }

  const resetSelection = () => {
    onDateRangeChange({ from: undefined, to: undefined })
  }

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ""
    return date.toISOString().split("T")[0]
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-auto justify-start text-left font-normal h-10 bg-white">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
              </>
            ) : (
              format(dateRange.from, "dd/MM/yyyy")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="text-sm font-medium">Select Date Range</div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Start Date</label>
              <Input
                type="date"
                value={formatDateForInput(dateRange.from)}
                onChange={handleStartDateChange}
                className="w-full"
                min="2020-01-01"
                max="2030-12-31"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">End Date</label>
              <Input
                type="date"
                value={formatDateForInput(dateRange.to)}
                onChange={handleEndDateChange}
                className="w-full"
                min="2020-01-01"
                max="2030-12-31"
              />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={resetSelection}>
              Clear
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
