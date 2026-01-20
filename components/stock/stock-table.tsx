"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface StockItem {
  id: string
  item: string
  category: string
  volume: string
  cost: number
  weekData: Record<string, string>
  status: "in-stock" | "low-stock" | "out-of-stock"
}

interface StockTableProps {
  data: StockItem[]
  weeks: string[]
  onEdit?: (item: StockItem) => void
  onDelete?: (item: StockItem) => void
}

type SortDirection = "asc" | "desc" | null
type SortField = "item" | "category" | "volume" | "cost" | "status"

export function StockTable({ data, weeks, onEdit, onDelete }: StockTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  const filteredData = data.filter(
    (item) =>
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField || !sortDirection) return 0

    let aValue: string | number = a[sortField]
    let bValue: string | number = b[sortField]

    if (sortField === "cost") {
      aValue = a.cost
      bValue = b.cost
    } else {
      aValue = String(aValue).toLowerCase()
      bValue = String(bValue).toLowerCase()
    }

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    }
    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
  })

  const getStatusBadge = (status: StockItem["status"]) => {
    switch (status) {
      case "in-stock":
        return (
          <Badge className="bg-chart-2/20 text-chart-2 hover:bg-chart-2/30 border-0">
            In Stock
          </Badge>
        )
      case "low-stock":
        return (
          <Badge className="bg-chart-3/20 text-chart-3 hover:bg-chart-3/30 border-0">
            Low Stock
          </Badge>
        )
      case "out-of-stock":
        return (
          <Badge className="bg-chart-4/20 text-chart-4 hover:bg-chart-4/30 border-0">
            Out of Stock
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
        />
        <span className="text-sm text-muted-foreground">
          {sortedData.length} items
        </span>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border">
              <TableHead className="text-muted-foreground font-semibold">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort("item")}
                >
                  Item
                  {getSortIcon("item")}
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort("category")}
                >
                  Category
                  {getSortIcon("category")}
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort("volume")}
                >
                  Volume
                  {getSortIcon("volume")}
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">
                <button
                  className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                  onClick={() => handleSort("cost")}
                >
                  Cost (KES)
                  {getSortIcon("cost")}
                </button>
              </TableHead>
              {weeks.map((week) => (
                <TableHead
                  key={week}
                  className="text-muted-foreground font-semibold text-center min-w-[100px]"
                >
                  {week}
                </TableHead>
              ))}
              <TableHead className="text-muted-foreground font-semibold">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort("status")}
                >
                  Status
                  {getSortIcon("status")}
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold w-[50px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow
                key={item.id}
                className={cn(
                  "border-border hover:bg-accent/30 transition-colors",
                  index % 2 === 0 ? "bg-card" : "bg-secondary/10"
                )}
              >
                <TableCell className="font-medium text-foreground">
                  {item.item}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.category}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.volume}
                </TableCell>
                <TableCell className="text-right font-mono text-foreground">
                  {item.cost.toLocaleString()}
                </TableCell>
                {weeks.map((week) => (
                  <TableCell
                    key={week}
                    className="text-center text-muted-foreground"
                  >
                    {item.weekData[week] || "-"}
                  </TableCell>
                ))}
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem
                        onClick={() => onEdit?.(item)}
                        className="text-muted-foreground hover:text-foreground focus:text-foreground"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete?.(item)}
                        className="text-chart-4 hover:text-chart-4 focus:text-chart-4"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
