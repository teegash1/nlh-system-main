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
  onChange: (value: string) => void
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "beverages", label: "Beverages" },
  { value: "detergents", label: "Detergents & Sanitary" },
  { value: "others", label: "Others" },
]

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] bg-secondary/50 border-border text-foreground">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {categories.map((category) => (
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
