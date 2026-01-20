"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Folder, Pencil, Plus, Save } from "lucide-react"

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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { createCategory, deleteCategory, updateCategory } from "@/app/stock/actions"

interface CategoryManagerDialogProps {
  categories: { id: string; name: string }[]
}

export function CategoryManagerDialog({ categories }: CategoryManagerDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const resetEditing = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleAdd = () => {
    setError(null)
    const name = newName.trim()
    if (!name) {
      setError("Category name is required.")
      return
    }

    const payload = new FormData()
    payload.set("name", name)
    startTransition(async () => {
      const result = await createCategory(payload)
      if (!result?.ok) {
        setError(result?.message ?? "Unable to create category.")
        return
      }
      setNewName("")
      router.refresh()
    })
  }

  const handleEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditingName(name)
    setError(null)
  }

  const handleSave = () => {
    if (!editingId) return
    setError(null)
    const name = editingName.trim()
    if (!name) {
      setError("Category name is required.")
      return
    }

    const payload = new FormData()
    payload.set("id", editingId)
    payload.set("name", name)
    startTransition(async () => {
      const result = await updateCategory(payload)
      if (!result?.ok) {
        setError(result?.message ?? "Unable to update category.")
        return
      }
      resetEditing()
      router.refresh()
    })
  }

  const handleDelete = async (id: string) => {
    setError(null)
    const payload = new FormData()
    payload.set("id", id)
    const result = await deleteCategory(payload)
    if (!result?.ok) {
      setError(result?.message ?? "Unable to delete category.")
      return
    }
    if (editingId === id) {
      resetEditing()
    }
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent">
          <Folder className="mr-2 h-4 w-4" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Category Manager</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add, rename, or remove inventory categories.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            <Label htmlFor="new-category" className="text-xs text-muted-foreground">
              New category
            </Label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Input
                id="new-category"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="e.g., Hospitality"
                className="bg-secondary/50 border-border text-foreground"
              />
              <Button
                type="button"
                onClick={handleAdd}
                disabled={isPending}
                className="bg-accent text-foreground hover:bg-accent/80 border border-border"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Existing categories
            </p>
            {categories.length === 0 ? (
              <div className="rounded-lg border border-border bg-secondary/20 p-3 text-xs text-muted-foreground">
                No categories created yet.
              </div>
            ) : (
              <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {editingId === category.id ? (
                      <Input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="bg-secondary/50 border-border text-foreground"
                      />
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {category.name}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {editingId === category.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetEditing}
                            className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isPending}
                            className="bg-accent text-foreground hover:bg-accent/80 border border-border"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category.id, category.name)}
                            className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <ConfirmDialog
                            title="Delete this category?"
                            description="Items in this category will be moved to Uncategorized."
                            confirmLabel="Delete category"
                            onConfirm={() => handleDelete(category.id)}
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                              >
                                Delete
                              </Button>
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
