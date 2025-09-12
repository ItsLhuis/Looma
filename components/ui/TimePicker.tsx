"use client"

import * as React from "react"

import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/Select"

export type TimePickerProps = {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  error?: boolean
  className?: string
}

function TimePicker({ value, onChange, disabled, error, className }: TimePickerProps) {
  const getDefaultTime = React.useCallback(() => {
    const now = new Date()
    const h = now.getHours()
    const m = now.getMinutes()

    return {
      hour: String(h).padStart(2, "0"),
      minute: String(m).padStart(2, "0")
    }
  }, [])

  const [hour, setHour] = React.useState<string>("")
  const [minute, setMinute] = React.useState<string>("")
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!value) {
      const def = getDefaultTime()
      setHour(def.hour)
      setMinute(def.minute)
      onChange?.(`${def.hour}:${def.minute}`)
    } else if (/^\d{1,2}:\d{2}$/.test(value)) {
      const [h, m] = value.split(":")
      setHour(h.padStart(2, "0"))
      setMinute(m)
    }
  }, [value, getDefaultTime, onChange])

  const handleChange = React.useCallback(
    (h: string, m: string) => {
      setHour(h)
      setMinute(m)
      if (h && m) onChange?.(`${h}:${m}`)
    },
    [onChange]
  )

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={`hover:text-foreground flex w-full justify-between text-left font-normal ${error ? "border-destructive" : ""}`}
          >
            {hour && minute ? `${hour}:${minute}` : "Select time"}
            <Icon name="Clock" className="text-muted-foreground ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4" align="start">
          <div className="flex w-full items-center gap-2">
            <div className="flex w-full flex-col items-start">
              <label className="mb-2 text-sm font-medium">Hour</label>
              <Select
                disabled={disabled}
                onValueChange={(val) => handleChange(val, minute)}
                value={hour}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="mt-6">:</span>
            <div className="flex w-full flex-col items-start">
              <label className="mb-2 text-sm font-medium">Minute</label>
              <Select
                disabled={disabled}
                onValueChange={(val) => handleChange(hour, val)}
                value={minute}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { TimePicker }
