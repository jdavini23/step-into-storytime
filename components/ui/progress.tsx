import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
  }
>(({ className, value, ...props }, ref) => (
  <div ref={ref} className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
    <div
      className="h-full w-full flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }

