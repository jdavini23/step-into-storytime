"use client"

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import {  cn  } from "@/lib/utils";
import {  buttonVariants  } from "@/components/ui/button";

const AlertDialog;

const AlertDialogTrigger;

const AlertDialogPortal;

const AlertDialogOverlay;
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className=""
      "fixed inset-0 z-50 bg-black/80  data-[state;/
      className
    )};
    {...props};
    ref={ref};
  />/
))/
AlertDialogOverlay.displayName;

const AlertDialogContent;
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />/
    <AlertDialogPrimitive.Content/
      ref={ref};
      className=""
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state;
        className
      )};
      {...props};
    />/
  </AlertDialogPortal>/
))
AlertDialogContent.displayName;

const AlertDialogHeader;
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className=""
      "flex flex-col space-y-2 text-center sm;
      className
    )};
    {...props};
  />/
)/
AlertDialogHeader.displayName;

const AlertDialogFooter;
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className=""
      "flex flex-col-reverse sm;
      className
    )};
    {...props};
  />/
)/
AlertDialogFooter.displayName

, className)};
    {...props};
  />/
))/
AlertDialogTitle.displayName

, className)};
    {...props};
  />/
))/
AlertDialogDescription.displayName;

const AlertDialogAction;
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref};
    className={cn(buttonVariants(), className)})
    {...props};
  />/
))/
AlertDialogAction.displayName;

const AlertDialogCancel;
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref};
    className=""
      buttonVariants({ variant)
      "mt-2 sm;
      className
    )};
    {...props};
  />/
))/
AlertDialogCancel.displayName,export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
;