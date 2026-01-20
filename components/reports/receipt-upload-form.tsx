"use client"

import React, { useRef, useState, useTransition } from "react"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createReceipt } from "@/app/reports/actions"

interface ReceiptUploadFormProps {
  categories: string[]
  paymentMethods: string[]
}

export function ReceiptUploadForm({
  categories,
  paymentMethods,
}: ReceiptUploadFormProps) {
  const hasCategories = categories.length > 0
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    receiptDate: "",
    vendor: "",
    category: "",
    paymentMethod: "",
    amount: "",
    reference: "",
  })
  const fileRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!hasCategories) {
      setError("Add at least one category before uploading a receipt.")
      return
    }

    const payload = new FormData()
    payload.set("receiptDate", formData.receiptDate)
    payload.set("vendor", formData.vendor)
    payload.set("category", formData.category)
    payload.set("paymentMethod", formData.paymentMethod)
    payload.set("amount", formData.amount)
    payload.set("reference", formData.reference)

    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError("Receipt file is required.")
      return
    }
    payload.set("file", file)

    startTransition(async () => {
      const result = await createReceipt(payload)
      if (!result?.ok) {
        setError(result?.message ?? "Unable to upload receipt.")
        return
      }
      setFormData({
        receiptDate: "",
        vendor: "",
        category: "",
        paymentMethod: "",
        amount: "",
        reference: "",
      })
      if (fileRef.current) {
        fileRef.current.value = ""
      }
      router.refresh()
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="receipt-date" className="text-foreground">
          Expenditure Date
        </Label>
        <Input
          id="receipt-date"
          type="date"
          required
          value={formData.receiptDate}
          onChange={(event) =>
            setFormData({ ...formData, receiptDate: event.target.value })
          }
          className="bg-secondary/40 border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="receipt-vendor" className="text-foreground">
          Shoper
        </Label>
        <Input
          id="receipt-vendor"
          placeholder="Shoper name"
          required
          value={formData.vendor}
          onChange={(event) =>
            setFormData({ ...formData, vendor: event.target.value })
          }
          className="bg-secondary/40 border-border text-foreground"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="receipt-category" className="text-foreground">
            Category
          </Label>
          <select
            id="receipt-category"
            className="h-9 w-full rounded-md border border-border bg-secondary/40 px-3 text-sm text-foreground"
            required
            value={formData.category}
            onChange={(event) =>
              setFormData({ ...formData, category: event.target.value })
            }
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
              Use Manage Categories to add one before uploading.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="receipt-method" className="text-foreground">
            Payment Method
          </Label>
          <select
            id="receipt-method"
            className="h-9 w-full rounded-md border border-border bg-secondary/40 px-3 text-sm text-foreground"
            required
            value={formData.paymentMethod}
            onChange={(event) =>
              setFormData({ ...formData, paymentMethod: event.target.value })
            }
          >
            <option value="" disabled>
              Select method
            </option>
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
          <Label htmlFor="receipt-amount" className="text-foreground">
            Amount (KES)
          </Label>
          <Input
            id="receipt-amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
            value={formData.amount}
            onChange={(event) =>
              setFormData({ ...formData, amount: event.target.value })
            }
            className="bg-secondary/40 border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="receipt-reference" className="text-foreground">
            Reference ID
          </Label>
          <Input
            id="receipt-reference"
            placeholder="EXP-####"
            value={formData.reference}
            onChange={(event) =>
              setFormData({ ...formData, reference: event.target.value })
            }
            className="bg-secondary/40 border-border text-foreground"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="receipt-file" className="text-foreground">
          Receipt File
        </Label>
        <Input
          id="receipt-file"
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          required
          className="bg-secondary/40 border-border text-foreground"
        />
        <p className="text-[11px] text-muted-foreground">
          Upload PDF, JPG, or PNG. Max size 10MB.
        </p>
      </div>
      <Button
        type="submit"
        disabled={isPending || !hasCategories}
        className="w-full bg-accent text-foreground hover:bg-accent/80 border border-border premium-btn"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isPending ? "Uploading..." : "Upload Receipt"}
      </Button>
    </form>
  )
}
