"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

interface BusinessPlanInlineEditProps {
  id: string
  field: string
  value: string
  type?: "input" | "textarea" | "date" | "select"
  className?: string
  selectOptions?: { value: string, label: string }[]
  onChange?: (field: string, value: string) => void
}

const DEFAULT_SELECT_OPTIONS: { value: string, label: string }[] = []

export function BusinessPlanInlineEdit({
  field,
  value,
  type = "input",
  className = "",
  selectOptions = DEFAULT_SELECT_OPTIONS,
  onChange,
}: BusinessPlanInlineEditProps) {
  const [editValue, setEditValue] = useState(value)

  function handleChange(value: string) {
    setEditValue(value)
    if (onChange) {
      onChange(field, value)
    }
  }

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            value={editValue}
            onChange={e => handleChange(e.target.value)}
            className={`min-h-[150px] resize-y ${className}`}
          />
        )
      case "date":
        return (
          <Input
            type="date"
            value={editValue}
            onChange={e => handleChange(e.target.value)}
            className={className}
          />
        )
      case "select":
        return (
          <Select
            value={editValue}
            onValueChange={handleChange}
          >
            <SelectTrigger className={className}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return (
          <Input
            value={editValue}
            onChange={e => handleChange(e.target.value)}
            className={className}
          />
        )
    }
  }

  return (
    <div className="relative">
      {renderInput()}
    </div>
  )
}
