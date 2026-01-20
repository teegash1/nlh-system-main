"use client"

import React, { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { updateReceipt } from "@/app/reports/actions"

interface EditReceiptDialogProps {
  receipt: {
    id: string
    receiptDate: string
    vendor: string
    category: string
    paymentMethod: string
    amount: number
    amountReceived: number | null
    reference: string | null
  }
  categories: string[]
  paymentMethods: string[]
}

export function EditReceiptDialog({
  receipt,
  categories,
  paymentMethods,
}: EditReceiptDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    receiptDate: receipt.receiptDate,
    vendor: receipt.vendor,
    category: receipt.category,
    paymentMethod: receipt.paymentMethod,
    amount: receipt.amount.toString(),
    amountReceived: receipt.amountReceived?.toString() ?? "",
    reference: receipt.reference ?? "",
  })
  const router = useRouter()
  const categoryOptions = useMemo(() => {
    if (categories.includes(formData.category)) return categories
    return [formData.category, ...categories]
  }, [categories, formData.category])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!formData.receiptDate) {
      setError("Select an expenditure date.")
      return
    }
    if (!formData.amountReceived) {
      setError("Enter the amount received for shopping.")
      return
    }

    const payload = new FormData()
    payload.set("id", receipt.id)
    payload.set("receiptDate", formData.receiptDate)
    payload.set("vendor", formData.vendor)
    payload.set("category", formData.category)
    payload.set("paymentMethod", formData.paymentMethod)
    payload.set("amount", formData.amount)
    payload.set("amountReceived", formData.amountReceived)
    payload.set("reference", formData.reference)

    startTransition(async () => {
      const result = await updateReceipt(payload)
      if (!result?.ok) {
        setError(result?.message ?? "Unable to update receipt.")
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          title="Edit receipt"
          className="h-8 w-8 border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Receipt</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update the receipt details and payment information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={`edit-receipt-date-${receipt.id}`} className="text-foreground">
                Expenditure Date
              </Label>
              <DatePicker
                id={`edit-receipt-date-${receipt.id}`}
                value={formData.receiptDate}
                onChange={(value) =>
                  setFormData({ ...formData, receiptDate: value })
                }
                placeholder="Select date"
                className="bg-secondary/40 border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-receipt-vendor-${receipt.id}`} className="text-foreground">
                Shoper
              </Label>
              <Input
                id={`edit-receipt-vendor-${receipt.id}`}
                value={formData.vendor}
                onChange={(event) =>
                  setFormData({ ...formData, vendor: event.target.value })
                }
                className="bg-secondary/40 border-border text-foreground"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`edit-receipt-category-${receipt.id}`} className="text-foreground">
                  Category
                </Label>
                <select
                  id={`edit-receipt-category-${receipt.id}`}
                  className="h-9 w-full rounded-md border border-border bg-secondary/40 px-3 text-sm text-foreground"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData({ ...formData, category: event.target.value })
                  }
                  required
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edit-receipt-method-${receipt.id}`} className="text-foreground">
                  Payment Method
                </Label>
                <select
                  id={`edit-receipt-method-${receipt.id}`}
                  className="h-9 w-full rounded-md border border-border bg-secondary/40 px-3 text-sm text-foreground"
                  value={formData.paymentMethod}
                  onChange={(event) =>
                    setFormData({ ...formData, paymentMethod: event.target.value })
                  }
                  required
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`edit-receipt-amount-${receipt.id}`} className="text-foreground">
                  Amount Spent (KES)
                </Label>
                <Input
                  id={`edit-receipt-amount-${receipt.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(event) =>
                    setFormData({ ...formData, amount: event.target.value })
                  }
                  className="bg-secondary/40 border-border text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edit-receipt-received-${receipt.id}`} className="text-foreground">
                  Amount Received (KES)
                </Label>
                <Input
                  id={`edit-receipt-received-${receipt.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amountReceived}
                  onChange={(event) =>
                    setFormData({ ...formData, amountReceived: event.target.value })
                  }
                  className="bg-secondary/40 border-border text-foreground"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`edit-receipt-balance-${receipt.id}`} className="text-foreground">
                  Balance Remaining (KES)
                </Label>
                <Input
                  id={`edit-receipt-balance-${receipt.id}`}
                  readOnly
                  value={(() => {
                    const amount = Number(formData.amount)
                    const received = Number(formData.amountReceived)
                    if (!Number.isFinite(amount) || !Number.isFinite(received)) return ""
                    return (received - amount).toLocaleString(undefined, { maximumFractionDigits: 2 })
                  })()}
                  placeholder="Auto-calculated"
                  className="bg-secondary/20 border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edit-receipt-reference-${receipt.id}`} className="text-foreground">
                  Reference ID
                </Label>
                <Input
                  id={`edit-receipt-reference-${receipt.id}`}
                  value={formData.reference}
                  onChange={(event) =>
                    setFormData({ ...formData, reference: event.target.value })
                  }
                  className="bg-secondary/40 border-border text-foreground"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-accent hover:bg-accent/80 text-foreground border border-border"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
