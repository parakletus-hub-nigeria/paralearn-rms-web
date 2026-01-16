'use client'

import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { toggleVariants } from '@/components/ui/toggle'

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: 'default',
  variant: 'default',
})

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toggleVariants> {
  type?: 'single' | 'multiple'
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  disabled?: boolean
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, variant, size, children, type = 'single', value, defaultValue, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? (type === 'multiple' ? [] : ''))
    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = React.useCallback((itemValue: string) => {
      if (type === 'single') {
        const newValue = currentValue === itemValue ? '' : itemValue
        if (value === undefined) {
          setInternalValue(newValue)
        }
        onValueChange?.(newValue as string)
      } else {
        const arr = Array.isArray(currentValue) ? currentValue : []
        const newValue = arr.includes(itemValue)
          ? arr.filter(v => v !== itemValue)
          : [...arr, itemValue]
        if (value === undefined) {
          setInternalValue(newValue)
        }
        onValueChange?.(newValue)
      }
    }, [type, currentValue, value, onValueChange])

    return (
      <ToggleGroupContext.Provider value={{ variant, size }}>
        <div
          ref={ref}
          data-slot="toggle-group"
          data-variant={variant}
          data-size={size}
          className={cn(
            'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
            className,
          )}
          {...props}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                ...child.props,
                'data-group-value': currentValue,
                onValueChange: handleValueChange,
              } as any)
            }
            return child
          })}
        </div>
      </ToggleGroupContext.Provider>
    )
  }
)
ToggleGroup.displayName = 'ToggleGroup'

interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof toggleVariants> {
  value: string
  'data-group-value'?: string | string[]
  onValueChange?: (value: string) => void
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, children, variant, size, value, 'data-group-value': groupValue, onValueChange, onClick, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)
    const isPressed = Array.isArray(groupValue) ? groupValue.includes(value) : groupValue === value

    return (
      <button
        ref={ref}
        type="button"
        data-slot="toggle-group-item"
        data-variant={context.variant || variant}
        data-size={context.size || size}
        data-state={isPressed ? 'on' : 'off'}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
          className,
        )}
        onClick={(e) => {
          onValueChange?.(value)
          onClick?.(e)
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
ToggleGroupItem.displayName = 'ToggleGroupItem'

export { ToggleGroup, ToggleGroupItem }
