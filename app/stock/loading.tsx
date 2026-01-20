import { AppShell } from "@/components/layout/app-shell"

export default function Loading() {
  return (
    <AppShell title="Stock Taking" subtitle="Live inventory from Supabase">
      <div className="p-4 md:p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-56 rounded-md bg-secondary/50 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-secondary/40 animate-pulse" />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="h-9 w-full md:w-80 rounded-md bg-secondary/40 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-md bg-secondary/40 animate-pulse" />
            <div className="h-9 w-28 rounded-md bg-secondary/40 animate-pulse" />
          </div>
        </div>

        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="border-b border-border p-4 grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-4 rounded bg-secondary/40 animate-pulse"
              />
            ))}
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="grid grid-cols-6 gap-4">
                <div className="h-4 rounded bg-secondary/40 animate-pulse col-span-2" />
                <div className="h-4 rounded bg-secondary/40 animate-pulse" />
                <div className="h-4 rounded bg-secondary/40 animate-pulse" />
                <div className="h-4 rounded bg-secondary/40 animate-pulse" />
                <div className="h-7 rounded bg-secondary/40 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
