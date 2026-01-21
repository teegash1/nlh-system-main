"use client"

import { useEffect, useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const pad = (value: number) => String(value).padStart(2, "0")

const toUtcDateKey = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}`

const startOfWeekUtc = (date: Date, weekStartsOn = 1) => {
  const day = date.getUTCDay()
  const diff = (day - weekStartsOn + 7) % 7
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - diff
    )
  )
}

const addDaysUtc = (date: Date, daysToAdd: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + daysToAdd,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  )

const addWeeksUtc = (date: Date, weeksToAdd: number) =>
  addDaysUtc(date, weeksToAdd * 7)

const addMonthsUtc = (date: Date, monthsToAdd: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + monthsToAdd,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  )

const differenceInCalendarMonthsUtc = (left: Date, right: Date) =>
  left.getUTCFullYear() * 12 +
  left.getUTCMonth() -
  (right.getUTCFullYear() * 12 + right.getUTCMonth())

const differenceInCalendarWeeksUtc = (
  left: Date,
  right: Date,
  weekStartsOn = 1
) => {
  const leftStart = startOfWeekUtc(left, weekStartsOn).getTime()
  const rightStart = startOfWeekUtc(right, weekStartsOn).getTime()
  return Math.round((leftStart - rightStart) / (7 * 24 * 60 * 60 * 1000))
}

const isAfterUtc = (left: Date, right: Date) =>
  left.getTime() > right.getTime()

const endOfDayUtc = (date: Date) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  )

const endOfWeekUtc = (date: Date, weekStartsOn = 1) =>
  endOfDayUtc(addDaysUtc(startOfWeekUtc(date, weekStartsOn), 6))

const isSameDayUtc = (left: Date, right: Date) =>
  toUtcDateKey(left) === toUtcDateKey(right)

const isSameWeekUtc = (left: Date, right: Date, weekStartsOn = 1) =>
  toUtcDateKey(startOfWeekUtc(left, weekStartsOn)) ===
  toUtcDateKey(startOfWeekUtc(right, weekStartsOn))

const isWithinIntervalUtc = (date: Date, start: Date, end: Date) =>
  date.getTime() >= start.getTime() && date.getTime() <= end.getTime()

const formatUtcDate = (date: Date, options: Intl.DateTimeFormatOptions) =>
  date.toLocaleDateString("en-US", { timeZone: "UTC", ...options })

const formatUtcTime = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  })

const normalizeTimestamp = (value: string) => {
  const raw = (value ?? "").trim()
  if (!raw) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return `${raw}T00:00:00Z`
  }

  let normalized = raw.replace(" ", "T")

  if (/([+-]\d{2})$/.test(normalized)) {
    normalized = normalized.replace(/([+-]\d{2})$/, "$1:00")
  }

  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) {
    normalized = `${normalized}Z`
  }

  return normalized
}

const parseTimestampUtc = (value: string) => {
  const normalized = normalizeTimestamp(value)
  if (!normalized) return new Date(NaN)
  return new Date(normalized)
}

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
    startOfWeekUtc(initialWeekStart ?? new Date(), 1)
  )
  const [liveReminders, setLiveReminders] = useState<CalendarReminder[]>(reminders)

  useEffect(() => {
    setLiveReminders(reminders)
  }, [reminders])

  useEffect(() => {
    let isActive = true
    if (reminders.length > 0) return undefined

    const loadReminders = async () => {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data } = await supabase
        .from("reminders")
        .select("id, title, start_at, recurrence, color")
        .order("start_at", { ascending: true })

      if (!isActive || !data) return
      setLiveReminders(data as CalendarReminder[])
    }

    loadReminders()

    return () => {
      isActive = false
    }
  }, [reminders.length])

  const buildOccurrences = (
    startAt: Date,
    recurrence: string,
    rangeStart: Date,
    rangeEnd: Date
  ) => {
    if (recurrence === "none") {
      return isWithinIntervalUtc(startAt, rangeStart, rangeEnd)
        ? [startAt]
        : []
    }

    const occurrences: Date[] = []
    if (recurrence === "weekly" || recurrence === "biweekly") {
      const interval = recurrence === "weekly" ? 1 : 2
      let occurrence = startAt
      if (occurrence < rangeStart) {
        const diffWeeks = differenceInCalendarWeeksUtc(
          rangeStart,
          occurrence,
          1
        )
        const steps = Math.floor(diffWeeks / interval) * interval
        occurrence = addWeeksUtc(occurrence, steps)
        while (occurrence < rangeStart) {
          occurrence = addWeeksUtc(occurrence, interval)
        }
      }
      while (!isAfterUtc(occurrence, rangeEnd)) {
        occurrences.push(occurrence)
        occurrence = addWeeksUtc(occurrence, interval)
      }
      return occurrences
    }

    if (recurrence === "monthly" || recurrence === "quarterly") {
      const interval = recurrence === "monthly" ? 1 : 3
      let occurrence = startAt
      if (occurrence < rangeStart) {
        const diffMonths = differenceInCalendarMonthsUtc(rangeStart, occurrence)
        const steps = Math.floor(diffMonths / interval) * interval
        occurrence = addMonthsUtc(occurrence, steps)
        while (occurrence < rangeStart) {
          occurrence = addMonthsUtc(occurrence, interval)
        }
      }
      while (!isAfterUtc(occurrence, rangeEnd)) {
        occurrences.push(occurrence)
        occurrence = addMonthsUtc(occurrence, interval)
      }
      return occurrences
    }

    return []
  }

  const reminderData = useMemo(() => {
    if (!liveReminders.length) {
      return { reminderEvents: [], reminderTasks: [] as UpcomingTask[] }
    }

    const rangeStart = startOfWeekUtc(weekStart, 1)
    const rangeEnd = endOfWeekUtc(weekStart, 1)
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

    const occurrences = liveReminders.flatMap((reminder) => {
      const startAt = parseTimestampUtc(reminder.start_at)
      if (Number.isNaN(startAt.getTime())) return []
      const recurrence = String(reminder.recurrence ?? "none")
      return buildOccurrences(startAt, recurrence, rangeStart, rangeEnd).map(
        (date) => ({
          reminder,
          date,
        })
      )
    })

    return {
      reminderEvents: occurrences.map((entry) => ({
        date: entry.date.toISOString(),
        colorClass:
          colorMap[String(entry.reminder.color ?? "chart-1")] ?? "bg-chart-1",
      })),
      reminderTasks: occurrences.map((entry) => {
        const recurrenceKey = String(entry.reminder.recurrence ?? "none")
        return {
          id: `reminder-${entry.reminder.id}-${entry.date.toISOString()}`,
          title: entry.reminder.title,
          type: recurrenceLabels[recurrenceKey] ?? "Reminder",
          time: `${formatUtcDate(entry.date, {
            weekday: "short",
          })} • ${formatUtcTime(entry.date)}`,
          color:
            colorMap[String(entry.reminder.color ?? "chart-1")] ?? "bg-chart-1",
          date: entry.date.toISOString(),
        }
      }),
    }
  }, [liveReminders, weekStart])

  const mergedEvents = useMemo(
    () => [...events, ...reminderData.reminderEvents],
    [events, reminderData.reminderEvents]
  )

  const mergedTasks = useMemo(() => {
    const merged = new Map<string, UpcomingTask>()
    taskItems.forEach((item) => merged.set(item.id, item))
    reminderData.reminderTasks.forEach((item) => merged.set(item.id, item))
    return Array.from(merged.values())
  }, [taskItems, reminderData.reminderTasks])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, string[]>()
    mergedEvents.forEach((event) => {
      const parsed = parseTimestampUtc(event.date)
      if (Number.isNaN(parsed.getTime())) return
      const key = toUtcDateKey(parsed)
      const existing = map.get(key) ?? []
      if (!existing.includes(event.colorClass)) {
        existing.push(event.colorClass)
      }
      map.set(key, existing)
    })
    return map
  }, [mergedEvents])

  const weekDays = useMemo(() => {
    const start = startOfWeekUtc(weekStart, 1)
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDaysUtc(start, index)
      const key = toUtcDateKey(date)
      return {
        label: formatUtcDate(date, { day: "numeric" }),
        isToday: isSameDayUtc(date, new Date()),
        colors: eventsByDate.get(key) ?? [],
      }
    })
  }, [weekStart, eventsByDate])

  const visibleTasks = useMemo(() => {
    const start = startOfWeekUtc(weekStart, 1)
    const end = endOfWeekUtc(weekStart, 1)

    return mergedTasks
      .map((task) => ({
        ...task,
        parsedDate: parseTimestampUtc(task.date),
      }))
      .filter((task) => {
        if (Number.isNaN(task.parsedDate.getTime())) return false
        return isWithinIntervalUtc(task.parsedDate, start, end)
      })
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
  }, [mergedTasks, weekStart])

  const headerLabel = isSameWeekUtc(weekStart, new Date(), 1)
    ? todayLabel
    : `Week of ${formatUtcDate(weekStart, { month: "short", day: "numeric" })}`

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
              onClick={() => setWeekStart((prev) => addWeeksUtc(prev, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setWeekStart((prev) => addWeeksUtc(prev, 1))}
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
