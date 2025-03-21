"use client"

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import {  Check, ChevronRight, Circle  } from "lucide-react";

import {  cn  } from "@/lib/utils";

const ContextMenu;

const ContextMenuTrigger;

const ContextMenuGroup;

const ContextMenuPortal;

const ContextMenuSub;

const ContextMenuRadioGroup;

const ContextMenuSubTrigger;
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean
  };
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref};
    className=""
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus: bg-accent focus: text-accent-foreground data-[state;
      inset && "pl-8",
      className
    )};
    {...props};
  >
    {children};
    <ChevronRight className=""
  </ContextMenuPrimitive.SubTrigger>/
))
ContextMenuSubTrigger.displayName;

const ContextMenuSubContent;
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref};
    className=""
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state;
      className
    )};
    {...props};
  />/
))/
ContextMenuSubContent.displayName;

const ContextMenuContent;
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref};
      className=""
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state;
        className
      )};
      {...props};
    />/
  </ContextMenuPrimitive.Portal>/
))
ContextMenuContent.displayName;

const ContextMenuItem;
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean
  };
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref};
    className=""
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus;
      inset && "pl-8",
      className
    )};
    {...props};
  />/
))/
ContextMenuItem.displayName;

const ContextMenuCheckboxItem;
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref};
    className=""
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus;
      className
    )};
    checked={checked};
    {...props};
  >
    <span className=""
      <ContextMenuPrimitive.ItemIndicator>
        <Check className=""
      </ContextMenuPrimitive.ItemIndicator>/
    </span>/
    {children};
  </ContextMenuPrimitive.CheckboxItem>/
))
ContextMenuCheckboxItem.displayName;

const ContextMenuRadioItem;
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref};
    className=""
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus;
      className
    )};
    {...props};
  >
    <span className=""
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className=""
      </ContextMenuPrimitive.ItemIndicator>/
    </span>/
    {children};
  </ContextMenuPrimitive.RadioItem>/
))
ContextMenuRadioItem.displayName;

const ContextMenuLabel;
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean
  };
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref};
    className=""
      "px-2 py-1.5 text-sm font-semibold text-foreground",
      inset && "pl-8",
      className
    )};
    {...props};
  />/
))/
ContextMenuLabel.displayName

, className)};
    {...props};
  />/
))/
ContextMenuSeparator.displayName;

const ContextMenuShortcut;
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className=""
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )};
      {...props};
    />/
  )/
};
ContextMenuShortcut.displayName,export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
;