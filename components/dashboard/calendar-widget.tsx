"use client"

import { useMemo, useState } from "react"
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameWeek,
  isWithinInterval,
  isValid,
  parseISO,
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

interface CalendarReminder {
  id: string
  title: string
  start_at: string
  recurrence: string | null
  color: string | null
}

interface UpcomingTask {
  id: string
  title: string
  type: string
  time: string
  color: string
  date: string
}

interface CalendarWidgetProps {
  todayLabel?: string
  events?: CalendarEvent[]
  upcomingTasks?: UpcomingTask[]
  initialWeekStart?: Date
  reminders?: CalendarReminder[]
}

export function CalendarWidget({
  todayLabel = "Today",
  events = [],
  upcomingTasks: taskItems = [],
  initialWeekStart,
  reminders = [],
}: CalendarWidgetProps) {
  const [weekStart, setWeekStart] = useState<Date>(
    initialWeekStart ?? startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  const buildOccurrences = (
    startAt: Date,
    recurrence: string,
    rangeStart: Date,
    rangeEnd: Date
  ) => {
    if (recurrence === "none") {
      return isWithinInterval(startAt, { start: rangeStart, end: rangeEnd })
        ? [startAt]
        : []
    }

    const occurrences: Date[] = []
    if (recurrence === "weekly" || recurrence === "biweekly") {
      const interval = recurrence === "weekly" ? 1 : 2
      let occurrence = startAt
      if (isBefore(occurrence, rangeStart)) {
        const diffWeeks = differenceInCalendarWeeks(rangeStart, occurrence, {
          weekStartsOn: 1,
        })
        const steps = Math.floor(diffWeeks / interval) * interval
        occurrence = addWeeks(occurrence, steps)
        while (isBefore(occurrence, rangeStart)) {
          occurrence = addWeeks(occurrence, interval)
        }
      }
      while (!isAfter(occurrence, rangeEnd)) {
        occurrences.push(occurrence)
        occurrence = addWeeks(occurrence, interval)
      }
      return occurrences
    }

    if (recurrence === "monthly" || recurrence === "quarterly") {
      const interval = recurrence === "monthly" ? 1 : 3
      let occurrence = startAt
      if (isBefore(occurrence, rangeStart)) {
        const diffMonths = differenceInCalendarMonths(rangeStart, occurrence)
        const steps = Math.floor(diffMonths / interval) * interval
        occurrence = addMonths(occurrence, steps)
        while (isBefore(occurrence, rangeStart)) {
          occurrence = addMonths(occurrence, interval)
        }
      }
      while (!isAfter(occurrence, rangeEnd)) {
        occurrences.push(occurrence)
        occurrence = addMonths(occurrence, interval)
      }
      return occurrences
    }

    return []
  }

  const mergedEvents = useMemo(
    () => {
      const rangeStart = startOfWeek(weekStart, { weekStartsOn: 1 })
      const rangeEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      const colorMap: Record<string, string> = {
        "chart-1": "bg-chart-1",
        "chart-2": "bg-chart-2",
        "chart-3": "bg-chart-3",
        "chart-4": "bg-chart-4",
        "chart-5": "bg-chart-5",
      }

      const reminderEvents = reminders.flatMap((reminder) => {
        const startAt = new Date(reminder.start_at)
        if (Number.isNaN(startAt.getTime())) return []
        const recurrence = String(reminder.recurrence ?? "none")
        return buildOccurrences(startAt, recurrence, rangeStart, rangeEnd).map(
          (date) => ({
            date: date.toISOString(),
            colorClass:
              colorMap[String(reminder.color ?? "chart-1")] ?? "bg-chart-1",
          })
        )
      })

      return [...events, ...reminderEvents]
    },
    [events, reminders, weekStart]
  )
  const mergedTasks = useMemo(() => {
    const rangeStart = startOfWeek(weekStart, { weekStartsOn: 1 })
    const rangeEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    const colorMap: Record<string, string> = {
      "chart-1": "bg-chart-1",
      "chart-2": "bg-chart-2",
      "chart-3": "bg-chart-3",
      "chart-4": "bg-chart-4",
      "chart-5": "bg-chart-5",
    }
    const recurrenceLabels: Record<string, string> = {
      none: "Reminder",
      weekly: "Weekly reminder",
      biweekly: "Bi-weekly reminder",
      monthly: "Monthly reminder",
      quarterly: "Quarterly reminder",
    }
    const merged = new Map<string, UpcomingTask>()
    taskItems.forEach((item) => merged.set(item.id, item))
    reminders
      .flatMap((reminder) => {
        const startAt = new Date(reminder.start_at)
        if (Number.isNaN(startAt.getTime())) return []
        const recurrence = String(reminder.recurrence ?? "none")
        return buildOccurrences(startAt, recurrence, rangeStart, rangeEnd).map(
          (date) => ({
            id: `reminder-${reminder.id}-${date.toISOString()}`,
            title: reminder.title,
            type: recurrenceLabels[recurrence] ?? "Reminder",
            time: format(date, "EEE • h:mm a"),
            color:
              colorMap[String(reminder.color ?? "chart-1")] ?? "bg-chart-1",
            date: date.toISOString(),
          })
        )
      })
      .forEach((item) => merged.set(item.id, item))
    return Array.from(merged.values())
  }, [taskItems, reminders, weekStart])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, string[]>()
    mergedEvents.forEach((event) => {
      const parsed = parseISO(event.date)
      if (!isValid(parsed)) return
      const key = format(parsed, "yyyy-MM-dd")
      const existing = map.get(key) ?? []
      if (!existing.includes(event.colorClass)) {
        existing.push(event.colorClass)
      }
      map.set(key, existing)
    })
    return map
  }, [mergedEvents])

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

  const visibleTasks = useMemo(() => {
    const start = startOfWeek(weekStart, { weekStartsOn: 1 })
    const end = endOfWeek(weekStart, { weekStartsOn: 1 })

    return mergedTasks
      .map((task) => ({
        ...task,
        parsedDate: new Date(task.date),
      }))
      .filter((task) => {
        if (Number.isNaN(task.parsedDate.getTime())) return false
        return isWithinInterval(task.parsedDate, { start, end })
      })
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
  }, [mergedTasks, weekStart])

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
          {visibleTasks.length === 0 ? (
            <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
              No reminders scheduled for this week.
            </div>
          ) : (
            visibleTasks.map((task) => (
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
