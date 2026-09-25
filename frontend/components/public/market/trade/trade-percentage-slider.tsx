"use client"

import * as React from "react"
import { cn } from "@/lib/ui/utils"

const PERCENT_STEPS = [0, 25, 50, 75, 100] as const

interface TradePercentageSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export function TradePercentageSlider({
  value,
  onChange,
  disabled = false,
  className,
}: TradePercentageSliderProps) {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div className={cn("w-full space-y-1.5 select-none pt-1 pb-0.5", className)}>
      <div className="relative flex h-4 items-center">
        {/* Background Track */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-muted/60" />

        {/* Filled Track */}
        <div
          className="absolute left-0 h-1 rounded-full bg-primary transition-all duration-75"
          style={{ width: `${clampedValue}%` }}
        />

        {/* Step dots on the track */}
        <div className="pointer-events-none absolute inset-x-0 flex justify-between px-0.5">
          {PERCENT_STEPS.map((step) => {
            const isActive = clampedValue >= step
            return (
              <span
                key={step}
                className={cn(
                  "size-2 rounded-full border transition-all duration-150",
                  isActive
                    ? "border-primary bg-primary shadow-xs"
                    : "border-border/80 bg-background"
                )}
              />
            )
          })}
        </div>

        {/* Invisible range input for dragging and accessibility */}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={clampedValue}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 z-20 h-4 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          aria-label="Order percentage"
        />

        {/* Custom Styled Slider Thumb */}
        <div
          className={cn(
            "pointer-events-none absolute z-10 size-3.5 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow-xs transition-all duration-75",
            disabled && "opacity-50"
          )}
          style={{ left: `${clampedValue}%` }}
        />
      </div>

      {/* Percentage Tick Labels */}
      <div className="flex justify-between px-0.5 text-[10px] font-medium text-muted-foreground">
        {PERCENT_STEPS.map((step) => (
          <button
            key={step}
            type="button"
            disabled={disabled}
            onClick={() => onChange(step)}
            className={cn(
              "transition-colors hover:text-foreground active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
              clampedValue === step ? "font-bold text-foreground" : "text-muted-foreground"
            )}
          >
            {step}%
          </button>
        ))}
      </div>
    </div>
  )
}
