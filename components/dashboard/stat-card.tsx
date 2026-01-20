"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = "neutral",
  className,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-chart-2" : trend === "down" ? "text-chart-4" : "text-muted-foreground"

  return (
    <Card className={cn("bg-card border-border hover:border-accent transition-colors duration-200", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </span>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {value}
            </span>
            {(change !== undefined || changeLabel) && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className={cn("flex items-center gap-0.5", trendColor)}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {change !== undefined && (
                    <span className="text-xs font-medium">
                      {change > 0 ? "+" : ""}{change}%
                    </span>
                  )}
                </div>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary border border-border">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
