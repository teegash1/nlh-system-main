"use client"

import React, { useState, useTransition } from "react"
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
import { Plus } from "lucide-react"
import { createItem } from "@/app/stock/actions"

interface AddItemDialogProps {
  categories: string[]
}

export function AddItemDialog({ categories }: AddItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const hasCategories = categories.length > 0
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    reorderLevel: "",
  })
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!hasCategories) {
      setError("Add a category before creating items.")
      return
    }
    if (!formData.category) {
      setError("Select a category.")
      return
    }

    const payload = new FormData()
    payload.set("name", formData.name)
    payload.set("category", formData.category)
    payload.set("unit", formData.unit)
    payload.set("reorderLevel", formData.reorderLevel)

    startTransition(async () => {
      const result = await createItem(payload)
      if (!result?.ok) {
        setError(result?.message ?? "Unable to create item.")
        return
      }
      setFormData({ name: "", category: "", unit: "", reorderLevel: "" })
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/80 text-foreground border border-border premium-btn">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Stock Item</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new item to your inventory. Fill in all the required details.
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
              <Label htmlFor="item" className="text-foreground">
                Item Name
              </Label>
              <Input
                id="item"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-secondary/50 border-border text-foreground"
                placeholder="e.g., Sugar"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-foreground">
                Category
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="h-9 w-full rounded-md border border-border bg-secondary/50 px-3 text-sm text-foreground"
                required
                disabled={!hasCategories}
              >
                <option value="" disabled>
                  {hasCategories ? "Select category" : "No categories yet"}
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {!hasCategories && (
                <p className="text-[11px] text-muted-foreground">
                  Use Manage Categories to add one before creating items.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="volume" className="text-foreground">
                Unit
              </Label>
              <Input
                id="volume"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="bg-secondary/50 border-border text-foreground"
                placeholder="e.g., pcs, kg, sachets"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reorder-level" className="text-foreground">
                Reorder Level
              </Label>
              <Input
                id="reorder-level"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({ ...formData, reorderLevel: e.target.value })
                }
                className="bg-secondary/50 border-border text-foreground"
                placeholder="Optional threshold"
              />
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
              {isPending ? "Saving..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
