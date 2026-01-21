"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Plus, RefreshCw, CheckCircle } from "lucide-react"

const tasks = [
  {
    label: "Pending",
    value: 5,
    color: "bg-chart-3",
    textColor: "text-chart-3",
    icon: Plus,
  },
  {
    label: "In Progress",
    value: 12,
    color: "bg-chart-1",
    textColor: "text-chart-1",
    icon: RefreshCw,
  },
  {
    label: "Completed",
    value: 28,
    color: "bg-chart-2",
    textColor: "text-chart-2",
    icon: CheckCircle,
  },
]

interface TaskSummaryProps {
  pending?: number
  inProgress?: number
  completed?: number
  completionRate?: number
}

export function TaskSummary({
  pending,
  inProgress,
  completed,
  completionRate,
}: TaskSummaryProps) {
  const displayTasks = [
    {
      label: "Pending",
      value: pending ?? tasks[0].value,
      color: tasks[0].color,
      textColor: tasks[0].textColor,
      icon: tasks[0].icon,
    },
    {
      label: "In Progress",
      value: inProgress ?? tasks[1].value,
      color: tasks[1].color,
      textColor: tasks[1].textColor,
      icon: tasks[1].icon,
    },
    {
      label: "Completed",
      value: completed ?? tasks[2].value,
      color: tasks[2].color,
      textColor: tasks[2].textColor,
      icon: tasks[2].icon,
    },
  ]
  const displayRate =
    completionRate ??
    (displayTasks[2].value + displayTasks[0].value + displayTasks[1].value > 0
      ? Math.round(
          (displayTasks[2].value /
            (displayTasks[2].value + displayTasks[0].value + displayTasks[1].value)) *
            100
        )
      : 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground sm:text-base">
          Task Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {displayTasks.map((task) => (
            <div
              key={task.label}
              className="flex flex-col items-center rounded-xl border border-border bg-secondary/50 p-2.5 sm:p-3"
            >
              <div className={cn(
                "mb-2 flex h-8 w-8 items-center justify-center rounded-xl sm:h-10 sm:w-10",
                task.color + "/20"
              )}>
                <task.icon className={cn("h-5 w-5", task.textColor)} />
              </div>
              <span className="text-lg font-bold text-foreground sm:text-2xl">
                {task.value}
              </span>
              <span className="text-[10px] text-muted-foreground sm:text-xs">
                {task.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground sm:text-sm">Completion Rate</span>
            <span className="text-sm font-semibold text-foreground">{displayRate}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-chart-2 to-chart-1"
              style={{ width: `${displayRate}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
