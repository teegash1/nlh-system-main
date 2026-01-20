"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { deleteReceipt } from "@/app/reports/actions"
import { EditReceiptDialog } from "@/components/reports/edit-receipt-dialog"

interface ReceiptActionsProps {
  receipt: {
    id: string
    receiptDate: string
    vendor: string
    category: string
    paymentMethod: string
    amount: number
    reference: string | null
  }
  categories: string[]
  paymentMethods: string[]
}

export function ReceiptActions({
  receipt,
  categories,
  paymentMethods,
}: ReceiptActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    const confirmed = window.confirm("Delete this receipt entry?")
    if (!confirmed) return

    const payload = new FormData()
    payload.set("id", receipt.id)
    startTransition(async () => {
      await deleteReceipt(payload)
    })
  }

  return (
    <div className="flex flex-wrap gap-2 md:flex-nowrap">
      <EditReceiptDialog
        receipt={receipt}
        categories={categories}
        paymentMethods={paymentMethods}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleDelete}
        className="h-8 border-border px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  )
}
