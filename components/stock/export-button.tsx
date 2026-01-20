"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react"

interface ExportButtonProps {
  onExportPDF?: () => void
  onExportCSV?: () => void
}

export function ExportButton({ onExportPDF, onExportCSV }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onExportPDF?.()
    setIsExporting(false)
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onExportCSV?.()
    setIsExporting(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-border text-muted-foreground hover:text-foreground hover:bg-accent premium-btn bg-transparent"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border w-48">
        <DropdownMenuItem
          onClick={handleExportPDF}
          className="text-muted-foreground hover:text-foreground focus:text-foreground cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4 text-chart-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportCSV}
          className="text-muted-foreground hover:text-foreground focus:text-foreground cursor-pointer"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-chart-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
