'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked: controlledChecked, defaultChecked, onCheckedChange, onClick, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false)
    const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const newChecked = !isChecked
      if (controlledChecked === undefined) {
        setInternalChecked(newChecked)
      }
      onCheckedChange?.(newChecked)
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        data-slot="switch"
        data-state={isChecked ? 'checked' : 'unchecked'}
        className={cn(
          'peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        <span
          data-slot="switch-thumb"
          className={cn(
            'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform',
            isChecked ? 'translate-x-[calc(100%-2px)]' : 'translate-x-0'
          )}
          data-state={isChecked ? 'checked' : 'unchecked'}
        />
      </button>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
