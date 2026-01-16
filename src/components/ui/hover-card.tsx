'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface HoverCardContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null)

interface HoverCardProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  openDelay?: number
  closeDelay?: number
  children?: React.ReactNode
}

function HoverCard({ open: controlledOpen, defaultOpen, onOpenChange, openDelay = 700, closeDelay = 300, children }: HoverCardProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }, newOpen ? openDelay : closeDelay)
  }, [controlledOpen, onOpenChange, openDelay, closeDelay])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <HoverCardContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div data-slot="hover-card">{children}</div>
    </HoverCardContext.Provider>
  )
}

interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

const HoverCardTrigger = React.forwardRef<HTMLDivElement, HoverCardTriggerProps>(
  ({ onMouseEnter, onMouseLeave, ...props }, ref) => {
    const context = React.useContext(HoverCardContext)

    return (
      <div
        ref={ref}
        data-slot="hover-card-trigger"
        onMouseEnter={(e) => {
          context?.onOpenChange(true)
          onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          context?.onOpenChange(false)
          onMouseLeave?.(e)
        }}
        {...props}
      />
    )
  }
)
HoverCardTrigger.displayName = 'HoverCardTrigger'

interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ className, align = 'center', sideOffset = 4, children, ...props }, ref) => {
    const context = React.useContext(HoverCardContext)

    if (!context?.open) return null

    return (
      <div
        ref={ref}
        data-slot="hover-card-content"
        className={cn(
          'bg-popover text-popover-foreground z-50 w-64 rounded-md border p-4 shadow-md outline-hidden fixed',
          className,
        )}
        style={{ marginTop: `${sideOffset}px` }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
HoverCardContent.displayName = 'HoverCardContent'

export { HoverCard, HoverCardTrigger, HoverCardContent }
