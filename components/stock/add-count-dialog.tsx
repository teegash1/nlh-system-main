"use client"

import React, { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, PlusCircle } from "lucide-react"

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
import { createStockCount } from "@/app/stock/actions"

interface ItemOption {
  id: string
  name: string
  unit: string
}

interface AddCountDialogProps {
  items: ItemOption[]
}

export function AddCountDialog({ items }: AddCountDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    itemId: "",
    countDate: "",
    rawValue: "",
    qtyNumeric: "",
    qtyUnit: "",
  })
  const router = useRouter()

  const selectedUnit = useMemo(() => {
    if (formData.qtyUnit) return formData.qtyUnit
    const selected = items.find((item) => item.id === formData.itemId)
    return selected?.unit ?? ""
  }, [formData.itemId, formData.qtyUnit, items])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const payload = new FormData()
    payload.set("itemId", formData.itemId)
    payload.set("countDate", formData.countDate)
    payload.set("rawValue", formData.rawValue)
    payload.set("qtyNumeric", formData.qtyNumeric)
    payload.set("qtyUnit", formData.qtyUnit || selectedUnit)

    startTransition(async () => {
      const result = await createStockCount(payload)
      if (!result?.ok) {
        setError(result?.message ?? "Unable to save count.")
        return
      }
      setFormData({
        itemId: "",
        countDate: "",
        rawValue: "",
        qtyNumeric: "",
        qtyUnit: "",
      })
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/80 text-foreground border border-border premium-btn">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Count
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">New Stock Count</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Log a stocktake entry so the latest snapshot updates automatically.
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
              <Label htmlFor="itemId" className="text-foreground">
                Item
              </Label>
              <select
                id="itemId"
                value={formData.itemId}
                onChange={(event) =>
                  setFormData({ ...formData, itemId: event.target.value })
                }
                className="h-9 w-full rounded-md border border-border bg-secondary/50 px-3 text-sm text-foreground"
                required
              >
                <option value="" disabled>
                  Select item
                </option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="countDate" className="text-foreground">
                Count Date
              </Label>
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="countDate"
                  type="date"
                  value={formData.countDate}
                  onChange={(event) =>
                    setFormData({ ...formData, countDate: event.target.value })
                  }
                  className="bg-secondary/50 border-border text-foreground pl-9"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rawValue" className="text-foreground">
                Raw Count (from sheet)
              </Label>
              <Input
                id="rawValue"
                value={formData.rawValue}
                onChange={(event) =>
                  setFormData({ ...formData, rawValue: event.target.value })
                }
                className="bg-secondary/50 border-border text-foreground"
                placeholder="e.g., 1 pkt + 1 opened"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
              <div className="grid gap-2">
                <Label htmlFor="qtyNumeric" className="text-foreground">
                  Quantity (numeric)
                </Label>
                <Input
                  id="qtyNumeric"
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
                <Label htmlFor="qtyUnit" className="text-foreground">
                  Unit
                </Label>
                <Input
                  id="qtyUnit"
                  value={selectedUnit}
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
              {isPending ? "Saving..." : "Save Count"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
