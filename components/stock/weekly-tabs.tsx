"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { StockTable, type StockItem } from "./stock-table"
import { cn } from "@/lib/utils"

interface WeeklyTabsProps {
  data: StockItem[]
  onEdit?: (item: StockItem) => void
  onDelete?: (item: StockItem) => void
}

const weekTabs = [
  { id: "week-1", label: "Week 1", dateRange: "Jan 1-7" },
  { id: "week-2", label: "Week 2", dateRange: "Jan 8-14" },
  { id: "week-3", label: "Week 3", dateRange: "Jan 15-21" },
  { id: "week-4", label: "Week 4", dateRange: "Jan 22-28" },
]

const weekColumns = ["05/10", "12/10", "19/10", "26/10"]

export function WeeklyTabs({ data, onEdit, onDelete }: WeeklyTabsProps) {
  return (
    <Tabs defaultValue="week-3" className="w-full">
      <div className="border-b border-border mb-4">
        <TabsList className="bg-transparent h-auto p-0 gap-0">
          {weekTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "relative h-12 px-6 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-chart-1 data-[state=active]:bg-transparent",
                "data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground",
                "hover:text-foreground transition-colors"
              )}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">{tab.label}</span>
                <span className="text-[10px] text-muted-foreground">{tab.dateRange}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {weekTabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0">
          <StockTable
            data={data}
            weeks={weekColumns}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
