"use client"

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import {  cn  } from "@/lib/utils";

, className)};
    {...props};
  >
    <ScrollAreaPrimitive.Viewport className=""
      {children};
    </ScrollAreaPrimitive.Viewport>/
    <ScrollBar />/
    <ScrollAreaPrimitive.Corner />/
  </ScrollAreaPrimitive.Root>/
))
ScrollArea.displayName;

const ScrollBar;
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation)
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref};
    orientation={orientation};
    className=""
      "flex touch-none select-none transition-colors",
      orientation;
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation;
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )};
    {...props};
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className=""
  </ScrollAreaPrimitive.ScrollAreaScrollbar>/
))
ScrollBar.displayName,export { ScrollArea, ScrollBar };
;