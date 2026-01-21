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
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider sm:text-xs">
              {title}
            </span>
            <span className="text-lg font-bold text-foreground tracking-tight sm:text-2xl break-words">
              {value}
            </span>
            {(change !== undefined || changeLabel) && (
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <div className={cn("flex items-center gap-0.5", trendColor)}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {change !== undefined && (
                    <span className="text-[10px] font-medium sm:text-xs">
                      {change > 0 ? "+" : ""}{change}%
                    </span>
                  )}
                </div>
                {changeLabel && (
                  <span className="text-[10px] text-muted-foreground sm:text-xs">
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
