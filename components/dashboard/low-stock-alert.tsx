"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface LowStockItem {
  id: string
  name: string
  current: number
  threshold: number
  unit: string
  category: string
}

const lowStockItems: LowStockItem[] = [
  {
    id: "1",
    name: "Coffee Sachets",
    current: 23,
    threshold: 50,
    unit: "sachets",
    category: "Beverages",
  },
  {
    id: "2",
    name: "Milo",
    current: 2,
    threshold: 10,
    unit: "sachets",
    category: "Beverages",
  },
  {
    id: "3",
    name: "Tissue Rolls",
    current: 10,
    threshold: 25,
    unit: "pcs",
    category: "Detergents",
  },
  {
    id: "4",
    name: "Handsoap",
    current: 1,
    threshold: 5,
    unit: "bottles",
    category: "Detergents",
  },
]

interface LowStockAlertProps {
  items?: LowStockItem[]
  viewLink?: string
}

export function LowStockAlert({ items, viewLink = "/stock" }: LowStockAlertProps) {
  const displayItems = items ?? lowStockItems

  return (
    <Card className="bg-card border-border border-l-4 border-l-chart-3">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-3/20">
            <AlertTriangle className="h-4 w-4 text-chart-3" />
          </div>
          <CardTitle className="text-sm font-semibold text-foreground sm:text-base">
            Low Stock Alerts
          </CardTitle>
          <span className="ml-auto rounded-full bg-chart-3/20 px-2 py-0.5 text-[10px] font-medium text-chart-3 sm:text-xs">
            {displayItems.length} items
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {displayItems.length === 0 ? (
            <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
              No low stock items right now.
            </div>
          ) : (
            displayItems.map((item) => {
            const percentage = Math.round((item.current / item.threshold) * 100)
            const isUrgent = percentage < 30
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-2.5 sm:p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-foreground truncate sm:text-sm">
                      {item.name}
                    </p>
                    {isUrgent && (
                      <span className="rounded bg-chart-4/20 px-1.5 py-0.5 text-[10px] font-medium text-chart-4">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    {item.current} / {item.threshold} {item.unit}
                  </p>
                </div>
                <div className="w-20">
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isUrgent ? "bg-chart-4" : "bg-chart-3"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })
          )}
        </div>
        <Button
          asChild
          variant="outline"
          className="mt-4 w-full border-border text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent premium-btn bg-transparent sm:text-xs"
        >
          <Link href={viewLink}>View All Inventory</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
