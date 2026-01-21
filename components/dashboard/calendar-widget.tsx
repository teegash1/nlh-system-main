"use client"

import { useMemo, useState } from "react"
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  isSameWeek,
  startOfWeek,
  subWeeks,
} from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

interface CalendarEvent {
  date: string
  colorClass: string
}

interface UpcomingTask {
  id: string
  title: string
  type: string
  time: string
  color: string
}

interface CalendarWidgetProps {
  todayLabel?: string
  events?: CalendarEvent[]
  upcomingTasks?: UpcomingTask[]
  initialWeekStart?: Date
}

export function CalendarWidget({
  todayLabel = "Today",
  events = [],
  upcomingTasks: taskItems = [],
  initialWeekStart,
}: CalendarWidgetProps) {
  const [weekStart, setWeekStart] = useState<Date>(
    initialWeekStart ?? startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  const eventsByDate = useMemo(() => {
    const map = new Map<string, string[]>()
    events.forEach((event) => {
      const key = event.date
      const existing = map.get(key) ?? []
      if (!existing.includes(event.colorClass)) {
        existing.push(event.colorClass)
      }
      map.set(key, existing)
    })
    return map
  }, [events])

  const weekDays = useMemo(() => {
    const start = startOfWeek(weekStart, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index)
      const key = format(date, "yyyy-MM-dd")
      return {
        label: format(date, "d"),
        isToday: isSameDay(date, new Date()),
        colors: eventsByDate.get(key) ?? [],
      }
    })
  }, [weekStart, eventsByDate])

  const headerLabel = isSameWeek(weekStart, new Date(), { weekStartsOn: 1 })
    ? todayLabel
    : `Week of ${format(weekStart, "MMM d")}`

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            {headerLabel}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setWeekStart((prev) => subWeeks(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setWeekStart((prev) => addWeeks(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Week View */}
        <div className="mb-4 grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{day}</span>
              <div
                className={cn(
                  "flex flex-col items-center justify-center h-8 w-8 rounded-lg text-xs font-medium transition-colors sm:h-9 sm:w-9 sm:text-sm",
                  weekDays[index]?.isToday
                    ? "bg-foreground text-background"
                    : "text-foreground hover:bg-accent cursor-pointer"
                )}
              >
                {weekDays[index]?.label}
              </div>
              {weekDays[index]?.colors.length ? (
                <div className="flex gap-0.5">
                  {weekDays[index]?.colors.slice(0, 3).map((color) => (
                    <div
                      key={color}
                      className={cn("w-1 h-1 rounded-full", color)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Upcoming Tasks */}
        <div className="space-y-2">
          {taskItems.length === 0 ? (
            <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
              No reminders scheduled yet.
            </div>
          ) : (
            taskItems.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border p-2.5 sm:p-3",
                task.color + "/10"
              )}
            >
              <div className={cn("w-1 h-10 rounded-full", task.color)} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground sm:text-sm">{task.title}</p>
                <p className="text-[11px] text-muted-foreground sm:text-xs">{task.type}</p>
              </div>
              <span className="text-[11px] text-muted-foreground sm:text-xs">{task.time}</span>
            </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
