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
import { updateItem } from "@/app/stock/actions"

interface EditItemDialogProps {
  item: {
    id: string
    name: string
    category: string
    unit: string
    reorderLevel: number | null
  }
  categories: string[]
}

export function EditItemDialog({ item, categories }: EditItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: item.name,
    category: item.category,
    unit: item.unit,
    reorderLevel: item.reorderLevel?.toString() ?? "",
  })
  const router = useRouter()

  const sortedCategories = useMemo(() => {
    const existing = categories.includes(item.category)
      ? categories
      : [item.category, ...categories]
    return Array.from(new Set(existing))
  }, [categories, item.category])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const payload = new FormData()
    payload.set("id", item.id)
    payload.set("name", formData.name)
    payload.set("category", formData.category)
    payload.set("unit", formData.unit)
    payload.set("reorderLevel", formData.reorderLevel)

    startTransition(async () => {
      const result = await updateItem(payload)
      if (!result?.ok) {
        setError(result?.message ?? "Unable to update item.")
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
          <DialogTitle className="text-foreground">Edit Item</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update the item details and reorder threshold.
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
              <Label htmlFor={`edit-item-name-${item.id}`} className="text-foreground">
                Item Name
              </Label>
              <Input
                id={`edit-item-name-${item.id}`}
                value={formData.name}
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
                className="bg-secondary/50 border-border text-foreground"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`edit-item-category-${item.id}`} className="text-foreground">
                Category
              </Label>
              <Input
                id={`edit-item-category-${item.id}`}
                list={`edit-category-options-${item.id}`}
                value={formData.category}
                onChange={(event) =>
                  setFormData({ ...formData, category: event.target.value })
                }
                className="bg-secondary/50 border-border text-foreground"
                required
              />
              <datalist id={`edit-category-options-${item.id}`}>
                {sortedCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`edit-item-unit-${item.id}`} className="text-foreground">
                Unit
              </Label>
              <Input
                id={`edit-item-unit-${item.id}`}
                value={formData.unit}
                onChange={(event) =>
                  setFormData({ ...formData, unit: event.target.value })
                }
                className="bg-secondary/50 border-border text-foreground"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`edit-item-reorder-${item.id}`} className="text-foreground">
                Reorder Level
              </Label>
              <Input
                id={`edit-item-reorder-${item.id}`}
                type="number"
                value={formData.reorderLevel}
                onChange={(event) =>
                  setFormData({ ...formData, reorderLevel: event.target.value })
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
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
