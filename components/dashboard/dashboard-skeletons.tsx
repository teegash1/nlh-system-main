import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function StockChartSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-secondary animate-pulse" />
            <div className="h-3 w-28 rounded bg-secondary animate-pulse" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-6 w-20 rounded bg-secondary animate-pulse" />
            <div className="h-3 w-16 rounded bg-secondary animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full rounded-xl bg-secondary/40 animate-pulse" />
      </CardContent>
    </Card>
  )
}

export function CategoryChartSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-[160px] w-[160px] rounded-full bg-secondary/40 animate-pulse" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-secondary animate-pulse" />
                <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TaskSummarySkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="h-4 w-28 rounded bg-secondary animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-xl border border-border bg-secondary/50 p-3"
            >
              <div className="h-10 w-10 rounded-xl bg-secondary animate-pulse" />
              <div className="mt-3 h-5 w-8 rounded bg-secondary animate-pulse" />
              <div className="mt-2 h-3 w-14 rounded bg-secondary animate-pulse" />
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-32 rounded bg-secondary animate-pulse" />
          <div className="h-2 rounded-full bg-secondary/60 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CalendarWidgetSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 rounded bg-secondary animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-secondary animate-pulse" />
            <div className="h-8 w-8 rounded bg-secondary animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="h-2 w-6 rounded bg-secondary animate-pulse" />
              <div className="h-8 w-8 rounded bg-secondary/50 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <div className="h-10 w-1 rounded-full bg-secondary animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-secondary animate-pulse" />
                <div className="h-2 w-24 rounded bg-secondary animate-pulse" />
              </div>
              <div className="h-3 w-10 rounded bg-secondary animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function LowStockAlertSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-secondary animate-pulse" />
          <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg border border-border p-3"
          >
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-secondary animate-pulse" />
              <div className="h-2 w-24 rounded bg-secondary animate-pulse" />
            </div>
            <div className="h-1.5 w-20 rounded-full bg-secondary animate-pulse" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ActivityFeedSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="h-4 w-28 rounded bg-secondary animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-secondary animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-secondary animate-pulse" />
              <div className="h-2 w-40 rounded bg-secondary animate-pulse" />
            </div>
            <div className="h-2 w-10 rounded bg-secondary animate-pulse" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ShoppingListSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 rounded bg-secondary animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded bg-secondary animate-pulse" />
            <div className="h-8 w-20 rounded bg-secondary animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border/60 bg-secondary/10 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-secondary animate-pulse" />
              <div className="h-2 w-36 rounded bg-secondary animate-pulse" />
            </div>
            <div className="h-4 w-20 rounded bg-secondary animate-pulse" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 rounded-lg bg-secondary/40 animate-pulse"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
