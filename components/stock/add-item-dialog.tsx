"use client"

import React from "react"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

interface AddItemDialogProps {
  onAdd?: (item: {
    item: string
    category: string
    volume: string
    cost: number
  }) => void
}

const categories = [
  "Beverages",
  "Detergents & Sanitary",
  "Others",
]

export function AddItemDialog({ onAdd }: AddItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    item: "",
    category: "",
    volume: "",
    cost: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd?.({
      item: formData.item,
      category: formData.category,
      volume: formData.volume,
      cost: parseFloat(formData.cost) || 0,
    })
    setFormData({ item: "", category: "", volume: "", cost: "" })
    setOpen(false)
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
            <div className="grid gap-2">
              <Label htmlFor="item" className="text-foreground">
                Item Name
              </Label>
              <Input
                id="item"
                value={formData.item}
                onChange={(e) =>
                  setFormData({ ...formData, item: e.target.value })
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
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-foreground focus:bg-accent focus:text-foreground"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="volume" className="text-foreground">
                Volume/Unit
              </Label>
              <Input
                id="volume"
                value={formData.volume}
                onChange={(e) =>
                  setFormData({ ...formData, volume: e.target.value })
                }
                className="bg-secondary/50 border-border text-foreground"
                placeholder="e.g., 1.5kg, 20 sachets"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cost" className="text-foreground">
                Cost (KES)
              </Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
                className="bg-secondary/50 border-border text-foreground"
                placeholder="0.00"
                required
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
              className="bg-accent hover:bg-accent/80 text-foreground border border-border"
            >
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
