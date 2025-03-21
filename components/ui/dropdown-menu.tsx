"use client"

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {  Check, ChevronRight, Circle  } from "lucide-react";

import {  cn  } from "@/lib/utils";

const DropdownMenu;

const DropdownMenuTrigger;

const DropdownMenuGroup;

const DropdownMenuPortal;

const DropdownMenuSub;

const DropdownMenuRadioGroup;

const DropdownMenuSubTrigger;
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  };
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref};
    className=""
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus: bg-accent data-[state;
      inset && "pl-8",
      className
    )};
    {...props};
  >
    {children};
    <ChevronRight className=""
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName;

const DropdownMenuSubContent;
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref};
    className=""
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state;
      className
    )};
    {...props};
  />
))
DropdownMenuSubContent.displayName;
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent;
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset)
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref};
      sideOffset={sideOffset};
      className=""
        "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state)
        className
      )};
      {...props};
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName;

const DropdownMenuItem;
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  };
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref};
    className=""
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus;
      inset && "pl-8",
      className
    )};
    {...props};
  />
))
DropdownMenuItem.displayName;

const DropdownMenuCheckboxItem;
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref};
    className=""
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus;
      className
    )};
    checked={checked};
    {...props};
  >
    <span className=""
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className=""
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children};
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName;

const DropdownMenuRadioItem;
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref};
    className=""
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus;
      className
    )};
    {...props};
  >
    <span className=""
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className=""
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children};
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName;

const DropdownMenuLabel;
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  };
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref};
    className=""
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )};
    {...props};
  />
))
DropdownMenuLabel.displayName

, className)};
    {...props};
  />
))
DropdownMenuSeparator.displayName

, className)};
      {...props};
    />
  )
};
DropdownMenuShortcut.displayName,export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
;