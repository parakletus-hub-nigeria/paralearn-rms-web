'use client'

import * as React from 'react'

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number
  children?: React.ReactNode
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = 16 / 9, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: `${(1 / ratio) * 100}%`,
          ...style,
        }}
        data-slot="aspect-ratio"
        {...props}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {children}
        </div>
      </div>
    )
  }
)

AspectRatio.displayName = 'AspectRatio'

export { AspectRatio }
