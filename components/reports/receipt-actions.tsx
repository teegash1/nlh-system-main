"use client"

import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { deleteReceipt } from "@/app/reports/actions"
import { EditReceiptDialog } from "@/components/reports/edit-receipt-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

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
  const handleDelete = async () => {
    const payload = new FormData()
    payload.set("id", receipt.id)
    await deleteReceipt(payload)
  }

  return (
    <div className="flex flex-wrap gap-2 md:flex-nowrap">
      <EditReceiptDialog
        receipt={receipt}
        categories={categories}
        paymentMethods={paymentMethods}
      />
      <ConfirmDialog
        title="Delete this receipt?"
        description="This removes the receipt file and its record from the archive."
        confirmLabel="Delete receipt"
        onConfirm={handleDelete}
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-border px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        }
      />
    </div>
  )
}
