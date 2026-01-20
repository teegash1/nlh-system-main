"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { addWeeks, endOfWeek, format, startOfWeek } from "date-fns"

type FilterType = "this-week" | "this-month" | "last-3-months" | "ytd" | "custom"

interface DateFilterProps {
  onFilterChange?: (filter: FilterType, dateRange?: { from: Date; to: Date }) => void
}

export function DateFilter({ onFilterChange }: DateFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("this-week")
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const weekStartSunday = { weekStartsOn: 0 as const }
  const weekEndSunday = { weekStartsOn: 1 as const }

  const filters: { id: FilterType; label: string }[] = [
    { id: "custom", label: "Custom Range" },
  ]

  const handleFilterClick = (filterId: FilterType) => {
    setActiveFilter(filterId)
    if (filterId !== "custom") {
      onFilterChange?.(filterId)
    }
  }

  const handleCustomDateSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    let { from, to } = range
    if (from) {
      from = startOfWeek(from, weekStartSunday)
    }
    if (to) {
      to = endOfWeek(to, weekEndSunday)
    }
    if (from && to) {
      const maxEnd = endOfWeek(addWeeks(from, 3), weekEndSunday)
      if (to > maxEnd) {
        to = maxEnd
      }
      const nextRange = { from, to }
      setCustomDateRange(nextRange)
      onFilterChange?.("custom", nextRange)
      return
    }
    setCustomDateRange({ from, to })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        filter.id === "custom" ? (
          <Popover key={filter.id} open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "border-border text-muted-foreground hover:text-foreground hover:bg-accent premium-btn h-9 px-4",
                  activeFilter === "custom" && "bg-accent text-foreground border-accent"
                )}
                onClick={() => setActiveFilter("custom")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDateRange.from && customDateRange.to ? (
                  <>
                    {format(customDateRange.from, "MMM d")} - {format(customDateRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  "Custom Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={customDateRange.from}
                selected={{ from: customDateRange.from, to: customDateRange.to }}
                onSelect={(range) => handleCustomDateSelect({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
                className="bg-card"
              />
              <div className="px-4 pb-4 text-[11px] text-muted-foreground">
                Range snaps to Sunday-Sunday, max 4 Sundays.
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button
            key={filter.id}
            variant="outline"
            className={cn(
              "border-border text-muted-foreground hover:text-foreground hover:bg-accent premium-btn h-9 px-4",
              activeFilter === filter.id && "bg-accent text-foreground border-accent"
            )}
            onClick={() => handleFilterClick(filter.id)}
          >
            {filter.label}
          </Button>
        )
      ))}
    </div>
  )
}
