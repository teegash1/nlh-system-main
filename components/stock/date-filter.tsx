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
import { format } from "date-fns"

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

  const filters: { id: FilterType; label: string }[] = [
    { id: "this-week", label: "This Week" },
    { id: "this-month", label: "This Month" },
    { id: "last-3-months", label: "Last 3 Months" },
    { id: "ytd", label: "Year to Date" },
    { id: "custom", label: "Custom Range" },
  ]

  const handleFilterClick = (filterId: FilterType) => {
    setActiveFilter(filterId)
    if (filterId !== "custom") {
      onFilterChange?.(filterId)
    }
  }

  const handleCustomDateSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setCustomDateRange(range)
    if (range.from && range.to) {
      onFilterChange?.("custom", { from: range.from, to: range.to })
    }
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
