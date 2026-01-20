"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateFilter } from "@/components/stock/date-filter"
import { CategoryFilter } from "@/components/stock/category-filter"
import { AddItemDialog } from "@/components/stock/add-item-dialog"
import { ExportButton } from "@/components/stock/export-button"
import { WeeklyTabs } from "@/components/stock/weekly-tabs"
import { StatCard } from "@/components/dashboard/stat-card"
import { Package, TrendingDown, TrendingUp, DollarSign } from "lucide-react"
import type { StockItem } from "@/components/stock/stock-table"

// Sample data based on the provided Excel sheet
const sampleStockData: StockItem[] = [
  // Beverages
  {
    id: "1",
    item: "Sugar",
    category: "Beverages",
    volume: "1.5kg",
    cost: 250,
    weekData: { "05/10": "1.5kg", "12/10": "-", "19/10": "1.5kg", "26/10": "3kg" },
    status: "in-stock",
  },
  {
    id: "2",
    item: "Coffee",
    category: "Beverages",
    volume: "20 sachets",
    cost: 400,
    weekData: { "05/10": "20 sachets", "12/10": "19 sachets", "19/10": "78 sachets", "26/10": "69 sachets" },
    status: "in-stock",
  },
  {
    id: "3",
    item: "Teabags",
    category: "Beverages",
    volume: "25 sachets",
    cost: 180,
    weekData: { "05/10": "25 sachets", "12/10": "25 sachets", "19/10": "50 sachets", "26/10": "45 sachets" },
    status: "in-stock",
  },
  {
    id: "4",
    item: "Milo",
    category: "Beverages",
    volume: "4 sachets",
    cost: 320,
    weekData: { "05/10": "4 sachets", "12/10": "10 sachets", "19/10": "8 sachets", "26/10": "9 sachets" },
    status: "low-stock",
  },
  {
    id: "5",
    item: "Greentea Mint",
    category: "Beverages",
    volume: "1 box",
    cost: 450,
    weekData: { "05/10": "1 box", "12/10": "1 box +6", "19/10": "6 sachets", "26/10": "9 sachets" },
    status: "in-stock",
  },
  {
    id: "6",
    item: "Drinking Chocolate",
    category: "Beverages",
    volume: "250ml",
    cost: 380,
    weekData: { "05/10": "250ml", "12/10": "250ml", "19/10": "0.75ml", "26/10": "0" },
    status: "out-of-stock",
  },
  {
    id: "7",
    item: "Holy Communion Juice",
    category: "Beverages",
    volume: "1.5 litres",
    cost: 650,
    weekData: { "05/10": "1.5 litres", "12/10": "3 litres", "19/10": "2 litres", "26/10": "2 litres" },
    status: "in-stock",
  },
  {
    id: "8",
    item: "Honey",
    category: "Beverages",
    volume: "500ml",
    cost: 850,
    weekData: { "05/10": "500ml", "12/10": "500ml opened", "19/10": "0.75ml", "26/10": "0" },
    status: "low-stock",
  },
  // Detergents & Sanitary
  {
    id: "9",
    item: "Tissue",
    category: "Detergents & Sanitary",
    volume: "10 pcs",
    cost: 450,
    weekData: { "05/10": "10 pcs", "12/10": "10 pcs + 2 used", "19/10": "4 pcs", "26/10": "1 pc" },
    status: "low-stock",
  },
  {
    id: "10",
    item: "Handtowel",
    category: "Detergents & Sanitary",
    volume: "1 pkt",
    cost: 280,
    weekData: { "05/10": "1 pkt", "12/10": "1 pkt", "19/10": "1 pkt + 1 opened", "26/10": "1 pkt + 1 opened" },
    status: "in-stock",
  },
  {
    id: "11",
    item: "Airfreshner",
    category: "Detergents & Sanitary",
    volume: "2 pcs",
    cost: 350,
    weekData: { "05/10": "2", "12/10": "2", "19/10": "2 new + 2 used", "26/10": "2 new + 2 used" },
    status: "in-stock",
  },
  {
    id: "12",
    item: "Handsoap",
    category: "Detergents & Sanitary",
    volume: "1 new",
    cost: 180,
    weekData: { "05/10": "1 new", "12/10": "2 new", "19/10": "2 new + 4 opened", "26/10": "2 new + 4 opened" },
    status: "in-stock",
  },
  {
    id: "13",
    item: "Barsoap (Sunlight)",
    category: "Detergents & Sanitary",
    volume: "1 bar",
    cost: 120,
    weekData: { "05/10": "1 bar", "12/10": "1 bar", "19/10": "1 bar opened", "26/10": "half bar" },
    status: "low-stock",
  },
  {
    id: "14",
    item: "Toilet Cleaner",
    category: "Detergents & Sanitary",
    volume: "1 new",
    cost: 220,
    weekData: { "05/10": "1 new", "12/10": "2 new", "19/10": "2 new + 2 opened", "26/10": "2 new + 2 opened" },
    status: "in-stock",
  },
  // Others
  {
    id: "15",
    item: "Cooking Oil",
    category: "Others",
    volume: "1 litre",
    cost: 380,
    weekData: { "05/10": "1 litre", "12/10": "1 litre", "19/10": "1.25 litres", "26/10": "1.25 litres" },
    status: "in-stock",
  },
  {
    id: "16",
    item: "Plastic Cups",
    category: "Others",
    volume: "3 sets",
    cost: 150,
    weekData: { "05/10": "3 sets", "12/10": "84", "19/10": "41 pcs", "26/10": "38 pcs" },
    status: "in-stock",
  },
  {
    id: "17",
    item: "Plastic Plates",
    category: "Others",
    volume: "140 pcs",
    cost: 280,
    weekData: { "05/10": "140", "12/10": "140", "19/10": "75 pcs", "26/10": "75 pcs" },
    status: "in-stock",
  },
  {
    id: "18",
    item: "Plastic Spoons",
    category: "Others",
    volume: "100 pcs",
    cost: 120,
    weekData: { "05/10": "100", "12/10": "100", "19/10": "25", "26/10": "25" },
    status: "low-stock",
  },
  {
    id: "19",
    item: "Toothpicks",
    category: "Others",
    volume: "50 pcs",
    cost: 80,
    weekData: { "05/10": "50", "12/10": "50", "19/10": "400", "26/10": "390" },
    status: "in-stock",
  },
  {
    id: "20",
    item: "Garbage Bags",
    category: "Others",
    volume: "30 pcs",
    cost: 200,
    weekData: { "05/10": "30", "12/10": "27", "19/10": "21", "26/10": "19" },
    status: "in-stock",
  },
]

export default function StockTakingPage() {
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockData, setStockData] = useState<StockItem[]>(sampleStockData)

  const filteredData = stockData.filter((item) => {
    if (categoryFilter === "all") return true
    if (categoryFilter === "beverages") return item.category === "Beverages"
    if (categoryFilter === "detergents") return item.category === "Detergents & Sanitary"
    if (categoryFilter === "others") return item.category === "Others"
    return true
  })

  const handleAddItem = (newItem: {
    item: string
    category: string
    volume: string
    cost: number
  }) => {
    const item: StockItem = {
      id: Date.now().toString(),
      ...newItem,
      weekData: {},
      status: "in-stock",
    }
    setStockData([...stockData, item])
  }

  const handleEditItem = (item: StockItem) => {
    console.log("Edit item:", item)
    // TODO: Implement edit functionality
  }

  const handleDeleteItem = (item: StockItem) => {
    setStockData(stockData.filter((i) => i.id !== item.id))
  }

  const handleExportPDF = () => {
    // Create a simple PDF export (in production, use a library like jsPDF)
    console.log("Exporting PDF...")
    alert("PDF export initiated. In production, this would generate a detailed PDF report.")
  }

  const handleExportCSV = () => {
    // Generate CSV data
    const headers = ["Item", "Category", "Volume", "Cost (KES)", "Status"]
    const rows = filteredData.map((item) => [
      item.item,
      item.category,
      item.volume,
      item.cost.toString(),
      item.status,
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `stock_report_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  // Calculate statistics
  const totalItems = stockData.length
  const lowStockItems = stockData.filter((i) => i.status === "low-stock").length
  const outOfStockItems = stockData.filter((i) => i.status === "out-of-stock").length
  const totalValue = stockData.reduce((sum, item) => sum + item.cost, 0)

  return (
    <AppShell title="Stock Taking" subtitle="Manage and track your inventory">
      <div className="p-4 md:p-6 space-y-6">
        {/* Page Header - Mobile */}
        <div className="md:hidden">
          <h1 className="text-xl font-semibold text-foreground">Stock Taking</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage church inventory
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Items"
            value={totalItems}
            icon={<Package className="h-5 w-5 text-chart-1" />}
          />
          <StatCard
            title="Total Value"
            value={`KES ${totalValue.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5 text-chart-2" />}
          />
          <StatCard
            title="Low Stock"
            value={lowStockItems}
            trend="down"
            icon={<TrendingDown className="h-5 w-5 text-chart-3" />}
          />
          <StatCard
            title="Out of Stock"
            value={outOfStockItems}
            trend={outOfStockItems > 0 ? "down" : "neutral"}
            icon={<TrendingUp className="h-5 w-5 text-chart-4" />}
          />
        </div>

        {/* Main Content Card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                Inventory Management
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <CategoryFilter
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                />
                <AddItemDialog onAdd={handleAddItem} />
                <ExportButton
                  onExportPDF={handleExportPDF}
                  onExportCSV={handleExportCSV}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Date Filters */}
            <div className="mb-6 pb-4 border-b border-border">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Filter by Date Range
              </p>
              <DateFilter />
            </div>

            {/* Weekly Tabs with Stock Table */}
            <WeeklyTabs
              data={filteredData}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-chart-1/20">
                  <Package className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Beverages</p>
                  <p className="text-xl font-bold text-foreground">
                    {stockData.filter((i) => i.category === "Beverages").length} items
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-chart-2/20">
                  <Package className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Detergents & Sanitary</p>
                  <p className="text-xl font-bold text-foreground">
                    {stockData.filter((i) => i.category === "Detergents & Sanitary").length} items
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-chart-3/20">
                  <Package className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Others</p>
                  <p className="text-xl font-bold text-foreground">
                    {stockData.filter((i) => i.category === "Others").length} items
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
