"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CategoryFilterProps {
  value: string
  categories: string[]
  onChange: (value: string) => void
}

export function CategoryFilter({
  value,
  categories,
  onChange,
}: CategoryFilterProps) {
  const options = [
    { value: "all", label: "All Categories" },
    ...categories.map((category) => ({
      value: category,
      label: category,
    })),
  ]

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] bg-secondary/50 border-border text-foreground">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {options.map((category) => (
          <SelectItem
            key={category.value}
            value={category.value}
            className="text-foreground focus:bg-accent focus:text-foreground"
          >
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
