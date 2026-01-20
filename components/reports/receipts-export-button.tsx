"use client"

import { Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReceiptExportRow {
  id: string
  date: string
  vendor: string
  category: string
  amount: number
  paymentMethod: string
  reference: string | null
  status: string
}

interface ReceiptsExportButtonProps {
  receipts: ReceiptExportRow[]
}

export function ReceiptsExportButton({ receipts }: ReceiptsExportButtonProps) {
  const handleExport = () => {
    const headers = [
      "Date",
      "Vendor",
      "Category",
      "Amount",
      "Payment Method",
      "Reference",
      "Status",
    ]

    const rows = receipts.map((receipt) => [
      receipt.date,
      receipt.vendor,
      receipt.category,
      receipt.amount.toString(),
      receipt.paymentMethod,
      receipt.reference ?? "",
      receipt.status,
    ])

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `receipts_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={receipts.length === 0}
      className="h-8 border-border px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
    >
      <Receipt className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  )
}
