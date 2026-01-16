'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="scroll-area"
        className={cn('relative overflow-auto', className)}
        {...props}
      >
        <div
          data-slot="scroll-area-viewport"
          className="size-full rounded-[inherit]"
        >
          {children}
        </div>
      </div>
    )
  }
)
ScrollArea.displayName = 'ScrollArea'

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal'
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = 'vertical', ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="scroll-area-scrollbar"
        className={cn(
          'flex touch-none p-px transition-colors select-none',
          orientation === 'vertical' &&
            'h-full w-2.5 border-l border-l-transparent',
          orientation === 'horizontal' &&
            'h-2.5 flex-col border-t border-t-transparent',
          className,
        )}
        {...props}
      >
        <div
          data-slot="scroll-area-thumb"
          className="bg-border relative flex-1 rounded-full"
        />
      </div>
    )
  }
)
ScrollBar.displayName = 'ScrollBar'

export { ScrollArea, ScrollBar }
