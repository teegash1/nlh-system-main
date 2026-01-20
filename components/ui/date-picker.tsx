"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, isValid, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  id?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  displayFormat?: string
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled,
  displayFormat = "MMM d, yyyy",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = React.useMemo(() => {
    if (!value) return undefined
    const parsed = parseISO(value)
    return isValid(parsed) ? parsed : undefined
  }, [value])

  const label = selected ? format(selected, displayFormat) : placeholder

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      onChange?.("")
      return
    }
    onChange?.(format(date, "yyyy-MM-dd"))
    setOpen(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled) return
    setOpen(nextOpen)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between border-border bg-secondary/40 text-foreground hover:bg-accent premium-btn",
            className
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className={cn(!selected && "text-muted-foreground")}>
              {label}
            </span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-card border-border"
        align="start"
      >
        <Calendar
          initialFocus
          mode="single"
          numberOfMonths={1}
          defaultMonth={selected}
          selected={selected}
          onSelect={handleSelect}
          className="bg-card"
        />
      </PopoverContent>
    </Popover>
  )
}
