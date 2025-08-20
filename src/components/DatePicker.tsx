import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'

interface DatePickerProps {
  value: string | undefined
  onDateChange: (date: string) => void
  className?: string
  disableWeekends?: boolean
}

export function DatePicker({ value, onDateChange, className, disableWeekends }: DatePickerProps) {
  const dateValue = value ? new Date(`${value}T00:00:00`) : undefined
  const [open, setOpen] = useState(false)

  const disabledDays = disableWeekends ? { dayOfWeek: [0, 6] } : undefined

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateChange(format(selectedDate, 'yyyy-MM-dd'))
      setOpen(false)
    } else {
      onDateChange('')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'mt-1 w-full justify-start text-left font-normal',
            !dateValue && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, 'PPP') : 'Select date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar mode="single" selected={dateValue} onSelect={handleSelect} disabled={disabledDays} />
      </PopoverContent>
    </Popover>
  )
}
