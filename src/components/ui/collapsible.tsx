'use client'

import * as React from 'react'

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const CollapsibleContext = React.createContext<{ isOpen: boolean; onToggle: () => void } | null>(null)

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open: controlledOpen, defaultOpen, onOpenChange, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen

    const handleToggle = React.useCallback(() => {
      const newOpen = !isOpen
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }, [isOpen, controlledOpen, onOpenChange])

    return (
      <CollapsibleContext.Provider value={{ isOpen, onToggle: handleToggle }}>
        <div
          ref={ref}
          data-slot="collapsible"
          data-state={isOpen ? 'open' : 'closed'}
          {...props}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    )
  }
)
Collapsible.displayName = 'Collapsible'

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onToggle?: () => void
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ onClick, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext)
    
    return (
      <button
        ref={ref}
        type="button"
        data-slot="collapsible-trigger"
        data-state={context?.isOpen ? 'open' : 'closed'}
        onClick={(e) => {
          context?.onToggle()
          onClick?.(e)
        }}
        {...props}
      />
    )
  }
)
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, forceMount, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext)
    const isOpen = context?.isOpen ?? false

    if (!isOpen && !forceMount) {
      return null
    }

    return (
      <div
        ref={ref}
        data-slot="collapsible-content"
        data-state={isOpen ? 'open' : 'closed'}
        className={className}
        {...props}
      />
    )
  }
)
CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
