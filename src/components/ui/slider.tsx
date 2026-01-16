'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'defaultValue' | 'onChange'> {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value: controlledValue, defaultValue, onValueChange, min = 0, max = 100, step = 1, disabled, orientation = 'horizontal', ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? [min])
    const values = controlledValue ?? internalValue
    const currentValue = values[0] ?? min

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [parseFloat(e.target.value)]
      if (controlledValue === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    const percentage = ((currentValue - min) / (max - min)) * 100

    return (
      <div
        ref={ref}
        data-slot="slider"
        data-orientation={orientation}
        data-disabled={disabled}
        className={cn(
          'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
          orientation === 'vertical' && 'h-full min-h-44 w-auto flex-col',
          className,
        )}
        {...props}
      >
        <div
          data-slot="slider-track"
          data-orientation={orientation}
          className={cn(
            'bg-muted relative grow overflow-hidden rounded-full',
            orientation === 'horizontal' ? 'h-1.5 w-full' : 'h-full w-1.5',
          )}
        >
          <div
            data-slot="slider-range"
            data-orientation={orientation}
            className={cn(
              'bg-primary absolute',
              orientation === 'horizontal' ? 'h-full' : 'w-full',
            )}
            style={orientation === 'horizontal' 
              ? { width: `${percentage}%` }
              : { height: `${percentage}%`, bottom: 0 }
            }
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          aria-orientation={orientation}
        />
        <div
          data-slot="slider-thumb"
          className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 absolute"
          style={orientation === 'horizontal' 
            ? { left: `${percentage}%`, transform: 'translateX(-50%)' }
            : { bottom: `${percentage}%`, transform: 'translateY(50%)' }
          }
        />
      </div>
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }
