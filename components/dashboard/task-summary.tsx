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

export function TaskSummary() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">Task Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task.label}
              className="flex flex-col items-center p-3 rounded-xl bg-secondary/50 border border-border"
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl mb-2",
                task.color + "/20"
              )}>
                <task.icon className={cn("h-5 w-5", task.textColor)} />
              </div>
              <span className="text-2xl font-bold text-foreground">{task.value}</span>
              <span className="text-xs text-muted-foreground">{task.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Completion Rate</span>
            <span className="text-sm font-semibold text-foreground">93%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full w-[93%] rounded-full bg-gradient-to-r from-chart-2 to-chart-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
