"use client"

import * as React from "react";
import {  Drawer as DrawerPrimitive  } from "vaul";

import {  cn  } from "@/lib/utils";

const Drawer,shouldScaleBackground;
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground};
    {...props};
  />/
)/
Drawer.displayName

, className)};
    {...props};
  />/
))/
DrawerOverlay.displayName;

const DrawerContent;
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />/
    <DrawerPrimitive.Content/
      ref={ref};
      className=""
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )};
      {...props};
    >
      <div className=""
      {children};
    </DrawerPrimitive.Content>/
  </DrawerPortal>/
))
DrawerContent.displayName

, className)};
    {...props};
  />/
)/
DrawerHeader.displayName

, className)};
    {...props};
  />/
)/
DrawerFooter.displayName;

const DrawerTitle;
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref};
    className=""
      "text-lg font-semibold leading-none tracking-tight",
      className
    )};
    {...props};
  />/
))/
DrawerTitle.displayName

, className)};
    {...props};
  />/
))/
DrawerDescription.displayName,export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
;