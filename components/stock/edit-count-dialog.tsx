"use client"

import React, { useState, useTransition } from "react"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

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
import { updateStockCount } from "@/app/stock/actions"

interface EditCountDialogProps {
  count: {
    id: string
    itemName: string
    countDate: string
    rawValue: string
    qtyNumeric: number | null
    qtyUnit: string | null
  }
}

export function EditCountDialog({ count }: EditCountDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    countDate: count.countDate,
    rawValue: count.rawValue,
    qtyNumeric: count.qtyNumeric?.toString() ?? "",
    qtyUnit: count.qtyUnit ?? "",
  })
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!formData.countDate) {
      setError("Select a count date.")
      return
    }

    const payload = new FormData()
    payload.set("id", count.id)
    payload.set("countDate", formData.countDate)
    payload.set("rawValue", formData.rawValue)
    payload.set("qtyNumeric", formData.qtyNumeric)
    payload.set("qtyUnit", formData.qtyUnit)

    startTransition(async () => {
      const result = await updateStockCount(payload)
      if (!result?.ok) {
        setError(result?.message ?? "Unable to update count.")
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
          size="sm"
          className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Stock Count</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update the latest count for {count.itemName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor={`edit-count-date-${count.id}`} className="text-foreground">
                Count Date
              </Label>
              <DatePicker
                id={`edit-count-date-${count.id}`}
                value={formData.countDate}
                onChange={(value) =>
                  setFormData({ ...formData, countDate: value })
                }
                placeholder="Select date"
                className="bg-secondary/50 border-border text-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`edit-raw-${count.id}`} className="text-foreground">
                Raw Count (from sheet)
              </Label>
              <Input
                id={`edit-raw-${count.id}`}
                value={formData.rawValue}
                onChange={(event) =>
                  setFormData({ ...formData, rawValue: event.target.value })
                }
                className="bg-secondary/50 border-border text-foreground"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
              <div className="grid gap-2">
                <Label htmlFor={`edit-numeric-${count.id}`} className="text-foreground">
                  Quantity (numeric)
                </Label>
                <Input
                  id={`edit-numeric-${count.id}`}
                  type="number"
                  value={formData.qtyNumeric}
                  onChange={(event) =>
                    setFormData({ ...formData, qtyNumeric: event.target.value })
                  }
                  className="bg-secondary/50 border-border text-foreground"
                  placeholder="Optional"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`edit-unit-${count.id}`} className="text-foreground">
                  Unit
                </Label>
                <Input
                  id={`edit-unit-${count.id}`}
                  value={formData.qtyUnit}
                  onChange={(event) =>
                    setFormData({ ...formData, qtyUnit: event.target.value })
                  }
                  className="bg-secondary/50 border-border text-foreground"
                  placeholder="pcs, kg"
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
