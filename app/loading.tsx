export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border border-border/60 bg-gradient-to-br from-chart-1/20 via-transparent to-chart-2/20" />
          <div className="absolute inset-2 rounded-full border border-border/40 bg-secondary/40 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-chart-1 border-r-chart-2 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            Nobles Lighthouse
          </p>
          <p className="text-xs text-muted-foreground">
            Loading your workspace...
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full bg-chart-1 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-chart-2 animate-bounce"
            style={{ animationDelay: "120ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-chart-3 animate-bounce"
            style={{ animationDelay: "240ms" }}
          />
        </div>
      </div>
    </div>
  )
}
