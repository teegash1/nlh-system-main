"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const currentWeek = [
  { day: 20, isToday: true, hasEvent: true },
  { day: 21, isToday: false, hasEvent: false },
  { day: 22, isToday: false, hasEvent: true },
  { day: 23, isToday: false, hasEvent: false },
  { day: 24, isToday: false, hasEvent: false },
  { day: 25, isToday: false, hasEvent: true },
  { day: 26, isToday: false, hasEvent: false },
]

const upcomingTasks = [
  {
    id: "1",
    title: "Weekly Stock Count",
    type: "Inventory",
    time: "9:30 AM",
    color: "bg-chart-1",
  },
  {
    id: "2",
    title: "Order Supplies",
    type: "Procurement",
    time: "11:00 AM",
    color: "bg-chart-3",
  },
  {
    id: "3",
    title: "Generate Report",
    type: "Admin",
    time: "2:00 PM",
    color: "bg-chart-2",
  },
]

interface WeekDay {
  day: number
  isToday: boolean
  hasEvent: boolean
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
  weekDays?: WeekDay[]
  upcomingTasks?: UpcomingTask[]
}

export function CalendarWidget({
  todayLabel = "Today, 20 January",
  weekDays = currentWeek,
  upcomingTasks: taskItems = upcomingTasks,
}: CalendarWidgetProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            {todayLabel}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
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
                {weekDays[index]?.day}
              </div>
              {weekDays[index]?.hasEvent && (
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-chart-1" />
                  <div className="w-1 h-1 rounded-full bg-chart-2" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Upcoming Tasks */}
        <div className="space-y-2">
          {taskItems.map((task) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
