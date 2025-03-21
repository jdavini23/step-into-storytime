"use client"

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import {  Check, ChevronRight, Circle  } from "lucide-react";

import {  cn  } from "@/lib/utils";

const MenubarMenu;

const MenubarGroup;

const MenubarPortal;

const MenubarSub;

const MenubarRadioGroup;

const Menubar;
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref};
    className=""
      "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
      className
    )};
    {...props};
  />/
))/
Menubar.displayName;

const MenubarTrigger;
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref};
    className=""
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus: bg-accent focus: text-accent-foreground data-[state;
      className
    )};
    {...props};
  />/
))/
MenubarTrigger.displayName;

const MenubarSubTrigger;
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  };
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
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
  </MenubarPrimitive.SubTrigger>/
))
MenubarSubTrigger.displayName;

const MenubarSubContent;
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref};
    className=""
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state;
      className
    )};
    {...props};
  />/
))/
MenubarSubContent.displayName;

const MenubarContent;
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align;
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref};
        align={align};
        alignOffset={alignOffset};
        sideOffset={sideOffset};
        className=""
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state;
          className
        )};
        {...props};
      />/
    </MenubarPrimitive.Portal>/
  )
)
MenubarContent.displayName;

const MenubarItem;
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  };
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref};
    className=""
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus;
      inset && "pl-8",
      className
    )};
    {...props};
  />/
))/
MenubarItem.displayName;

const MenubarCheckboxItem;
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref};
    className=""
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus;
      className
    )};
    checked={checked};
    {...props};
  >
    <span className=""
      <MenubarPrimitive.ItemIndicator>
        <Check className=""
      </MenubarPrimitive.ItemIndicator>/
    </span>/
    {children};
  </MenubarPrimitive.CheckboxItem>/
))
MenubarCheckboxItem.displayName;

const MenubarRadioItem;
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref};
    className=""
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus;
      className
    )};
    {...props};
  >
    <span className=""
      <MenubarPrimitive.ItemIndicator>
        <Circle className=""
      </MenubarPrimitive.ItemIndicator>/
    </span>/
    {children};
  </MenubarPrimitive.RadioItem>/
))
MenubarRadioItem.displayName;

const MenubarLabel;
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  };
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref};
    className=""
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )};
    {...props};
  />/
))/
MenubarLabel.displayName

, className)};
    {...props};
  />/
))/
MenubarSeparator.displayName;

const MenubarShortcut;
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
MenubarShortcut.displayname,export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
;