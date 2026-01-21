"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, FileText, TrendingUp, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  type: "stock_update" | "low_stock" | "report" | "increase" | "completed"
  title: string
  description: string
  time: string
}

const activities: Activity[] = [
  {
    id: "1",
    type: "low_stock",
    title: "Low Stock Alert",
    description: "Coffee sachets below threshold - 23 remaining",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "stock_update",
    title: "Stock Updated",
    description: "Sugar inventory updated to 3.5kg",
    time: "15 min ago",
  },
  {
    id: "3",
    type: "report",
    title: "Weekly Report",
    description: "Stock report generated for Week 3",
    time: "1 hour ago",
  },
  {
    id: "4",
    type: "increase",
    title: "Stock Replenished",
    description: "Tissue rolls restocked - +50 units",
    time: "2 hours ago",
  },
  {
    id: "5",
    type: "completed",
    title: "Stock Count Complete",
    description: "Monthly inventory audit completed",
    time: "Yesterday",
  },
]

const iconMap = {
  stock_update: Package,
  low_stock: AlertTriangle,
  report: FileText,
  increase: TrendingUp,
  completed: CheckCircle2,
}

const colorMap = {
  stock_update: "bg-chart-1/20 text-chart-1",
  low_stock: "bg-chart-3/20 text-chart-3",
  report: "bg-chart-5/20 text-chart-5",
  increase: "bg-chart-2/20 text-chart-2",
  completed: "bg-chart-2/20 text-chart-2",
}

interface ActivityFeedProps {
  activities?: Activity[]
  viewLink?: string
}

export function ActivityFeed({
  activities: activityItems,
  viewLink = "/reports",
}: ActivityFeedProps) {
  const displayActivities = activityItems ?? activities

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground sm:text-base">
            Recent Activity
          </CardTitle>
          <Link
            href={viewLink}
            className="text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-xs"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {displayActivities.length === 0 ? (
            <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
              No activity yet.
            </div>
          ) : (
            displayActivities.map((activity) => {
            const Icon = iconMap[activity.type]
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                  colorMap[activity.type]
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground sm:text-sm">
                    {activity.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            )
          })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
