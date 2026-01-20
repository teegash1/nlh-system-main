import { AppShell } from "@/components/layout/app-shell"

export default function Loading() {
  return (
    <AppShell title="Stock Taking" subtitle="Inventory snapshot and stewardship overview">
      <div className="p-4 md:p-6 space-y-6">
        {/* Hero summary */}
        <div className="rounded-2xl border border-border bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)] p-5 md:p-7">
          <div className="space-y-3">
            <div className="h-4 w-28 rounded-md bg-gray-200 animate-pulse" />
            <div className="h-7 w-56 rounded-md bg-gray-200 animate-pulse" />
            <div className="h-4 w-80 rounded-md bg-gray-200 animate-pulse" />
            <div className="h-4 w-44 rounded-md bg-gray-200 animate-pulse" />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 w-24 rounded-md bg-gray-200 animate-pulse" />
                    <div className="h-5 w-16 rounded-md bg-gray-200 animate-pulse" />
                    <div className="h-3 w-20 rounded-md bg-gray-200 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="h-9 w-full md:w-72 rounded-md bg-gray-200 animate-pulse" />
            <div className="h-9 w-36 rounded-md bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Tables */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded-md bg-gray-200 animate-pulse" />
              <div className="h-3 w-56 rounded-md bg-gray-200 animate-pulse" />
            </div>
            <div className="h-3 w-28 rounded-md bg-gray-200 animate-pulse" />
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <div className="border-b p-4 grid grid-cols-12 gap-4">
              <div className="h-4 rounded bg-gray-200 animate-pulse col-span-4" />
              <div className="h-4 rounded bg-gray-200 animate-pulse col-span-3" />
              <div className="h-4 rounded bg-gray-200 animate-pulse col-span-3" />
              <div className="h-4 rounded bg-gray-200 animate-pulse col-span-2" />
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 items-center">
                  <div className="h-4 rounded bg-gray-200 animate-pulse col-span-4" />
                  <div className="h-4 rounded bg-gray-200 animate-pulse col-span-3" />
                  <div className="h-4 rounded bg-gray-200 animate-pulse col-span-3" />
                  <div className="h-4 rounded bg-gray-200 animate-pulse col-span-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
