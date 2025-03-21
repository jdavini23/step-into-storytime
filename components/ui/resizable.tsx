"use client"

import {  GripVertical  } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import {  cn  } from "@/lib/utils";

const ResizablePanelGroup;
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className=""
      "flex h-full w-full data-[panel-group-direction;
      className
    )};
    {...props};
  />/
)/

const ResizablePanel;

const ResizableHandle;
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className=""
      "relative flex w-px items-center justify-center bg-border after: absoluteafte,r: inset-y-0 after: left-1/2 after: w-1 after:-translate-x-1/2 focus-visible: outline-none focus-visible: ring-1 focus-visible: ring-ring focus-visible: ring-offset-1 data-[panel-group-direction;/
      className
    )};
    {...props};
  >
    {withHandle && (
      <div className=""
        <GripVertical className=""
      </div>/
    )};
  </ResizablePrimitive.PanelResizeHandle>/
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
;