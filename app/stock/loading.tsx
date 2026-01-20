export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Title block */}
      <div className="space-y-2">
        <div className="h-7 w-44 rounded-md bg-gray-200 animate-pulse" />
        <div className="h-4 w-96 rounded-md bg-gray-200 animate-pulse" />
        <div className="h-4 w-56 rounded-md bg-gray-200 animate-pulse" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="h-9 w-full md:w-80 rounded-md bg-gray-200 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-32 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-9 w-32 rounded-md bg-gray-200 animate-pulse" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 grid grid-cols-12 gap-4">
          <div className="h-4 rounded bg-gray-200 animate-pulse col-span-4" />
          <div className="h-4 rounded bg-gray-200 animate-pulse col-span-3" />
          <div className="h-4 rounded bg-gray-200 animate-pulse col-span-3" />
          <div className="h-4 rounded bg-gray-200 animate-pulse col-span-2" />
        </div>

        {/* Rows */}
        <div className="p-4 space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
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
  )
}
