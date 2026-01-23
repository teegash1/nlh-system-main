"use client"

import type { ReactNode } from "react"
import { Trash2, Download, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { deleteReceipt } from "@/app/reports/actions"
import { EditReceiptDialog } from "@/components/reports/edit-receipt-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ReceiptActionsProps {
  receipt: {
    id: string
    receiptDate: string
    vendor: string
    category: string
    paymentMethod: string
    amount: number
    amountReceived: number | null
    previousBalance: number | null
    reference: string | null
  }
  viewUrl: string | null
  categories: string[]
  paymentMethods: string[]
}

function ActionTooltip({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

export function ReceiptActions({
  receipt,
  viewUrl,
  categories,
  paymentMethods,
}: ReceiptActionsProps) {
  const handleDelete = async () => {
    const payload = new FormData()
    payload.set("id", receipt.id)
    await deleteReceipt(payload)
  }

  const viewButton = viewUrl ? (
    <ActionTooltip label="View receipt">
      <Button
        asChild
        variant="outline"
        size="icon-sm"
        className="h-8 w-8 border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
      >
        <a href={viewUrl} target="_blank" rel="noreferrer">
          <Eye className="h-4 w-4" />
        </a>
      </Button>
    </ActionTooltip>
  ) : (
    <ActionTooltip label="No file">
      <span className="inline-flex">
        <Button
          variant="outline"
          size="icon-sm"
          disabled
          className="h-8 w-8 border-border text-muted-foreground bg-transparent"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </span>
    </ActionTooltip>
  )

  const downloadButton = viewUrl ? (
    <ActionTooltip label="Download receipt">
      <Button
        asChild
        variant="outline"
        size="icon-sm"
        className="h-8 w-8 border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
      >
        <a href={viewUrl} download>
          <Download className="h-4 w-4" />
        </a>
      </Button>
    </ActionTooltip>
  ) : (
    <ActionTooltip label="No file">
      <span className="inline-flex">
        <Button
          variant="outline"
          size="icon-sm"
          disabled
          className="h-8 w-8 border-border text-muted-foreground bg-transparent"
        >
          <Download className="h-4 w-4" />
        </Button>
      </span>
    </ActionTooltip>
  )

  return (
    <div className="grid w-[84px] grid-cols-2 place-items-center gap-1.5">
      {viewButton}
      {downloadButton}
      <EditReceiptDialog
        receipt={receipt}
        categories={categories}
        paymentMethods={paymentMethods}
      />
      <ConfirmDialog
        title="Delete this receipt?"
        description="This removes the receipt file and its record from the archive."
        confirmLabel="Delete receipt"
        confirmText="delete"
        confirmPlaceholder="Type delete to confirm"
        onConfirm={handleDelete}
        trigger={
          <Button
            variant="outline"
            size="icon-sm"
            title="Delete receipt"
            className="h-8 w-8 border-destructive/40 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  )
}
