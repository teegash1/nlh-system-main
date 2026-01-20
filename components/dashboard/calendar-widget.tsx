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

export function CalendarWidget() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Today, 20 January
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
        <div className="grid grid-cols-7 gap-1 mb-4">
          {days.map((day, index) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{day}</span>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                  currentWeek[index].isToday
                    ? "bg-foreground text-background"
                    : "text-foreground hover:bg-accent cursor-pointer"
                )}
              >
                {currentWeek[index].day}
              </div>
              {currentWeek[index].hasEvent && (
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
          {upcomingTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border border-border",
                task.color + "/10"
              )}
            >
              <div className={cn("w-1 h-10 rounded-full", task.color)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.type}</p>
              </div>
              <span className="text-xs text-muted-foreground">{task.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
